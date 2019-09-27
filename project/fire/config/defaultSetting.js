
const path = require('path');

const defaultSettings = {
    // webpack开发服务器配置
    devServer: {
        port: 8088,
        host: 'localhost',
        openPage: "home.html"
    },
    // 提取公共依赖
    extractBundle: {
        commonBundle: [
            'react', 'react-dom'
        ]
    },
    bundleHash: true,
    // 资源地址
    publicAssetPath: "https://baidu.com/"
}

module.exports = defaultSettings;