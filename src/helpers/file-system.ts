import { FileWrapper } from '../types/types'

// This fixes the Render build error by keeping the expected export
export const isNativeFileSystemSupported = false

/**
 * This version bypasses local file selection and instead fetches a cloud JSON
 * file containing song metadata and URLs.
 */
const SONGS_JSON_URL = '/songs.json' // Change to full cloud URL if hosted elsewhere

export const getCloudSongs = async (): Promise<FileWrapper[]> => {
  try {
    console.log('[file-system.ts] Fetching songs from:', SONGS_JSON_URL)

    const response = await fetch(SONGS_JSON_URL)
    if (!response.ok) {
      console.error('[file-system.ts] Failed to fetch songs.json:', response.statusText)
      return []
    }

    const songs = await response.json()

    if (!Array.isArray(songs)) {
      console.error('[file-system.ts] songs.json is not an array')
      return []
    }

    const formatted: FileWrapper[] = songs.map((song, idx) => ({
      name: song.title || `song-${idx + 1}`,
      path: song.url,
      url: song.url,
      duration: song.duration || 0,
      artist: song.artist || 'Unknown Artist',
      album: song.album || '',
      image: song.image || '',
      id: song.id || `song-${idx + 1}`,
      type: 'audio/mpeg',
    }))

    console.log(`[file-system.ts] Loaded ${formatted.length} songs from cloud`)
    return formatted
  } catch (err) {
    console.error('[file-system.ts] Error fetching songs:', err)
    return []
  }
}
