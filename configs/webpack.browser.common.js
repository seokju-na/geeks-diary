const { ContextReplacementPlugin, NoEmitOnErrorsPlugin, ProgressPlugin } = require('webpack');
const { CommonsChunkPlugin } = require('webpack').optimize;
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MonacoLoadPlugin = require('../tools/monaco-load-plugin');
const DefaultThemeGenerator = require('../tools/default-theme-generator');
const helpers = require('./helpers');


// noinspection JSUnusedGlobalSymbols
const config = {
    name: 'renderer',
    entry: {
        polyfills: helpers.path.src('polyfills.browser.ts'),
        renderer: helpers.path.src('main.browser.ts')
    },
    output: {
        path: helpers.path.dist(),
        filename: '[name].js',
        chunkFilename: '[id].chunk.js'
    },
    resolve: {
        extensions: ['.ts', '.js', '.json'],
        modules: [helpers.path.nodeModules()]
    },
    resolveLoader: {
        modules: [helpers.path.nodeModules()]
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                loader: 'html-loader',
                exclude: [helpers.path.src('index.html')]
            },
            {
                test: /\.less$/,
                use: [
                    'exports-loader?module.exports.toString()',
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
                ],
                exclude: [helpers.path.src('styles')]
            }
        ]
    },
    plugins: [
        new NoEmitOnErrorsPlugin(),
        new ProgressPlugin(),
        new ContextReplacementPlugin(
            /@angular(\\|\/)core(\\|\/)esm5/,
            helpers.path.src('.'),
            {}
        ),
        new CommonsChunkPlugin({
            name: ['vendor'],
            minChunks(module) {
                return module.resource && (module.resource.startsWith(helpers.path.nodeModules()));
            },
            chunks: ['renderer']
        }),
        new CommonsChunkPlugin({
            name: ['polyfills', 'vendor'].reverse()
        }),
        new CopyWebpackPlugin([
            {
                from: helpers.path.src('assets/'),
                to: helpers.path.dist('assets/')
            }
        ]),
        new HtmlWebpackPlugin({
            template: helpers.path.src('index.html'),
            minify: {
                removeComments: true
            }
        }),
        new MonacoLoadPlugin(helpers.path.src('assets/load-monaco.html'), 'MONACO_EDITOR_LOAD_POSITION'),
        new DefaultThemeGenerator(helpers.path.dist('default-theme.css'))
    ],
    stats: {
        assets: true,
        excludeAssets: [/assets/]
    },
    target: 'electron-renderer'
};

module.exports = config;
