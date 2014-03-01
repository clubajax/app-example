requirejs.config({
    baseUrl: '../../../',
    paths: {
        'jquery':    './lib/jquery',
        'dcl':      './src/shared/dcl-master',
        'chart':    './chart',
        'plugins':  './src/plugins',
        'common':   './src/common',
        'i18n':     './lib/i18n',
        'knockout': './lib/knockout'
    }
});

require([
    'dcl/dcl',
    'common/EventTree'
], function(dcl, EventTree) {

    var
        _id,
        tree,
        Item,
        a, ab, ac, ab1, ab2, ac1;

    _id = 0;
    function uid(str){
        str = str || 'event-';
        return str + (_id++);
    }

    Item = dcl(null, {
        constructor: function(tree, id, type){
            this.id = id;
            this.tree = tree;
            this.type = type;
            this.children = [];

            // setSource allows for the building of an object chain
            this.tree.setSource(this.type, this);
        },
        addChild: function(id, type){

            var
                tree = this.tree.child(),
                item = new Item(tree, id, type);

            this.children.push(item);

            this.handle = item.tree.on('ping', function(e){
                console.log(this.id, this.type, '- heard ping:', e);
            }, this);

            return item;
        },
        dispose: function(){
            // just disposing EventTree, not object (for test purposes)
            //
            console.log('item dispose, tree:', this.tree.id, 'handle:', this.handle.id);

            // this.handle belongs to the child tree, not this tree,
            // so it won't auto-remove
            this.handle.remove();

            this.tree.dispose();
            delete this.tree;
        },
        ping: function(){
            var event = {
                source: this
            };
            event[this.type] = this;
            this.tree.emit('ping', event);
        }
    });

    tree = new EventTree({sourceName:'master', source:window});
    tree.on('ping', function(e){
        console.log('master tree - heard ping:', e);
    }, this);

    a = new Item(tree, 'a', 'parent');
        ab = a.addChild('ab', 'child');
            ab1 = ab.addChild('ab1', 'grandchild');
            ab2 = ab.addChild('ab2', 'grandchild');
        ac = a.addChild('ac', 'child');
            ac1 = ac.addChild('ac1', 'grandchild');

    ac1.ping();
    ab2.ping();
    ab1.ping();
     ab.ping();

     console.log('\n\n****dispose tests****');
     ab2.ping();
     ab.dispose();
     ab2.ping();
});
