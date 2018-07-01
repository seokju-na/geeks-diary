const { DefinePlugin, NoEmitOnErrorsPlugin, ProgressPlugin } = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const helpers = require('./helpers');


const runTargetName = helpers.runTarget.getName();
const PROD = runTargetName === 'production';

if (!helpers.runTarget.isTargetAvailable(runTargetName)) {
    throw new Error('Invalid run target');
}


const config = {
    mode: PROD ? 'production' : 'development',
    name: 'main',
    devtool: PROD ? null : 'cheap-module-source-map',
    entry: {
        main: helpers.path.src('main.electron.ts')
    },
    output: {
        path: helpers.path.dist(),
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
                exclude: [...helpers.path.excludes()],
                options: {
                    configFileName: helpers.path.src('tsconfig.electron.json')
                }
            }
        ]
    },
    node: {
        __dirname: false,
        __filename: false
    },
    plugins: [
        new NoEmitOnErrorsPlugin(),
        new ProgressPlugin(),
        new DefinePlugin({
            'process.env': {
                RUN_TARGET: JSON.stringify(runTargetName)
            }
        })
    ],
    target: 'electron-main',
    externals: {
        nodegit: 'require("nodegit")'
    }
};


if (PROD) {
    config.plugins.push(new UglifyJsPlugin({
        uglifyOptions: { ecma: 6 }
    }));
}


module.exports = config;
