import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const targetId = req.nextUrl.searchParams.get("userId");
  if (!targetId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(targetId);
    const meta = user.publicMetadata as { photo?: string };
    return NextResponse.json({
      name: (`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()) || (user.emailAddresses?.[0]?.emailAddress ?? "User"),
      photo: meta.photo ?? user.imageUrl ?? "",
    });
  } catch {
    return NextResponse.json({ name: "User", photo: "" });
  }
}
