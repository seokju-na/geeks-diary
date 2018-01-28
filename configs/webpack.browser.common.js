const { ContextReplacementPlugin, NoEmitOnErrorsPlugin, ProgressPlugin } = require('webpack');
const { CommonsChunkPlugin } = require('webpack').optimize;
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
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
                test: /\.ts$/,
                include: [helpers.path.src('.')],
                exclude: [...helpers.path.excludes()],
                use: [
                    {
                        loader: 'awesome-typescript-loader',
                        options: {
                            configFileName: helpers.path.src('tsconfig.json')
                        }
                    },
                    { loader: 'angular2-template-loader' }
                ]
            },
            {
                test: /\.html$/,
                loader: 'html-loader',
                query: {
                    minimize: true
                }
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
                ]
            },
            {
                test: /\.(jpg|png|gif)$/,
                use: 'file-loader'
            },
            {
                test: /\.(eot|woff2?|svg|ttf)([\?]?.*)$/,
                use: 'file-loader'
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
            template: helpers.path.src('index.html')
        })
    ],
    stats: {
        assets: true,
        excludeAssets: [/assets/]
    },
    target: 'electron-renderer'
};

module.exports = config;
