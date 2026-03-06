const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function tryDevcert(certDir) {
  const devcert = require('devcert');
  console.log('Attempting devcert for a trusted localhost certificate...');
  const { key, cert } = await devcert.certificateFor('localhost');
  const certPath = path.join(certDir, 'cert.pem');
  const keyPath = path.join(certDir, 'key.pem');
  fs.writeFileSync(certPath, cert);
  fs.writeFileSync(keyPath, key);
  return { certPath, keyPath };
}

function tryMkcert(certDir) {
  const { spawnSync } = require('child_process');
  try {
    // Check mkcert availability
    const which = spawnSync('mkcert', ['-version'], { stdio: 'ignore' });
    if (which.status !== 0) throw new Error('mkcert not available');

    console.log('Using mkcert to generate a locally-trusted certificate...');
    // Ensure local CA is installed
    spawnSync('mkcert', ['-install'], { stdio: 'inherit' });

    const certPath = path.join(certDir, 'cert.pem');
    const keyPath = path.join(certDir, 'key.pem');
    // Create cert for localhost and common loopbacks
    const res = spawnSync('mkcert', ['-cert-file', certPath, '-key-file', keyPath, 'localhost', '127.0.0.1', '::1'], { stdio: 'inherit' });
    if (res.status !== 0) throw new Error('mkcert failed to create certs');
    return { certPath, keyPath };
  } catch (err) {
    throw err;
  }
}

function makeSelfSigned(certDir) {
  console.log('Falling back to a self-signed certificate (not browser-trusted).');
  const selfsigned = require('selfsigned');
  const attrs = [{ name: 'commonName', value: 'localhost' }];
  const pems = selfsigned.generate(attrs, { days: 365 });
  const certPath = path.join(certDir, 'cert.pem');
  const keyPath = path.join(certDir, 'key.pem');
  fs.writeFileSync(certPath, pems.cert);
  fs.writeFileSync(keyPath, pems.private);
  return { certPath, keyPath };
}

(async function main() {
  try {
    const certDir = path.resolve(__dirname, '..', '.devcert');
    if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true });

    let certs;
    try {
      // Prefer mkcert (trusted) if available
      certs = tryMkcert(certDir);
    } catch (mkErr) {
      try {
        certs = await tryDevcert(certDir);
      } catch (devErr) {
        // devcert often fails on Windows without OpenSSL; fall back
        certs = makeSelfSigned(certDir);
      }
    }

    console.log('Starting https static server on https://localhost:8443');

    const httpServerBin = require.resolve('http-server/bin/http-server');
    const args = [process.cwd(), '-p', '8443', '-S', '--cert', certs.certPath, '--key', certs.keyPath];

    const child = spawn(process.execPath, [httpServerBin, ...args], { stdio: 'inherit' });

    child.on('close', (code) => {
      process.exit(code);
    });
  } catch (err) {
    console.error('Failed to start HTTPS server:', err);
    process.exit(1);
  }
})();
