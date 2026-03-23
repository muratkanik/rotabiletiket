const axios = require('axios');
const cheerio = require('cheerio');

async function testScrape() {
    const url = 'https://www.macro-tr.com/product-page/honeywell-ct32-el-terminali';
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        
        let breadcrumbs = [];
        // Wix usually uses nav or specifics div for breadcrumbs. Let's look for common patterns
        $('a').each((i, el) => {
            const href = $(el).attr('href');
            if (href && href.includes('/category/')) {
                breadcrumbs.push($(el).text().trim());
            }
        });

        console.log('Category links found:', breadcrumbs);
        
        // Let's also try just looking for the text "Ana Sayfa / " or similar structure
        let allText = $('body').text();
        let catIndex = allText.indexOf('CUBISCAN TÜRKİYE DİSTRİBÜTÖRÜ');
        if(catIndex > -1) {
            console.log('Found possible breadcrumb root text around: ', allText.substring(catIndex, catIndex + 100).replace(/\n/g, ' '));
        }

    } catch(err) {
        console.error(err.message);
    }
}
testScrape();
