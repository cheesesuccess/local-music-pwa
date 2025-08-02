/// <reference lib='WebWorker' />

import { Buffer } from 'buffer'
import { parseBuffer as parseMetadata } from 'music-metadata'
import { TrackParseMessage } from '../message-types'
import type { UnknownTrack, FileWrapper } from '../../../types/types'
import { extractColorFromImage } from './color-from-image'

// @ts-ignore
globalThis.Buffer = Buffer

declare const self: DedicatedWorkerGlobalScope

const FILE_SIZE_LIMIT_500MB = 5e8

const parseTrack = async (
  fileWrapper: FileWrapper,
): Promise<UnknownTrack | null> => {
  try {
    const file =
      fileWrapper.type === 'file'
        ? fileWrapper.file
        : await fileWrapper.file.getFile()

    if (file.size > FILE_SIZE_LIMIT_500MB) return null

    const fileBuffer = await new Response(file).arrayBuffer()
    const fileUint8 = new Uint8Array(fileBuffer)

    const metadata = await parseMetadata(fileUint8, { mimeType: file.type })

    return {
      id: file.name,
      title: metadata.common.title || file.name,
      artist: metadata.common.artist || 'Unknown Artist',
      album: metadata.common.album || '',
      coverUrl: '', // placeholder
      url: URL.createObjectURL(file),
      duration: metadata.format.duration || 0,
      source: 'local',
    }
  } catch {
    return null
  }
}

self.addEventListener('message', async ({ data }: MessageEvent<FileWrapper[]>) => {
  const tracks: UnknownTrack[] = []
  for (let i = 0; i < data.length; i++) {
    const track = await parseTrack(data[i])
    if (track) {
      tracks.push(track)
    }

    self.postMessage({ parsedCount: i + 1 } as TrackParseMessage)
}

self.postMessage({ finished: true, tracks } as TrackParseMessage)
})






// helpers/tracks-file-parser/worker/tracks-file-parser-worker.ts

console.log("👷‍♂️ Worker: Starting track parsing")

// After const parseAllTracks = async (...) {
console.log("📦 Worker: Received", inputFiles.length, "files")

// Inside for loop after const metadata = await parseTrack(file)
console.log("✅ Worker: Parsed track", parsedCount + 1)
