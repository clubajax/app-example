define([
    'dcl/dcl',
    'knockout',
    'localLib/Evented',
    'localLib/on'
], function(dcl, ko, Evented, on){

    var Base = dcl(Evented, {
        declaredClass:'Base',
        constructor: function(options){

            if(this.preMixProperties){
                options = this.preMixProperties(options);
            }

            var
                _dispose,
                _oldDispose,
                handles = [],
                prop,
                observables = this.observables || {};

            for(prop in options){
                if(options.hasOwnProperty(prop)){

                    if(this[prop] !== undefined && observables[prop] !== undefined){
                        console.error('Property assignment conflict with observable assignment:', prop);
                    }

                    else if(this[prop] !== undefined){
                        if(this.declaredClass === 'Section' && prop === 'rect'){
                            console.log('   prop', prop, this.declaredClass);
                            continue;
                        }
                        //if(this.declaredClass === 'Serie'){
                        //    //console.log('   prop', prop, this.declaredClass);
                        //}
                        this[prop] = options[prop];
                    }

                    // initialize settings observables
                    else if(observables.hasOwnProperty(prop)){
                        this[prop] = ko.observable(options[prop] !== undefined ? options[prop] : observables[prop]);
                    }
                }
            }

            // initialize default observables
            for(prop in observables){
                if(observables.hasOwnProperty(prop) && options[prop] === undefined){
                    this[prop] = ko.observable(observables[prop]);
                }
            }

            // NOTE:
            // don't delete this.observables or its props or it removes it from future prototypes
            //delete this.observables;


            this.own = function(handle){
                handles.push(handle);
            };


            _dispose = function(){
                on.remove(handles);
                this.map = null;
                this.list = null;
            }.bind(this);

            if(this.dispose){
                _oldDispose = this.dispose;
                this.dispose = function(){
                    _oldDispose.call(this);
                    _dispose();
                };
            }else{
                this.dispose = _dispose;
            }
        },


        // methods for List classes
        getChain: function(id, chain){
            chain = chain || {};
            var
                key,
                result,
                item,
                type = this.declaredClass.replace('List', '').toLowerCase();

            for(key in this.map){
                if(this.map.hasOwnProperty(key)){
                    item = this.map[key];
                    if(key === id){
                        chain[type+'Id'] = id;
                        chain[type] = item;
                        chain.type = type;
                        return chain;
                    }
                    if(!item.list){
                        // end of chain
                        return null;
                    }
                    result = item.list.getChain(id, chain);
                    if(result){
                        result[type+'Id'] = id;
                        result[type] = item;
                        return result;
                    }
                }
            }
            return null;
        },

        getIndex: function(identifier){
            for(var i = 0; i < this.list.length; i++){
                if(this.list[i].id === identifier || this.list[i].id === identifier.id){
                    return i;
                }
            }
            return -1;
        },

        get: function(identifier){
            if(typeof identifier === 'string'){
                return this.map[identifier];
            }
            if(typeof identifier === 'number'){
                return this.list[identifier];
            }
            if(typeof identifier === 'object' && identifier.id){
                // not a very good check. Maybe use a childDeclaredClass or
                // test the indexOf declaredClass
                return identifier;
            }
            return this.list || [];
        },

        removeItem: function(identifier){
            var index, id;
            if(typeof identifier === 'string'){
                index = this.getIndex(identifier);
                id = identifier;
            }
            if(typeof identifier === 'number'){
                id = this.list[identifier].id;
                index = identifier;
            }
            if(!id || index === undefined){
                return false;
            }
            delete this.map[id];
            this.list.splice(index, 1);
            return true;
        }
    });

    return Base;
});
