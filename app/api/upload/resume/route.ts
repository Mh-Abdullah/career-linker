import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import formidable from "formidable";
import { Readable } from "stream";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to convert Web ReadableStream to Node.js Readable
async function webStreamToNodeReadable(webStream: ReadableStream<Uint8Array>): Promise<Readable> {
  const reader = webStream.getReader();
  return new Readable({
    async read() {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        this.push(Buffer.from(value));
      }
      this.push(null);
    },
  });
}

// POST /api/upload/resume
export async function POST(req: Request): Promise<Response> {
  const uploadDir = path.join(process.cwd(), "public", "uploads", "resume");
  await fs.mkdir(uploadDir, { recursive: true });

  const form = formidable({
    multiples: false,
    uploadDir,
    keepExtensions: true,
    filename: (name: string, ext: string, part: { originalFilename: string }) => {
      return `${Date.now()}_${part.originalFilename}`;
    },
  });

  // Convert the Web Stream to Node.js Readable
  const nodeReq = await webStreamToNodeReadable(req.body as ReadableStream<Uint8Array>);

  // Patch headers for formidable (content-type and content-length)
  const contentType = req.headers.get("content-type") || undefined;
  const contentLength = req.headers.get("content-length") || undefined;
  (nodeReq as unknown as { headers: Record<string, string | undefined> }).headers = {
    "content-type": contentType,
    "content-length": contentLength,
  };

  return await new Promise<Response>((resolve) => {
    form.parse(nodeReq, async (err: Error | null, fields: Record<string, unknown>, files: Record<string, unknown>) => {
      if (err) {
        return resolve(NextResponse.json({ error: "Upload failed" }, { status: 500 }));
      }
      const file = files.resume as Array<{ filepath: string }>;
      if (!file) {
        return resolve(NextResponse.json({ error: "No file uploaded" }, { status: 400 }));
      }
      const fileUrl = `/uploads/resume/${path.basename(file[0].filepath)}`;
      resolve(NextResponse.json({ url: fileUrl }));
    });
  });
}
