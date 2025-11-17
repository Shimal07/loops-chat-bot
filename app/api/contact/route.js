export async function POST(req) {
  const data = await req.json();

  console.log("Contact submission:", data);

  return Response.json({ success: true });
}
