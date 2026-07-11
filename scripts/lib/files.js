const fs = require('fs');
const path = require('path');

function copyDirectoryContents(sourceDir, targetDir, excludedNames = new Set()) {
  fs.mkdirSync(targetDir, { recursive: true });
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    if (excludedNames.has(entry.name)) continue;
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      fs.cpSync(sourcePath, targetPath, { recursive: true });
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

function replaceDirectory(sourceDir, targetDir, options = {}) {
  const parentDir = path.dirname(targetDir);
  const baseName = path.basename(targetDir);
  const stagingDir = fs.mkdtempSync(path.join(parentDir, `.${baseName}-staging-`));
  const backupDir = path.join(parentDir, `.${baseName}-backup-${process.pid}-${Date.now()}`);
  let hasBackup = false;

  try {
    copyDirectoryContents(sourceDir, stagingDir, new Set(options.exclude || []));
    options.prepare?.(stagingDir);
    if (!fs.existsSync(path.join(stagingDir, 'SKILL.md'))) {
      throw new Error(`Source does not contain SKILL.md: ${sourceDir}`);
    }

    if (fs.existsSync(targetDir)) {
      fs.renameSync(targetDir, backupDir);
      hasBackup = true;
    }
    fs.renameSync(stagingDir, targetDir);
    if (hasBackup) fs.rmSync(backupDir, { recursive: true, force: true });
  } catch (error) {
    if (fs.existsSync(stagingDir)) fs.rmSync(stagingDir, { recursive: true, force: true });
    if (hasBackup && !fs.existsSync(targetDir)) fs.renameSync(backupDir, targetDir);
    throw error;
  }
}

module.exports = { copyDirectoryContents, replaceDirectory };
