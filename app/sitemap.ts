import { MetadataRoute } from 'next'
import { unstable_cache } from 'next/cache'
import { type Script } from '../lib/languages'
import { getDictionaryList, AVAILABLE_PAIRS } from '../lib/dictionary'
import { toPairSegment } from '../lib/routes'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://qqsozlik.com'
const SCRIPTS: Script[] = ['lat', 'cyr']
const ENTRIES_PER_CHUNK = Math.floor(50000 / SCRIPTS.length)

type IndexSlot = { pair: string; chunk: number }

// Cached so it runs once per build, not once per sitemap ID
const buildIndex = unstable_cache(
  async (): Promise<IndexSlot[]> => {
    const slots: IndexSlot[] = []

    for (const pair of AVAILABLE_PAIRS) {
      const [from, to] = pair.split('-')

      try {
        const list = await getDictionaryList(from, to)
        if (!list?.length) continue

        const numChunks = Math.ceil(list.length / ENTRIES_PER_CHUNK)
        for (let i = 0; i < numChunks; i++) {
          slots.push({ pair, chunk: i })
        }
      } catch (err) {
        // Now errors are visible instead of silently returning []
        console.error(`[sitemap] Failed to load dictionary for ${pair}:`, err)
      }
    }

    console.log(`[sitemap] Built index with ${slots.length} slots`)
    return slots
  },
  ['sitemap-index'],
  { revalidate: 3600 }
)

export async function generateSitemaps() {
  const index = await buildIndex()
  return [{ id: 0 }, ...index.map((_, i) => ({ id: i + 1 }))]
}

type SitemapId = string | number | undefined | Promise<string | number | undefined>

function toNumberId(id: SitemapId): Promise<number | null> {
  return Promise.resolve(id).then((value) => {
    if (value === undefined || value === null) return null
    const num = typeof value === 'number' ? value : Number(value)
    return Number.isFinite(num) ? num : null
  })
}

export default async function sitemap({
  id,
}: {
  id: SitemapId
}): Promise<MetadataRoute.Sitemap> {
  const resolvedId = await toNumberId(id)
  if (resolvedId === null) {
    console.error(`[sitemap] Invalid id value:`, id)
    return []
  }

  if (resolvedId === 0) {
    const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL
    const pairPages = AVAILABLE_PAIRS.map((pair) => {
      const [from, to] = pair.split('-')
      return `${baseUrl}/${toPairSegment(from, to)}`
    })
    const urls = [baseUrl, `${baseUrl}/about`, ...pairPages]
    const uniqueUrls = Array.from(new Set(urls))

    return uniqueUrls.map((url) => ({
      url,
      changeFrequency: 'daily',
      priority: url === baseUrl ? 1 : 0.8,
    }))
  }

  const index = await buildIndex()
  const slot = index[resolvedId - 1]

  if (!slot) {
    console.error(`[sitemap] No slot found for id=${resolvedId}`)
    return []
  }

  const { pair, chunk: chunkIndex } = slot
  const [from, to] = pair.split('-')

  const allEntries = await getDictionaryList(from, to)
  if (!allEntries?.length) return []

  const start = chunkIndex * ENTRIES_PER_CHUNK
  const chunk = allEntries.slice(start, start + ENTRIES_PER_CHUNK)
  if (!chunk.length) return []

  return SCRIPTS.flatMap((script) =>
    chunk.map((entry) => ({
      url: `${BASE_URL}/${toPairSegment(from, to)}/${script}/${encodeURIComponent(entry.source)}`,
    }))
  )
}
