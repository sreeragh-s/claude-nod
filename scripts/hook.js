#!/usr/bin/env node

// Claude Code PermissionRequest hook script
// Reads permission request JSON from stdin, sends it to the Electron overlay app,
// waits for the user's decision, and outputs the response to stdout.

const http = require('http');

const PORT = 19191;
const HOST = '127.0.0.1';
const TIMEOUT_MS = 120000; // 2 minute timeout

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(new Error(`Failed to parse stdin: ${e.message}`));
      }
    });
    process.stdin.on('error', reject);
  });
}

function sendToOverlay(payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);

    const req = http.request(
      {
        hostname: HOST,
        port: PORT,
        path: '/permission',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        },
        timeout: TIMEOUT_MS
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Invalid response from overlay: ${data}`));
          }
        });
      }
    );

    req.on('error', (err) => {
      reject(new Error(`Cannot reach overlay app on port ${PORT}: ${err.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out waiting for user decision'));
    });

    req.write(body);
    req.end();
  });
}

async function main() {
  try {
    const input = await readStdin();
    const decision = await sendToOverlay(input);

    // Wrap the decision in the format Claude Code expects for PermissionRequest hooks
    const hookResponse = {
      hookSpecificOutput: {
        hookEventName: 'PermissionRequest',
        decision: decision
      }
    };

    process.stdout.write(JSON.stringify(hookResponse));
    process.exit(0);
  } catch (err) {
    // If overlay is unreachable, fall through silently so Claude Code
    // shows its normal permission dialog as fallback
    process.stderr.write(`[claude-permission-overlay] ${err.message}\n`);
    process.exit(1);
  }
}

main();
