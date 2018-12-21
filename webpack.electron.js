const { DefinePlugin, NoEmitOnErrorsPlugin, ProgressPlugin } = require('webpack');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');


const PROD = process.env.NODE_ENV === 'production';


const config = {
    mode: PROD ? 'production' : 'development',
    name: 'main-process',
    devtool: PROD ? false : 'cheap-module-source-map',
    entry: {
        main: path.resolve(__dirname, 'src/main-process/main.ts')
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    resolve: {
        extensions: ['.ts', '.js', '.json']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'awesome-typescript-loader',
                exclude: [/node_modules/, /dist/, /assets/, /test/],
                options: {
                    configFileName: path.resolve(__dirname, 'tsconfig.electron.json')
                }
            }
        ]
    },
    plugins: [
        new NoEmitOnErrorsPlugin(),
        new ProgressPlugin(),
        new DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV)
            }
        })
    ],
    node: {
        __dirname: false,
        __filename: false
    },
    target: 'electron-main',
    externals: {
        nodegit: 'require("nodegit")',
        '@sentry/electron': 'require("@sentry/electron")',
    }
};


if (PROD) {
    config.plugins.push(new UglifyJsPlugin({
        uglifyOptions: { ecma: 6 }
    }));
}


module.exports = config;
