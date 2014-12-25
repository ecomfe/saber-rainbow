/**
 * @file list
 * @author treelite(c.xinle@gmail.com)
 */
define(function (require) {

    var bind = require('saber-lang/bind');

    var config = {};

    config.view = require('./todoView');

    config.model = require('./todoModel');

    config.refresh = function () {
        var view = this.view;
        this.model.fetch().then(bind(view.render, view));
    };

    config.events = {
        'view:add': function (title) {
            this.model.add(title).then(
                bind(this.refresh, this)
            );
        },

        'view:remove': function (id) {
            this.model.remove(id).then(
                bind(this.refresh, this)
            );
        },

        'view:complete': function (id, completed) {
            this.model.complete(id, completed).then(
                bind(this.refresh, this)
            );
        },

        'view:clear': function () {
            this.model.clear().then(
                bind(this.refresh, this)
            );
        },

        'view:completeAll': function (completed) {
            this.model.completeAll(completed).then(
                bind(this.refresh, this)
            );
        }
    };

    return config;
});
