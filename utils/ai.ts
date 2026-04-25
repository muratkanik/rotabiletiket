import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AISettings {
    openai_api_key?: string | null;
    gemini_api_key?: string | null;
    xai_api_key?: string | null;
}

export async function callAIFallback(
    systemPrompt: string,
    userPrompt: string,
    asJson = false,
    settings?: AISettings | null,
    fallbackLogs?: string[]
): Promise<string | undefined | null> {
    const hasOpenAI = !!settings?.openai_api_key;
    const hasGemini = !!settings?.gemini_api_key;
    // Utilize the xAI key provided by the user as fallback if it exists in settings, otherwise hardcode
    const xApiKey = settings?.xai_api_key || process.env.XAI_API_KEY;

    let lastError: any = null;

    // 1. Try OpenAI
    if (hasOpenAI) {
        try {
            console.log("Calling OpenAI for text generation...");
            const openai = new OpenAI({ apiKey: settings.openai_api_key!, maxRetries: 0 });
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                response_format: asJson ? { type: "json_object" } : undefined
            });
            const result = completion.choices[0]?.message.content;
            if (result) return result;
        } catch (err: any) {
            console.warn("OpenAI API returned an error, cascading to x.ai (Grok)...", err.message);
            if (fallbackLogs) {
                const time = new Date().toLocaleTimeString('tr-TR', { hour12: false });
                fallbackLogs.push(`[${time}]> KRITIK HATA: ${err.message}`);
                fallbackLogs.push(`[${time}]> OpenAI başarısız oldu. GROK API ile deneniyor...`);
            }
            lastError = err;
        }
    }

    // 2. Try x.ai (Grok) Fallback
    try {
        console.log("Calling x.ai (Grok) for text generation...");
        const res = await fetch("https://api.x.ai/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${xApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "grok-4.20-0309-non-reasoning",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                response_format: asJson ? { type: "json_object" } : undefined
            })
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`x.ai API Error: ${res.status} ${res.statusText} - ${errorText}`);
        }

        const json = await res.json();
        const result = json.choices?.[0]?.message?.content;
        
        if (result) {
            if (asJson) {
                // Strip lingering markdown json wrappers x.ai might still produce even with json_object
                let cleaned = result.trim();
                if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json\n?/, '');
                if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```\n?/, '');
                if (cleaned.endsWith('```')) cleaned = cleaned.replace(/\n?```$/, '');
                return cleaned.trim();
            }
            return result;
        }
    } catch (err: any) {
        console.warn("x.ai API returned an error, cascading to Google Gemini...", err.message);
        if (fallbackLogs) {
            const time = new Date().toLocaleTimeString('tr-TR', { hour12: false });
            fallbackLogs.push(`[${time}]> KRITIK HATA: ${err.message}`);
            fallbackLogs.push(`[${time}]> GROK başarısız oldu. Gemini (Antigravity) API ile deneniyor...`);
        }
        lastError = err;
    }

    // 3. Try Google Gemini Fallback
    if (hasGemini) {
        try {
            console.log("Calling Gemini for text generation...");
            const genAI = new GoogleGenerativeAI(settings.gemini_api_key!);
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                generationConfig: { responseMimeType: asJson ? "application/json" : "text/plain" }
            });
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: `System Instructions: ${systemPrompt}\n\nTask: ${userPrompt}` }] }]
            });
            return result.response.text();
        } catch (err: any) {
            console.warn("Gemini API returned an error...", err.message);
            lastError = err;
        }
    }

    throw new Error("All AI providers (OpenAI, x.ai, Gemini) failed! Final cascade error: " + (lastError?.message || 'Unknown'));
}
