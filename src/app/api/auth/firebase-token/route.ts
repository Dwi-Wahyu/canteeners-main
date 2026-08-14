import { NextResponse } from "next/server";

export async function GET(req: Request) {
  return NextResponse.json({ error: null, token: null, uid: null }, { status: 200 });
}
