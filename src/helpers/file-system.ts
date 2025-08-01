helpers/file-system.ts

import { STATIC_SONGS } from '../data/static-songs'

export const isNativeFileSystemSupported = false

export const getStaticSongs = async () => {
  return STATIC_SONGS.map((song, index) => ({
    name: song.title,
    path: song.src,
    getBlob: async () => {
      const response = await fetch(song.src)
      return await response.blob()
    },
    index,
  }))
}
