// 深拷贝
const deepClone = parent => {
    // 判断类型
    const isType = (obj, type) => {
        if (typeof obj !== "object") return false;
        const typeString = Object.prototype.toString.call(obj);
        let flag;
        switch (type) {
            case "Array":
                flag = typeString === "[object Array]";
                break;
            case "Date":
                flag = typeString === "[object Date]";
                break;
            case "RegExp":
                flag = typeString === "[object RegExp]";
                break;
            default:
                flag = false;
        }
        return flag;
    };

    // 处理正则
    const getRegExp = re => {
        var flags = "";
        if (re.global) flags += "g";
        if (re.ignoreCase) flags += "i";
        if (re.multiline) flags += "m";
        return flags;
    };
    // 维护两个储存循环引用的数组
    const parents = [];
    const children = [];

    const _clone = parent => {
        if (parent === null) return null;
        if (typeof parent !== "object") return parent;

        let child, proto;

        if (isType(parent, "Array")) {
            // 对数组做特殊处理
            child = [];
        } else if (isType(parent, "RegExp")) {
            // 对正则对象做特殊处理
            child = new RegExp(parent.source, getRegExp(parent));
            if (parent.lastIndex) child.lastIndex = parent.lastIndex;
        } else if (isType(parent, "Date")) {
            // 对Date对象做特殊处理
            child = new Date(parent.getTime());
        } else {
            // 处理对象原型
            proto = Object.getPrototypeOf(parent);
            // 利用Object.create切断原型链
            child = Object.create(proto);
        }

        // 处理循环引用
        const index = parents.indexOf(parent);

        if (index != -1) {
            // 如果父数组存在本对象,说明之前已经被引用过,直接返回此对象
            return children[index];
        }
        parents.push(parent);
        children.push(child);

        for (let i in parent) {
            // 递归
            child[i] = _clone(parent[i]);
        }

        return child;
    };
    return _clone(parent);
}

// 深度递归 Object.assign
const deepAssign = (target, ...sources) => {
    let to = Object(target);

    // 遍历来源对象数组
    for (let i = 0; i < sources.length; i++) {
        let source = sources[i];
        // 检查是否为简单对象
        if (Object.prototype.toString.call(source) !== '[object Object]') {
            to = Object.assign(to, source);
            continue;
        }

        // 遍历来源对象
        for (let key in source) {
            // 是否为自身属性
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                let val = source[key];
                // 检查是否为简单对象
                if (Object.prototype.toString.call(val) !== '[object Object]') {
                    to[key] = val;
                    continue;
                }

                // 递归调用
                to[key] = deepAssign(to[key], val);
            }
        }
    }

    return to;
};

module.exports = {
    deepClone,
    deepAssign
};
