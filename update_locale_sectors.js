const fs = require('fs');

['tr', 'en', 'de', 'fr', 'ar'].forEach(lang => {
  const path = `./messages/${lang}.json`;
  if (fs.existsSync(path)) {
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));
    if (!data.Common.seeAllSectors) {
      if (lang === 'tr') data.Common.seeAllSectors = 'Tüm Sektörel Çözümleri Gör';
      else if (lang === 'en') data.Common.seeAllSectors = 'See All Sectors';
      else if (lang === 'de') data.Common.seeAllSectors = 'Alle Branchenlösungen ansehen';
      else if (lang === 'fr') data.Common.seeAllSectors = 'Voir tous les secteurs';
      else if (lang === 'ar') data.Common.seeAllSectors = 'عرض جميع القطاعات';
      fs.writeFileSync(path, JSON.stringify(data, null, 2));
    }
  }
});
