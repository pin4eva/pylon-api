import type { IncomingMessage, ServerResponse } from 'node:http'
import { Readable } from 'node:stream'

const METHODS_WITHOUT_BODY = new Set(['GET', 'HEAD'])

async function readRequestBody(req: IncomingMessage): Promise<Buffer | undefined> {
  const method = (req.method ?? 'GET').toUpperCase()
  if (METHODS_WITHOUT_BODY.has(method)) {
    return undefined
  }

  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }

  if (chunks.length === 0) {
    return undefined
  }

  return Buffer.concat(chunks)
}

function resolveRequestUrl(req: IncomingMessage): URL {
  const protocol = (req.headers['x-forwarded-proto'] as string | undefined) ?? 'https'
  const host = (req.headers['x-forwarded-host'] as string | undefined) ?? req.headers.host ?? 'localhost'
  const path = req.url ?? '/'

  return new URL(path, `${protocol}://${host}`)
}

async function forwardResponse(response: Response, res: ServerResponse): Promise<void> {
  res.statusCode = response.status
  res.statusMessage = response.statusText

  const setCookie = response.headers.getSetCookie?.()
  if (setCookie && setCookie.length > 0) {
    res.setHeader('set-cookie', setCookie)
  }

  for (const [key, value] of response.headers) {
    if (key.toLowerCase() === 'set-cookie') {
      continue
    }

    res.setHeader(key, value)
  }

  if (!response.body) {
    const arrayBuffer = await response.arrayBuffer()
    res.end(Buffer.from(arrayBuffer))
    return
  }

  if (typeof Readable.fromWeb === 'function') {
    const nodeStream = Readable.fromWeb(response.body as any)
    await new Promise<void>((resolve, reject) => {
      nodeStream.on('error', reject)
      res.on('error', reject)
      res.on('finish', resolve)
      nodeStream.pipe(res)
    })
    return
  }

  const reader = (response.body as ReadableStream<Uint8Array>).getReader()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }
      if (value) {
        res.write(Buffer.from(value))
      }
    }
  } finally {
    reader.releaseLock()
    res.end()
  }
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = resolveRequestUrl(req)
  const body = await readRequestBody(req)

  const requestInit: RequestInit = {
    method: req.method,
    headers: req.headers as HeadersInit
  }

  if (body) {
    requestInit.body = body as unknown as BodyInit
  }

  const request = new Request(url.toString(), requestInit)

  const { default: app } = await import('../.pylon/index.js')

  if (typeof app?.fetch !== 'function') {
    throw new Error('Pylon app does not expose a fetch handler')
  }

  const response = await app.fetch(request)
  await forwardResponse(response, res)
}
