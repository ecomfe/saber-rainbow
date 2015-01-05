/**
 * @file main
 * @autor treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var mm = require('saber-mm');
    var Emitter = require('saber-emitter');
    var bind = require('saber-lang/bind');
    var curry = require('saber-lang/curry');

    // 配置路由器
    var router = require('saber-router');
    router.controller(require('saber-router/controller/page'));
    mm.config({router: router});

    var exports = {};

    Emitter.mixin(exports);

    /**
     * 引导Presenter
     *
     * @inner
     * @param {Object} options
     * @param {Presenter} presenter
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

        presenter
            .enter(document.body, path, query, url, options)
            .then(success, fail);
    }

    /**
     * 配置
     *
     * @public
     * @param {Object} config
     * @param {string|Array.<string>=} config.template 通用模版
     * @param {Object=} config.templateConfig 模版引擎配置
     */
    exports.config = function (config) {
        mm.config(config);
    };

    /**
     * 启动Presenter
     *
     * @public
     * @param {Object} config
     * @param {Object=} options
     */
    exports.boot = function (config, options) {
        mm.create(config).then(curry(boot, options));
    };

    return exports;

});
