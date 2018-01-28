const { DefinePlugin } = require('webpack');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.browser.common');
const helpers = require('./helpers');


const config = webpackMerge(commonConfig, {
    devtool: 'cheap-module-source-map',
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
                            configFileName: helpers.path.src('tsconfig.app.json')
                        }
                    },
                    { loader: 'angular2-template-loader' }
                ]
            },
            {
                test: /\.css/,
                use: [
                    'style-loader', 'css-loader'
                ],
                include: [helpers.path.src('styles', 'styles.less')]
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    'css-loader',
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
                include: [helpers.path.src('styles', 'styles.less')]
            }
        ]
    },
    plugins: [
        new DefinePlugin({
            'process.env': {
                RUN_TARGET: JSON.stringify('development')
            }
        })
    ]
});

module.exports = config;
