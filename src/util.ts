import fs from "fs-extra";
import glob from "glob";
import path from "path";
import { pathType } from "./type";
// @copypro-replace {#test}
export const getAbsoluteDir = (dir: pathType) => {
  return path.isAbsolute(dir) ? dir : path.resolve(dir);
};
// @copypro-replace {#test}
export const getFullPathList = (pathList: pathType[] = []) => {
  const _pathList = Array.isArray(pathList) ? pathList : [pathList];
  return _pathList
    .map((item) => glob.sync(item))
    .flat()
    .map((filePath) => path.resolve(filePath));
};
// @copypro-replace {#test}
export const getFullPathList1 = (pathList: pathType[] = []) => {
  const _pathList = Array.isArray(pathList) ? pathList : [pathList];
  return _pathList
    .map((item) => glob.sync(item))
    .flat()
    .map((filePath) => path.resolve(filePath));
};
// @copypro-replace {#test}
export const getFullPathList2 = (pathList: pathType[] = []) => {
  const _pathList = Array.isArray(pathList) ? pathList : [pathList];
  return _pathList
    .map((item) => glob.sync(item))
    .flat()
    .map((filePath) => path.resolve(filePath));
};
// @copypro-replace {#test}
export const getFullPathList3 = (pathList: pathType[] = []) => {
  const _pathList = Array.isArray(pathList) ? pathList : [pathList];
  return _pathList
    .map((item) => glob.sync(item))
    .flat()
    .map((filePath) => path.resolve(filePath));
};
// @copypro-ignore
export const travel = (
  dir: pathType,
  excludeList: pathType[],
  noHandelList: pathType[],
  handleFile: (current: pathType) => void,
  copyDir: (current: pathType) => void
) => {
  fs.readdirSync(dir).forEach((file) => {
    const pathname = path.join(dir, file);
    if (excludeList.includes(pathname)) {
      return;
    }
    if (fs.statSync(pathname).isDirectory()) {
      if (noHandelList.includes(pathname)) {
        copyDir(pathname);
      } else {
        travel(pathname, excludeList, noHandelList, handleFile, copyDir);
      }
    } else {
      handleFile(pathname);
    }
  });
};
