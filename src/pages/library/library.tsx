import { createEffect, createMemo, createSignal, For, JSXElement, Show } from 'solid-js'
import { Outlet, useNavigate, NavLink, useMatch } from 'solid-app-router'
import { CSSTransition } from '~/components/css-transition/css-transition'
import { Icon } from '~/components/icon/icon'
import { IconButton } from '~/components/icon-button/icon-button'
import { useMenu } from '~/components/menu/menu'
import { useEntitiesStore, useLibraryStore } from '~/stores/stores'
import { MessageBanner } from '~/components/message-banner/message-banner'
import { LibraryPageConfig, CONFIG } from './config'
import { MusicItemType } from '~/types/types'
import { useMapRouteToValue } from '~/helpers/router-match'
import { Scaffold } from '~/components/scaffold/scaffold'
import { AppTopBar } from '~/components/app-top-bar/app-top-bar'
import { createMediaQuery } from '~/helpers/hooks/create-media-query'
import { clx, IS_DEVICE_A_MOBILE } from '~/utils'
// Temporary fallback to prevent crash if CSS vars are missing
const styles = {
  root: '',
  rootMobile: '',
  header: '',
  main: '',
}

const [installEvent, setInstallEvent] = createSignal<Event | null>(null)

export default function Library(): JSXElement {
  const navigate = useNavigate()
  const { loadFromCloud } = useEntitiesStore()

  createEffect(() => {
    console.log('[library.tsx] Attempting to load songs from cloud...')
    if (typeof loadFromCloud === 'function') {
      loadFromCloud()
        .then(() => console.log('[library.tsx] Songs loaded successfully.'))
        .catch((err) => console.error('[library.tsx] Error loading songs:', err))
    } else {
      console.error('[library.tsx] loadFromCloud is not a function:', loadFromCloud)
    }
  })

  const menu = useMenu()
  const config = useMapRouteToValue<LibraryPageConfig>(CONFIG)
  const isDesktop = createMediaQuery('(min-width: 1024px)')

  return (
    <Scaffold
      class={clx(styles.root, IS_DEVICE_A_MOBILE && styles.rootMobile)}
      topBar={<AppTopBar />}
      menu={menu}
    >
      <Show when={typeof config === 'function' && config()?.header}>
        {(header) => <header class={styles.header}>{header?.()}</header>}
      </Show>

      <main class={styles.main}>
        <Outlet />
      </main>

      <Show when={!isDesktop()}>
        <MessageBanner />
      </Show>
    </Scaffold>
  )
}
