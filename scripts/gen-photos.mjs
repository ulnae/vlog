// Build-time thumbnail + dimensions manifest generator for the photo gallery.
//
// Reads the {url, text} pairs from docs/.vitepress/theme/utils/photos.ts,
// generates ~480px-wide WebP thumbnails for each original image (into
// docs/public/_thumb/<same-relative-path>.webp), reads each image's real
// dimensions (honoring EXIF orientation), and writes a manifest to
// docs/.vitepress/theme/utils/photos.generated.json.
//
// The gallery then loads the small thumbnails instead of multi-megabyte
// originals, and knows every aspect ratio up front — so there is no runtime
// Image() dimension measurement and no aspect-change rebuild churn.
//
// Run with:  pnpm photos:gen   (or: node scripts/gen-photos.mjs)

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const docsPublic = path.join(root, 'docs', 'public')
const thumbRoot = path.join(docsPublic, '_thumb')
const photosTsPath = path.join(root, 'docs', '.vitepress', 'theme', 'utils', 'photos.ts')
const manifestPath = path.join(root, 'docs', '.vitepress', 'theme', 'utils', 'photos.generated.json')

const THUMB_WIDTH = 480
const WEBP_QUALITY = 80

/** Parse the PHOTOS array out of photos.ts to keep text strings as the source of truth. */
async function readPhotoPairs() {
  const src = await fs.readFile(photosTsPath, 'utf8')
  const pairs = []
  // matches: { url: '/2025/05/11/01.jpeg', text: '护士节快乐🎉' }
  const re = /\{\s*url:\s*['"]([^'"]+)['"]\s*,\s*text:\s*'((?:[^'\\]|\\.)*)'\s*\}/g
  let m
  while ((m = re.exec(src))) {
    // unescape simple \' sequences just in case
    const text = m[2].replace(/\\'/g, "'")
    pairs.push({ url: m[1], text })
  }
  return pairs
}

async function pathExists(p) {
  try { await fs.access(p); return true } catch { return false }
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true })
}

/** EXIF orientations 5-8 are transposed (portrait), so swap w/h for display. */
function displaySize(meta) {
  let w = meta.width || 0
  let h = meta.height || 0
  const ori = meta.orientation || 0
  if (ori >= 5 && ori <= 8) [w, h] = [h, w]
  return { w, h }
}

async function main() {
  const pairs = await readPhotoPairs()
  if (!pairs.length) {
    console.error('[gen-photos] no {url,text} pairs found in photos.ts — aborting.')
    process.exit(1)
  }
  console.log(`[gen-photos] found ${pairs.length} photos in photos.ts`)

  await ensureDir(thumbRoot)

  const manifest = []
  let generated = 0
  let skipped = 0
  let failed = 0

  for (const p of pairs) {
    const rel = p.url.replace(/^\//, '') // 2025/05/11/01.jpeg
    const srcAbs = path.join(docsPublic, rel)

    if (!(await pathExists(srcAbs))) {
      console.warn(`[gen-photos] missing source: ${srcAbs} (url=${p.url})`)
      failed++
      continue
    }

    const thumbRel = rel.replace(/\.(jpe?g)$/i, '.webp')
    const thumbAbs = path.join(thumbRoot, thumbRel)
    await ensureDir(path.dirname(thumbAbs))

    // Read real dimensions once (with auto-orientation).
    const meta = await sharp(srcAbs).rotate().metadata()
    const { w, h } = displaySize(meta)
    if (!w || !h) {
      console.warn(`[gen-photos] could not read dimensions: ${srcAbs}`)
      failed++
      continue
    }

    // Incremental: skip thumbnail re-encode if it's newer than the source.
    const srcStat = await fs.stat(srcAbs)
    let skip = false
    try {
      const thumbStat = await fs.stat(thumbAbs)
      if (thumbStat.mtimeMs > srcStat.mtimeMs) skip = true
    } catch {
      skip = false
    }

    if (!skip) {
      await sharp(srcAbs)
        .rotate() // auto-orient based on EXIF so the thumbnail matches the display aspect
        .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toFile(thumbAbs)
      generated++
    } else {
      skipped++
    }

    manifest.push({
      url: p.url, // '/2025/05/11/01.jpeg' — leading slash, matches photoUrl() convention
      thumb: '/_thumb/' + thumbRel,
      w,
      h
      // NOTE: text intentionally omitted — it stays the source of truth in photos.ts.
    })
  }

  // Stable order: keep the order from photos.ts (already the gallery order).
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8')

  console.log(`[gen-photos] thumbnails: ${generated} generated, ${skipped} up-to-date, ${failed} failed`)
  console.log(`[gen-photos] manifest written: ${path.relative(root, manifestPath)} (${manifest.length} entries)`)

  if (failed > 0) process.exitCode = 1
}

main().catch((err) => {
  console.error('[gen-photos] fatal:', err)
  process.exit(1)
})
