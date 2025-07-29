import path from 'node:path'
import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import { createHtmlPlugin } from 'vite-plugin-html'
import { ViteWebfontDownload } from 'vite-plugin-webfont-dl'
import manifest from './package.json'
import { mangleClassNames } from './lib/vite-mangle-classnames'
import { injectScriptsToHtmlDuringBuild } from './lib/vite-inject-scripts-to-html'
import { serviceWorker } from './lib/vite-service-worker'

const isDev = process.env.NODE_ENV !== 'production'

const createMScreenshot = (name: string, sizes: string) => ({
  sizes,
  src: `/screenshots/${name}.webp`,
  type: 'image/webp',
})

export default defineConfig({
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT) || 5173
  },
  build: {
    target: 'esnext',
    polyfillDynamicImport: false,
    polyfillModulePreload: false,
    cssCodeSplit: false,
    minify: 'terser',
    terserOptions: {
      output: {
        comments: false,
      },
      module: true,
      compress: {
        passes: 3,
        unsafe_math: true,
        unsafe_methods: true,
        unsafe_arrows: true,
      },
      mangle: {
        properties: {
          regex: /^_/,
        },
      },
    },
    rollupOptions: {
      output: {
        manualChunks: undefined,
        preferConst: true,
      },
    },
  },
  plugins: [
    createHtmlPlugin(),
    injectScriptsToHtmlDuringBuild({
      input: ['./src/disable-app-if-not-supported.ts'],
    }),
    mangleClassNames(),
    vanillaExtractPlugin(),
    solidPlugin({
      hot: false,
    }),
    ViteWebfontDownload([
      'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;500&display=swap',
    ]),
    !isDev && serviceWorker({
      manifest: {
        short_name: 'Snae',
        name: 'Snae player',
        start_url: '/',
        scope: '../',
        theme_color: '#1a1a1a',
        background_color: '#1a1a1a',
        display: 'standalone',
        orientation: 'portrait',
        description: manifest.description,
        icons: [
          {
            src: '/icons/icon_responsive.svg',
            type: 'image/svg+xml',
            sizes: 'any',
            purpose: 'any',
          },
          {
            src: '/icons/icon_maskable.svg',
            type: 'image/svg+xml',
            sizes: 'any',
            purpose: 'maskable',
          },
        ],
        screenshots: [
          createMScreenshot('small_1', '1079x1919'),
          createMScreenshot('small_2', '1079x1919'),
          createMScreenshot('small_3', '1079x1919'),
          createMScreenshot('medium_1', '1276x960'),
          createMScreenshot('medium_2', '1276x960'),
          createMScreenshot('medium_3', '1276x960'),
        ],
      },
    })
  ].filter(Boolean),
})
