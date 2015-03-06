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

    var exports = {};

    Emitter.mixin(exports);

    /**
     * 全局配置项
     *
     * @type {Object}
     */
    var config = {
        // 默认启动首屏渲染
        renderFirst: true,

        // 是否开启同构模式
        isomorphic: false,

        // 数据同步的key
        syncDataKey: '__rebas__'
    };

    /**
     * 获取前后端同步的数据
     *
     * @inner
     * @param {string=} name 数据名称
     * @return {*}
     */
    function getSyncData(name) {
        var store = extend({}, window[config.syncDataKey]);
        return name ? store[name] : store;
    }

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
        // TODO
        // Parse path params
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
            presenter.ready();
            presenter.complete();
        }

        function fail(reason) {
            exports.emit('error', reason);
        }

        // 判断是否应该进行首屏渲染
        var needRender = !config.isomorphic && config.renderFirst;

        // 启动首渲染
        if (needRender) {
            presenter
                .enter(document.body, path, query, url, options)
                .then(success, fail);
        }
        else {
            // 不再渲染首屏
            presenter.set(path);
            presenter.view.set(document.body);
            if (config.isomorphic) {
                presenter.model.fill(getSyncData('model'));
            }
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
    };

    /**
     * 启动Presenter
     *
     * @public
     * @param {Object} presenter Presenter配置参数
     * @param {Object=} options 附加参数
     */
    exports.boot = function (presenter, options) {
        // 设置saber-mm
        var config4mm = getConfig4MM();
        var router = require('saber-router');
        router.controller(require('saber-router/controller/page'));
        config4mm.router = router;
        // 扩展同步的模版静态数据
        config4mm.templateData = extend({}, getSyncData('templateData'), config4mm.templateData);
        mm.config(config4mm);

        mm.create(presenter).then(curry(boot, options));
    };

    /**
     * 获取同步的数据
     *
     * @public
     * @param {name=} 数据名称
     * @return {*}
     */
    exports.getSyncData = getSyncData;

    return exports;

});
