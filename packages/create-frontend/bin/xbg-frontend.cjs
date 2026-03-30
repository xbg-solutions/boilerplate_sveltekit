#!/usr/bin/env node
'use strict';

const command = process.argv[2];
const args = process.argv.slice(3);

// Re-inject args so child scripts see them
process.argv = [process.argv[0], process.argv[1], ...args];

switch (command) {
  case 'setup':
    require('../src/commands/setup.cjs');
    break;
  case 'add':
    require('../src/commands/add.cjs');
    break;
  case 'validate':
    require('../src/commands/validate.cjs');
    break;
  case 'generate':
    require('../src/commands/generate.cjs');
    break;
  default:
    console.log('Usage: xbg-frontend <command>');
    console.log('');
    console.log('Commands:');
    console.log('  setup      Configure project (--config <path> for non-interactive)');
    console.log('  add        Add components from registry');
    console.log('  validate   Validate project configuration');
    console.log('  generate   Generate component, route, or service');
    process.exit(command ? 1 : 0);
}
