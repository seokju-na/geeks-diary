const CI = process.env.CI || false;
const SINGLE_RUN = process.env.KARMA_SINGLE_RUN || false;


process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;


module.exports = (config) => {
    config.set({
        basePath: '../',
        frameworks: ['jasmine', '@angular-devkit/build-angular'],
        plugins: [
            require('karma-jasmine'),
            require('karma-electron'),
            require('karma-jasmine-html-reporter'),
            require('karma-coverage-istanbul-reporter'),
            require('@angular-devkit/build-angular/plugins/karma')
        ],
        client: {
            captureConsole: true,
            useIframe: false
        },
        files: [
            { pattern: 'src/assets/**/*', watched: false, included: false, served: true, nocache: false },
        ],
        proxies: {
            '/assets/': '/base/src/assets/'
        },
        coverageIstanbulReporter: {
            dir: require('path').join(__dirname, '../coverage'),
            reports: ['html', 'lcovonly'],
            fixWebpackSourcePaths: true
        },
        reporters: ['dots'],
        port: 9876,
        color: true,
        logLevel: config.LOG_INFO,
        autoWatch: !CI,
        browsers: ['Electron'],
        singleRun: CI || SINGLE_RUN
    });
};
