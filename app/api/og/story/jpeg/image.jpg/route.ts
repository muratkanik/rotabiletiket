import { NextRequest } from "next/server";
import sharp from "sharp";

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);

        // Construct the URL to fetch the original PNG from our own OG route
        const ogUrl = new URL(`/api/og/story${url.search}`, url.origin);

        const response = await fetch(ogUrl.toString());

        if (!response.ok) {
            console.error("Failed to fetch OG image:", response.statusText);
            return new Response("Failed to fetch OG image", { status: response.status });
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Convert the PNG buffer to JPEG format
        const jpegBuffer = await sharp(buffer)
            .jpeg({ quality: 90 })
            .toBuffer();

        return new Response(jpegBuffer as any, {
            headers: {
                "Content-Type": "image/jpeg",
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error: any) {
        console.error("Error converting OG to JPEG:", error);
        return new Response("Failed to generate JPEG", { status: 500 });
    }
}
