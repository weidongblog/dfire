const path = require('path');
let glob = require('glob');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const options = require('./options.js');
const defaultSetting = require('../defaultSetting.js');

//基本路径
let basePath = options.basePath;
//单独打包模块
let extractBundle = defaultSetting.extractBundle;

//入口页面
const entryPages = () => {
    let pattern = path.join(basePath.pagePath, '*.html');
    let pages = [];
    glob.sync(pattern).forEach(function (fullFileName) {
        let name = path.parse(fullFileName).name;
        pages.push(name);
    });
    return pages;
}

//入口页面路径{ page: 'xxx/xxx/page' }
const entry = () => {
    let entry = Object.assign({}, extractBundle);
    let pages = entryPages();
    for (let i = 0; i < pages.length; i++) {
        let page = pages[i];
        entry[page] = path.join(basePath.entryPath, page);
    }
    return entry;
}

//html插件配置
const getHtmlWebpackPlugins = () => {
    let plugins = [];
    let pages = entryPages();
    for (let i = 0; i < pages.length; i++) {
        let page = pages[i];
        let chunksArray = Object.keys(extractBundle);
        chunksArray.push(page);
        plugins.push(new HtmlWebpackPlugin({
            template: path.join(basePath.pagePath, `${page}.html`),
            filename: path.join(basePath.distPath, `${page}.html`),
            chunks: chunksArray
        }))
    }
    return plugins;
}

//其他插件
const getPlugins = () => {
    let plugins = getHtmlWebpackPlugins();
    plugins.push(
        new MiniCssExtractPlugin({
            filename: "[name].css?t=[hash]",
            chunkFilename: "[name].css",
        })
    )
    return plugins;
}

//webpack基本配置
const config = {
    entry: entry(),
    resolve: {
        alias: {
            assets: path.join(basePath.srcPath, 'assets'),
            components: path.join(basePath.srcPath, 'components'),
            styles: path.join(basePath.srcPath, 'styles'),
            commons: path.join(basePath.srcPath, 'commons')
        },
        extensions: ['.js', '.jsx']
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-loader?interpolate&minimize=false&attrs=script:src link:href img:src a:href'
                    }
                ]
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader'
                ]
            },
            {
                test: /\.less$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            config: {
                                path: path.resolve(__dirname, './postcss.config.js')
                            }
                        }
                    },
                    'less-loader'
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            config: {
                                path: path.resolve(__dirname, './postcss.config.js')
                            }
                        }
                    },
                    'sass-loader'
                ]
            },
            {
                test: /\.(js|jsx)$/,
                use: [
                    {
                        loader: 'babel-loader?cacheDirectory'
                    }
                ],
                include: basePath.srcPath
            },
            {
                test: /\.(ico|mp4|ogg|svg|eot|otf|ttf|woff|woff2)$/,
                use: [
                    {
                        loader: 'file-loader'
                    }
                ]
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            name: '[name].[ext]?[hash]',
                            limit: 8192
                        }
                    }
                ]
            }
        ]
    },
    plugins: getPlugins()
}

module.exports = {
    config,
    entryPages
};