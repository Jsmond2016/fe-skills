const fs = require('fs');

function readManifest(manifestPath, createDefault) {
  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return createDefault();
    throw new Error(`Cannot read manifest ${manifestPath}: ${error.message}`, { cause: error });
  }
}

module.exports = { readManifest };
