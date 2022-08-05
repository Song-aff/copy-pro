import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import template from "@babel/template";
import prettier from "prettier";
import { pluginType } from "../type";
const IGNORE_STRING = "@copypro-ignore";
const REPLACE_STRING = "@copypro-replace";

const jsPlugin: (
  replaceMap?: Record<string, string>,
  prettierOpt?: prettier.Options
) => pluginType = (
  replaceMap = {},
  prettierOpt = {
    semi: false,
    singleQuote: true,
    printWidth: 120,
  }
) => {
  return ({ key, data }) => {
    const _replaceMapList: { id: string; value: string }[] = [];
    if (![".js", ".jsx", ".tsx", ".ts"].includes(key.parse.ext)) {
      return data;
    }
    const ast = parse(data, {
      sourceType: "unambiguous",
      plugins: ["jsx", "typescript"],
    });
    traverse(ast, {
      enter(path, state) {
        // 处理ignore
        const leadingIgonreCommentsIndex = path.node.leadingComments
          ? path.node.leadingComments.findIndex(
              (comment) =>
                comment &&
                !comment.ignore &&
                comment.value.trim() === IGNORE_STRING
            )
          : -1;
        if (leadingIgonreCommentsIndex !== -1) {
          path.node.leadingComments![leadingIgonreCommentsIndex].ignore = true;
          path.remove();
          path.skip();
          return;
        }

        // 处理replace
        const leadingRepalceCommentsIndex = path.node.leadingComments
          ? path.node.leadingComments.findIndex(
              (comment) =>
                comment &&
                !comment.ignore &&
                comment.value.trim().includes(REPLACE_STRING)
            )
          : -1;

        if (leadingRepalceCommentsIndex !== -1) {
          const repalceCommentsValue =
            path.node.leadingComments![
              leadingRepalceCommentsIndex
            ].value.trim();
          // 匹配replaceID
          let replaceID = "";
          if (/\{#(\w+)\}/.test(repalceCommentsValue)) {
            replaceID = /\{#(\w+)\}/.exec(repalceCommentsValue)![1];
          } else {
            throw Error("未能正确匹配到@copypro-replace {#id}的id值");
          }
          path.node.leadingComments![leadingRepalceCommentsIndex].ignore = true;
          // 生成占位
          if (replaceMap && replaceMap[replaceID]) {
            const replaceAst = template.ast(`{}//${replaceID}_placeholder`, {
              preserveComments: true,
            });
            _replaceMapList.push({
              id: replaceID,
              value: replaceMap[replaceID],
            });
            path.replaceWith(replaceAst as any);
          } else {
            throw Error(
              `使用@copypro-replace需要配置对应map值,replaceID: ${replaceID} 未找到对应值`
            );
          }
          path.skip();
          return;
        }
      },
    });
    const { code } = generate(ast);
    let _code = code;
    // 对replace统一替换
    _replaceMapList.forEach((_replaceMap) => {
      _code = _code.replace(
        `{} //${_replaceMap.id}_placeholder`,
        _replaceMap.value
      );
    });
    // 格式化处理
    return prettier.format(_code, {
      parser: "babel-ts",
      ...prettierOpt,
    });
  };
};
module.exports = jsPlugin;
