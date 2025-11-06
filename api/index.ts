import pylonAppModule from '../.pylon/index.js'

const app = (pylonAppModule as any).default ?? (pylonAppModule as any)

if (typeof app?.fetch !== 'function') {
  throw new Error('Pylon build output does not expose a fetch handler')
}

export default {
  async fetch(request: Request) {
    return app.fetch(request)
  }
}
