/**
 * @file view
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {
    var config = {};

    config.render = function (data) {
        var list = data.list;
        var container = this.query('#todo-list');
        container.innerHTML = this.template.render('todoList', {list: list});

        var clearBtn = this.query('#clear-completed');
        if (data.completedCount > 0) {
            clearBtn.innerHTML = this.template.render('clearButtonText', {count: data.completedCount});
            clearBtn.style.display = '';
        }
        else {
            clearBtn.style.display = 'none';
        }

        this.query('#toggle-all').checked = data.checkedCount === list.length;
        this.query('#todo-count').innerHTML = this.template.render('todoCount', {count: data.remainingCount});

        var filter = data.filter || 'all';
        this.queryAll('#filters a').forEach(function (ele) {
            var type = ele.getAttribute('data-type');
            ele.className = type === filter ? 'selected' : '';
        });
    };

    config.domEvents = {
        'keypress: #new-todo': function (ele, e) {
            if (e.keyCode === 13) {
                var value = ele.value.trim();
                this.emit('add', value);
                ele.value = '';
            }
        },
        'click: .toggle': function (ele, e) {
            this.emit('complete', ele.getAttribute('data-id'), ele.checked);
        },
        'click: #clear-completed': function () {
            this.emit('clear');
        },
        'click: #toggle-all': function (ele) {
            this.emit('completeAll', ele.checked);
        },
        'click: .destroy': function (ele) {
            this.emit('remove', ele.getAttribute('data-id'));
        }
    };

    return config;
});
