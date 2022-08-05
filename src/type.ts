import {ObjectEncodingOptions} from 'fs'
export type pathType = string;
export type pluginType = (param: {
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
export interface Iconfig {
  originDir: pathType;
  targetDir: pathType;
  clear?: boolean;
  encoding?:ObjectEncodingOptions["encoding"];
  copyConfig?: {
    exclude?: pathType[];
  };
  handleConfig?: {
    include?: pathType[];
    exclude?: pathType[];
    plugins?: pluginType[];
  };
}
