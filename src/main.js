/**
 * @file main
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var mm = require('saber-mm');
    var Emitter = require('saber-emitter');
    var bind = require('saber-lang/bind');
    var curry = require('saber-lang/curry');
    var extend = require('saber-lang/extend');

    // 配置路由器
    var router = require('saber-router');
    router.controller(require('saber-router/controller/page'));
    mm.config({router: router});

    var exports = {};

    Emitter.mixin(exports);

    /**
     * 全局配置项
     *
     * @type {Object}
     */
    var config = {
        // 默认启动首屏渲染
        renderFirst: true
    };

    /**
     * 获取saber-mm需要的配置信息
     *
     * @inner
     * @return {Object}
     */
    function getConfig4MM() {
        var res = {};
        var names = [
            'template', 'templateConfig', 'templateData',
            'Presenter', 'View', 'Model'
        ];

        names.forEach(function (name) {
            if (config[name]) {
                res[name] = config[name];
            }
        });

        return res;
    }

    /**
     * 引导Presenter
     *
     * @inner
     * @param {Object} options 跳转参数
     * @param {Presenter} presenter Presenter对象
     */
    function boot(options, presenter) {
        var parseQuery = require('saber-uri/util/parse-query');
        var path = location.pathname;
        var query = parseQuery(location.search.substring(1));
        var url = path;
        if (location.search.length > 1) {
            url += location.search;
        }

        function success() {
            window.addEventListener(
                'unload',
                bind(presenter.leave, presenter),
                false
            );
            presenter.ready(true);
            presenter.complete();
        }

        function fail(reason) {
            exports.emit('error', reason);
        }

        // 启动首渲染
        if (config.renderFirst) {
            presenter
                .enter(document.body, path, query, url, options)
                .then(success, fail);
        }
        else {
            // 不再渲染首屏
            presenter.set(path);
            presenter.view.set(document.body);
            success();
        }
    }

    /**
     * 配置
     *
     * @public
     * @param {Object} options 配置项
     * @param {boolean=} options.renderFirst 是否启用首屏渲染，默认为启动
     * @param {string|Array.<string>=} options.template 通用模版
     * @param {Object=} options.templateConfig 模版引擎配置
     * @param {Object=} options.templateData 通用模版静态数据
     * @param {Function=} options.Presenter Presenter基类
     * @param {Function=} options.View View基类
     * @param {Function=} options.Model Model基类
     */
    exports.config = function (options) {
        config = extend(config, options);
        mm.config(getConfig4MM());
    };

    /**
     * 启动Presenter
     *
     * @public
     * @param {Object} config Presenter配置参数
     * @param {Object=} options 附加参数
     */
    exports.boot = function (config, options) {
        mm.create(config).then(curry(boot, options));
    };

    return exports;

});
