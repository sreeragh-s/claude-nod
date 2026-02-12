#!/usr/bin/env node

// Test script for Claude Permission Overlay
// Run the app first with `npm run dev`, then run this script.
// It sends mock permission requests so you can preview the overlay.

const http = require('http')
const readline = require('readline')

const PORT = 19191
const HOST = '127.0.0.1'

const TEST_REQUESTS = [
  {
    name: 'Bash command',
    payload: {
      tool_name: 'Bash',
      tool_input: { command: 'rm -rf /tmp/old-builds && echo "cleaned up"' }
    }
  },
  {
    name: 'Edit file (multi-line diff)',
    payload: {
      tool_name: 'Edit',
      tool_input: {
        file_path: '/Users/you/project/src/auth/login.ts',
        old_string: 'const token = jwt.sign({ userId }, SECRET)\nconst expires = Date.now() + 3600\nreturn { token, expires }',
        new_string: 'const token = jwt.sign({ userId, role }, SECRET, { expiresIn: "1h" })\nconst expires = Date.now() + 3600 * 1000\nconst refreshToken = jwt.sign({ userId }, REFRESH_SECRET)\nreturn { token, refreshToken, expires }'
      }
    }
  },
  {
    name: 'Write file',
    payload: {
      tool_name: 'Write',
      tool_input: { file_path: '/Users/you/project/config/database.yml' }
    }
  },
  {
    name: 'Read file',
    payload: {
      tool_name: 'Read',
      tool_input: { file_path: '/etc/hosts' }
    }
  },
  {
    name: 'Web search',
    payload: {
      tool_name: 'WebSearch',
      tool_input: { query: 'electron always on top macos 2026' }
    }
  },
  {
    name: 'Glob pattern',
    payload: {
      tool_name: 'Glob',
      tool_input: { pattern: 'src/**/*.test.ts' }
    }
  },
  {
    name: 'Grep search',
    payload: {
      tool_name: 'Grep',
      tool_input: { pattern: 'TODO|FIXME|HACK', path: '/Users/you/project' }
    }
  },
  {
    name: 'Long bash command',
    payload: {
      tool_name: 'Bash',
      tool_input: { command: 'docker compose -f docker-compose.prod.yml up -d --build --force-recreate --remove-orphans api worker scheduler' }
    }
  }
]

function sendRequest(payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload)
    const req = http.request(
      {
        hostname: HOST,
        port: PORT,
        path: '/permission',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      },
      (res) => {
        let data = ''
        res.on('data', (chunk) => { data += chunk })
        res.on('end', () => {
          try {
            resolve(JSON.parse(data))
          } catch {
            resolve({ raw: data })
          }
        })
      }
    )
    req.on('error', (err) => reject(err))
    req.write(body)
    req.end()
  })
}

async function healthCheck() {
  return new Promise((resolve) => {
    const req = http.get(`http://${HOST}:${PORT}/health`, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => resolve(true))
    })
    req.on('error', () => resolve(false))
    req.setTimeout(2000, () => { req.destroy(); resolve(false) })
  })
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
function prompt(q) {
  return new Promise((resolve) => rl.question(q, resolve))
}

async function main() {
  console.log('╔══════════════════════════════════════════╗')
  console.log('║   Claude Permission Overlay — Test Tool  ║')
  console.log('╚══════════════════════════════════════════╝')
  console.log()

  // Health check
  const alive = await healthCheck()
  if (!alive) {
    console.log('✗ Overlay app is not running on port ' + PORT)
    console.log('  Start it first with: npm run dev')
    console.log()
    process.exit(1)
  }
  console.log('✓ Overlay app is running\n')

  while (true) {
    console.log('─── Pick a test request ───')
    TEST_REQUESTS.forEach((t, i) => {
      console.log(`  ${i + 1}. ${t.name}  →  ${t.payload.tool_name}`)
    })
    console.log(`  q. Send queue burst (3 at once)`)
    console.log(`  x. Exit`)
    console.log()

    const choice = await prompt('Choice: ')

    if (choice.toLowerCase() === 'x') {
      console.log('Bye!')
      rl.close()
      process.exit(0)
    }

    if (choice.toLowerCase() === 'q') {
      console.log('\nSending 3 requests simultaneously (queue test)...')
      const burst = [TEST_REQUESTS[0], TEST_REQUESTS[1], TEST_REQUESTS[4]]
      const results = await Promise.all(
        burst.map((t, i) => {
          console.log(`  → Sent #${i + 1}: ${t.name}`)
          return sendRequest(t.payload)
        })
      )
      results.forEach((r, i) => {
        console.log(`  ← Response #${i + 1}: ${r.behavior || 'unknown'}`)
      })
      console.log()
      continue
    }

    const idx = parseInt(choice) - 1
    if (isNaN(idx) || idx < 0 || idx >= TEST_REQUESTS.length) {
      console.log('Invalid choice\n')
      continue
    }

    const test = TEST_REQUESTS[idx]
    console.log(`\nSending: ${test.name}`)
    console.log(`  Tool: ${test.payload.tool_name}`)
    console.log(`  Input: ${JSON.stringify(test.payload.tool_input)}`)
    console.log('  Waiting for your decision in the overlay...\n')

    try {
      const result = await sendRequest(test.payload)
      console.log(`  ✓ Response: ${result.behavior}${result.message ? ' — ' + result.message : ''}`)
    } catch (err) {
      console.log(`  ✗ Error: ${err.message}`)
    }
    console.log()
  }
}

main().catch(console.error)
