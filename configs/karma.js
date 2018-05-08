const testWebpackConfig = require('./webpack.test');


const CI = process.env.CI || false;


module.exports = (config) => {
    config.set({
        basePath: './',
        frameworks: ['jasmine'],
        plugins: [
            require('karma-jasmine'),
            require('karma-sourcemap-loader'),
            require('karma-webpack'),
            require('karma-electron'),
            require('karma-electron-launcher')
        ],
        client: {
            captureConsole: true,
            useIframe: false
        },
        files: [
            'src/spec.js',
            { pattern: 'src/assets/**/*', watched: false, included: false, served: true, nocache: false }
        ],
        proxies: {
            '/assets/': '/base/src/assets/'
        },
        preprocessors: {
            'src/spec.js': ['webpack', 'sourcemap', 'electron']
        },
        webpack: testWebpackConfig,
        webpackMiddleware: {
            noInfo: true,
            stats: 'errors-only'
        },
        customContextFile: 'tools/karma-context-page.html',
        reporters: ['dots'],
        port: 9876,
        color: true,
        logLevel: config.LOG_INFO,
        autoWatch: !CI,
        browsers: ['Electron'],
        singleRun: CI
    });
};
