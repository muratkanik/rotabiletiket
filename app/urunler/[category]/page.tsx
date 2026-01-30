import { Breadcrumb } from '@/components/ui/breadcrumb';

// ... (imports)

// ... (inside component)
return (
    <main className="min-h-screen bg-slate-50">
        <Navbar />

        {/* Header */}
        <div className="bg-slate-900 py-16 text-white text-center">
            <div className="container px-4 md:px-6 mx-auto mb-6">
                <nav className="flex justify-center text-sm text-slate-400 mb-4" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                        <li className="inline-flex items-center">
                            <a href="/" className="hover:text-white transition-colors">Anasayfa</a>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <span className="mx-2 text-slate-600">/</span>
                                <span className="text-white font-medium">Ürünler</span>
                            </div>
                        </li>
                        <li aria-current="page">
                            <div className="flex items-center">
                                <span className="mx-2 text-slate-600">/</span>
                                <span className="text-white font-medium">{category.title}</span>
                            </div>
                        </li>
                    </ol>
                </nav>
            </div>
            <h1 className="text-4xl font-bold mb-4">{category.title}</h1>
            <p className="text-slate-400 max-w-xl mx-auto">
                Endüstriyel standartlarda, yüksek kaliteli {category.title.toLowerCase()} çözümlerimiz.
            </p>
        </div>

        {/* Grid */}
        <div className="container px-4 md:px-6 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products?.map((product: any) => (
                    <ProductCard key={product.id} product={product} categorySlug={categorySlug} />
                ))}
                {products?.length === 0 && (
                    <div className="col-span-full text-center py-20 text-slate-500">
                        Bu kategoride henüz ürün bulunmuyor.
                    </div>
                )}
            </div>
        </div>
    </main>
);
}
