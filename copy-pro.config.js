const jsPlugin = require("./dist/src/plugin/jsPlugin");
const { defineConfig } = require("./dist/src/index");
const replaceMap = {
  test: `
  const test = 'test'
  console.log(test)
  `,
};
const config = defineConfig({
  originDir: "./demo/origin",
  targetDir: "./demo/target",
  clear: true,
  copyConfig: {
    exclude: ["./demo/origin/dir1"],
  },
  handleConfig: {
    include: ["./demo/origin/**/*.[j|t]s{,x}"],
    exclude: ["./demo/origin/dir2"],
    plugins: [jsPlugin(replaceMap)],
  },
});
module.exports = config;
