import { prisma } from "@/lib/db";

const GIF_BASE64 = "R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";

export async function GET(_request: Request, { params }: { params: { emailLogId: string } }) {
  const id = params.emailLogId;

  if (id) {
    await prisma.emailLog.updateMany({
      where: { id, openedAt: null },
      data: { openedAt: new Date() }
    });
  }

  const gif = Buffer.from(GIF_BASE64, "base64");
  return new Response(gif, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate"
    }
  });
}
