import build from '@hono/vite-build/node'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/node'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    build({
      entry: 'src/index.tsx',
      entryContentAfterHooks: [
        async (appName) => {
          return `import { serve } from '@hono/node-server'
const port = Number(process.env.PORT) || 3000
const server = serve({ fetch: ${appName}.fetch, port })
console.log(\`Server running at http://0.0.0.0:\${port}\`)
const gracefulShutdown = () => {
  server.close(() => process.exit(0))
  setTimeout(() => process.exit(1), 5000).unref()
}
process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)
`
        }
      ]
    }),
    devServer({
      adapter,
      entry: 'src/index.tsx'
    })
  ],
  server: {
    port: 3000,
    host: '0.0.0.0'
  }
})
