import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json([], { status: 401 });
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const photos = (user.publicMetadata as { profilePhotos?: string[] }).profilePhotos ?? [];
  return NextResponse.json(photos);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { photos } = await req.json();
  if (!Array.isArray(photos)) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  await client.users.updateUser(userId, {
    publicMetadata: { ...user.publicMetadata, profilePhotos: photos.slice(0, 6) },
  });
  return NextResponse.json({ ok: true });
}
