/**
 * fire执行程序，待完善
 * 目前仅支持任务执行
 */

const path = require('path');
const process = require('process');

let uri = path.join(__dirname, 'firefile');
let tasks = require(uri);

const argv = process.argv || [];

// 查找可执行任务并执行
const checkAndExecute = () => {
    const _tasks = {};
    for (const key in tasks) {
        if (tasks.hasOwnProperty(key)) {
            const fn = tasks[key];
            if (argv.includes(key)) {
                _tasks[key] = fn;
                fn();
            }
        }
    }

    return _tasks;
}

tasks.clean(() => {
    checkAndExecute();
});