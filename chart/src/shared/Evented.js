define([
    'dcl/dcl',
    'EventEmitter',
    'localLib/on'
], function(dcl, EventEmitter, on){
    //  Evented is similar to EventEmitter with a few extra options:
    //  connecting to an event with 'on' allows for an optional context parameter:
    //      on('loaded', this.onLoad, this);
    //  Disconnecting is easier because now a handle is returned:
    //      var handle = on('loaded', this.onLoad, this);
    //      handle.remove(); // disconnected!
    //      
    return dcl(EventEmitter, {
        declaredClass:'Evented',
        on: dcl.superCall(function(sup){
            return function(eventName, callback, context){

                if(context){
                    callback = on.bind(context, callback);
                }

                sup.apply(this, arguments);

                var self = this;
                return {
                    remove: function(){
                        self.off(eventName, callback);
                    }
                };
            };
        })
    });
});
