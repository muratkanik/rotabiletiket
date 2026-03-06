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

    // 3. Publish to Meta as Instagram Story and Feed Post
    const publishToInstagram = async (isStory: boolean) => {
      const containerUrl = `https://graph.facebook.com/v21.0/${instagram_business_account_id}/media`;
      const params: Record<string, string> = {
        image_url: finalMetaImageUrl,
        access_token: system_user_access_token,
      };
      if (isStory) {
        params.media_type = "STORIES";
      } else {
        params.caption = caption || ""; // Feed posts show caption
      }

      const containerFormData = new URLSearchParams(params);

      const containerResponse = await fetch(containerUrl, {
        method: "POST",
        body: containerFormData,
      });

      const containerData = await containerResponse.json();

      if (containerData.error) {
        console.error("Meta API Container Error:", containerData.error);
        throw new Error(`Meta Container Error (${isStory ? 'Story' : 'Post'}): ` + containerData.error.message);
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
          throw new Error(`Meta rejected the image processing (${isStory ? 'Story' : 'Post'}).`);
        }
        attempts++;
      }

      if (!isReady) {
        throw new Error(`Media processing timeout by Meta (${isStory ? 'Story' : 'Post'}).`);
      }

      // Publish the Media Container
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
        throw new Error(`Meta Publishing Error (${isStory ? 'Story' : 'Post'}): ` + publishData.error.message);
      }

      return publishData.id;
    };

    try {
      // Run both publish tasks in parallel
      const [storyPostId, feedPostId] = await Promise.all([
        publishToInstagram(true),  // Publish as Story
        publishToInstagram(false)  // Publish as Feed Post
      ]);

      return NextResponse.json({
        success: true,
        story_post_id: storyPostId,
        feed_post_id: feedPostId
      });
    } catch (error: any) {
      console.error("Manual publish failed:", error);
      return NextResponse.json({ error: error.message || "Failed to publish to Instagram" }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Instagram Publish API Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
