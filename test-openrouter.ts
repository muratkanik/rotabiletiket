import OpenAI from "openai";

async function test() {
    const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: "sk-proj-invalidopenaikey", // Fake OpenAI key
    });

    try {
        await openai.chat.completions.create({
            model: "google/gemini-2.5-flash",
            messages: [{ role: "user", content: "hi" }]
        });
        console.log("Success");
    } catch (e: any) {
        console.error("Error:", e.message);
    }
}

test();
