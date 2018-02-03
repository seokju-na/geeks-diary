const { ContextReplacementPlugin, DefinePlugin } = require('webpack');
const helpers = require('./helpers');


const CI = process.env.CI || false;

const config = {
    devtool: 'inline-source-map',
    resolve: {
        extensions: ['.ts', '.js', '.json'],
        modules: [helpers.path.src(), helpers.path.nodeModules()]
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'awesome-typescript-loader',
                        query: {
                            configFileName: helpers.path.src('tsconfig.spec.json')
                        }
                    },
                    'angular2-template-loader'
                ]
            },
            {
                test: /\.json$/,
                loader: 'json-loader',
                exclude: [helpers.path.src('index.html')]
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
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
            }
        ]
    },
    plugins: [
        new DefinePlugin({
            'process.env': {
                RUN_TARGET: JSON.stringify('test')
            }
        }),
        new ContextReplacementPlugin(
            /@angular(\\|\/)core(\\|\/)esm5/,
            helpers.path.src('.'),
            {}
        )
    ],
    performance: {
        hints: false
    },
    target: 'electron-renderer'
};


if (CI) {
    config.module.rules.push(
        {
            enforce: 'post',
            test: /\.(js|ts)$/,
            loader: 'istanbul-instrumenter-loader',
            include: helpers.path.src('app'),
            exclude: [
                /\.(e2e|spec)\.ts$/,
                /node_modules/
            ]
        }
    );
}

module.exports = config;
