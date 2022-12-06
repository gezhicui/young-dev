#!/usr/bin/env node

const { Command } = require('commander');

const program = new Command();

program
  .version(require('../package.json').version, '-v, -V', '输出当前框架的版本')
  .description('手写前端框架的产物框架')
  .usage('<command> [options]');

program
  .command('help')
  .alias('-h')
  .description('帮助命令')
  .action(function (name, other) {
    console.log(`
手写前端框架的产物框架 malita

支持的命令:
  version, -v,-V 输出当前框架的版本
  help,-h 输出帮助程序

Example call:
    $ malita <command> --help`);
  });

program
  .command('dev')
  .description('框架开发命令')
  .action(function () {
    require('../lib/dev');
  });

program.parse(process.argv);
