define([
    'dcl/dcl',
    'common/Base',
    'common/Utilities',
    'common/Rect',
    './Serie'
], function (dcl, Base, utilities, rect, Serie) {

    return dcl(Base, {
        declaredClass:'SerieList',
        eventTree:null,
        scaler: null,
        rect: null,
        indexedData: null,
        painterFactory: null,
        theme:null,
        constructor: function(settings, node) {
            this.domNode = node;
            this.list = [];
            this.map = {};
            this._serieRect = rect();

            this.eventTree.on(this.eventTree.events.removeSerie, function(id){
                this.removeItem(id);
            }, this);
        },
        
        getSection: function(id){
            var i, serie;
            for(i = 0; i < this.list.length; i++){
                serie = this.list[i].sections.get(id);
                if(serie){
                    return serie;
                }
            }
            return null;
        },

        removeSection: function(id){
            // transforms from removeSerie to removeSection.... UGH
            var i, removedId, serie;
            for(i = 0; i < this.list.length; i++){
                serie = this.list[i].sections.get(id);
                if(serie){
                    removedId = this.list[i].id;
                    this.list[i].dispose();
                    this.list.splice(i, 1);
                    delete this.map[removedId];
                    return removedId;
                }
            }
            return null;
        },

        add: function(options){
            if(Array.isArray(options)){
                options.forEach(this.add, this);
                return null;
            }


            var serie = new Serie({
                eventTree: this.eventTree.child(),
                id: options.id,
                scaler: this.scaler,
                rect: this._serieRect,
                serie: options,
                indexedData: this.indexedData,
                painterFactory: this.painterFactory,
                theme:this.theme
            }, this.domNode);
            
            this.map[serie.id] = serie;
            this.list.push(serie);
            
            this.eventTree.emit(this.eventTree.events.addSerie, {serie: serie});

            return serie;
        },

        remove: function(identifier){
            var serie = this.get(identifier);
            serie.remove();
        },

        dimensions: function(iRect){
            for(var i = 0; i < this.list.length; i++){
                this.list[i].dimensions(iRect);
            }
        },
        
        resize: function(){
            for(var i = 0; i < this.list.length; i++){
                this.list[i]._resize();
            }
        },

        render: function(){
            for(var i = 0; i < this.list.length; i++){
                this.list[i].render();
            }
        }
    });
});
