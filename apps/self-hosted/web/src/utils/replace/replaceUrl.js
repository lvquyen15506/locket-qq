import { CONFIG } from "@/config";

export function getImageSrc(url) {
  if (!url) return "";

  const lower = url.toLowerCase();

  // chỉ convert khi là heic / heif
  if (lower.includes(".heic") || lower.includes(".heif")) {
    const convertApi = CONFIG.api.convertApi || "https://api.locket-dio.com";
    return `${convertApi}/api/convert?url=${encodeURIComponent(url)}`;
  }

  // các định dạng khác dùng thẳng
  return url;
}

