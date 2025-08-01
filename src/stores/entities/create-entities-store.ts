import { batch } from 'solid-js'
import { createStore, produce, SetStoreFunction } from 'solid-js/store'
import { nanoid } from 'nanoid'
import { getFilesFromDirectory, importCloudSongs } from '../../helpers/file-system'
import { tracksParser } from '../../helpers/tracks-file-parser/tracks-file-parser'
import {
  Track,
  Album,
  Artist,
  Playlist,
  MusicItemType,
  UnknownTrack,
  FileWrapper,
} from '../../types/types'
import { UNKNOWN_ITEM_ID } from '../../types/constants'
import { createPlaylistsActions } from './create-playlists-actions'
import { toast } from '~/components/toast/toast'

export interface State {
  tracks: {
    [trackId: string]: Track
  }
  albums: {
    [albumId: string]: Album
  }
  artists: {
    [artistId: string]: Artist
  }
  playlists: {
    [playlistId: string]: Playlist
  }
  favorites: string[]
}

export type SetState = SetStoreFunction<State>

export const createEntitiesStore = () => {
  const [state, setState] = createStore<State>({
    tracks: {},
    albums: {},
    artists: {},
    playlists: {},
    favorites: [],
  })

  const addTracks = async () => {
    try {
      // ✅ LOAD SONGS FROM CLOUD INSTEAD OF DEVICE
      const cloudTracks = await importCloudSongs()
      const unknownTracks = await tracksParser(cloudTracks, () => {})
      // Transform into actual Track entities
      batch(() => {
        unknownTracks.forEach((track) => {
          const id = track.id || nanoid()
          setState(
            produce((s) => {
              s.tracks[id] = {
                ...track,
                id,
                type: MusicItemType.TRACK,
              }
            }),
          )
        })
      })
    } catch (e) {
      toast.error("Failed to import tracks.")
    }
  }

  return {
    state,
    setState,
    addTracks,
  }
}
export const [entitiesState, entitiesActions] = createEntitiesStore()
