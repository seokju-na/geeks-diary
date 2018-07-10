// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/dist/zone-testing';
import { getTestBed } from '@angular/core/testing';
import {
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';


declare const require: any;


getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting(),
);


if ((<any>window).MONACO) {
    runTest();
} else {
    (<any>window).REGISTER_MONACO_INIT_CALLBACK(() => {
        runTest();
    });
}


function runTest(): void {
    const context = require.context('../src/browser', true, /\.spec\.ts$/);
    context.keys().map(context);
}
