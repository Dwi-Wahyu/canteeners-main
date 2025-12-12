import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    const filename = formData.get("filename") as string | null;

    if (!file) {
        return NextResponse.json(
            { success: false, error: "No file uploaded" },
            { status: 400 }
        );
    }

    if (!filename) {
        return NextResponse.json(
            { success: false, error: "No filename" },
            { status: 400 }
        );
    }

    const blob = await put(filename, file, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json(blob);
}
