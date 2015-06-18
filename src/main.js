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

    var router = require('saber-router');
    router.controller(require('saber-router/controller/page'));

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
     * 启动Presenter
     *
     * @inner
     * @param {string} path 请求路径
     * @param {Object} query 查询条件
     * @param {Object} options 跳转参数
     * @param {Function} done 路由处理完成回调
     * @param {Presenter} presenter Presenter对象
     */
    function boot(path, query, options, done, presenter) {

        function success() {
            window.addEventListener(
                'unload',
                bind(presenter.leave, presenter),
                false
            );
            presenter.ready();
            presenter.complete();
            done();
        }

        function fail(reason) {
            exports.emit('error', reason);
            done();
        }

        // 判断是否应该进行首屏渲染
        var needRender = !config.isomorphic && config.renderFirst;

        var main = config.main || document.body;
        // 启动首渲染
        if (needRender) {
            presenter
                .enter(main, path, query, options)
                .then(success, fail);
        }
        else {
            // 不再渲染首屏
            presenter.set(path);
            presenter.view.set(main);
            if (config.isomorphic) {
                presenter.model.fill(getSyncData('model'));
            }
            success();
        }
    }

    /**
     * 路由处理
     *
     * @inner
     * @param {Object|string} presenter presenter 配置信息或者配置信息加载地址
     * @param {Object} options 附加参数
     * @return {Function}
     */
    function routeTo(presenter, options) {
        return function (path, query, params, url, opts, done) {
            options = extend(opts, options);
            query = extend(params, query);
            mm.create(presenter).then(curry(boot, path, query, options, done));
        };
    }

    /**
     * 配置
     *
     * @public
     * @param {Object} options 配置项
     * @param {HTMLElement} options.main 主元素
     * @param {boolean=} options.renderFirst 是否启用首屏渲染，默认为 `true`
     * @param {boolean=} options.isomorphic 是否启用同构模式，默认为 `false`
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
     * @param {Object|string} presenter Presenter 配置信息或者配置信息的加载地址
     * @param {string|RegExp=} path 路由路径
     * @param {Object=} options 附加参数
     */
    exports.boot = function (presenter, path, options) {
        // 设置saber-mm
        var config4mm = getConfig4MM();
        config4mm.router = router;
        // 扩展同步的模版静态数据
        config4mm.templateData = extend({}, getSyncData('templateData'), config4mm.templateData);
        mm.config(config4mm);

        // 配置并启动路由器
        path = path || location.pathname;
        router.add(path, routeTo(presenter, options));

        router.start();
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
