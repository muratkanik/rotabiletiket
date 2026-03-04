import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: allIds } = await supabase.from("products").select("id");
    console.log("Total products:", allIds.length);
    if (allIds && allIds.length > 0) {
        const randomId = allIds[Math.floor(Math.random() * allIds.length)].id;
        console.log("Random ID chosen:", randomId);
        const { data: randomProduct } = await supabase
            .from("products")
            .select(`
                title, 
                price, 
                description_html,
                images:product_images(storage_path)
            `)
            .eq("id", randomId)
            .single();
        console.log("Fetched product:", JSON.stringify(randomProduct, null, 2));
    }
}
check();
