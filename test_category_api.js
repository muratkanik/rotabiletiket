const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function run() {
    const fetch = require('node-fetch');
    const res = await fetch('http://localhost:3000/api/ai/enhance-category', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ categoryId: '31c926e6-36c5-4981-b572-4380520949a2', mock: true }) // Tablet PC id from user prompt
    });
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
}
run();
