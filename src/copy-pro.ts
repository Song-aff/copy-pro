#!/usr/bin/env node
import fs from "fs-extra";
import path from "path";
import { getFullPathList, travel, getAbsoluteDir } from "./util";
import { cosmiconfigSync } from "cosmiconfig";
import minimist from "minimist";
import { Iconfig } from "./type";
const explorerSync = cosmiconfigSync("copy-pro");
// const args = minimist(process.argv.slice(2));
function main() {
  const config: Iconfig = explorerSync.search()?.config || {};
  const originDir = getAbsoluteDir(config.originDir);
  const targetDir = getAbsoluteDir(config.targetDir);
  const { copyConfig = {}, handleConfig = {}, clear = false, encoding = "utf-8" } = config;
  const plugins = handleConfig.plugins || [];
  if (clear) {
    fs.emptyDirSync(targetDir);
  }
  if (originDir === targetDir) {
    console.error("originDir不能与targetDir相同");
    return;
  }
  const noCopyList = getFullPathList(copyConfig?.exclude);
  const handelList = getFullPathList(handleConfig?.include);
  const noHandelList = getFullPathList(handleConfig?.exclude);
  fs.ensureDirSync(targetDir)
  travel(originDir, noCopyList, noHandelList,
    (current: string) => {
      console.log('current:', current)
      const currentTargetDir = path.join(
        targetDir,
        path.parse(path.relative(originDir, current)).dir
      );
      const currentTargetFile = path.join(
        targetDir,
        path.relative(originDir, current)
      );
      fs.ensureDirSync(currentTargetDir)
      //不经过处理，直接复制
      if (noHandelList.includes(current) || !handelList.includes(current)) {
        fs.copyFileSync(current, currentTargetFile);
      } else {
        const source = fs.readFileSync(current, {
          encoding: encoding,
        });

        let _payload = {};
        let _source = source;
        plugins.forEach((plugin: Function, index: number) => {
          _source = plugin({
            key: {
              full: current,
              relative: path.relative(originDir, current),
              parse: path.parse(current),
            },
            data: _source,
            payload: _payload,
          });
        });
        fs.writeFileSync(currentTargetFile, _source, {
          encoding: encoding,
        });
      }
    }, (current: string) => {
      console.log('current:', current)
      const currentTargetFile = path.join(
        targetDir,
        path.relative(originDir, current),
      );
      fs.copySync(current, currentTargetFile)
    });
}
main();
