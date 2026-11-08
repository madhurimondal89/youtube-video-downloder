import { NextRequest, NextResponse } from "next/server";
import { getVideoMetadata } from "@/lib/ytdlp-runner";
import { purgeStaleTempFiles } from "@/lib/file-cleanup";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Purge any old files in background
  purgeStaleTempFiles();

  const { searchParams } = req.nextUrl;
  const url = searchParams.get("url");

  if (!url || !url.trim()) {
    return NextResponse.json(
      { success: false, error: "YouTube URL is required" },
      { status: 400 }
    );
  }

  try {
    const info = await getVideoMetadata(url);
    return NextResponse.json({ success: true, data: info });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to inspect video" },
      { status: 500 }
    );
  }
}
