define([
    'dcl/dcl',
    'common/Base',
    'common/Utilities',
    'common/Rect',
    './Section'
], function (dcl, Base, utilities, rect, Section) {

    return dcl(Base, {
        declaredClass:'SectionList',
        eventTree:null,
        scaler: null,
        rect: null,
        limits: null,
        indexedData: null,
        painterFactory: null,
        serie: null,
        theme:null,
        constructor: function(settings, node) {
            this.domNode = node;
            this.list = [];
            this.map = {};
        },

        remove: function(id){
            this.list.splice(this.getIndex(id), 1);
            console.log('REM:', this.map[id]);
            this.map[id].dispose();
            delete this.map[id];
            return true;
        },

        add: function(options){
            // options:
            // chartType,
            // dataPointDefinitions,
            // id,
            // isSelected,
            // style.lineStyle

            if(Array.isArray(options)){
                options.forEach(this.add, this);
                return null;
            }

            //var section = new Section(this.domNode, utilities.mixin(options, {
            //    eventTree: this.eventTree.child(),
            //    scaler: this.scaler,
            //    rect: this.rect,
            //    limits: this.limits,
            //    indexedData: this.indexedData,
            //    painterFactory: this.painterFactory,
            //    serie: this.serie,
            //    zOrder: this.zOrder,
            //    theme:this.theme
            //}));

            var section = new Section({
                chartType: options.chartType,
                dataPointDefinitions: options.dataPointDefinitions,
                id: options.id,
                isSelected: options.isSelected,
                style: options.style,

                eventTree: this.eventTree.child(),
                scaler: this.scaler,
                rect: this.rect,
                limits: this.limits,
                indexedData: this.indexedData,
                painterFactory: this.painterFactory,
                serie: this.serie,
                zOrder: this.zOrder,
                theme:this.theme
            }, this.domNode);


            this.map[section.id] = section;
            this.list.push(section);

            this.eventTree.emit(this.eventTree.events.addSection, section);

            return section;
        },

        isSelected: function(value){
            // for now, a serie tells all sections to
            // select or deselect
            for(var i = 0; i < this.list.length; i++){
                this.list[i].isSelected(value);
            }
        },

        dimensions: function(iRect){
            console.log('SectionList.dimensions');
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
        },
        dispose: function(){
            console.log('SectionList.dispose', this.list);
            var i;
            for(i = 0; i < this.list.length; i++){
                this.list[i].dispose();
            }
            this.list = null;
            this.map = null;
        }
    });
});
