import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const title = searchParams.get('title') || 'Rotabiletiket Ürünü';
        const price = searchParams.get('price') || '';
        const caption = searchParams.get('caption') || 'Fırsatı Kaçırmayın! Hemen İnceleyin.';

        const _imageUrl = searchParams.get('image');
        let rawImageUrl = _imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60';

        // Fix Supabase storage double slashes issue which causes 400 Bad Request
        if (rawImageUrl.includes('.supabase.co/storage')) {
            rawImageUrl = rawImageUrl.replace(/products\/\/img/g, 'products/img');
        }

        let imageBuffer: ArrayBuffer | null = null;
        if (rawImageUrl) {
            try {
                const res = await fetch(rawImageUrl);
                if (res.ok) {
                    imageBuffer = await res.arrayBuffer();
                }
            } catch (e) {
                console.error("Failed to fetch image for OG:", e);
            }
        }

        return new ImageResponse(
            (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#1e293b',
                        color: 'white',
                        fontFamily: 'sans-serif',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {/* Background Image with Overlay */}
                    {imageBuffer ? (
                        <img
                            src={imageBuffer as any}
                            alt="Background"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    ) : (
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#475569' }} />
                    )}
                    {/* Dark Gradient Overlay */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%)',
                        }}
                    />

                    {/* Logo / Brand Header */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            paddingTop: '80px',
                            paddingBottom: '20px',
                            position: 'relative',
                        }}
                    >
                        <div
                            style={{
                                fontSize: 48,
                                fontWeight: 800,
                                letterSpacing: '0.1em',
                                color: 'white',
                                textTransform: 'uppercase',
                                textShadow: '0 4px 12px rgba(0,0,0,0.5)',
                            }}
                        >
                            ROTABİLETİKET
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            flex: 1,
                            padding: '80px',
                            position: 'relative',
                            textAlign: 'center',
                        }}
                    >
                        {/* AI Caption / Viral Text */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                padding: '40px 60px',
                                borderRadius: '32px',
                                border: '2px solid rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(16px)',
                                marginBottom: '40px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                            }}
                        >
                            {/* Viral Badge */}
                            <div
                                style={{
                                    display: 'flex',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    padding: '12px 24px',
                                    borderRadius: '100px',
                                    fontSize: 32,
                                    fontWeight: 900,
                                    letterSpacing: '0.15em',
                                    textTransform: 'uppercase',
                                    marginBottom: '32px',
                                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.6)',
                                }}
                            >
                                🔥 TREND
                            </div>

                            <div
                                style={{
                                    fontSize: 64,
                                    fontWeight: 800,
                                    color: '#ffffff',
                                    lineHeight: 1.3,
                                    textAlign: 'center',
                                    textShadow: '0 4px 16px rgba(0,0,0,0.8)',
                                }}
                            >
                                {`"${caption}"`}
                            </div>
                        </div>

                        {/* Product Title Box */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                padding: '24px 56px',
                                borderRadius: '24px',
                                marginBottom: '24px',
                                boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 52,
                                    fontWeight: 900,
                                    color: '#0f172a',
                                    textAlign: 'center',
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                {title}
                            </span>
                        </div>

                        {/* Price Tag (if available) */}
                        {price && (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                    padding: '24px 64px',
                                    borderRadius: '100px',
                                    boxShadow: '0 16px 48px rgba(234, 88, 12, 0.5)',
                                    border: '4px solid rgba(255, 255, 255, 0.2)',
                                }}
                            >
                                <span style={{ fontSize: 72, fontWeight: 900, color: 'white' }}>
                                    {`${price} TL`}
                                </span>
                            </div>
                        )}

                        <div style={{ paddingBottom: '120px' }}></div>
                    </div>
                </div>
            ),
            {
                width: 1080,
                height: 1920,
            }
        );
    } catch (e: any) {
        console.error("OG Error:", e.message);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
