#!/usr/bin/env node
'use strict';

const subcommand = process.argv[2];

switch (subcommand) {
  case 'component':
    process.argv = [process.argv[0], process.argv[1], ...process.argv.slice(3)];
    require('./generate-component.cjs');
    break;
  case 'route':
    process.argv = [process.argv[0], process.argv[1], ...process.argv.slice(3)];
    require('./generate-route.cjs');
    break;
  case 'service':
    process.argv = [process.argv[0], process.argv[1], ...process.argv.slice(3)];
    require('./generate-service.cjs');
    break;
  default:
    console.log('Usage: xbg-frontend generate <type> <name> [options]');
    console.log('');
    console.log('Types: component, route, service');
    process.exit(subcommand ? 1 : 0);
}
