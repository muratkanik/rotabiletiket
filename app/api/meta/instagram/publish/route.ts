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

    // 2. Create Media Container on Meta
    const containerUrl = `https://graph.facebook.com/v21.0/${instagram_business_account_id}/media`;
    const containerFormData = new URLSearchParams({
      image_url: imageUrl,
      caption: caption || "",
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
