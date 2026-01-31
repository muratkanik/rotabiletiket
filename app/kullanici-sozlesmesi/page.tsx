import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Kullanıcı Sözleşmesi - Rotabil Etiket',
    description: 'Rotabil Etiket web sitesi kullanıcı sözleşmesi ve hizmet şartları.',
};

export default function UserAgreementPage() {
    return (
        <div className="min-h-screen bg-white py-16">
            <div className="container px-4 md:px-6 max-w-4xl">
                <h1 className="text-3xl md:text-4xl font-bold mb-8 text-slate-900 border-b pb-4">Kullanıcı Sözleşmesi</h1>

                <div className="prose prose-slate max-w-none text-slate-700">
                    <p className="lead text-lg">
                        Lütfen sitemizi kullanmadan önce bu kullanıcı sözleşmesini dikkatlice okuyunuz.
                    </p>

                    <h3>1. Taraflar</h3>
                    <p>
                        a) www.rotabiletiket.com internet sitesinin faaliyetlerini yürüten; Rotabil Etiket (Bundan böyle "Satıcı" olarak anılacaktır).<br />
                        b) www.rotabiletiket.com internet sitesine üye olan veya ziyaret eden internet kullanıcısı (Bundan böyle "Kullanıcı" olarak anılacaktır).
                    </p>

                    <h3>2. Sözleşmenin Konusu</h3>
                    <p>
                        İşbu Sözleşme'nin konusu Satıcı'nın sahip olduğu internet sitesi www.rotabiletiket.com'dan Kullanıcı'nın faydalanma şartlarının belirlenmesidir.
                    </p>

                    <h3>3. Tarafların Hak ve Yükümlülükleri</h3>

                    <h4>3.1. Üyelik ve Kullanım</h4>
                    <p>
                        Kullanıcı, www.rotabiletiket.com internet sitesine üye olurken verdiği kişisel ve diğer sair bilgilerin kanunlar önünde doğru olduğunu, Satıcı'nın bu bilgilerin gerçeğe aykırılığı nedeniyle uğrayacağı tüm zararları aynen ve derhal tazmin edeceğini beyan ve taahhüt eder.
                    </p>

                    <h4>3.2. Güvenlik</h4>
                    <p>
                        Kullanıcı, kendisine verilmiş olan şifreyi başka kişi ya da kuruluşlara veremez, kullanıcının söz konusu şifreyi kullanma hakkı bizzat kendisine aittir. Bu sebeple doğabilecek tüm sorumluluk ile üçüncü kişiler veya yetkili merciler tarafından Satıcı'ya karşı ileri sürülebilecek tüm iddia ve taleplere karşı, Satıcı'nın söz konusu izinsiz kullanımdan kaynaklanan her türlü tazminat ve sair talep hakkı saklıdır.
                    </p>

                    <h4>3.3. Telif Hakları</h4>
                    <p>
                        www.rotabiletiket.com internet sitesi yazılım ve tasarımı Satıcı mülkiyetinde olup, bunlara ilişkin telif hakkı ve/veya diğer fikri mülkiyet hakları ilgili kanunlarca korunmakta olup, bunlar Kullanıcı tarafından izinsiz kullanılamaz, iktisap edilemez ve değiştirilemez.
                    </p>

                    <h4>3.4. Yasal Sorumluluklar</h4>
                    <p>
                        Kullanıcı, www.rotabiletiket.com internet sitesini kullanırken yasal mevzuat hükümlerine riayet etmeyi ve bunları ihlal etmemeyi baştan kabul ve taahhüt eder. Aksi takdirde, doğacak tüm hukuki ve cezai yükümlülükler tamamen ve münhasıran Kullanıcı'yı bağlayacaktır.
                    </p>

                    <h3>4. Sözleşmenin Feshi</h3>
                    <p>
                        İşbu sözleşme Kullanıcı'nın üyeliğini iptal etmesi veya Satıcı tarafından üyeliğinin iptal edilmesine kadar yürürlükte kalacaktır. Satıcı, Kullanıcı'nın üyelik sözleşmesinin herhangi bir hükmünü ihlal etmesi durumunda Kullanıcı'nın üyeliğini iptal ederek sözleşmeyi tek taraflı olarak feshedebilecektir.
                    </p>

                    <h3>5. Yürürlük</h3>
                    <p>
                        Kullanıcı'nın, üyelik kaydı yapması Kullanıcı'nın üyelik sözleşmesinde yer alan tüm maddeleri okuduğu ve üyelik sözleşmesinde yer alan maddeleri kabul ettiği anlamına gelir. İşbu Sözleşme Kullanıcı'nın üye olması anında akdedilmiş ve karşılıklı olarak yürürlülüğe girmiştir.
                    </p>
                </div>
            </div>
        </div>
    );
}
