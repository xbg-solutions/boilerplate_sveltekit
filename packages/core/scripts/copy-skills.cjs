#!/usr/bin/env node
/**
 * postinstall script — copies .claude/skills/ from this package
 * into the consuming project's .claude/skills/ directory.
 *
 * Uses INIT_CWD (set by npm to the directory where `npm install` was run)
 * to locate the project root reliably, regardless of hoisting.
 */

const fs = require('fs');
const path = require('path');

const projectRoot = process.env.INIT_CWD;
if (!projectRoot) {
	// Not running via npm install (e.g. standalone node call) — skip silently.
	process.exit(0);
}

// Don't run when installing inside the monorepo itself
const packageJson = path.join(projectRoot, 'package.json');
try {
	const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
	if (pkg.name === 'boilerplate_frontend' || pkg.name === '@xbg.solutions/frontend-core') {
		process.exit(0);
	}
} catch {
	// No package.json at project root — unusual but not fatal
}

const sourceSkills = path.join(__dirname, '..', '.claude', 'skills');
const targetSkills = path.join(projectRoot, '.claude', 'skills');

if (!fs.existsSync(sourceSkills)) {
	// Skills weren't bundled — nothing to copy.
	process.exit(0);
}

/**
 * Recursively copy a directory, creating targets as needed.
 * Overwrites existing files so consumers always get the latest skills.
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

try {
	copyDirSync(sourceSkills, targetSkills);
	console.log('  \u2705 Claude Code skills copied to .claude/skills/');
} catch (err) {
	// Non-fatal — log but don't fail the install
	console.warn('  \u26A0\uFE0F  Could not copy Claude Code skills:', err.message);
}
