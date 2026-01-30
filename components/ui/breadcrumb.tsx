import Link from "next/link";

interface BreadcrumbProps {
    items: {
        label: string;
        href?: string;
    }[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
    return (
        <nav className="flex text-sm text-slate-500 mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                    <Link href="/" className="hover:text-blue-600 transition-colors">
                        Anasayfa
                    </Link>
                </li>
                {items.map((item, index) => (
                    <li key={index}>
                        <div className="flex items-center">
                            <span className="mx-2 text-slate-300">/</span>
                            {item.href ? (
                                <Link href={item.href} className="hover:text-blue-600 transition-colors">
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="text-slate-900 font-medium">{item.label}</span>
                            )}
                        </div>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
