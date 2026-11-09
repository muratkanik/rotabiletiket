import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AISettings {
    openai_api_key?: string | null;
    serper_api_key?: string | null;
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
    const clean = (result: string) => {
        if (!asJson) return result;
        return result.trim().replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim();
    };
    const log = (message: string) => {
        console.warn(message);
        if (fallbackLogs) fallbackLogs.push(`[${new Date().toLocaleTimeString('tr-TR', { hour12: false })}]> ${message}`);
    };
    let lastError: any = null;

    const geminiKey = process.env.GEMINI_API_KEY || settings?.gemini_api_key;
    const directOpenAIKey = process.env.OPENAI_API_KEY || (settings?.openai_api_key && !settings.openai_api_key.startsWith('sk-or-') ? settings.openai_api_key : undefined);
    const openRouterKey = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || (settings?.openai_api_key?.startsWith('sk-or-') ? settings.openai_api_key : undefined);
    const compatible = async (key: string, models: string[], baseURL?: string) => {
        const client = new OpenAI({ apiKey: key.trim(), ...(baseURL ? { baseURL } : {}), ...(baseURL?.includes('openrouter') ? { defaultHeaders: { 'HTTP-Referer': 'https://rotabiletiket.com', 'X-Title': 'Rotabil Etiket AI' } } : {}) });
        for (const model of models) {
            try {
                log(`${baseURL?.includes('openrouter') ? 'OpenRouter' : 'AI'} üzerinden ${model} deneniyor...`);
                const completion = await client.chat.completions.create({ model, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }], response_format: asJson ? { type: 'json_object' } : undefined });
                const result = completion.choices[0]?.message.content;
                if (result) return clean(result);
            } catch (error: any) {
                lastError = error;
                log(`KRITIK HATA (${model}): ${error.message}`);
            }
        }
        return null;
    };

    // Google AI is the default provider because it is configured for this project.
    if (geminiKey) {
        try {
            log('Google AI (Gemini) varsayılan sağlayıcı olarak deneniyor...');
            const gemini = new GoogleGenerativeAI(geminiKey);
            const model = gemini.getGenerativeModel({ model: 'gemini-2.5-flash', systemInstruction: systemPrompt, generationConfig: asJson ? { responseMimeType: 'application/json' } : undefined });
            const result = await model.generateContent(userPrompt);
            const text = result.response.text();
            if (text) return clean(text);
        } catch (error: any) {
            lastError = error;
            log(`KRITIK HATA (Gemini): ${error.message}`);
        }
    }

    if (directOpenAIKey) {
        const result = await compatible(directOpenAIKey, ['gpt-4o-mini', 'gpt-4o']);
        if (result) return result;
    }

    if (settings?.xai_api_key) {
        const result = await compatible(settings.xai_api_key, ['grok-3-mini', 'grok-3'], 'https://api.x.ai/v1');
        if (result) return result;
    }

    if (openRouterKey) {
        const result = await compatible(openRouterKey, ['google/gemini-2.5-flash', 'deepseek/deepseek-chat', 'meta-llama/llama-3.1-8b-instruct'], 'https://openrouter.ai/api/v1');
        if (result) return result;
    }

    throw new Error('Tüm AI sağlayıcıları başarısız oldu: ' + (lastError?.message || 'API anahtarı bulunamadı.'));
}
