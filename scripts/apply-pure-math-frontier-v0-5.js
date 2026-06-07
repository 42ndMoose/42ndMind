#!/usr/bin/env node
'use strict';

const cp = require('child_process');

cp.execFileSync(process.execPath, ['scripts/apply-promoted-frontier-state-v0-1.js'], { stdio: 'inherit' });
console.log('pure math frontier v0.5 promoted state delegated');
