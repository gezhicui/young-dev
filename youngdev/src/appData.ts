import path from 'path';
import { DEFAULT_ENTRY_POINT, DEFAULT_OUTDIR, DEFAULT_TEMPLATE, DEFAULT_PORT } from './constants';

interface Options {
  cwd: string;
  port?: number;
}
export interface AppData {
  paths: {
    cwd: string;
    port: number;
    absSrcPath: string;
    absPagesPath: string;
    absTmpPath: string;
    absOutputPath: string;
    absEntryPath: string;
    absNodeModulesPath: string;
  };
  pkg: any;
}
export const getAppData = ({ cwd, port = DEFAULT_PORT }: Options) => {
  return new Promise((resolve: (value: AppData) => void, rejects) => {
    /* 
      cwd: 前端项目路径 'D:\\CodeDemo\\造轮子\\young-dev\\app',
      port: 运行端口 8888,
      absSrcPath: src目录路径 '磁盘路径\\app\\src',
      absPagesPath: pages目录路径 '磁盘路径\\app\\src\\pages',
      absNodeModulesPath:  依赖包目录路径 '磁盘路径\\app\\node_modules',
      absTmpPath: 临时目录路径 '磁盘路径\\app\\node_modules\\.youngdev',
      absEntryPath: 主入口文件的路径 '磁盘路径\\app\\node_modules\\.youngdev\\youngdev.tsx',
      absOutputPath: 输出目录路径 '磁盘路径\\app\\dist'
    */
    const absSrcPath = path.resolve(cwd, 'src');
    const absPagesPath = path.resolve(absSrcPath, 'pages');
    const absNodeModulesPath = path.resolve(cwd, 'node_modules');
    const absTmpPath = path.resolve(absNodeModulesPath, DEFAULT_TEMPLATE);
    const absEntryPath = path.resolve(absTmpPath, DEFAULT_ENTRY_POINT);
    const absOutputPath = path.resolve(cwd, DEFAULT_OUTDIR);

    const paths = {
      cwd,
      port,
      absSrcPath,
      absPagesPath,
      absNodeModulesPath,
      absTmpPath,
      absEntryPath,
      absOutputPath,
    };
    // 当前项目的 package.json，格式为 Object。
    const pkg = require(path.resolve(cwd, 'package.json'));
    resolve({ paths, pkg });
  });
};
