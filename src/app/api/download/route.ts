import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { downloadMedia, sanitizeFilename } from "@/lib/ytdlp-runner";
import { safelyDeleteFile } from "@/lib/file-cleanup";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 mins on platforms supporting it

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const url = searchParams.get("url");
  const type = searchParams.get("type") || "video"; // 'video' | 'audio'
  const quality = searchParams.get("quality") || "1080";
  const audioBitrate = searchParams.get("bitrate") || "320";
  const userTitle = searchParams.get("title") || "";

  if (!url || !url.trim()) {
    return NextResponse.json(
      { success: false, error: "YouTube URL is required" },
      { status: 400 }
    );
  }

  const isAudio = type === "audio" || type === "mp3";

  try {
    const { filePath, fileName, mimeType } = await downloadMedia({
      url,
      isAudio,
      quality,
      audioBitrate,
    });

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: "Generated file could not be found." },
        { status: 500 }
      );
    }

    const stat = fs.statSync(filePath);
    const ext = path.extname(fileName);
    const finalName = userTitle
      ? `${sanitizeFilename(userTitle)}${ext}`
      : fileName;

    // Create readable web stream from node stream
    const nodeStream = fs.createReadStream(filePath);
    
    // Cleanup file once stream finishes or errors
    let cleaned = false;
    const cleanup = () => {
      if (!cleaned) {
        cleaned = true;
        safelyDeleteFile(filePath);
      }
    };

    nodeStream.on("close", cleanup);
    nodeStream.on("error", cleanup);

    // Transform Node.js Readable to Web ReadableStream
    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on("data", (chunk) => {
          controller.enqueue(chunk);
        });
        nodeStream.on("end", () => {
          controller.close();
          cleanup();
        });
        nodeStream.on("error", (err) => {
          controller.error(err);
          cleanup();
        });
      },
      cancel() {
        nodeStream.destroy();
        cleanup();
      },
    });

    const encodedFilename = encodeURIComponent(finalName);

    return new Response(webStream, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Length": stat.size.toString(),
        "Content-Disposition": `attachment; filename="${finalName}"; filename*=UTF-8''${encodedFilename}`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (err: any) {
    console.error("API download handler error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to download media" },
      { status: 500 }
    );
  }
}
