import '@getcronit/pylon'

declare module '@getcronit/pylon' {
  interface Bindings {}

  interface Variables {}
}

declare module '../.pylon/index.js' {
  const app: any
  export default app
}
