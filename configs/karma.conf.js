const testWebpackConfig = require('./webpack.test');


const CI = process.env.CI || false;


module.exports = (config) => {
    const options = {
        basePath: '../',
        frameworks: ['jasmine'],
        plugins: [
            require('karma-jasmine'),
            require('karma-coverage'),
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
            'src/spec.js': ['webpack', 'electron']
        },
        webpack: testWebpackConfig,
        webpackMiddleware: {
            noInfo: true,
            stats: {
                chunks: false
            }
        },
        reporters: CI ? ['dots', 'coverage'] : ['dots'],
        port: 9876,
        color: true,
        logLevel: config.LOG_INFO,
        autoWatch: !CI,
        browsers: ['Electron'],
        singleRun: CI
    };

    if (CI) {
        options.coverageReporter = {
            reporters: [
                { type: 'lcovonly', subdir: '.' }
            ]
        };
    }

    config.set(options);
};
