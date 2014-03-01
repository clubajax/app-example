define([
    'dcl/dcl',
    'common/Utilities'
], function(dcl, utilities){

    return dcl(null, {
        declaredClass:'Broker',
        constructor: function(options){
            this.map = {};
            if (options && options.plugins) {
                this._pluginStack = options.plugins;
            } else {
                this._pluginStack = [];
            }

            window.broker = this;
        },

        add: function(plugin, index){
            //console.log('add', plugin.declaredClass, '\n', plugin);
            if(index !== undefined){
                this._pluginStack.splice(index, 0, plugin);
            }else{
                this._pluginStack.push(plugin);
            }
            if(plugin.on){
                plugin.on('active', function(value){
                    this.lockPlugins(!value, plugin);
                }, this);
            }
            if(plugin.pluginName){
                this.map[plugin.pluginName] = plugin;
            }
        },

        get: function(name){
            return this.map[name];
        },

        lockPlugins: function(value, plugin){
            var i, len = this._pluginStack.length;

            for(i = 0; i < len; i++){
                if(this._pluginStack[i] !== plugin && this._pluginStack[i].lock){
                    this._pluginStack[i].lock(value);
                }
            }
        },

        setChart: function(chart){
            this.chart = chart;
        },

        onEventCallback: function (type, eventObject) {
            this._invokeGestureHandler(this._pluginStack, type, eventObject);
        },

        _invokeGestureHandler: function (plugins, eventType, eventObject) {
            var i, plugin, gesture, length = plugins.length;

            for (i = 0; i < length; i++) {

                plugin = plugins[i];
                gesture = plugin.onEventCallback;
                if (gesture && !gesture.call(plugin, eventType, eventObject)) {
                    break;
                }
            }
        }
    });
});
