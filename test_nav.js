const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
    const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('id, title, slug')
        .order('display_order', { ascending: true })
        .order('title', { ascending: true });
    
    console.log("Categories Error:", catError);
    console.log("Categories Count:", categories?.length);
}
test();
