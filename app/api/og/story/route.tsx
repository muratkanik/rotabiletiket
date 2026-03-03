import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        // Get parameters
        const title = searchParams.get('title') || 'Rotabiletiket Ürünü';
        const price = searchParams.get('price') || '';
        const _imageUrl = searchParams.get('image');
        // Fallback placeholder image if none provided
        const imageUrl = _imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60';
        const caption = searchParams.get('caption') || 'Fırsatı Kaçırmayın! Hemen İnceleyin.';

        // Instagram Story Size: 1080 x 1920
        return new ImageResponse(
            (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#1e293b', // slate-800
                        color: 'white',
                        fontFamily: '"Intar", sans-serif',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {/* Background Image with Overlay */}
                    <img
                        src={imageUrl}
                        alt={title}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
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
                            zIndex: 10,
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
                            zIndex: 10,
                            textAlign: 'center',
                        }}
                    >
                        {/* AI Caption / Viral Text */}
                        <div
                            style={{
                                fontSize: 64,
                                fontWeight: 700,
                                color: '#fff',
                                marginBottom: '40px',
                                lineHeight: 1.2,
                                textShadow: '0 4px 16px rgba(0,0,0,0.8)',
                            }}
                        >
                            &quot;{caption}&quot;
                        </div>

                        {/* Product Title Box */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                padding: '24px 48px',
                                borderRadius: '24px',
                                marginBottom: '20px',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 56,
                                    fontWeight: 800,
                                    color: '#0f172a',
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
                                    background: 'linear-gradient(90deg, #ea580c 0%, #c2410c 100%)', // Orange gradient
                                    padding: '20px 60px',
                                    borderRadius: '100px',
                                    boxShadow: '0 12px 40px rgba(234, 88, 12, 0.4)',
                                }}
                            >
                                <span style={{ fontSize: 72, fontWeight: 900, color: 'white' }}>
                                    {price} TL
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
        console.error(e.message);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
