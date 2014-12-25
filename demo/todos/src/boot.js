/**
 * @file boot
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {
    var Resolver = require('saber-promise');
    var rainbow = require('saber-rainbow');
    var dom = require('saber-dom');

    // 禁止Promise捕获异常
    // 仅适用于开发环境 便于调试
    Resolver.disableExceptionCapture();

    // 还可以在此添加对公共依赖模块的引用
    // 便于combine公共模块
    //
    // require('saber-dom');
    // ...

    function boot(config) {
        rainbow.config({
            template: dom.g('template').innerHTML
        });

        rainbow.boot(config);
    }

    return boot;
});
