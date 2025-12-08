import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { nanoid } from "nanoid";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid") || nanoid();

  const token = await adminAuth.createCustomToken(uid, {
    guest: true,
  });

  return NextResponse.json({ token, uid });
}
