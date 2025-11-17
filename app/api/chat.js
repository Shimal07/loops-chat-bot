// pages/api/chat.js
import { GoogleGenerativeAI } from "@google-generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const { message, lang, fallbackTriggered } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "Message required" });
    }

    // Detect if user gave name + email + message
    const detailPattern = /([A-Za-z ]+),?\s*([\w.-]+@[\w.-]+\.\w+),?\s*(.*)/;

    if (fallbackTriggered && detailPattern.test(message)) {
      const match = message.match(detailPattern);
      const name = match[1];
      const email = match[2];
      const userMessage = match[3] || "Not provided";

      // Store user details via contact API
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message: userMessage,
          source: "chatbot"
        })
      });

      return res.status(200).json({
        reply:
          lang === "si"
            ? "ඔබේ විස්තර ලැබුණා! කණ්ඩායමේ සාමාජිකයෙකු ඉක්මනින් ඔබව සම්බන්ධ කර ගනු ඇත."
            : "Thank you! Your details have been received. A team member will contact you shortly.",
        stop: true
      });
    }

    // --- AI CALL BEGINS HERE ---

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ reply: "Server error: API Key missing" });
    }

    const genAI = new GoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const language = lang === "si" ? "Sinhala" : "English";

    const SYSTEM_PROMPT = `
You are Loops Integrated’s official assistant.

Allowed information:
- Hours: Mon–Fri, 9 AM–6 PM
- Location: Colombo 03
- Services: Digital marketing, creative strategy, performance marketing, content creation
- Contact: hello@loops.lk / +94 77 123 4567

RULES:
1. ONLY answer using the above.
2. If user asks anything outside this list, reply:
   "I can connect you with a team member. May I have your full name, email, and a short message?"
3. Reply ONLY in ${language}.
4. Keep replies short.
`;

    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    });

    const result = await model.generateContent({
      contents: [
        { role: "system", parts: [{ text: SYSTEM_PROMPT }] },
        { role: "user", parts: [{ text: message }] },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 200,
      },
    });

    const replyText = result.response.text();

    const fallback =
      replyText.includes("May I have your full name") ||
      replyText.includes("කරුණාකර ඔබේ නම");

    return res.status(200).json({
      reply: replyText,
      fallback,
    });
  } catch (err) {
    console.error("Gemini Error:", err);
    return res.status(500).json({
      reply: "Server error",
    });
  }
}
