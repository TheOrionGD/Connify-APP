/**
 * Automatic Version Bumper for Connify App & Backend
 * Automatically bumps version in package.json, app.json, and android/app/build.gradle
 *
 * Usage:
 *   node bump_version.js          (defaults to patch bump: 3.4.1 -> 3.4.2)
 *   node bump_version.js patch    (3.4.1 -> 3.4.2)
 *   node bump_version.js minor    (3.4.1 -> 3.5.0)
 *   node bump_version.js major    (3.4.1 -> 4.0.0)
 */

const fs = require('fs');
const path = require('path');

// File paths
const connifyPkgPath = path.join(__dirname, 'package.json');
const connifyAppJsonPath = path.join(__dirname, 'app.json');
const backendPkgPath = path.join(__dirname, '..', 'backend', 'package.json');
const gradlePath = path.join(__dirname, 'android', 'app', 'build.gradle');

// 1. Read current version from Connify package.json
if (!fs.existsSync(connifyPkgPath)) {
  console.error('❌ Error: package.json not found!');
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(connifyPkgPath, 'utf8'));
const currentVersion = pkg.version || '1.0.0';

// Parse semver X.Y.Z
const parts = currentVersion.split('.').map((n) => parseInt(n, 10) || 0);
let [major, minor, patch] = parts.length === 3 ? parts : [1, 0, 0];

// Determine bump type from CLI arg: patch | minor | major
const bumpType = (process.argv[2] || 'patch').toLowerCase();

if (bumpType === 'major') {
  major += 1;
  minor = 0;
  patch = 0;
} else if (bumpType === 'minor') {
  minor += 1;
  patch = 0;
} else {
  // default patch
  patch += 1;
}

const newVersion = `${major}.${minor}.${patch}`;

console.log(`\n====================================================`);
console.log(`🚀 Bumping Connify App Version: ${currentVersion} ➔ ${newVersion} (${bumpType})`);
console.log(`====================================================\n`);

// 2. Update Connify package.json
pkg.version = newVersion;
fs.writeFileSync(connifyPkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`✅ [1/4] Updated Connify package.json -> version "${newVersion}"`);

// 3. Update app.json if present
if (fs.existsSync(connifyAppJsonPath)) {
  try {
    const appJson = JSON.parse(fs.readFileSync(connifyAppJsonPath, 'utf8'));
    if (appJson.expo) appJson.expo.version = newVersion;
    if (appJson.version) appJson.version = newVersion;
    fs.writeFileSync(connifyAppJsonPath, JSON.stringify(appJson, null, 2) + '\n');
    console.log(`✅ [2/4] Updated Connify app.json -> version "${newVersion}"`);
  } catch (e) {
    console.warn(`⚠️ Skipped app.json update: ${e.message}`);
  }
} else {
  console.log(`ℹ️ [2/4] app.json not found (skipped)`);
}

// 4. Update Backend package.json if present
if (fs.existsSync(backendPkgPath)) {
  try {
    const backendPkg = JSON.parse(fs.readFileSync(backendPkgPath, 'utf8'));
    backendPkg.version = newVersion;
    fs.writeFileSync(backendPkgPath, JSON.stringify(backendPkg, null, 2) + '\n');
    console.log(`✅ [3/4] Synced backend/package.json -> version "${newVersion}"`);
  } catch (e) {
    console.warn(`⚠️ Failed to update backend package.json: ${e.message}`);
  }
} else {
  console.log(`ℹ️ [3/4] backend/package.json not found (skipped)`);
}

// 5. Update Android build.gradle (versionName & versionCode)
if (fs.existsSync(gradlePath)) {
  try {
    let gradleContent = fs.readFileSync(gradlePath, 'utf8');

    // Auto-increment integer versionCode
    let newVersionCode = 1;
    const versionCodeMatch = gradleContent.match(/versionCode\s+(\d+)/);
    if (versionCodeMatch) {
      newVersionCode = parseInt(versionCodeMatch[1], 10) + 1;
      gradleContent = gradleContent.replace(/versionCode\s+\d+/, `versionCode ${newVersionCode}`);
    }

    // Update versionName string
    gradleContent = gradleContent.replace(/versionName\s+["'].*?["']/, `versionName "${newVersion}"`);

    fs.writeFileSync(gradlePath, gradleContent);
    console.log(`✅ [4/4] Updated android/app/build.gradle -> versionCode ${newVersionCode}, versionName "${newVersion}"`);
  } catch (e) {
    console.warn(`⚠️ Failed to update build.gradle: ${e.message}`);
  }
} else {
  console.log(`ℹ️ [4/4] android/app/build.gradle not found (skipped)`);
}

console.log(`\n====================================================`);
console.log(`🎉 Version successfully updated to ${newVersion}!`);
console.log(`====================================================\n`);
