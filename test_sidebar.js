const axios = require('axios');
const cheerio = require('cheerio');

async function testSidebar() {
    const url = 'https://www.macro-tr.com/argox-barkod-yazıcılar';
    try {
        const { data } = await axios.get(encodeURI(url));
        const $ = cheerio.load(data);
        
        let subcats = [];
        // Usually sidebars have links or specific classes. Let's find all text under a specific navigation or filter area.
        // Or let's just dump all internal links
        $('a').each((i, el) => {
            const href = $(el).attr('href');
            if (href && !href.includes('/product-page/') && href.length > 25) {
                // console.log($(el).text().trim(), href);
            }
        });

        // Let's specifically look for elements containing "Masaüstü"
        $('a, span, div, li').each((i, el) => {
            if ($(el).text().trim().includes('Masaüstü Barkod Yazıcılar')) {
                 console.log('Found wrapper:', $(el).prop('tagName'), 'Class:', $(el).attr('class'), 'Href:', $(el).attr('href'), 'FullText:', $(el).text().trim().substring(0, 50));
            }
        });

    } catch(err) {
        console.error(err.message);
    }
}
testSidebar();
