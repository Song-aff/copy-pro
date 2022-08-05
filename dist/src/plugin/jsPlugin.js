"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var parser_1 = require("@babel/parser");
var traverse_1 = __importDefault(require("@babel/traverse"));
var generator_1 = __importDefault(require("@babel/generator"));
var template_1 = __importDefault(require("@babel/template"));
var prettier_1 = __importDefault(require("prettier"));
var IGNORE_STRING = "@copypro-ignore";
var REPLACE_STRING = "@copypro-replace";
var jsPlugin = function (replaceMap, prettierOpt) {
    if (replaceMap === void 0) { replaceMap = {}; }
    if (prettierOpt === void 0) { prettierOpt = {
        semi: false,
        singleQuote: true,
        printWidth: 120,
    }; }
    return function (_a) {
        var key = _a.key, data = _a.data;
        var _replaceMapList = [];
        if (![".js", ".jsx", ".tsx", ".ts"].includes(key.parse.ext)) {
            return data;
        }
        var ast = (0, parser_1.parse)(data, {
            sourceType: "unambiguous",
            plugins: ["jsx", "typescript"],
        });
        (0, traverse_1.default)(ast, {
            enter: function (path, state) {
                // 处理ignore
                var leadingIgonreCommentsIndex = path.node.leadingComments
                    ? path.node.leadingComments.findIndex(function (comment) {
                        return comment &&
                            !comment.ignore &&
                            comment.value.trim() === IGNORE_STRING;
                    })
                    : -1;
                if (leadingIgonreCommentsIndex !== -1) {
                    path.node.leadingComments[leadingIgonreCommentsIndex].ignore = true;
                    path.remove();
                    path.skip();
                    return;
                }
                // 处理replace
                var leadingRepalceCommentsIndex = path.node.leadingComments
                    ? path.node.leadingComments.findIndex(function (comment) {
                        return comment &&
                            !comment.ignore &&
                            comment.value.trim().includes(REPLACE_STRING);
                    })
                    : -1;
                if (leadingRepalceCommentsIndex !== -1) {
                    var repalceCommentsValue = path.node.leadingComments[leadingRepalceCommentsIndex].value.trim();
                    // 匹配replaceID
                    var replaceID = "";
                    if (/\{#(\w+)\}/.test(repalceCommentsValue)) {
                        replaceID = /\{#(\w+)\}/.exec(repalceCommentsValue)[1];
                    }
                    else {
                        throw Error("未能正确匹配到@copypro-replace {#id}的id值");
                    }
                    path.node.leadingComments[leadingRepalceCommentsIndex].ignore = true;
                    // 生成占位
                    if (replaceMap && replaceMap[replaceID]) {
                        var replaceAst = template_1.default.ast("{}//".concat(replaceID, "_placeholder"), {
                            preserveComments: true,
                        });
                        _replaceMapList.push({
                            id: replaceID,
                            value: replaceMap[replaceID],
                        });
                        path.replaceWith(replaceAst);
                    }
                    else {
                        throw Error("\u4F7F\u7528@copypro-replace\u9700\u8981\u914D\u7F6E\u5BF9\u5E94map\u503C,replaceID: ".concat(replaceID, " \u672A\u627E\u5230\u5BF9\u5E94\u503C"));
                    }
                    path.skip();
                    return;
                }
            },
        });
        var code = (0, generator_1.default)(ast).code;
        var _code = code;
        // 对replace统一替换
        _replaceMapList.forEach(function (_replaceMap) {
            _code = _code.replace("{} //".concat(_replaceMap.id, "_placeholder"), _replaceMap.value);
        });
        // 格式化处理
        return prettier_1.default.format(_code, __assign({ parser: "babel-ts" }, prettierOpt));
    };
};
module.exports = jsPlugin;
//# sourceMappingURL=jsPlugin.js.map