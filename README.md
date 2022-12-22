# 什么是 young-dev

一个学习用的**react 开发框架**,基于 esbuild 和 express 实现,通过命令行运行,实现 react 工程热更新、用户自定义配置、前端 proxy 处理、约定式路由处理

源码地址: [young-dev:一个学习用的 react 开发框架](https://github.com/gezhicui/young-dev)

# 目录结构

```
├─app（示例react项目文件夹）
│  ├─mock （纯前端mock接口配置文件夹）
│  ├─src （前端页面文件夹）
│  ├─package.json （前端项目工程信息文件）
│  ├─young.config.ts （用户配置文件）
├─youngdev（youngdev开发框架文件夹）
│  ├─bin （命令行工具,解析用户输入）
│  ├─client （客户端socket,用于热更新）
│  ├─src （核心代码包）
│  │  ├─appData.ts （获取前端工程项目路径信息）
│  │  ├─build.ts （执行前端工程打包命令时的操作）
│  │  ├─config.ts （读取前端工程项目配置文件）
│  │  ├─constants.ts （配置youngdev元信息）
│  │  ├─dev.ts （主文件,启动开发服务器,引入各个核心模块进行处理）
│  │  ├─entry.ts （生成前端工程虚拟入口文件）
│  │  ├─html.ts （生成前端工程html模板文件）
│  │  ├─mock.ts （处理前端工程mock文件）
│  │  ├─routes.ts （约定式路由处理文件）
│  │  ├─server.ts （服务端socket,用于热更新）
│  │  ├─style.ts （处理样式文件）
├─.gitignore（git忽略文件）
├─package.json（工程信息文件）
├─pnpm-workspace.yaml（pnpm monorepo工程配置文件）
├─tsconfig.base.json（ts基础配置文件）
```

# 关于 young-dev

本框架是对前端工程化的一次学习和尝试,初学者能在这个极简的框架里找到以下问题的答案：

- 1、命令行工具是怎么实现的？

- 2、在项目中 `npm run dev` 的时候发生了什么？

- 3、为什么 `npm run dev` 以后,可以通过 localhost:端口号 访问到项目内容？

- 4、为什么修改文件保存后,开发框架会自动帮我们更新浏览器页面内容？

- 5、umi 中的约定式路由是怎么实现的？

- 6、用户的自定义配置文件(`xxx.config.js`)是在哪里被解析的？是怎么被解析的？

- 7、用户的自定义配置文件中的 proxy 是怎么让开发服务器进行代理的？

- 8、纯前端的 mock 数据是怎么实现的？

我用大白话来回答下这些问题

## 1、命令行工具是怎么实现的？

声明命令不是什么黑魔法,这就是 node 的用法说明,只要在 `package.json` 里面配置上 `bin `属性就可以实现。

```json
  "bin": {
    "youngdev": "bin/youngdev.js"
  },
```

注意开头要添加脚本的解释程序,比如我们这里使用的是 node

```js
#!/usr/bin/env node
console.log('Hello YoungDev!');
```

这样,执行`npm run youngdev`的时候,就在控制台输出了**Hello YoungDev!**

我们可以借助 node 命令行解决方案 `commander.js`来实现运行命令行程序时让用户输入内容并解析处理,相关代码在`youngdev/bin/youngdev.js`

## 2、在项目中 `npm run dev` 的时候发生了什么？

前端工程的`package.json`中的脚本命令配置如下

```json
  "scripts": {
    "build": "youngdev build",
    "dev": "youngdev dev",
  },
```

在前端工程(app)下执行`npm run dev`,实际上就是执行`youngdev dev`

在问题 1 中我们知道,`youngdev`中配置了`bin`,直接运行`youngdev`会执行`"bin/youngdev.js"`,这个文件中为 dev 参数提供了处理方法

```js
program
  .command('dev')
  .description('框架开发命令')
  .action(function () {
    const { dev } = require('../lib/dev');
    dev();
  });
```

相当于在前端工程中执行`npm run dev`,执行的是`youngdev/lib/dev.js`文件的内容

## 3、为什么 `npm run dev` 以后,可以通过 localhost:端口号 访问到项目内容？

在问题 2 中,我们了解到在前端工程中执行`npm run dev`,执行的是`youngdev/lib/dev.js`文件的内容,`dev.js`这个文件实际上是`youngdev/src/dev.ts`文件的打包产物,`dev.ts`是整个开发框架的主入口文件,其中的主要内容就是使用 express 启动了一个服务,服务提供的内容包括了前端构建完的项目文件,所以就可以通过 localhost:端口号访问前端项目了

## 4、为什么修改文件保存后,开发框架会自动帮我们更新浏览器页面内容？

首先我们来分析一下 webpack 的 hmr 原理。

- 1、项目页面（以下称之为客户端）下载 manifest 资源文件,你可以理解为需要加载的链接的清单列表
- 2、客户端加载文件完成之后与 webpack 的开发服务器（以下称之为服务端）,建立 Socket 通信
- 3、webpack 监听文件变化,产生增量构建,并向客户端发送构建事件
- 4、客户端接收到构建事件之后,向服务端请求 manifest 资源文件,比对文件变化,确认去要增量下载的文件
- 5、客户端加载增量构建的模块
- 6、webpack runtime 出发热更新回调,执行变更逻辑。

因为 esbuild 没有办法做增量构建,所以我们结合上面的原理,完成我们的逻辑。

- 1、项目加载完成,注入 Socket 客户端脚本

客户端 Socket 脚本源码在`youngdev/client/client.ts`,打包产物为`youngdev/lib/client/client.js`,开发脚手架提供了初始 html 根节点模板,模板内容在`youngdev/src/html.ts`,用户可以不需要在前端(这里的前端指客户端)项目中编写 html 模板,而是使用项目配置的方式来修改 html 模板中的内容,在这个 html 模板中,引入了`client.js`,使得前端项目拥有了 Socket 通信能力

- 2、与服务端建立 Socket 通信通道

想要与客户端通信,服务端也要有一套 Socket 处理,服务端 Socket 脚本在`youngdev/src/server.ts`

- 3、esbuild 监听事件变化,执行 onRebuild 事件

在开发框架主入口文件`src/dev.ts`中构建前端项目时监听了前端项目文件,当前端项目文件发生修改时执行`onRebuild`中的内容

- 4、向客户端发送 reload 事件

`onRebuild`中使用 socket 向客户端发送了一条 message,内容为'reload'

- 5、客户端执行 window.location.reload() 刷新页面

客户端的 socket 脚本中对'reload'这条 message 进行了处理,接收到时就使用` window.location.reload()`去刷新页面

## 5、umi 中的约定式路由是怎么实现的？

约定路由其实就是先找出所有的文件,然后筛选出所有的 tsx 文件,用文件名作为路由,生成路由配置信息。代码在`youngdev/src/routes.ts`

然后通过找到约定式的全局 layout ,把它当作根路由,嵌套上面生成的路由配置信息,最终返回。代码在`youngdev/src/dev.ts`中`buildMain`下使用的`generateEntry`方法

## 6、用户的自定义配置文件(`xxx.config.js`)是在哪里被解析的？是怎么被解析的？

在前端开发中,我们经常用到`vue.config.js`、`webpack.config.js`等等用户配置文件,在框架运行的整个生命周期中都可以获取到用户的自定义配置信息。

在这之前,我们需要知道`process.cwd()`的用法,它能获取到当前 Node.js 进程执行时的文件夹地址——工作目录,由于我们的框架`youngdev`的执行命令在`app/package.json`中,所以目前的工作目录就是`/app`,这样我们就可以在`youngdev/src/dev.ts`的 node 脚本中获取工作目录下的文件,这样就可以在启动开发服务器之前先通过约定好的文件名获取到用户开发配置,在框架运行的整个生命周期中就都可以使用到这些配置了

## 7、用户的自定义配置文件中的 proxy 是怎么让开发服务器进行代理的？

问题 6 中我们知道了自定义配置文件可以在开发服务器启动之前被解析到,那框架就可以获取到配置文件中的`proxy`,通过`http-proxy-middleware`这个插件就可以很轻松的在服务端新增代理路由进行接口路由代理,代码在`youngdev/src/dev.ts`中 `buildMain`方法下的处理 proxy 部分

## 8、纯前端的 mock 数据是怎么实现的？

在`app/mock/app.ts`中,用户可以在没有接口的情况下先进行纯前端数据 mock,实际上这也是通过`process.cwd()`获取工作目录下事先约定的文件,获取完然后对目标文件约定的语法进行解析,把解析完成的路由和出入参交给开发服务器来处理,这样用户在访问 mock 数据的路由时,开发服务器就可以把对应的路由下事先准备好的内容返回给用户,完成纯前端数据 mock(事实上这一切都在开发框架启动的服务器中处理)
