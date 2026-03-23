const axios = require('axios');
const cheerio = require('cheerio');

async function testCategory() {
    const url = 'https://www.macro-tr.com/el-terminalleri';
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        
        let products = [];
        $('a[href*="/product-page/"]').each((i, el) => {
            const href = $(el).attr('href');
            // Wix product links often have h3 or aria-label containing the title
            const title = $(el).text().trim() || $(el).attr('aria-label') || 'No Title';
            products.push({ href: href.replace(/.*\/product-page\//, ''), title, rawText: $(el).text().trim() });
        });

        console.log(`Found ${products.length} product links directly in HTML.`);
        console.log(products.slice(0,5));

    } catch(err) {
        console.error(err.message);
    }
}
testCategory();
