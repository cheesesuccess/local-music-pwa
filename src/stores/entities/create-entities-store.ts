import { batch } from 'solid-js'
import { createStore, produce, SetStoreFunction } from 'solid-js/store'
import { nanoid } from 'nanoid'
import { importCloudSongs } from '../../helpers/file-system'
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

  const removeTracks = (ids: string[]) => {
    setState(
      'tracks',
      produce((trackMap) => {
        ids.forEach((id) => {
          delete trackMap[id]
        })
      }),
    )
  }

  const remove = () => {
    setState({
      tracks: {},
      albums: {},
      artists: {},
      playlists: {},
      favorites: [],
    })
  }

// Add inside importTracks()
console.log("📥 create-entities-store.ts: importTracks started")
      
  const importTracks = async () => {
    try {
      const cloudTracks = await importCloudSongs()
      const unknownTracks = await tracksParser(cloudTracks, () => {})
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

  const clearData = () => {
    setState({
      tracks: {},
      albums: {},
      artists: {},
      playlists: {},
      favorites: [],
    })
  }

  const playlistsActions = createPlaylistsActions(state, setState)

  const actions = {
    ...playlistsActions,
    removeTracks,
    remove,
    importTracks,
    clearData,
  }

  return [
    state,
    actions,
    [
      {
        key: 'data-tracks',
        selector: () => state.tracks,
        load: (tracks: State['tracks']) => setState({ tracks }),
      },
      {
        key: 'data-albums',
        selector: () => state.albums,
        load: (albums: State['albums']) => setState({ albums }),
      },
      {
        key: 'data-artists',
        selector: () => state.artists,
        load: (artists: State['artists']) => setState({ artists }),
      },
      {
        key: 'data-playlists',
        selector: () => state.playlists,
        load: (playlists: State['playlists']) => setState({ playlists }),
      },
      {
        key: 'data-favorites',
        selector: () => state.favorites,
        load: (favorites: State['favorites']) => setState({ favorites }),
      },
    ],
  ] as const
}

// ✅ Export global instance
export const [entitiesState, entitiesActions] = createEntitiesStore()

