"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.travel = exports.getFullPathList = exports.getAbsoluteDir = void 0;
var fs_extra_1 = __importDefault(require("fs-extra"));
var glob_1 = __importDefault(require("glob"));
var path_1 = __importDefault(require("path"));
var getAbsoluteDir = function (dir) {
    return path_1.default.isAbsolute(dir) ? dir : path_1.default.resolve(dir);
};
exports.getAbsoluteDir = getAbsoluteDir;
var getFullPathList = function (pathList) {
    if (pathList === void 0) { pathList = []; }
    var _pathList = Array.isArray(pathList) ? pathList : [pathList];
    return _pathList
        .map(function (item) { return glob_1.default.sync(item); })
        .flat()
        .map(function (filePath) { return path_1.default.resolve(filePath); });
};
exports.getFullPathList = getFullPathList;
var travel = function (dir, excludeList, noHandelList, handleFile, copyDir) {
    fs_extra_1.default.readdirSync(dir).forEach(function (file) {
        var pathname = path_1.default.join(dir, file);
        if (excludeList.includes(pathname)) {
            return;
        }
        if (fs_extra_1.default.statSync(pathname).isDirectory()) {
            if (noHandelList.includes(pathname)) {
                copyDir(pathname);
            }
            else {
                (0, exports.travel)(pathname, excludeList, noHandelList, handleFile, copyDir);
            }
        }
        else {
            handleFile(pathname);
        }
    });
};
exports.travel = travel;
//# sourceMappingURL=util.js.map