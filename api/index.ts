import {app} from '@getcronit/pylon'

export const graphql = {
  Query: {
    sum: (a: number, b: number) => a + b,
    hello: () => 'Hello, world!'
  },
  Mutation: {
    divide: (a: number, b: number) => a / b
  }
}
app.get("/api",()=>{
  return new Response("Welcome to the Pylon API")
})
app.get('/api/health', (ctx, next) => {

  return new Response('Ok', {status: 200})
})

export default app
