import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { adminAuth } from "@/lib/firebase/admin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid"); // firebase uid

  if (!uid) {
    return NextResponse.json({ error: "uid is required" }, { status: 400 });
  }

  const token = await adminAuth.createCustomToken(uid, {
    guest: true,
  });

  return NextResponse.json({ error: null, token, uid }, { status: 200 });
}
