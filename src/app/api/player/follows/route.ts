import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { playerFollows } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.select().from(playerFollows).where(eq(playerFollows.targetClerkId, userId));

  if (!rows.length) return NextResponse.json({ pending: [], approved: [] });

  const client = await clerkClient();
  const results = await Promise.all(rows.map(async (r) => {
    try {
      const u = await client.users.getUser(r.followerClerkId);
      const meta = u.publicMetadata as { photo?: string };
      return {
        followerClerkId: r.followerClerkId,
        name: (`${u.firstName ?? ""} ${u.lastName ?? ""}`.trim()) || (u.emailAddresses?.[0]?.emailAddress ?? "User"),
        photo: meta.photo ?? u.imageUrl ?? "",
        status: r.status,
      };
    } catch { return null; }
  }));

  const valid = results.filter(Boolean) as { followerClerkId: string; name: string; photo: string; status: string }[];
  return NextResponse.json({
    pending: valid.filter((r) => r.status === "pending"),
    approved: valid.filter((r) => r.status === "approved"),
  });
}
