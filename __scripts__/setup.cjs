#!/usr/bin/env node
/**
 * Wrapper — delegates to packages/create-frontend/src/commands/setup.cjs
 * Prefer: npx bpsk setup [--config setup-config.json]
 */
'use strict';
require('../packages/create-frontend/src/commands/setup.cjs');
