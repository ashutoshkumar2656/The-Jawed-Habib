const fs = require('fs');

const originalMkdir = fs.mkdir;
const originalMkdirSync = fs.mkdirSync;

fs.mkdirSync = function (p, options) {
  let retries = 5;
  while (true) {
    try {
      return originalMkdirSync.apply(this, arguments);
    } catch (err) {
      if (err.code === 'EPERM' || err.code === 'EEXIST') {
        if (fs.existsSync(p)) {
          return p;
        }
        if (retries-- > 0) {
          const waitTill = new Date(new Date().getTime() + 60);
          while (waitTill > new Date()) {}
          continue;
        }
      }
      throw err;
    }
  }
};

fs.mkdir = function (p, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  let retries = 5;

  function attempt() {
    originalMkdir(p, options, (err, result) => {
      if (err && (err.code === 'EPERM' || err.code === 'EEXIST')) {
        if (fs.existsSync(p)) {
          return callback ? callback(null, p) : undefined;
        }
        if (retries-- > 0) {
          setTimeout(attempt, 60);
          return;
        }
      }
      if (callback) callback(err, result);
    });
  }

  attempt();
};

const originalPromisesMkdir = fs.promises.mkdir;

if (fs.promises) {
  fs.promises.mkdir = async function (p, options) {
    let retries = 10;
    while (true) {
      try {
        return await originalPromisesMkdir.apply(this, arguments);
      } catch (err) {
        if (err.code === 'EPERM' || err.code === 'EEXIST') {
          if (fs.existsSync(p)) {
            return p;
          }
          if (retries-- > 0) {
            await new Promise((r) => setTimeout(r, 60));
            continue;
          }
        }
        throw err;
      }
    }
  };
}

const originalReadFileSync = fs.readFileSync;
fs.readFileSync = function (p, options) {
  let retries = 5;
  while (true) {
    try {
      return originalReadFileSync.apply(this, arguments);
    } catch (err) {
      if (err.code === 'EPERM' || err.code === 'EBUSY') {
        if (retries-- > 0) {
          const waitTill = new Date(new Date().getTime() + 50);
          while (waitTill > new Date()) {}
          continue;
        }
      }
      throw err;
    }
  }
};

console.log('[PATCH] fs.mkdir, fs.mkdirSync, fs.readFileSync patched for Windows EPERM resilience');
