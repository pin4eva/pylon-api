let cachedApp: any;

async function getPylonApp() {
  if (!cachedApp) {
    const module = await import('../.pylon/index.js')
    cachedApp = module.default ?? module
  }
  return cachedApp
}

export default {
  async fetch(request: Request) {
    const app = await getPylonApp()

    if (typeof app?.fetch !== 'function') {
      throw new Error('Pylon app does not expose a fetch handler')
    }

    return app.fetch(request)
  }
}
