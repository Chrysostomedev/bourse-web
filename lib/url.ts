// URL utilities

export function resolveStorageUrl(url: string | null): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `/storage/${url}`;
}

export function fileExtension(filename: string): string {
  if (!filename) return "";
  return filename.split(".").pop()?.toLowerCase() || "";
}

export function fileName(path: string): string {
  if (!path) return "";
  return path.split("/").pop() || "";
}
