#!/usr/bin/env node
const program = require('commander');
const path = require('path');
const gulp = require("gulp");
const replace = require('gulp-replace');

/**
 * 创建项目
 * @param {String} value 项目名/项目描述
 */
var createProject = function (value) {
    if (!value || typeof value !== "string" || !value.split("/")[1]) {
        console.log("命令有误，格式：dfire c|create 项目名/[项目描述]");
        return;
    }
    console.log("生成项目...");
    // 复制整体目录
    const projectPath = path.resolve(__dirname, "../project/fire/");
    const valueArr = value.split("/");
    const projectName = valueArr[0];
    const projectDisc = valueArr[1];
    gulp.src(`${projectPath}/**`)
        .pipe(replace('__projectName__', projectName))
        .pipe(replace('__projectDesc__', projectDisc))
        .pipe(gulp.dest(`${process.cwd()}`));
    gulp.src(`${projectPath}/.*`)
        .pipe(gulp.dest(`${process.cwd()}`))
        .on("end", () => {
            console.log("生成完毕");
        });
}

program
    .command('create')
    .alias('c')
    .description('创建项目')
    .action(function (value) {
        createProject(value);
    });

program.parse(process.argv)