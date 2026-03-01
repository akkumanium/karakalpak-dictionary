import { MetadataRoute } from 'next'
import { type Script } from '../lib/languages'
import { getDictionaryList, AVAILABLE_PAIRS } from '../lib/dictionary'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdictionary.com'
const SCRIPTS: Script[] = ['lat', 'cyr']
const MAX_URLS_PER_SITEMAP = 50000
// Since each entry generates URLs for all SCRIPTS, we divide the limit
const ENTRIES_PER_CHUNKS = Math.floor(MAX_URLS_PER_SITEMAP / SCRIPTS.length)

export async function generateSitemaps() {
  const sitemaps = [{ id: 'index' }]

  for (const pair of AVAILABLE_PAIRS) {
    const [from, to] = pair.split('-')
    const entries = await getDictionaryList(from, to)
    
    if (!entries) continue
    
    // Calculate how many sitemaps this pair needs
    const numChunks = Math.ceil(entries.length / ENTRIES_PER_CHUNKS)
    
    for (let i = 0; i < numChunks; i++) {
      // Create IDs like "en-fr-0", "en-fr-1", etc.
      sitemaps.push({ id: `${pair}-${i}` })
    }
  }

  return sitemaps
}

export default async function sitemap({
  id,
}: {
  id: string
}): Promise<MetadataRoute.Sitemap> {
  const resolvedId = await id

  if (resolvedId === 'index') {
    return [{ url: BASE_URL, changeFrequency: 'daily', priority: 1 }]
  }

  // Parse the ID (e.g., "en-fr-0" -> pair: "en-fr", chunk: 0)
  const parts = resolvedId.split('-')
  const chunkIndex = parseInt(parts.pop() || '0', 10)
  const pair = parts.join('-') // Reconstructs pair in case of multiple dashes

  if (!AVAILABLE_PAIRS.includes(pair)) {
    return []
  }

  const [from, to] = pair.split('-')
  const allEntries = await getDictionaryList(from, to)

  if (!allEntries) return []

  // Slice the entries for this specific chunk
  const start = chunkIndex * ENTRIES_PER_CHUNKS
  const end = start + ENTRIES_PER_CHUNKS
  const entriesChunk = allEntries.slice(start, end)

  if (entriesChunk.length === 0) return []

  return SCRIPTS.flatMap((script) =>
    entriesChunk.map((entry) => ({
      url: `${BASE_URL}/${from}/${to}/${script}/${encodeURIComponent(entry.source)}`,
    }))
  )
}