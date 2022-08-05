#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_extra_1 = __importDefault(require("fs-extra"));
var path_1 = __importDefault(require("path"));
var util_1 = require("./util");
var cosmiconfig_1 = require("cosmiconfig");
var explorerSync = (0, cosmiconfig_1.cosmiconfigSync)("copy-pro");
// const args = minimist(process.argv.slice(2));
function main() {
    var _a;
    var config = ((_a = explorerSync.search()) === null || _a === void 0 ? void 0 : _a.config) || {};
    var originDir = (0, util_1.getAbsoluteDir)(config.originDir);
    var targetDir = (0, util_1.getAbsoluteDir)(config.targetDir);
    var _b = config.copyConfig, copyConfig = _b === void 0 ? {} : _b, _c = config.handleConfig, handleConfig = _c === void 0 ? {} : _c, _d = config.clear, clear = _d === void 0 ? false : _d, _e = config.encoding, encoding = _e === void 0 ? "utf-8" : _e;
    var plugins = handleConfig.plugins || [];
    if (clear) {
        fs_extra_1.default.emptyDirSync(targetDir);
    }
    if (originDir === targetDir) {
        console.error("originDir不能与targetDir相同");
        return;
    }
    var noCopyList = (0, util_1.getFullPathList)(copyConfig === null || copyConfig === void 0 ? void 0 : copyConfig.exclude);
    var handelList = (0, util_1.getFullPathList)(handleConfig === null || handleConfig === void 0 ? void 0 : handleConfig.include);
    var noHandelList = (0, util_1.getFullPathList)(handleConfig === null || handleConfig === void 0 ? void 0 : handleConfig.exclude);
    fs_extra_1.default.ensureDirSync(targetDir);
    (0, util_1.travel)(originDir, noCopyList, noHandelList, function (current) {
        console.log('current:', current);
        var currentTargetDir = path_1.default.join(targetDir, path_1.default.parse(path_1.default.relative(originDir, current)).dir);
        var currentTargetFile = path_1.default.join(targetDir, path_1.default.relative(originDir, current));
        fs_extra_1.default.ensureDirSync(currentTargetDir);
        //不经过处理，直接复制
        if (noHandelList.includes(current) || !handelList.includes(current)) {
            fs_extra_1.default.copyFileSync(current, currentTargetFile);
        }
        else {
            var source = fs_extra_1.default.readFileSync(current, {
                encoding: encoding,
            });
            var _payload_1 = {};
            var _source_1 = source;
            plugins.forEach(function (plugin, index) {
                _source_1 = plugin({
                    key: {
                        full: current,
                        relative: path_1.default.relative(originDir, current),
                        parse: path_1.default.parse(current),
                    },
                    data: _source_1,
                    payload: _payload_1,
                });
            });
            fs_extra_1.default.writeFileSync(currentTargetFile, _source_1, {
                encoding: encoding,
            });
        }
    }, function (current) {
        console.log('current:', current);
        var currentTargetFile = path_1.default.join(targetDir, path_1.default.relative(originDir, current));
        fs_extra_1.default.copySync(current, currentTargetFile);
    });
}
main();
//# sourceMappingURL=copy-pro.js.map