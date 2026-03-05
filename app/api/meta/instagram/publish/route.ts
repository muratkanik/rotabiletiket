import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // Check authentication (simple example)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imageUrl, caption } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
    }

    // 1. Fetch credentials from settings
    const { data: settings, error: settingsError } = await supabase
      .from("meta_settings")
      .select("*")
      .single();

    if (settingsError || !settings) {
      return NextResponse.json({ error: "Meta settings not configured" }, { status: 400 });
    }

    const { system_user_access_token, instagram_business_account_id } = settings;

    // 2. Prepare final static URL for Meta (Bypass Facebook URL validation)
    let finalMetaImageUrl = imageUrl;
    if (imageUrl.includes('/api/og/story')) {
      try {
        const ogRes = await fetch(imageUrl);
        if (ogRes.ok) {
          const buffer = await ogRes.arrayBuffer();
          const fileName = `story_manual_${Date.now()}.jpg`;
          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(`stories/${fileName}`, buffer, { contentType: 'image/jpeg', upsert: true });

          if (!uploadError) {
            finalMetaImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/stories/${fileName}`;
          } else {
            console.error("Supabase manual story upload failed", uploadError);
          }
        } else {
          console.error("Failed to fetch OG image for manual publish", ogRes.status);
        }
      } catch (e) {
        console.error("Error processing manual publish image", e);
      }
    }

    // 3. Create Media Container on Meta
    const containerUrl = `https://graph.facebook.com/v21.0/${instagram_business_account_id}/media`;
    const containerFormData = new URLSearchParams({
      image_url: finalMetaImageUrl,
      caption: caption || "",
      media_type: "STORIES", // CRITICAL FOR STORIES (If we assume all manual publishes here are stories, otherwise omit or pass from UI)
      access_token: system_user_access_token,
    });

    const containerResponse = await fetch(containerUrl, {
      method: "POST",
      body: containerFormData,
    });

    const containerData = await containerResponse.json();

    if (containerData.error) {
      console.error("Meta API Container Error:", containerData.error);
      return NextResponse.json({ error: containerData.error.message }, { status: 500 });
    }

    const creationId = containerData.id;

    // --- Wait for the Container to be ready (FINISHED) ---
    let isReady = false;
    let attempts = 0;
    while (!isReady && attempts < 10) {
      await new Promise(r => setTimeout(r, 3000)); // wait 3 seconds
      const statusUrl = `https://graph.facebook.com/v21.0/${creationId}?fields=status_code&access_token=${system_user_access_token}`;
      const statusRes = await fetch(statusUrl);
      const statusData = await statusRes.json();
      if (statusData && statusData.status_code === "FINISHED") {
        isReady = true;
      } else if (statusData && statusData.status_code === "ERROR") {
        console.error("Meta Container Processing Error:", statusData);
        return NextResponse.json({ error: "Meta rejected the image processing." }, { status: 500 });
      }
      attempts++;
    }

    if (!isReady) {
      return NextResponse.json({ error: "Media processing timeout by Meta." }, { status: 504 });
    }

    // 3. Publish the Media Container
    const publishUrl = `https://graph.facebook.com/v21.0/${instagram_business_account_id}/media_publish`;
    const publishFormData = new URLSearchParams({
      creation_id: creationId,
      access_token: system_user_access_token,
    });

    const publishResponse = await fetch(publishUrl, {
      method: "POST",
      body: publishFormData,
    });

    const publishData = await publishResponse.json();

    if (publishData.error) {
      console.error("Meta API Publishing Error:", publishData.error);
      return NextResponse.json({ error: publishData.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, meta_post_id: publishData.id });
  } catch (error: any) {
    console.error("Instagram Publish API Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
