const webpack = require('webpack');
const pkg = require('./package.json');
const fs = require("fs")
const path = require('path');
const glob = require('glob');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const settings = require('./config/defaultSettings');

//基本路径
const basePath = {
    srcPath: path.join(process.cwd(), './src'),
    pagePath: path.join(process.cwd(), './src/pages'),
    entryPath: path.join(process.cwd(), './src/entries'),
    assetsPath: path.join(process.cwd(), `./dist/assets`),
    distPath: path.join(process.cwd(), './dist')
};

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

//单独提取打包文件
const extractBundle = {
    reactBundle: ['react', 'react-dom']
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
            chunks: chunksArray,
            alterAssetTags: (htmlPluginData) => {
                let assetTags = [].concat(htmlPluginData.head).concat(htmlPluginData.body);
                assetTags.forEach((assetTag) => {
                    if (assetTag.tagName == 'script' || assetTag.tagName == 'link') {
                        assetTag.attributes.crossorigin = 'anonymous';
                    }
                });

                return htmlPluginData;
            }
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

//开发服务代理
let devServerProxy = {
    '/proxy/': {
        target: '', //代理目标地址
        pathRewrite: {
            '^/proxy/': '/'
        },
        logLevel: 'debug', // 修改 webpack-dev-server 的日志等级
        secure: false, // 忽略检查代理目标的 SSL 证书
        changeOrigin: true, // 修改代理目标请求头中的 host 为目标源
        onProxyReq: (proxyReq, req /*, res*/) => { // 代理目标请求发出前触发
            let body = req.body;
            let method = req.method.toLowerCase();

            if (body && method == 'post') {
                let contentType = req.get('Content-Type');
                contentType = contentType ? contentType.toLowerCase() : '';

                if (contentType.includes('application/json')) {
                    // 使用 application/json 类型提交表单
                    let bodyData = JSON.stringify(body);

                    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                    proxyReq.write(bodyData);
                } else if (contentType.includes('application/x-www-form-urlencoded')) {
                    // 使用 application/x-www-form-urlencoded 类型提交表单
                    let bodyData = Object.keys(body).map((key) => {
                        let val = body[key];
                        val = val ? val : '';
                        return encodeURIComponent(key) + '=' + encodeURIComponent(val);
                    }).join('&');

                    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                    proxyReq.write(bodyData);
                } else if (contentType.includes('multipart/form-data')) {
                    // 使用 multipart/form-data 类型提交表单
                }
            }
        },
        onProxyRes: ( /*proxyRes, req, res*/) => { // 代理目标响应接收后触发
        },
        onError: ( /*err, req, res*/) => { // 代理目标出现错误后触发
        }
    }
};

//webpack基本配置
const config = {
    mode: 'development',
    entry: entry(),
    output: {
        path: basePath.distPath,
        publicPath: `/`,
        filename: '[name].js',
        chunkFilename: '[name]-[id].[chunkhash:8].bundle.js'
    },
    devtool: 'source-map',
    devServer: {
        hot: true,
        host: settings.host,
        contentBase: basePath.distPath,
        port: settings.port,
        disableHostCheck: true,
        openPage: "index.html"
    },
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
                test: /\.(ico|mp4|ogg|svg|eot|otf|ttf|woff|woff2)$/,
                use: [
                    {
                        loader: 'file-loader'
                    }
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

module.exports = config;