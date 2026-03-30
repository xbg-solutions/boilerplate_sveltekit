#!/usr/bin/env node
/**
 * prepublish script — copies .claude/skills/ from the monorepo root
 * into packages/core/.claude/skills/ so they are included in the
 * published npm tarball.
 */

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..', '..');
const source = path.join(repoRoot, '.claude', 'skills');
const target = path.join(__dirname, '..', '.claude', 'skills');

if (!fs.existsSync(source)) {
	console.error('ERROR: .claude/skills/ not found at repo root');
	process.exit(1);
}

/**
 * Recursively copy a directory, creating targets as needed.
 */
function copyDirSync(src, dest) {
	fs.mkdirSync(dest, { recursive: true });

	for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name);

		if (entry.isDirectory()) {
			copyDirSync(srcPath, destPath);
		} else {
			fs.copyFileSync(srcPath, destPath);
		}
	}
}

// Clean previous bundle
if (fs.existsSync(target)) {
	fs.rmSync(target, { recursive: true, force: true });
}

copyDirSync(source, target);
console.log('Skills bundled into packages/core/.claude/skills/');
