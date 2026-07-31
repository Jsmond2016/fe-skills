#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

const ROOT = path.join(__dirname, '..');
const SKILLS_DIR = path.join(ROOT, 'skills');
const README_PATH = path.join(ROOT, 'README.md');
const NAME_REGEX = /^[a-z0-9-]+$/;
const MAX_DESCRIPTION_LENGTH = 150;

function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!match) return { frontmatter: null, body: content };
  return { frontmatter: YAML.parse(match[1]), body: content.slice(match[0].length) };
}

/**
 * Check inline markdown links that point to relative files inside the skill
 * directory (`./foo.md`), and flag ones that don't exist. `../` links and
 * remote/anchor links are skipped to avoid false positives.
 */
function checkRelativeLinks(body, skillDir, warnings) {
  const linkRegex = /\]\((\.{1,2}\/[^)\s]+)\)/g;
  let match;
  while ((match = linkRegex.exec(body)) !== null) {
    const target = match[1].split('#')[0].split('?')[0];
    if (!target) continue;
    const resolved = path.resolve(skillDir, target);
    if (resolved.startsWith(skillDir) && !fs.existsSync(resolved)) {
      warnings.push(`Broken relative link: ${match[1]}`);
    }
  }
}

function validateSkill(skillDir) {
  const skillName = path.basename(skillDir);
  const skillFile = path.join(skillDir, 'SKILL.md');
  const errors = [];
  const warnings = [];

  // Check SKILL.md exists
  if (!fs.existsSync(skillFile)) {
    errors.push('Missing SKILL.md');
    return { name: skillName, valid: false, errors, warnings };
  }

  const content = fs.readFileSync(skillFile, 'utf-8');

  // Check frontmatter exists
  let frontmatter;
  let body;
  try {
    ({ frontmatter, body } = parseFrontmatter(content));
  } catch (error) {
    errors.push(`Malformed YAML frontmatter: ${error.message}`);
    return { name: skillName, valid: false, errors, warnings };
  }
  if (!frontmatter) {
    errors.push('Missing or malformed YAML frontmatter');
    return { name: skillName, valid: false, errors, warnings };
  }

  // Check required fields
  if (typeof frontmatter.name !== 'string' || !frontmatter.name.trim()) {
    errors.push('Missing required field: name');
  } else {
    // Validate name format
    if (!NAME_REGEX.test(frontmatter.name)) {
      errors.push(`Invalid name format: "${frontmatter.name}" (must be lowercase letters, numbers, and hyphens only)`);
    }
    // Check directory name matches
    if (frontmatter.name !== skillName) {
      errors.push(`Directory name "${skillName}" does not match skill name "${frontmatter.name}"`);
    }
  }

  if (typeof frontmatter.description !== 'string' || !frontmatter.description.trim()) {
    errors.push('Missing required field: description');
  } else if (frontmatter.description.length > MAX_DESCRIPTION_LENGTH) {
    warnings.push(`Description is long (${frontmatter.description.length} chars, >${MAX_DESCRIPTION_LENGTH})`);
  }

  // Body quality checks (non-fatal warnings)
  const trimmedBody = (body || '').trim();
  if (!trimmedBody) {
    warnings.push('Skill body is empty');
  } else {
    if (!/^#\s/m.test(trimmedBody)) {
      warnings.push('No top-level H1 heading');
    }
    checkRelativeLinks(trimmedBody, skillDir, warnings);
  }

  // README sync check (skill should be listed in the Available Skills table)
  try {
    const readme = fs.readFileSync(README_PATH, 'utf-8');
    if (!readme.includes(`./skills/${skillName}`)) {
      warnings.push('Missing from README Available Skills table');
    }
  } catch {
    // README missing — skip the check
  }

  return {
    name: skillName,
    valid: errors.length === 0,
    errors,
    warnings,
    frontmatter,
  };
}

function main() {
  if (!fs.existsSync(SKILLS_DIR)) {
    console.error('Error: skills/ directory does not exist');
    process.exit(1);
  }

  const entries = fs.readdirSync(SKILLS_DIR, { withFileTypes: true });
  const skillDirs = entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => path.join(SKILLS_DIR, entry.name));

  if (skillDirs.length === 0) {
    console.log('No skills found in skills/ directory');
    process.exit(0);
  }

  console.log(`Validating ${skillDirs.length} skill(s)...\n`);

  let validCount = 0;
  let invalidCount = 0;
  let warningCount = 0;

  for (const skillDir of skillDirs) {
    const result = validateSkill(skillDir);

    if (result.valid) {
      console.log(`  ✓ ${result.name}`);
      if (result.frontmatter?.description) {
        console.log(`    ${result.frontmatter.description}`);
      }
      validCount++;
    } else {
      console.log(`  ✗ ${result.name}`);
      for (const error of result.errors) {
        console.log(`    - ${error}`);
      }
      invalidCount++;
    }

    for (const warning of result.warnings) {
      console.log(`    ! ${warning}`);
      warningCount++;
    }
  }

  console.log(`\n${'='.repeat(40)}`);
  console.log(`Total: ${skillDirs.length} skill(s)`);
  console.log(`  Valid:   ${validCount}`);
  console.log(`  Invalid: ${invalidCount}`);
  console.log(`  Warnings: ${warningCount}`);

  if (invalidCount > 0) {
    console.log('\nValidation failed. Please fix the errors above.');
    process.exit(1);
  } else {
    console.log('\nAll skills passed validation.');
    process.exit(0);
  }
}

main();
