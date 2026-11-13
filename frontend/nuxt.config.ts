import { themeScript } from './app/lib/theme-script';

// https://nuxt.com/docs/api/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  // Registers <VueLenis> and useLenis() for smooth scrolling.
  modules: ['lenis/nuxt'],

  typescript: {
    strict: true,
  },

  // Plain component names (<ThemeToggle>, <Donut>) regardless of which folder they live in.
  components: [{ path: '~/components', pathPrefix: false }],

  css: ['lenis/dist/lenis.css', '~/assets/css/main.css'],

  runtimeConfig: {
    // Where /api/* is proxied. Override at runtime with NUXT_BACKEND_URL.
    backendUrl: process.env.BACKEND_URL || 'http://localhost:4000',
  },

  // The dashboard only works with a logged-in user and fetches everything client-side.
  routeRules: {
    '/app/**': { ssr: false },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Cashflow',
      meta: [
        { name: 'description', content: 'Track every expense, get a daily spending allowance, and see where your money goes.' },
        { name: 'theme-color', media: '(prefers-color-scheme: light)', content: '#ffffff' },
        { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: '#050605' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' }],
      // Sets the theme before first paint so the page never flashes the wrong one.
      script: [{ innerHTML: themeScript, tagPosition: 'head' }],
    },
  },

  nitro: {
    routeRules: {
      '/**': {
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'same-origin',
          'X-Frame-Options': 'DENY',
        },
      },
    },
  },
});
