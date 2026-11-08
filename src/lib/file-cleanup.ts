import fs from "fs";
import path from "path";

export const TEMP_DIR = path.join(process.cwd(), ".temp_downloads");

// Ensure temp dir exists
if (!fs.existsSync(TEMP_DIR)) {
  try {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  } catch (err) {
    console.error("Failed to create TEMP_DIR:", err);
  }
}

/**
 * Deletes a single file safely if it exists.
 */
export function safelyDeleteFile(filePath: string): void {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.warn(`Failed to clean up file ${filePath}:`, err);
  }
}

/**
 * Periodically purges files older than maxAgeMs in TEMP_DIR.
 */
export function purgeStaleTempFiles(maxAgeMs = 3600000): void {
  try {
    if (!fs.existsSync(TEMP_DIR)) return;
    const now = Date.now();
    const files = fs.readdirSync(TEMP_DIR);
    for (const file of files) {
      if (file.endsWith(".txt")) continue; // keep cookies.txt if present
      const fullPath = path.join(TEMP_DIR, file);
      try {
        const stats = fs.statSync(fullPath);
        if (now - stats.mtimeMs > maxAgeMs) {
          fs.unlinkSync(fullPath);
        }
      } catch {}
    }
  } catch (err) {
    console.warn("Failed to purge stale temp files:", err);
  }
}

