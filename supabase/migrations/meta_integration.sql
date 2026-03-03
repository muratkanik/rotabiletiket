-- Meta App Credentials & Settings
CREATE TABLE meta_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meta_app_id TEXT NOT NULL,
    meta_app_secret TEXT NOT NULL,
    system_user_access_token TEXT NOT NULL,
    instagram_business_account_id TEXT NOT NULL,
    facebook_page_id TEXT NOT NULL,
    meta_ad_account_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Protect meta_settings with basic RLS
ALTER TABLE meta_settings ENABLE ROW LEVEL SECURITY;
-- Assuming an admin role, but for now we skip complex RLS policies for simplicity unless instructed.
-- We can add a policy to only allow admins to view/edit this:
-- CREATE POLICY "Allow admins to manage meta_settings" ON meta_settings FOR ALL TO authenticated USING (auth.role() = 'admin');

-- Scheduled Instagram Posts
CREATE TABLE scheduled_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    caption TEXT,
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'failed')),
    meta_post_id TEXT, -- The ID returned by Meta after publishing
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;

-- Meta Ad Campaigns
CREATE TABLE ad_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    daily_budget INTEGER NOT NULL, -- Stored in cents (e.g. 100 = $1.00)
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'failed')),
    meta_campaign_id TEXT,
    meta_adset_id TEXT,
    meta_ad_id TEXT,
    creative_image_url TEXT NOT NULL,
    creative_body TEXT NOT NULL,
    creative_headline TEXT,
    link_url TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
