# 什么是 young-dev

一个学习用的**react 开发框架**,基于 esbuild 和 express 实现,通过命令行运行,实现 react 工程 hmr 热加载、用户自定义配置、前端 proxy 处理、约定式路由处理

# 目录结构

```
├─app（示例react项目文件夹）
│  ├─mock （纯前端mock接口配置文件夹）
│  ├─src （前端页面文件夹）
│  ├─package.json （前端项目工程信息文件）
│  ├─young.config.ts （用户配置文件）
├─youngdev（youngdev开发框架文件夹）
│  ├─bin （命令行工具，解析用户输入）
│  ├─client （客户端socket，用于hmr）
│  ├─src （核心代码包）
│  │  ├─appData.ts （获取前端工程项目路径信息）
│  │  ├─build.ts （执行前端工程打包命令时的操作）
│  │  ├─config.ts （读取前端工程项目配置文件）
│  │  ├─constants.ts （配置youngdev元信息）
│  │  ├─dev.ts （主文件，启动开发服务器，引入各个核心模块进行处理）
│  │  ├─entry.ts （生成前端工程虚拟入口文件）
│  │  ├─html.ts （生成前端工程html模板文件）
│  │  ├─mock.ts （处理前端工程mock文件）
│  │  ├─routes.ts （约定式路由处理文件）
│  │  ├─server.ts （服务端socket,用于hmr）
│  │  ├─style.ts （处理样式文件）
├─.gitignore（git忽略文件）
├─package.json（工程信息文件）
├─pnpm-workspace.yaml（pnpm monorepo工程配置文件）
├─tsconfig.base.json（ts基础配置文件）
```

# 关于 young-dev

本框架是对前端工程化的一次学习和尝试，初学者能在这个极简的框架里找到以下问题的答案：

- 1、命令行工具是怎么实现的？

- 2、在项目中 `npm run dev` 的时候发生了什么？

- 3、为什么 `npm run dev` 以后，可以通过 localhost:端口号 访问到项目内容？

- 4、为什么修改文件保存后，开发框架会自动帮我们更新浏览器页面内容？

- 5、umi 中的约定式路由是怎么实现的？

- 6、用户的自定义配置文件(`xxx.config.js`)是在哪里被解析的？是怎么被解析的？

- 7、用户的自定义配置文件中的 proxy 是怎么让开发服务器进行代理的？

- 8、纯前端的 mock 数据是怎么实现的？

我用大白话来回答下这些问题

## 1、命令行工具是怎么实现的？

声明命令不是什么黑魔法，这就是 node 的用法说明，只要在 `package.json` 里面配置上 `bin `属性就可以实现。

```json
  "bin": {
    "youngdev": "bin/youngdev.js"
  },
```
注意开头要添加脚本的解释程序，比如我们这里使用的是 node

```js
#!/usr/bin/env node
console.log('Hello YoungDev!')
```
这样，执行`npm run youngdev`的时候，就在控制台输出了**Hello YoungDev!**

我们可以借助node 命令行解决方案 `commander.js`来实现运行命令行程序时让用户输入内容并解析处理，代码在`youngdev/bin/youngdev.js`

## 2、在项目中 `npm run dev` 的时候发生了什么？

前端工程的`package.json`中的脚本命令配置如下
```json
  "scripts": {
    "build": "youngdev build",
    "dev": "youngdev dev",
  },
```
在前端工程(app)下执行`npm run dev`,实际上就是执行`youngdev dev`

在问题1中我们知道,`youngdev`中配置了`bin`,直接运行`youngdev`会执行`"bin/youngdev.js"`,这个文件中为dev参数提供了处理方法
```js
program
  .command('dev')
  .description('框架开发命令')
  .action(function () {
    const { dev } = require('../lib/dev');
    dev();
  });
```
相当于在前端工程中执行`npm run dev`，执行的是`youngdev/lib/dev.js`文件的内容
