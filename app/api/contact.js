// pages/api/contact.js
export default async function handler(req, res){
  if(req.method !== "POST") return res.status(405).end();
  try {
    const { name, email, message, source } = req.body;
    if(!name || !email) return res.status(400).json({ error: "name and email required" });

    // For assignment: just log and return ok
    console.log("Contact capture:", { name, email, message, source, at: new Date().toISOString() });

    // Optionally: integrate with SendGrid or any email service here

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("contact error", e);
    return res.status(500).json({ error: "server error" });
  }
}
