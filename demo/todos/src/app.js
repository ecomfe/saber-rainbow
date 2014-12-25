/**
 * @file app
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {
    var Resolver = require('saber-promise');
    var rainbow = require('saber-rainbow');
    var dom = require('saber-dom');

    Resolver.disableExceptionCapture();


    function start(config) {
        rainbow.config({
            template: dom.g('template').innerHTML
        });

        rainbow.load(config);
    }

    return start;
});
