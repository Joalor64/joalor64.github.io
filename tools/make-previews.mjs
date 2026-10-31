/*
 * Makes small WebP previews of big images, so pages load fast while download
 * links still point at the full-size originals.
 *
 *   npm install        (once)
 *   npm run previews   (after adding or changing images)
 *
 * img/<folder>/<name>.png  ->  img/previews/<folder>/<name>.webp
 * Only images that are new or changed since their preview was made are processed.
 * Pages load previews through previewSrc()/previewImg() in js/script.js, which fall
 * back to the original if a preview doesn't exist yet.
 *
 * It also writes img/previews/sizes.json (width and height of every image), so pages can
 * reserve the right amount of space for images before they load and don't jump around.
 */
import { readdir, stat, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1")), "..");
const OUT = path.join(ROOT, "img", "previews");

// folder (relative to img/) -> max width of the preview in pixels
// (or { width, quality } to override the default quality of 82).
// Keep in sync with PREVIEW_FOLDERS in js/script.js.
const TARGETS = {
    "comics": { width: 2400, quality: 90 },
    "wallpapers": 640,
    "gallery": 800,
    "thumbnails": 480,
    "foreverbox/splashes": 1000,
    "foreverbox/albums": 480,
    "foreverbox/icons": 400,
    "news": 480,
    "dreambox/splashes": 1000,
    "dreambox/icons": 400
};

async function* walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) yield* walk(full);
        else if (/\.(png|jpe?g|webp)$/i.test(entry.name)) yield full;
    }
}

let made = 0, skipped = 0;
const sizes = {};
for (const [folder, target] of Object.entries(TARGETS)) {
    const { width, quality = 82 } = typeof target === "number" ? { width: target } : target;
    for await (const file of walk(path.join(ROOT, "img", folder))) {
        const rel = path.relative(path.join(ROOT, "img"), file).split(path.sep).join("/");
        const out = path.join(OUT, rel.replace(/\.\w+$/, ".webp"));
        const { width: w, height: h } = await sharp(file).metadata();
        sizes[rel] = [w, h];
        const [src, dst] = await Promise.all([stat(file), stat(out).catch(() => null)]);
        if (dst && dst.mtimeMs >= src.mtimeMs) { skipped++; continue; }

        await mkdir(path.dirname(out), { recursive: true });
        await sharp(file)
            .resize({ width, withoutEnlargement: true })
            .webp({ quality, alphaQuality: 90, effort: 5 })
            .toFile(out);
        made++;
        console.log("preview:", path.relative(ROOT, out));
    }
}
await mkdir(OUT, { recursive: true });
await writeFile(path.join(OUT, "sizes.json"), JSON.stringify(sizes) + "\n");
console.log(`Done: ${made} made, ${skipped} already up to date. Sizes of ${Object.keys(sizes).length} images saved.`);
