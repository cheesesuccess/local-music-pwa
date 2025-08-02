import { batch } from 'solid-js'
import { createStore, produce, SetStoreFunction } from 'solid-js/store'
import { nanoid } from 'nanoid'
import { getCloudSongs } from '../../helpers/file-system'
import { tracksParser } from '../../helpers/tracks-file-parser/tracks-file-parser'
import {
  Track,
  Album,
  Artist,
  Playlist,
  MusicItemType,
  UnknownTrack,
} from '../../types/types'
import { UNKNOWN_ITEM_ID } from '../../types/constants'
import { createPlaylistsActions } from './create-playlists-actions'
import { toast } from '~/components/toast/toast'

export interface State {
  tracks: { [trackId: string]: Track }
  albums: { [albumId: string]: Album }
  artists: { [artistId: string]: Artist }
  playlists: { [playlistId: string]: Playlist }
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

  const playlistsActions = createPlaylistsActions(setState)

  const loadFromCloud = async () => {
    try {
      console.log('[entities-store] Fetching cloud songs...')
      const fileWrappers = await getCloudSongs()

      if (!fileWrappers || fileWrappers.length === 0) {
        toast.error('No songs found in songs.json or URL')
        console.warn('[entities-store] No songs returned from getCloudSongs()')
        return
      }

      const unknownTracks: UnknownTrack[] = await tracksParser(fileWrappers)

      if (!Array.isArray(unknownTracks)) {
        console.error('[entities-store] tracksParser returned invalid result:', unknownTracks)
        return
      }

      batch(() => {
        unknownTracks.forEach((track) => {
          const trackId = nanoid()

          const albumId = track.album || UNKNOWN_ITEM_ID
          const artistId = track.artist || UNKNOWN_ITEM_ID

          setState(produce((s) => {
            s.tracks[trackId] = {
              id: trackId,
              title: track.title || 'Unknown Title',
              artist: artistId,
              album: albumId,
              image: track.image || '',
              path: track.path,
              duration: track.duration || 0,
            }

            if (!s.albums[albumId]) {
              s.albums[albumId] = {
                id: albumId,
                title: track.album || 'Unknown Album',
                image: track.image || '',
                tracks: [],
                artist: artistId,
              }
            }

            if (!s.artists[artistId]) {
              s.artists[artistId] = {
                id: artistId,
                name: track.artist || 'Unknown Artist',
                tracks: [],
              }
            }

            s.albums[albumId].tracks.push(trackId)
            s.artists[artistId].tracks.push(trackId)
          }))
        })
      })

      console.log(`[entities-store] Loaded ${unknownTracks.length} tracks`)
    } catch (err) {
      console.error('[entities-store] Error loading cloud songs:', err)
      toast.error('Failed to load songs from cloud.')
    }
  }

  return {
    state,
    setState,
    loadFromCloud, // ✅ must be returned
    ...playlistsActions,
  }
}
