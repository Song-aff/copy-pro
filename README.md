# copy-pro
copy directory with ForEach
## Start
1. 安装`npm install copy-pro`
2. 配置`copy-pro.config.js`
3. 运行 `npx coppy`
## Config
### example
```
const { defineConfig } = require("copy-pro");
const config = defineConfig({
  //待复制目录
  originDir: "./demo/origin",
  //目标目录
  targetDir: "./demo/target",
  //是否清除文件夹
  clear: true,
  //复制配置
  copyConfig: {
    //不需要复制的目录
    exclude: ["./demo/origin/dir1"],
  },
  //处理配置
  handleConfig: {
    //需要处理
    include: ["./demo/origin/**/*.[j|t]s{,x}"],
    //不需要处理的
    exclude: ["./demo/origin/dir2"],
    //处理函数
    plugins: [],
  },
});
module.exports = config;
```
### APi
| 字段名 | 说明 | 类型 | 默认值 | 其他 |
| --- | --- | --- | --- | --- |
| originDir | 待复制目录 | path |  |  |
| targetDir |目标目录  | path |  |  |
| clear | 是否清空目标目录 | ？boolean | false |  |
| encoding |文件编码  |？string   |utf-8 |  |
| copyConfig.exclude | 不复制的 | ？path[] |  |  |
|  handleConfig.include| 需要处理的 | ?path[] |  |  |
|  handleConfig.exclude| 不需要处理的 | ?path[] |  |  |
|  handleConfig.plugins| 处理函数 | ?pluginType[] |  |  |
## Plugins
以文本方式读入文件，按照Plugins中从左往右的顺序对字符串进行处理，最终写入文件。

`fs.readFile--sting-->plugin1--sting-->...--sting-->pluginN--sting-->fs.writeFile`

plugin的类型如下
```
type pluginType = (param: {
  key: {
    full: pathType;
    relative: pathType;
    parse: {
      root: pathType;
      dir: pathType;
      base: pathType;
      ext: pathType;
      name: pathType;
    };
  };
  data: string;
  payload: any;
}) => string;
```
通过key对当前文件进行区分，payload可以在不同plugin之间传递信息

### jsPlugin
在库中提供了一个自带的jsPlugin，可以通过在代码中的注释来进行代码片段的替换和忽略
```
const jsPlugin = require('copy-pro/dist/src/plugin/jsPlugin')
replaceMap={replaceID:replaceCode}
......
plugins: [jsPlugin(replaceMap)
```

在代码片段上方加入
``// @copypro-ignore ``
将会在复制时删除这段代码

在代码片段上方加入
``// @copypro-replace ${#replaceID}``
将会在复制时替换为replaceMap[replaceID]中的内容



### example
```
const jsPlugin = require('copy-pro/dist/src/plugin/jsPlugin')
const { defineConfig } = require('copy-pro')
const { version } = require('./package.json')
const replaceMap = {
  test: `
  console.log('test)
  `,
}
const packageCb = ({ key, data }) => {
  if (key.parse.base === 'package.json') {
    const packageData = JSON.parse(data)
    packageData.name = 'test'
    return JSON.stringify(packageData, null, 4)
  } else {
    return data
  }
}
const config = defineConfig({
  originDir: './demo',
  targetDir: './temp',
  clear: true,
  copyConfig: {
    exclude: ['./demo/node_modules'],
  },
  handleConfig: {
    include: ['./demo/**/*.[j|t]s{,x}', './demo/**/*.json'],
    exclude: ['./demo/exclude'],
    plugins: [jsPlugin(replaceMap), packageCb],
  },
})
module.exports = config

```