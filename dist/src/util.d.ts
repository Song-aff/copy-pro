import { pathType } from "./type";
export declare const getAbsoluteDir: (dir: pathType) => string;
export declare const getFullPathList: (pathList?: pathType[]) => string[];
export declare const getFullPathList1: (pathList?: pathType[]) => string[];
export declare const getFullPathList2: (pathList?: pathType[]) => string[];
export declare const getFullPathList3: (pathList?: pathType[]) => string[];
export declare const travel: (dir: pathType, excludeList: pathType[], noHandelList: pathType[], handleFile: (current: pathType) => void, copyDir: (current: pathType) => void) => void;
