const fs = require('fs');

['tr', 'en', 'de', 'fr', 'ar'].forEach(lang => {
  const path = `./messages/${lang}.json`;
  if (fs.existsSync(path)) {
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));
    if (!data.Common.seeAllCategories) {
      if (lang === 'tr') data.Common.seeAllCategories = 'Tüm Kategorileri Gör';
      else if (lang === 'en') data.Common.seeAllCategories = 'See All Categories';
      else if (lang === 'de') data.Common.seeAllCategories = 'Alle Kategorien anzeigen';
      else if (lang === 'fr') data.Common.seeAllCategories = 'Voir toutes les catégories';
      else if (lang === 'ar') data.Common.seeAllCategories = 'عرض جميع الفئات';
      fs.writeFileSync(path, JSON.stringify(data, null, 2));
    }
  }
});
