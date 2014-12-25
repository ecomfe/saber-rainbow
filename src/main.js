/**
 * @file main
 * @autor treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var mm = require('saber-mm');
    var Emitter = require('saber-emitter');
    var bind = require('saber-lang/bind');
    var curry = require('saber-lang/curry');

    var exports = {};

    Emitter.mixin(exports);

    function enter(options, presenter) {
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
     * 加载Presenter
     *
     * @public
     * @param {Object} config
     * @param {Object=} options
     */
    exports.load = function (config, options) {
        mm.create(config).then(curry(enter, options));
    };

    return exports;

});
