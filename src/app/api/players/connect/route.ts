import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const client = await clerkClient();
    const { data: users } = await client.users.getUserList({ limit: 100 });

    const players = users
      .filter((u) => {
        const meta = u.publicMetadata as { role?: string; isHidden?: boolean };
        return (meta.role === "player" || meta.role === "parent") && !meta.isHidden;
      })
      .slice(0, 20)
      .map((u) => {
        const meta = u.publicMetadata as Record<string, any>;
        const sports: string[] = meta.playerSports?.length ? meta.playerSports : (meta.sport ? [meta.sport] : []);
        return {
          clerkUserId: u.id,
          name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "Player",
          photo: meta.photo ?? u.imageUrl ?? null,
          city: meta.city ?? null,
          sport: sports[0] ?? null,
          skillLevel: meta.level ?? null,
          birthYear: meta.birthYear ? parseInt(meta.birthYear) : null,
        };
      })
      .filter((p) => p.name !== "Player" || p.photo);

    return NextResponse.json(players);
  } catch {
    return NextResponse.json([]);
  }
}
