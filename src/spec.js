Error.stackTraceLimit = Infinity;

require('core-js/es7/reflect');

require('zone.js/dist/zone');
require('zone.js/dist/long-stack-trace-zone');
require('zone.js/dist/proxy'); // since zone.js 0.6.15
require('zone.js/dist/sync-test');
require('zone.js/dist/jasmine-patch'); // put here since zone.js 0.6.14
require('zone.js/dist/async-test');
require('zone.js/dist/fake-async-test');


const fs = require('fs');

try {
    fs.accessSync('temp/');
} catch (err) {
    fs.mkdirSync('temp/');
}


const testing = require('@angular/core/testing');
const browser = require('@angular/platform-browser-dynamic/testing');

testing.TestBed.initTestEnvironment(
    browser.BrowserDynamicTestingModule,
    browser.platformBrowserDynamicTesting()
);

/*
 * Ok, this is kinda crazy. We can use the context method on
 * require that webpack created in order to tell webpack
 * what files we actually want to require or import.
 * Below, context will be a function/object with file names as keys.
 * Using that regex we are saying look in ../src then find
 * any file that ends with spec.ts and get its path. By passing in true
 * we say do this recursively
 */

if (window.MONACO) {
    runTest();
} else {
    window.REGISTER_MONACO_INIT_CALLBACK(() => {
        runTest();
    });
}


function runTest() {
    const testContext = require.context('./app', true, /\.spec\.ts/);
    testContext.keys().map(testContext);
}
