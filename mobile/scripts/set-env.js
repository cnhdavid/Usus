/**
 * Detects the correct API URL and writes EXPO_PUBLIC_API_URL to .env
 * Runs automatically before every `npm start/ios/android/web`.
 *
 *   --web   → uses localhost (browser on the same machine, subject to CORS)
 *   default → uses LAN IP  (physical device / simulator, bypasses CORS)
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BACKEND_PORT = 5112;
const isWeb = process.argv.includes('--web');

function getLanIp() {
  const ifaces = ['en0', 'en1', 'wlan0', 'eth0'];
  for (const iface of ifaces) {
    try {
      const ip = execSync(`ipconfig getifaddr ${iface} 2>/dev/null`, { encoding: 'utf8' }).trim();
      if (ip) return ip;
    } catch {
      // try next interface
    }
  }
  return '10.0.2.2'; // Android emulator fallback
}

const host = isWeb ? 'localhost' : getLanIp();
const url = `http://${host}:${BACKEND_PORT}/api`;

const envPath = path.join(__dirname, '..', '.env');
fs.writeFileSync(envPath, `EXPO_PUBLIC_API_URL=${url}\n`);
console.log(`✓ EXPO_PUBLIC_API_URL set to ${url} (${isWeb ? 'web' : 'native'})`);
