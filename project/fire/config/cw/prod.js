const base = require('./base.js');
const process = require('process');
const webpack = require('webpack');
const options = require('./options.js');
const defaultSetting = require('../defaultSetting.js');

const basePath = options.basePath;

// 扩展配置
const config = {
    mode: process.env.NODE_ENV === "production" ? "production" : "development",
    output: {
        path: basePath.assetsPath,
        publicPath: defaultSetting.publicAssetPath,
        filename: 'js/[name].js?t=[hash]'
    },
    devtool: process.env.NODE_ENV === "production" ? 'hidden-source-map' : 'cheap-module-eval-source-map',
    plugins: base.config.plugins.concat(new webpack.LoaderOptionsPlugin({
        debug: false,
        minimize: true,
        options: {
            context: __dirname
        }
    }))
}

module.exports = Object.assign({}, base.config, config);