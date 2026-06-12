#!/usr/bin/env node
'use strict';
const M = require('../src/one-logic-math-v1.js');
const G = require('../src/math-law-gate-v0-1.js');
const state = { files: { 'src/one-logic-math-v1.js': M.textBlock() }, internal_state: { symbols: M.F, relations: [], mutations: [], virtual_edits: [] } };
const report = G.verifyState(state, { math: M });
console.log(JSON.stringify(report, null, 2));
module.exports = { report };
