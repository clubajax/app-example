define([
	'dcl/dcl'
], function(dcl){
    // EventTree
    //      EventTree is a typical event emitter with additional functionality
    //      of generating child EventTrees. A child event will propogate up the tree
    //      to the original tree, but will not propogate down other branches.
    //
    //      A chain can be built by using setSource. Objects up the tree will
    //      be added.
    //
    //      See EventTree-main.js in the tests for usage.
    //      
	var
        EventTree,
        _id = 0;
    function uid(str){
        str = str || 'event-';
        return str + (_id++);
    }
    function noop(){}

	EventTree = dcl(null, {

		declaredClass:'EventTree',
        eventNames:null,

		constructor: function(options){
            options = options || {};
            this.id = uid('event-tree-');
			this.listeners = {};
            this.handles = {};
            this.children = {};
            if(options.events){
                this.setEventNames(options.events);
            }
            if(options.source){
                this.setSource(options.sourceName, options.source);
            }
		},

        setEventNames: function(events){
            this.events = {};
            for(var key in events){
                if(events.hasOwnProperty(key)){
                    this.events[key] = events[key];
                    this.events[events[key]] = events[key];
                }
            }
        },

        setSource: function(name, source){
            this.sourceName = name;
            this.source = source;
            if(!name || !source){
                console.error('A name and a source must be passed');
            }
        },

		emit: function(name, event){
            if(this.events && !this.events[name]){
                console.warn('Possible incorrect event name:  emit('+name+')');
            }
			var
				key,
				listeners = this.listeners[name],
				args = Array.prototype.slice.call(arguments);

			args.shift();

            if(this.source && typeof event === 'object'){
                event[this.sourceName] = this.source;
            }
            
			if(listeners){
				for(key in listeners){
					if(listeners.hasOwnProperty(key)){
                        listeners[key].apply(null, args);
					}
				}
			}

            if(this.parent){
                this.parent.emit.apply(this.parent, arguments);
            }

		},

		removeAll: function(){
			this.listeners = {};
		},

        removeChild: function(childId){
            delete this.children[childId].tree;
            delete this.children[childId];
        },

        child: function(){
            var tree = new EventTree({events:this.events});
            tree.parent = this;
            this.children[tree.id] = {
                tree: tree
                // handle?
            };
            return tree;
        },

		on: function(name, callback, context){
            if(this.events && !this.events[name]){
                console.warn('Possible incorrect event name:  on('+name+')');
            }
            var
                handles = this.handles,
                handle,
				listeners = this.listeners,
				paused,
				id = uid('listener-');

			this.listeners[name] = this.listeners[name] || {};
			if(context){
				callback = callback.bind(context);
			}

			listeners[name][id] = callback;

			handle = {
                id: uid('handle'),
				remove: function(){
                    //console.log('     remove handle!', this.id, id);
                    this.pause();
					delete listeners[name][id];
                    delete handles[this.id];
				},
				pause: function(){
					paused = listeners[name][id];
					listeners[name][id] = noop;
				},
				resume: function(){
					listeners[name][id] = paused;
				}
			};

            handles[handle.id] = handle;

            return handle;
		},
        dispose: function(){
            var
                listeners = this.listeners,
                handles = this.handles;

            //console.log('dispose:', this.id);

            Object.keys(handles).forEach(function(key){
                handles[key].remove();
            });
            Object.keys(listeners).forEach(function(key){
                delete listeners[key];
            });

            //console.log('    et - listeners:', listeners);
            if(this.parent){
                this.parent.removeChild(this.id);
            }

            this.events = null;
        }
	});

    return EventTree;
});
