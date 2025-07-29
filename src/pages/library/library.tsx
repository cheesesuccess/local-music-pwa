import { createMemo, createSignal, For, JSXElement, Show } from 'solid-js'
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
import * as styles from './library.css'
import React, { useEffect, useState } from "react";

const Library = () => {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    fetch("/songs.json")
      .then((res) => res.json())
      .then((data) => setSongs(data));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Library</h1>
      <ul>
        {songs.map((song) => (
          <li key={song.id}>
            <strong>{song.title}</strong> by {song.artist}
            <br />
            <audio controls src={song.url} style={{ width: "100%" }} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Library;
