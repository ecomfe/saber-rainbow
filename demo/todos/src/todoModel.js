/**
 * @file model
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var Resolver = require('saber-promise');

    var DEFAULT_TODOS = [
        {id: 1, title: 'hello', completed: false},
        {id: 2, title: 'world', completed: false},
        {id: 3, title: 'something', completed: true}
    ];

    var KEY_STORAGE = 'todos';

    var config = {};

    config.events = {
        init: function () {
            var todos = localStorage.getItem(KEY_STORAGE);
            if (!todos) {
                todos = DEFAULT_TODOS;
            }
            else {
                todos = JSON.parse(todos);
            }
            this.todos = todos;
        }
    };

    config.save = function () {
        localStorage.setItem(KEY_STORAGE, JSON.stringify(this.todos));
    };

    config.fetch = function (url, query) {
        var res = {};
        query = this.query = query || this.query;
        if (query && query.filter) {
            res.list = this.todos.filter(function (item) {
                return item.completed === (query.filter === 'completed');
            });
        }
        else {
            res.list = [].concat(this.todos);
        }

        res.filter = query.filter;

        res.completedCount = this.todos.filter(function (item) {
            return item.completed;
        }).length;

        res.checkedCount = res.list.filter(function (item) {
            return !item.completed;
        }).length;

        res.remainingCount = this.todos.length - res.completedCount;

        return Resolver.resolved(res);
    };

    config.add = function (title) {
        var item = {};
        item.title = title;
        item.id = Date.now();
        item.completed = false;
        this.todos.push(item);
        this.save();

        return Resolver.resolved();
    };

    config.remove = function (id) {
        var todos = this.todos;
        todos.some(function (item, index) {
            if (id == item.id) {
                todos.splice(index, 1);
            }
            return id == item.id;
        });
        this.save();

        return Resolver.resolved();
    };

    config.complete = function (id, completed) {
        this.todos.some(function (item) {
            if (item.id == id) {
                item.completed = completed;
            }
            return item.id == id;
        });
        this.save();

        return Resolver.resolved();
    };

    config.completeAll = function (completed) {
        this.todos.forEach(function (item) {
            item.completed = completed;
        });
        this.save();

        return Resolver.resolved();
    };

    config.clear = function () {
        this.todos = this.todos.filter(function (item) {
            return !item.completed;
        });
        this.save();

        return Resolver.resolved();
    };

    return config;

});
