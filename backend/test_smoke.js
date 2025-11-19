// Simple smoke test for the server endpoints
// Usage: node test_smoke.js

const serverUrl = process.env.SERVER_URL || 'http://localhost:5000'

async function run() {
  try {
    console.log(`Checking ${serverUrl}/`)
    const root = await fetch(`${serverUrl}/`)
    const rootText = await root.text()
    console.log('Root response:', root.status)

    console.log(`Checking ${serverUrl}/api/messages`)
    const msgs = await fetch(`${serverUrl}/api/messages`)
    const msgsJson = await msgs.json()
    console.log('Messages endpoint status:', msgs.status)
    console.log('Messages count:', Array.isArray(msgsJson) ? msgsJson.length : 'unexpected')
  } catch (e) {
    console.error('Smoke test failed:', e.message)
    process.exit(1)
  }
}

run()
