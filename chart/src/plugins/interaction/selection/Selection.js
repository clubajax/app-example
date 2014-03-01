define([
    'dcl/dcl',
    'localLib/Evented'
], function (dcl, Evented) {

    return dcl(Evented, {

        declaredClass:'Selection',
        pluginName:'selection',

        constructor: function(settings){
            this.settings = settings;
        },

        onEventCallback: function (eventType, eventObject) {
            if (eventType === "downGesture") {
                return this.onDownGesture(eventObject);
            }
            return true;
        },
        
        onDownGesture: function(eventObject) {

            var
                hitTest = eventObject.hitTest(),//graph && graph.hitTest(x, y),
                targetType = hitTest && hitTest.target,
                currentLayer = eventObject.chart.getSelectedSerie();

            if(currentLayer === hitTest.serie){
                // do nothing - clicked on selection
                return true;
            }

            eventObject.chart.clearSelection();

            if (targetType === 'layer' || targetType === 'hotspot') {
                hitTest.layer.isSelected(true);
            }

            return true;
        },
        
        dispose: function () {
            this.settings = null;
        }
    });
});
