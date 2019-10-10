#!/usr/bin/env node

const { readFile, writeFile } = require('fs');
const { promisify } = require('util');


const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);

const WEBPACK_BROWSER_CONFIG = 'node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/browser.js';
const WEBPACK_TEST_CONFIG = 'node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/test.js';

const addDefinePlugin = `new (require("webpack")).DefinePlugin({'process.env': {NODE_ENV:JSON.stringify(process.env.NODE_ENV||'development')}}),`;


async function overrideAngularDevKit() {
    const browserData = await readFileAsync(WEBPACK_BROWSER_CONFIG, 'utf8');
    let browserResult = browserData.toString();

    // Add build target as 'electron-renderer'.
    browserResult = browserResult.replace(/target: "electron-renderer"/g, '');
    browserResult = browserResult.replace(/node: false,/g, 'node: false, target: "electron-renderer"');

    // Add define plugin.
    browserResult = browserResult.replace(addDefinePlugin, '');
    browserResult = browserResult.replace(/plugins: extraPlugins.concat\(\[/g, `plugins: extraPlugins.concat([${addDefinePlugin}`);

    await writeFileAsync(WEBPACK_BROWSER_CONFIG, browserResult, 'utf8');

    // Add build target as 'electron-renderer'.
    const testData = await readFileAsync(WEBPACK_TEST_CONFIG, 'utf8');
    let testResult = testData.toString();

    testResult = testResult.replace(/target: "electron-renderer",/g, '');
    testResult = testResult.replace(/return {/g, 'return { target: "electron-renderer",');
    await writeFileAsync(WEBPACK_TEST_CONFIG, testResult, 'utf8');
}


overrideAngularDevKit()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
