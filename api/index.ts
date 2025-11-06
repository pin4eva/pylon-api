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

app.get('/health', (ctx, next) => {

  return new Response('Welcome home')
})

export default app
