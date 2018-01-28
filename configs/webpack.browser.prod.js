const { DefinePlugin, LoaderOptionsPlugin } = require('webpack');
const webpackMerge = require('webpack-merge');
const { UglifyJsPlugin } = require('webpack').optimize;
const { AngularCompilerPlugin } = require('@ngtools/webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeJsPlugin = require('optimize-js-plugin');
const commonConfig = require('./webpack.browser.common');
const helpers = require('./helpers');


const config = webpackMerge(commonConfig, {
    devtool: 'source-map',
    resolve: {
        extensions: ['.ts', '.ngfactory', '.js', '.json'],
        modules: [helpers.path.nodeModules()]
    },
    module: {
        rules: [
            {
                test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                loader: '@ngtools/webpack'
            },
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: false,
                                importLoaders: 1
                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                postcss: {},
                                ident: 'postcss'
                            }
                        },
                        {
                            loader: 'less-loader',
                            options: {
                                sourceMap: false
                            }
                        }
                    ]
                }),
                include: [helpers.path.src('styles/styles.less')]
            }
        ]
    },
    plugins: [
        new DefinePlugin({
            'process.env': {
                RUN_TARGET: JSON.stringify('production')
            }
        }),
        new AngularCompilerPlugin({
            tsConfigPath: helpers.path.src('tsconfig.app.json'),
            entryModule: helpers.path.src('app/app.module#AppModule'),
            mainPath: helpers.path.src('main.browser.ts'),
            sourceMap: true
        }),
        new OptimizeJsPlugin({
            sourceMap: false
        }),
        new ExtractTextPlugin('[name].css'),
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
