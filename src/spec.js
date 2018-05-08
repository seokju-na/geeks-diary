// Source from
// https://github.com/colinskow/angular-electron-dream-starter/blob/master/config/spec-bundle.js

Error.stackTraceLimit = Infinity;

require('core-js/es7/reflect');

require('zone.js/dist/zone');
require('zone.js/dist/long-stack-trace-zone');
require('zone.js/dist/proxy'); // since zone.js 0.6.15
require('zone.js/dist/sync-test');
require('zone.js/dist/jasmine-patch'); // put here since zone.js 0.6.14
require('zone.js/dist/async-test');
require('zone.js/dist/fake-async-test');

const fse = require('fs-extra');

const testing = require('@angular/core/testing');
const browser = require('@angular/platform-browser-dynamic/testing');


testing.TestBed.initTestEnvironment(
    browser.BrowserDynamicTestingModule,
    browser.platformBrowserDynamicTesting()
);


if (window.MONACO) {
    runTest();
} else {
    window.REGISTER_MONACO_INIT_CALLBACK(() => {
        runTest();
    });
}


function runTest() {
    fse.ensureDirSync('temp/');

    const testContext = require.context('./app', true, /\.spec\.ts/);
    testContext.keys().map(testContext);
}
