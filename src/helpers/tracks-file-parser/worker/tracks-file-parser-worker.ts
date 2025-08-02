/// <reference lib='WebWorker' />

import { Buffer } from 'buffer'
import { TrackParseMessage } from '../message-types'
import type { UnknownTrack, FileWrapper } from '../../../types/types'

declare const self: DedicatedWorkerGlobalScope

self.onmessage = async (e: MessageEvent<TrackParseMessage>) => {
  try {
    const { files } = e.data

    console.log('[worker] Received files to parse:', files?.length)

    const parsedTracks: UnknownTrack[] = []

    for (const file of files) {
      if (!file || !file.url) {
        console.warn('[worker] Skipping file with no URL:', file)
        continue
      }

      parsedTracks.push({
        id: file.id || file.name,
        title: file.name,
        artist: file.artist || 'Unknown Artist',
        album: file.album || '',
        path: file.url,
        image: file.image || '',
        duration: file.duration || 0,
      })
    }

    console.log('[worker] Parsed tracks count:', parsedTracks.length)
    self.postMessage(parsedTracks)
  } catch (err) {
    console.error('[worker] Error parsing tracks:', err)
    self.postMessage([])
  }
}
