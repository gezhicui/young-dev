import express from 'express';
import { build } from 'esbuild';
import path from 'path';
import fs from 'fs';
import portfinder from 'portfinder';
import { createServer } from 'http';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { DEFAULT_OUTDIR, DEFAULT_PLATFORM, DEFAULT_PORT, DEFAULT_HOST } from './constants';
import { createWebSocketServer } from './server';
import { style } from './styles';
import { getAppData } from './appData';
import type { AppData } from './appData';
import { getUserConfig } from './config';
import { getRoutes } from './routes';
import { generateEntry } from './entry';
import { generateHtml } from './html';
import { getMockConfig } from './mock';

export const dev = async () => {
  const cwd = process.cwd();
  const app = express();
  const port = await portfinder.getPortPromise({
    port: DEFAULT_PORT,
  });

  const output = path.resolve(cwd, DEFAULT_OUTDIR);

  app.get('/', (_req, res, next) => {
    res.set('Content-Type', 'text/html');
    const htmlPath = path.join(output, 'index.html');
    if (fs.existsSync(htmlPath)) {
      fs.createReadStream(htmlPath).on('error', next).pipe(res);
    } else {
      next();
    }
  });

  app.use(`/${DEFAULT_OUTDIR}`, express.static(output));
  app.use(`/malita`, express.static(path.resolve(__dirname, 'client')));

  const malitaServe = createServer(app);
  const ws = createWebSocketServer(malitaServe);

  function sendMessage(type: string, data?: any) {
    ws.send(JSON.stringify({ type, data }));
  }

  const buildMain = async ({ appData }: { appData: AppData }) => {
    // 获取用户数据
    const userConfig = await getUserConfig({ appData, malitaServe });
    // 获取用户配置的mock数据
    const mockConfig = await getMockConfig({ appData, malitaServe });
    // 获取 routes 配置
    const routes = await getRoutes({ appData });
    // 生成项目主入口
    await generateEntry({ appData, routes, userConfig });
    // 生成 Html
    await generateHtml({ appData, userConfig });

    //处理用户mock数据
    app.use((req, res, next) => {
      const result = mockConfig?.[req.method]?.[req.url];
      if (
        Object.prototype.toString.call(result) === '[object String]' ||
        Object.prototype.toString.call(result) === '[object Array]' ||
        Object.prototype.toString.call(result) === '[object Object]'
      ) {
        res.json(result);
      } else if (Object.prototype.toString.call(result) === '[object Function]') {
        result(req, res);
      } else {
        next();
      }
    });

    if (userConfig.proxy) {
      Object.keys(userConfig.proxy).forEach(key => {
        // !. 非空断言操作符 表示一定不是null或undefine
        const proxyConfig = userConfig.proxy![key];
        const target = proxyConfig.target;
        if (target) {
          app.use(key, createProxyMiddleware(key, proxyConfig));
        }
      });
    }
  };
  malitaServe.on('REBUILD', async ({ appData }) => {
    await buildMain({ appData });
    sendMessage('reload');
  });

  malitaServe.listen(port, async () => {
    console.log(`App listening at http://${DEFAULT_HOST}:${port}`);
    try {
      // 生命周期
      // 获取项目元信息
      const appData = await getAppData({ cwd, port });
      // 执行主构建准备内容
      await buildMain({ appData });
      // 执行构建
      await build({
        format: 'iife',
        logLevel: 'error',
        outdir: appData.paths.absOutputPath,
        platform: DEFAULT_PLATFORM,
        bundle: true,
        watch: {
          onRebuild: (err, res) => {
            if (err) {
              console.error(JSON.stringify(err));
              return;
            }
            console.log('esbuild rebuild~~');
            sendMessage('reload');
          },
        },
        define: {
          'process.env.NODE_ENV': JSON.stringify('development'),
        },
        external: ['esbuild'],
        plugins: [style()],
        entryPoints: [appData.paths.absEntryPath],
      });
      // [Issues](https://github.com/evanw/esbuild/issues/805)
      // 查了很多资料，esbuild serve 不能响应 onRebuild， esbuild build 和 express 组合不能不写入文件
    } catch (e) {
      console.log(e);
      process.exit(1);
    }
  });
};
