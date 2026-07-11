#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

const SKILLS_DIR = path.join(__dirname, '..', 'skills');
const NAME_REGEX = /^[a-z0-9-]+$/;

function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!match) return null;
  return YAML.parse(match[1]);
}

function validateSkill(skillDir) {
  const skillName = path.basename(skillDir);
  const skillFile = path.join(skillDir, 'SKILL.md');
  const errors = [];

  // Check SKILL.md exists
  if (!fs.existsSync(skillFile)) {
    errors.push('Missing SKILL.md');
    return { name: skillName, valid: false, errors };
  }

  const content = fs.readFileSync(skillFile, 'utf-8');

  // Check frontmatter exists
  let frontmatter;
  try {
    frontmatter = parseFrontmatter(content);
  } catch (error) {
    errors.push(`Malformed YAML frontmatter: ${error.message}`);
    return { name: skillName, valid: false, errors };
  }
  if (!frontmatter) {
    errors.push('Missing or malformed YAML frontmatter');
    return { name: skillName, valid: false, errors };
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
  }

  return {
    name: skillName,
    valid: errors.length === 0,
    errors,
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
  }

  console.log(`\n${'='.repeat(40)}`);
  console.log(`Total: ${skillDirs.length} skill(s)`);
  console.log(`  Valid:   ${validCount}`);
  console.log(`  Invalid: ${invalidCount}`);

  if (invalidCount > 0) {
    console.log('\nValidation failed. Please fix the errors above.');
    process.exit(1);
  } else {
    console.log('\nAll skills passed validation.');
    process.exit(0);
  }
}

main();
