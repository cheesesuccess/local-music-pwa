import { FileWrapper, UnknownTrack } from '../../types/types'
import { TrackParseMessage } from './message-types'

export type TrackParsedFn = (totalParsedCount: number) => void

export const tracksParser = async (
  files: FileWrapper[],
  trackParsed: TrackParsedFn = () => {},
): Promise<UnknownTrack[]> => {
  try {
    const TrackWorkerModule = await import(
      './worker/tracks-file-parser-worker?worker&inline'
    )
    const TrackWorker = TrackWorkerModule.default
    const worker = new TrackWorker()

    console.log('[tracksParser] Starting track parsing...')

    return await new Promise((resolve, reject) => {
      worker.addEventListener('error', (err) => {
        console.error('[tracksParser] Worker error:', err)
        reject(err)
      })

      worker.addEventListener('message', ({ data }: MessageEvent<UnknownTrack[]>) => {
        if (Array.isArray(data)) {
          console.log(`[tracksParser] Received ${data.length} tracks from worker`)
          resolve(data)
        } else {
          console.warn('[tracksParser] Unexpected data received from worker:', data)
          resolve([])
        }
      })

      // ✅ This is the most important fix — make sure worker expects { files }
      worker.postMessage({ files })
    })
  } catch (err) {
    console.error('[tracksParser] Failed to start worker:', err)
    return []
  }
}
