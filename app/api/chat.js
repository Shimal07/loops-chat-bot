// pages/api/chat.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const { message, lang } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "Message required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY missing.");
      return res.status(500).json({ reply: "Server error: API Key missing" });
    }

    const genAI = new GoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

    // Decide language: English or Sinhala
    const language = lang === "si" ? "සිංහල" : "English";

    const SYSTEM_PROMPT = `
ඔබ Loops Integrated ආයතනයේ නිල ඩිජිටල් සහයකයාය.

ඔබේ දැනුම් මූලාශ්‍රය පමණි:

- සේවා වේලාව: සඳුදා–සිකුරාදා, 9 AM–6 PM
- ස්ථානය: කොළඹ 03
- සේවාවන්: ඩිජිටල් මාර්කට්ටින්, සෘජු ක්‍රියාකාරී මාර්ගෝපදේශ, ක්‍රියාදාම මාර්කට්ටින්, අන්තර්ගත නිර්මාණය
- සම්බන්ධ වීමට: hello@loops.lk / +94 77 123 4567

RULES:
1. ඉහත දැනුම් මූලාශ්‍රය පමණක් භාවිතා කර පිළිතුරු ලබා දෙන්න.
2. වෙනත් ප්‍රශ්නයක් ඇසුවහොත් පිළිතුර: "මම ඔබ සමඟ කණ්ඩායම් සාමාජිකයෙකු සම්බන්ධ කර ගත හැක. කරුණාකර ඔබේ නම, ඊමේල් ලිපිනය, සහ කෙටි පණිවුඩයක් ලබා දෙන්න."
3. පිළිතුරු **${language}** භාෂාවෙන් ලබා දෙන්න.
4. පිළිතුරු කෙටි, මිත්‍රශීලී, වෘත්තීයමය විය යුතුය.
`;

    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash", // use latest stable
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: `${SYSTEM_PROMPT}\nUser: ${message}` }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 200,
        temperature: 0.2,
      },
    });

    const reply = result.response.text();
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Gemini Error:", err);
    return res.status(500).json({ reply: err.message || "Server error" });
  }
}
