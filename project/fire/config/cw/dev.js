const base = require('./base.js');
const webpack = require('webpack');
const options = require('./options.js');
const defaultSetting = require('../defaultSetting.js');

const basePath = options.basePath;

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

// 扩展配置
const config = {
    mode: "development",
    output: {
        path: basePath.distPath,
        publicPath: `/`,
        filename: defaultSetting.bundleHash ? '[name].[hash].js' : '[name].js',
        chunkFilename: defaultSetting.bundleHash ? '[name].[chunkhash:8].bundle.js' : '[name].bundle.js'
    },
    devtool: 'cheap-module-eval-source-map',
    devServer: {
        hot: true,
        host: "0.0.0.0",
        contentBase: basePath.distPath,
        port: '8088',
        disableHostCheck: true,
        proxy: devServerProxy
    },
    plugins: base.config.plugins.concat(new webpack.HotModuleReplacementPlugin())
};

module.exports = Object.assign({}, base.config, config);