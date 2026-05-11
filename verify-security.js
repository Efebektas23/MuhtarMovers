#!/usr/bin/env node

// Security Verification Script
// Run this to check your security implementation

console.log('🔒 MUHTAR MOVERS - Security Verification\n');

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(colors[color] + message + colors.reset);
}

function checkFile(filename, shouldExist = true) {
    const exists = fs.existsSync(filename);
    if (shouldExist) {
        if (exists) {
            log(`✅ ${filename} exists`, 'green');
            return true;
        } else {
            log(`❌ ${filename} missing`, 'red');
            return false;
        }
    } else {
        if (!exists) {
            log(`✅ ${filename} properly excluded`, 'green');
            return true;
        } else {
            log(`⚠️  ${filename} exists (consider if this should be committed)`, 'yellow');
            return false;
        }
    }
}

function checkFileContent(filename, searchTerm, shouldContain = true) {
    if (!fs.existsSync(filename)) {
        log(`❌ Cannot check ${filename} - file missing`, 'red');
        return false;
    }
    
    const content = fs.readFileSync(filename, 'utf8');
    const contains = content.includes(searchTerm);
    
    if (shouldContain) {
        if (contains) {
            log(`✅ ${filename} contains required content`, 'green');
            return true;
        } else {
            log(`❌ ${filename} missing required content: ${searchTerm}`, 'red');
            return false;
        }
    } else {
        if (!contains) {
            log(`✅ ${filename} properly excludes: ${searchTerm}`, 'green');
            return true;
        } else {
            log(`❌ ${filename} contains sensitive content: ${searchTerm}`, 'red');
            return false;
        }
    }
}

console.log('1. Checking Configuration Files...\n');

let score = 0;
let total = 0;

// Check for required files
total++;
if (checkFile('config.example.js')) score++;

total++;
if (checkFile('config-loader.js')) score++;

total++;
if (checkFile('.gitignore')) score++;

total++;
if (checkFile('SECURITY.md')) score++;

total++;
if (checkFile('config.js')) score++;

console.log('\n2. Checking .gitignore Protection...\n');

total++;
if (checkFileContent('.gitignore', 'config.js')) score++;

total++;
if (checkFileContent('.gitignore', '*.env')) score++;

console.log('\n3. Checking for Exposed API Keys...\n');

total++;
if (checkFileContent('index.html', 'AIza', false)) score++;

total++;
if (checkFileContent('index.html', 'config-loader.js')) score++;

console.log('\n4. Checking Configuration Setup...\n');

if (fs.existsSync('config.js')) {
    total++;
    if (checkFileContent('config.js', 'YOUR_GOOGLE_MAPS_API_KEY_HERE', false)) score++;
    
    total++;
    if (checkFileContent('config.js', 'AIza')) score++;
} else {
    log('⚠️  config.js not found - copy from config.example.js', 'yellow');
}

console.log('\n5. Security Score...\n');

const percentage = Math.round((score / total) * 100);

if (percentage >= 90) {
    log(`🎉 Excellent! Security Score: ${score}/${total} (${percentage}%)`, 'green');
    log('Your security implementation is strong!', 'green');
} else if (percentage >= 70) {
    log(`⚠️  Good! Security Score: ${score}/${total} (${percentage}%)`, 'yellow');
    log('Most security measures are in place, but review the failed checks.', 'yellow');
} else {
    log(`❌ Needs Work! Security Score: ${score}/${total} (${percentage}%)`, 'red');
    log('Critical security issues found. Please address them immediately.', 'red');
}

console.log('\n6. Next Steps...\n');

log('Manual steps you must complete:', 'blue');
log('1. Apply domain restrictions in Google Cloud Console', 'blue');
log('2. Set up API service restrictions', 'blue');
log('3. Configure billing alerts', 'blue');
log('4. Test the website functionality', 'blue');

log('\nFor detailed instructions, see:', 'blue');
log('- SECURITY.md (complete guide)', 'blue');
log('- QUICK_SECURITY_SETUP.md (immediate actions)', 'blue');

console.log('\n' + '='.repeat(50));
log('Security verification complete!', 'blue');
console.log('='.repeat(50)); 