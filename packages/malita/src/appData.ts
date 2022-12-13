import path from 'path';
import { DEFAULT_ENTRY_POINT, DEFAULT_OUTDIR, DEFAULT_TEMPLATE } from './constants';

interface Options {
  cwd: string;
  port: number;
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
export const getAppData = ({ cwd, port }: Options) => {
  return new Promise((resolve: (value: AppData) => void, rejects) => {
    // cwd，当前路径  : '磁盘路径\\young-js\\examples\\app',
    // absSrcPath，src目录绝对路径: '磁盘路径\\young-js\\examples\\app\\src',
    // absPagesPath，pages目录绝对路径: '磁盘路径\\young-js\\examples\\app\\src\\pages',
    // absNodeModulesPath，node_modules 目录绝对路径: '磁盘路径\\young-js\\examples\\app\\node_modules',
    // absTmpPath，临时目录绝对路径: '磁盘路径\\young-js\\examples\\app\\node_modules\\.malita',
    // absEntryPath，主入口文件的绝对路径: '磁盘路径\\young-js\\examples\\app\\node_modules\\.malita\\malita.tsx
    // absOutputPath，输出目录绝对路径: '磁盘路径\\young-js\\examples\\app\\dist'

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
