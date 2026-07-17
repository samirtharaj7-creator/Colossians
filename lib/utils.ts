export function padChapter(chapter: number | string) {
  return String(chapter).padStart(2, "0");
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
