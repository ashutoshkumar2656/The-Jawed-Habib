const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

function waitForServer(url, timeoutMs = 25000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    function check() {
      http.get(url, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 500) {
          resolve();
        } else {
          retry();
        }
      }).on('error', retry);
    }
    function retry() {
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Timeout waiting for server at ${url}`));
      } else {
        setTimeout(check, 500);
      }
    }
    check();
  });
}

async function main() {
  console.log('Starting production server on port 3000...');
  const server = spawn('npm.cmd', ['run', 'start', '--', '-p', '3000'], {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
    shell: true,
  });

  try {
    await waitForServer('http://localhost:3000/api/health');
    console.log('Server is healthy! Running 20-point admin verification...');

    const verify = spawn('node', ['scripts/verify-admin-20-points.js'], {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'inherit',
    });

    const exitCode = await new Promise((resolve) => {
      verify.on('close', resolve);
    });

    console.log(`Verification completed with exit code: ${exitCode}`);
    server.kill();
    process.exit(exitCode);
  } catch (err) {
    console.error('Execution error:', err);
    server.kill();
    process.exit(1);
  }
}

main();
