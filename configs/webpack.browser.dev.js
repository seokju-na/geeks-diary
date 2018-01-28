const { DefinePlugin } = require('webpack');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.browser.common');


const config = webpackMerge(commonConfig, {
    devtool: 'cheap-module-source-map',
    plugins: [
        new DefinePlugin({
            'process.env': {
                RUN_TARGET: JSON.stringify('development')
            }
        })
    ]
});

module.exports = config;
