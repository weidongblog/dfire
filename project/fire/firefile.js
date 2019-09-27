const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const path = require('path');
const settings = require('./config/defaultSetting');
const fancyLog = require('fancy-log');
const pluginError = require('plugin-error');
const process = require('process');
const del = require('del');
// const tutils = require('tutils');

// 环境枚举
const envEnum = {
    dev: "dev",   //开发环境
    test: "test",   //测试环境
    prod: "prod"    //生产环境
};

const argv = process.argv || [];

/**
 * 获得运行配置枚举
 * @example fire-env fire-open fire-hot
 */
const getStartOptionEnum = () => {
    let _enum = {};
    let reg = /^(fire\-[a-z]+)/;
    for (let i = 0; i < argv.length; i++) {
        if (reg.test(argv[i])) {
            let list = argv[i].split("=");
            let _key = list[0].split('-')[1];
            let _value = list[1] || true;
            _enum[_key] = _value;
        }
    }
    return _enum;
}

// 运行配置枚举
const optionEnum = getStartOptionEnum();

// 获得环境变量
const getEnv = () => {
    let env = envEnum[optionEnum['env']];
    if (!env) {
        throw new pluginError('error: ', 'Invalid environment type')
    }
    return env;
}

// 获取 webpack 配置
const getWebpackConfig = () => {
    let uri = path.join(__dirname, './config/index.js');
    let webpackOption = require(uri);
    let config = getEnv() === "dev" ? webpackOption.devConfig : webpackOption.prodConfig;
    return config;
}

const webpackConfig = getWebpackConfig();

// 获得本地服务配置
const getDevServer = () => {
    let startServerOption = {
        hot: optionEnum['hot'],
        open: optionEnum['open']
    };
    let settingServerOption = settings.devServer;
    let baseServerOption = webpackConfig.devServer;

    let _devServer = Object.assign({}, baseServerOption, settingServerOption, startServerOption);
    return _devServer;
}


// 设置开发服务器
const devServer = getDevServer();

// 清理构建文件
const cleanBuild = (callback) => {
    let buildOutput = './dist'; // 编译输出目录
    let buildCache = './node_modules/.cache/**'; // 编译缓存目录

    del([buildOutput, buildCache], {
        dryRun: false
    }).then((paths) => {
        fancyLog('cleanBuild', `'${buildOutput}' and '${buildCache}' has been cleaned`);
        callback();
    }).catch((err) => {
        throw new pluginError('error: ', err)
    });
};


//构建项目
const buildProject = () => {
    // tutils.exec('cross-env NODE_ENV=production dev=false webpack --hide-modules', { stdio: 'inherit' });
    fancyLog('building...');
    webpack(webpackConfig, (err, stats) => {
        // funLog('build', stats.toString());
        fancyLog('Log in plugin build', '\nMessage:\n    ', stats.toString());
    });
}

// 启动开发服务器
const startDevServer = () => {
    fancyLog('starting...');
    new webpackDevServer(webpack(webpackConfig), devServer).listen(devServer.port, devServer.host);
}

exports.clean = cleanBuild;
exports.build = buildProject;
exports.server = startDevServer;