import OpenAI from 'openai';

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
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || settings?.openai_api_key;
    if (!apiKey) {
        throw new Error("OpenRouter API Key tanımlı değil.");
    }

    let lastError: any = null;

    const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: apiKey.trim(),
        defaultHeaders: {
            "HTTP-Referer": "https://rotabiletiket.com",
            "X-Title": "Rotabil Etiket AI",
            "Authorization": `Bearer ${apiKey.trim()}`
        }
    });

    const models = [
        "google/gemini-2.5-flash",
        "deepseek/deepseek-chat",
        "meta-llama/llama-3.1-8b-instruct"
    ];

    for (const model of models) {
        try {
            console.log(`Calling OpenRouter (${model}) for text generation...`);
            if (fallbackLogs) {
                const time = new Date().toLocaleTimeString('tr-TR', { hour12: false });
                fallbackLogs.push(`[${time}]> OpenRouter üzerinden ${model} deneniyor...`);
            }

            const completion = await openai.chat.completions.create({
                model: model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                response_format: asJson ? { type: "json_object" } : undefined
            });

            let result = completion.choices[0]?.message.content;
            if (result) {
                if (asJson) {
                    let cleaned = result.trim();
                    if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json\n?/, '');
                    if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```\n?/, '');
                    if (cleaned.endsWith('```')) cleaned = cleaned.replace(/\n?```$/, '');
                    return cleaned.trim();
                }
                return result;
            }
        } catch (err: any) {
            console.warn(`Model ${model} failed, cascading...`, err.message);
            if (fallbackLogs) {
                const time = new Date().toLocaleTimeString('tr-TR', { hour12: false });
                fallbackLogs.push(`[${time}]> KRITIK HATA (${model}): ${err.message}`);
            }
            lastError = err;
        }
    }

    throw new Error("All AI models in OpenRouter failed! Final cascade error: " + (lastError?.message || 'Unknown'));
}
