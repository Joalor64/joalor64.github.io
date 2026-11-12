import { readdir, stat, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1")), "..");
const OUT = path.join(ROOT, "img", "previews");

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
