import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const formData = await request.formData();

  const file = formData.get("file") as File | null;
  const path = formData.get("path") as string | null;

  if (!file) {
    return NextResponse.json(
      { success: false, error: "No file uploaded" },
      { status: 400 }
    );
  }

  if (!path) {
    return NextResponse.json(
      { success: false, error: "No path provided" },
      { status: 400 }
    );
  }

  // Forward to backend
  const backendFormData = new FormData();
  backendFormData.append("path", path);
  backendFormData.append("file", file);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload`,
      {
        method: "POST",
        body: backendFormData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
