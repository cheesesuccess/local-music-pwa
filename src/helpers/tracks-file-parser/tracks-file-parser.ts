import { FileWrapper, UnknownTrack } from '../../types/types'
import { TrackParseMessage } from './message-types'

export type TrackParsedFn = (totalParsedCount: number) => void

export const tracksParser = async (
  files: FileWrapper[],
  trackParsed: TrackParsedFn,
): Promise<UnknownTrack[]> => {
  // ✅ Skip parsing if input is already remote track metadata
  if (files.length > 0 && (files as any)[0].url) {
    return files as any as UnknownTrack[];
  }

  const TrackWorkerModule = await import(
    './worker/tracks-file-parser-worker?worker&inline'
  )
  const TrackWorker = TrackWorkerModule.default

  return new Promise((resolve, reject) => {
    const worker = new TrackWorker()

    worker.addEventListener('error', reject)
    worker.addEventListener(
      'message',
      ({ data }: MessageEvent<TrackParseMessage>) => {
        if (data.finished) {
          resolve(data.tracks)
        } else {
          trackParsed(data.parsedCount)
        }
      },
    )

    worker.postMessage(files)
  })
}





















import { FileWrapper, UnknownTrack } from '../../types/types'
import { TrackParseMessage } from './message-types'

export type TrackParsedFn = (totalParsedCount: number) => void

export const tracksParser = async (
  files: FileWrapper[],
  trackParsed: TrackParsedFn,
): Promise<UnknownTrack[]> => {
  console.log("🎧 tracksParser: Received", files.length, "files")

  const TrackWorkerModule = await import(
    './worker/tracks-file-parser-worker?worker&inline'
  )
  const TrackWorker = TrackWorkerModule.default

  return new Promise((resolve, reject) => {
    const worker = new TrackWorker()

    worker.addEventListener('error', (err) => {
      console.error("❌ Worker Error:", err)
      reject(err)
    })

    worker.addEventListener(
      'message',
      ({ data }: MessageEvent<TrackParseMessage>) => {
        if (data.finished) {
          console.log("✅ Worker finished parsing", data.tracks.length, "tracks")
          resolve(data.tracks)
        } else {
          trackParsed(data.parsedCount)
        }
      },
    )

    worker.postMessage(files)
  })
}
