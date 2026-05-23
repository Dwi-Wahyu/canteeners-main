import { NextResponse } from "next/server";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return new Response("Missing url parameter", { status: 400 });
  }

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return new Response(`Failed to fetch image: ${response.statusText}`, {
        status: response.status,
      });
    }

    const blob = await response.blob();
    const headers = new Headers();
    headers.set(
      "Content-Type",
      response.headers.get("Content-Type") || "application/octet-stream"
    );
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new Response(blob, {
      status: 200,
      headers,
    });
  } catch (error) {
    return new Response(`Error proxying image: ${(error as Error).message}`, {
      status: 500,
    });
  }
}
