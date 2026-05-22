#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const SKILLS_DIR = path.join(__dirname, '..', 'skills');
const TEMPLATE_PATH = path.join(__dirname, '..', 'templates', 'skill', 'SKILL.md');

const NAME_REGEX = /^[a-z0-9-]+$/;

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--name' && args[i + 1]) {
      result.name = args[i + 1];
      i++;
    } else if (args[i] === '--description' && args[i + 1]) {
      result.description = args[i + 1];
      i++;
    } else if (args[i] === '--help' || args[i] === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return result;
}

function printHelp() {
  console.log(`Usage: npm run create-skill [-- --name <name> --description <desc>]

Create a new skill in the skills/ directory.

Options:
  --name <name>         Skill name (lowercase, hyphens and numbers only)
  --description <desc>  Short description of the skill
  -h, --help            Show this help message

If no options are provided, the script will run in interactive mode.
`);
}

function validateName(name) {
  if (!name || name.length === 0) {
    return 'Name is required';
  }
  if (!NAME_REGEX.test(name)) {
    return 'Name must be lowercase letters, numbers, and hyphens only';
  }
  if (name.startsWith('-') || name.endsWith('-')) {
    return 'Name cannot start or end with a hyphen';
  }
  return null;
}

function skillExists(name) {
  const skillPath = path.join(SKILLS_DIR, name);
  return fs.existsSync(skillPath);
}

function createSkill(name, description) {
  const skillDir = path.join(SKILLS_DIR, name);

  if (skillExists(name)) {
    console.error(`Error: Skill "${name}" already exists at ${skillDir}`);
    process.exit(1);
  }

  fs.mkdirSync(skillDir, { recursive: true });

  let templateContent;
  if (fs.existsSync(TEMPLATE_PATH)) {
    templateContent = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  } else {
    templateContent = defaultTemplate();
  }

  const content = templateContent
    .replace(/\{\{name\}\}/g, name)
    .replace(/\{\{description\}\}/g, description);

  const skillFilePath = path.join(skillDir, 'SKILL.md');
  fs.writeFileSync(skillFilePath, content, 'utf-8');

  // Auto-sync agent symlinks
  require('child_process').execSync('node scripts/sync-agent-links.js', { stdio: 'inherit', cwd: path.join(__dirname, '..') });

  console.log(`Created skill: ${name}`);
  console.log(`  Location: ${skillFilePath}`);
  console.log(`  Description: ${description}`);
  console.log(`\nNext steps:`);
  console.log(`  1. Edit ${skillFilePath} to add your skill content`);
  console.log(`  2. Run "npm run validate" to verify the skill format`);
  console.log(`  3. Commit and push your changes`);
}

function defaultTemplate() {
  return `---
name: {{name}}
description: {{description}}
---

# {{name}}

<!-- Add your skill instructions here -->

## Overview

Describe what this skill does and when to use it.

## Guidelines

1. Guideline one
2. Guideline two
3. Guideline three

## Examples

\`\`\`typescript
// Add code examples here
\`\`\`

## Best Practices

- Practice one
- Practice two
- Practice three
`;
}

async function interactiveMode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt) =>
    new Promise((resolve) => rl.question(prompt, resolve));

  console.log('Create a new skill\n');

  let name;
  while (true) {
    name = await question('Skill name: ');
    name = name.trim();
    const error = validateName(name);
    if (error) {
      console.log(`  Invalid: ${error}`);
      continue;
    }
    if (skillExists(name)) {
      console.log(`  Invalid: Skill "${name}" already exists`);
      continue;
    }
    break;
  }

  let description;
  while (true) {
    description = await question('Description: ');
    description = description.trim();
    if (description.length === 0) {
      console.log('  Invalid: Description is required');
      continue;
    }
    break;
  }

  rl.close();
  console.log();
  createSkill(name, description);
}

async function main() {
  const args = parseArgs();

  if (args.name || args.description) {
    const nameError = validateName(args.name);
    if (nameError) {
      console.error(`Error: ${nameError}`);
      process.exit(1);
    }
    if (!args.description) {
      console.error('Error: --description is required when using --name');
      process.exit(1);
    }
    if (skillExists(args.name)) {
      console.error(`Error: Skill "${args.name}" already exists`);
      process.exit(1);
    }
    createSkill(args.name, args.description);
  } else {
    await interactiveMode();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
