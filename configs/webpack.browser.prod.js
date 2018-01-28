const { DefinePlugin, LoaderOptionsPlugin } = require('webpack');
const webpackMerge = require('webpack-merge');
const { UglifyJsPlugin } = require('webpack/lib/optimize');
const { AotPlugin } = require('@ngtools/webpack');
const OptimizeJsPlugin = require('optimize-js-plugin');
const commonConfig = require('./webpack.browser.common');
const helpers = require('./helpers');


const config = webpackMerge(commonConfig, {
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: '@ngtools/webpack'
            }
        ]
    },
    plugins: [
        new DefinePlugin({
            'process.env': {
                RUN_TARGET: JSON.stringify('production')
            }
        }),
        new AotPlugin({
            tsConfigPath: helpers.path.src('tsconfig.aot.json'),
            entryModule: helpers.path.src('app/app.module#AppModule')
        }),
        new OptimizeJsPlugin({
            sourceMap: false
        }),
        new UglifyJsPlugin({
            beautify: false,
            output: {
                comments: false
            },
            mangle: {
                screw_ie8: true
            },
            compress: {
                screw_ie8: true,
                warnings: false,
                conditionals: true,
                unused: true,
                comparisons: true,
                sequences: true,
                dead_code: true,
                evaluate: true,
                if_return: true,
                join_vars: true,
                negate_iife: false
            }
        }),
        new LoaderOptionsPlugin({
            minimize: true,
            debug: false
        })
    ]
});

module.exports = config;
