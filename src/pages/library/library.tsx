import { createSignal, JSXElement, For, Show } from 'solid-js'
import songs from './songs.json'

const Library = (): JSXElement => {
  const [localTracks] = createSignal(songs)

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🎵 Local Songs</h2>
      <Show
        when={localTracks().length > 0}
        fallback={<p>No songs found in songs.json</p>}
      >
        <For each={localTracks()}>
          {(track) => (
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid #ccc' }}>
              <img
                src={track.cover}
                alt={track.title}
                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
              />
              <h3>{track.title}</h3>
              <p>{track.artist} — {track.album}</p>
              <audio controls src={track.url} style={{ width: '100%' }} />
            </div>
          )}
        </For>
      </Show>
    </div>
  )
}

export default Library
