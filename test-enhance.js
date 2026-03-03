const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data: articles } = await supabase.from('articles').select('id, title').limit(1);
  if (articles && articles.length > 0) {
    const id = articles[0].id;
    console.log("Testing with article ID:", id, articles[0].title);
    
    // Attempt local fetch
    const fetch = require('node-fetch');
    const res = await fetch('https://www.rotabiletiket.com/api/ai/enhance-article', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleId: id, mock: true })
    });
    
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
  } else {
    console.log("No articles found");
  }
}
run();
