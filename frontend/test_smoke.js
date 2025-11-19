// Simple smoke test for the client dev server
// Usage: node test_smoke.js

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'

async function run() {
  try {
    console.log(`Checking ${clientUrl}/`)
    const root = await fetch(`${clientUrl}/`)
    const text = await root.text()
    console.log('Client root status:', root.status)
    console.log('Client HTML length:', text.length)
  } catch (e) {
    console.error('Client smoke test failed:', e.message)
    process.exit(1)
  }
}

run()
