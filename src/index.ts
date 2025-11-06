import {app} from '@getcronit/pylon'

export const graphql = {
  Query: {
    hello: () => {
      return 'Hello, world!'
    }
  },
  Mutation: {}
}

app.get("/api", () => {
  return new Response("Welcome to the Pylon API")
});

app.get('/', () => {
  return new Response('Ok', { status: 200 })
})
export default app
