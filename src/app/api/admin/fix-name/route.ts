import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("key") !== "grupup-admin-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const email = searchParams.get("email");
  const first = searchParams.get("first");
  const last = searchParams.get("last");
  if (!email || !first || !last) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const client = await clerkClient();
  const { data: users } = await client.users.getUserList({ emailAddress: [email] });
  if (!users.length) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await client.users.updateUser(users[0].id, { firstName: first, lastName: last });
  return NextResponse.json({ ok: true, id: users[0].id, name: `${first} ${last}` });
}
