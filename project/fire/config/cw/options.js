const path = require('path');

const options = {
    basePath: {
        srcPath: path.join(process.cwd(), './src'),
        pagePath: path.join(process.cwd(), './src/pages'),
        entryPath: path.join(process.cwd(), './src/entries'),
        assetsPath: path.join(process.cwd(), `./dist/assets`),
        distPath: path.join(process.cwd(), './dist'),
        scriptPath: path.join(process.cwd(), './script'),
    }
}

module.exports = options;