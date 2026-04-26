import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@clerk/nextjs/server";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { filename, contentType } = await req.json();
    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json({ error: "File type not allowed. Use JPEG, PNG, WebP, or GIF." }, { status: 400 });
    }

    const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
    const key = `grupup/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET ?? "anytime-soccer-media",
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    const cdnUrl = `${(process.env.CLOUDFRONT_URL ?? "https://d2vm0l3c6tu9qp.cloudfront.net").replace(/\/$/, "")}/${key}`;

    return NextResponse.json({ uploadUrl, cdnUrl });
  } catch (err) {
    console.error("[POST /api/upload]", err);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
