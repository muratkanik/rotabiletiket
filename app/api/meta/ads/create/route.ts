import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        // Check authentication
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, dailyBudget, creativeImageUrl, creativeBody, linkUrl, creativeHeadline } = await req.json();

        // Fetch settings
        const { data: settings, error: settingsError } = await supabase
            .from("meta_settings")
            .select("*")
            .single();

        if (settingsError || !settings) {
            return NextResponse.json({ error: "Meta settings not configured" }, { status: 400 });
        }

        const { system_user_access_token, meta_ad_account_id, facebook_page_id } = settings;
        const API_VERSION = "v21.0";
        const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;
        const ACT_ID = `act_${meta_ad_account_id}`;

        // 1. Create Campaign
        const campaignUrl = `${BASE_URL}/${ACT_ID}/campaigns`;
        const campaignParams = new URLSearchParams({
            name: `${name} - Campaign`,
            objective: "OUTCOME_TRAFFIC",
            status: "PAUSED",
            special_ad_categories: "NONE",
            access_token: system_user_access_token
        });

        const campaignRes = await fetch(campaignUrl, { method: "POST", body: campaignParams });
        const campaignData = await campaignRes.json();
        if (campaignData.error) throw new Error(campaignData.error.message);
        const campaignId = campaignData.id;

        // 2. Create Ad Set
        const adsetUrl = `${BASE_URL}/${ACT_ID}/adsets`;
        const adsetParams = new URLSearchParams({
            name: `${name} - Ad Set`,
            campaign_id: campaignId,
            daily_budget: dailyBudget.toString(),
            billing_event: "IMPRESSIONS",
            optimization_goal: "LINK_CLICKS",
            bid_amount: "100", // example bid
            promoted_object: JSON.stringify({ page_id: facebook_page_id }),
            targeting: JSON.stringify({ geo_locations: { countries: ["TR"] } }), // example targeting
            status: "PAUSED",
            access_token: system_user_access_token
        });

        const adsetRes = await fetch(adsetUrl, { method: "POST", body: adsetParams });
        const adsetData = await adsetRes.json();
        if (adsetData.error) throw new Error(adsetData.error.message);
        const adsetId = adsetData.id;

        // 3. Create Ad Creative
        const creativeUrl = `${BASE_URL}/${ACT_ID}/adcreatives`;
        const creativeParams = new URLSearchParams({
            name: `${name} - Creative`,
            object_story_spec: JSON.stringify({
                page_id: facebook_page_id,
                link_data: {
                    image_url: creativeImageUrl,
                    link: linkUrl,
                    message: creativeBody,
                    name: creativeHeadline || name // Used as headline sometimes
                }
            }),
            access_token: system_user_access_token
        });

        const creativeRes = await fetch(creativeUrl, { method: "POST", body: creativeParams });
        const creativeData = await creativeRes.json();
        if (creativeData.error) throw new Error(creativeData.error.message);
        const creativeId = creativeData.id;

        // 4. Create Ad
        const adUrl = `${BASE_URL}/${ACT_ID}/ads`;
        const adParams = new URLSearchParams({
            name: `${name} - Ad`,
            adset_id: adsetId,
            creative: JSON.stringify({ creative_id: creativeId }),
            status: "PAUSED",
            access_token: system_user_access_token
        });

        const adRes = await fetch(adUrl, { method: "POST", body: adParams });
        const adData = await adRes.json();
        if (adData.error) throw new Error(adData.error.message);
        const adId = adData.id;

        return NextResponse.json({
            success: true,
            campaignId,
            adsetId,
            adId
        });

    } catch (error: any) {
        console.error("Meta Ads Form Error:", error);
        return NextResponse.json({ error: error.message || "Failed to create Meta Ad snippet" }, { status: 500 });
    }
}
