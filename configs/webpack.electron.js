const { DefinePlugin, NoEmitOnErrorsPlugin, ProgressPlugin } = require('webpack');
const { UglifyJsPlugin } = require('webpack').optimize;
const helpers = require('./helpers');


const runTargetName = helpers.runTarget.getName();
const PROD = runTargetName === 'production';

if (!helpers.runTarget.isTargetAvailable(runTargetName)) {
    throw new Error('Invalid run target');
}


const config = {
    name: 'main',
    devtool: PROD ? 'source-map' : 'cheap-module-source-map',
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
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
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
    target: 'electron-main'
};

if (PROD) {
    config.plugins.push(new UglifyJsPlugin({
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
    }));
}

module.exports = config;
