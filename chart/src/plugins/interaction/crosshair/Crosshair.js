define([
    'jquery',
    'dcl/dcl',
    'common/Utilities',
    'knockout'
], function($, dcl, utilities, ko){

    return dcl(null, {
        declaredClass:'Crosshair',
        pluginName:'crosshair',
        constructor: function(settings) {
            this.settings = settings || {};
            this.settings.$domElement = $(this.settings.$domElement);
            this._mousedown = false;
            this.active = ko.observable(true);
            this.active.subscribe(function(value){
                this.onEventCallback = utilities.eventDelegation(value);
            }, this);
            this.active.valueHasMutated();

            this.lock = ko.observable(false);
            this.lock.subscribe(function(value){
                this.active(value);
            }, this);
            this._currentCursor = 'default';

            if (this.settings.delay === undefined) {
                this.settings.delay = 250;
            }

        },

        onDownGesture: function (eventObject) {
            if (!this.active()) { return true; }
            if (eventObject.pointers[0].region.type === 'series') {

                if (eventObject.pointers[0].target === 'graph') {
                    this._timer =
                        setTimeout(
                            function () {

                                this._showCrosshair(eventObject);

                                if (this.settings.$domElement) {
                                    this.settings.$domElement.css('cursor', 'crosshair');
                                    this._currentCursor = 'crosshair';
                                }
                            }.bind(this),
                            this.settings.delay);
                } else {
                    this._showCrosshair(eventObject);
                }
                return false;
            } else {
                return true;
            }
        },

        _showCrosshair: function (eventObject) {
            eventObject.pointers[0].graph.showCrosshair(eventObject.pointers[0].barSlotCenter, eventObject.pointers[0].offsetY);
            this._mousedown = true;
        },

        onUpGesture: function (eventObject) {
            if (this._mousedown) {
                eventObject.chart.graphs(0).hideCrosshair();
                if (this.settings.$domElement) {
                    this.settings.$domElement.css('cursor', 'default');
                    this._currentCursor = 'default';
                }
                this._mousedown = false;
            }

            if (this._timer) {
                clearTimeout(this._timer);
                this._timer = null;
            }

            return true;
        },

        onMoveGesture: function (eventObject) {
            if (this._mousedown && eventObject.pointers[0].region && eventObject.pointers[0].region.type === 'series') {
                if (this.settings.$domElement && this._currentCursor !== 'crosshair') {
                    this.settings.$domElement.css('cursor', 'crosshair');
                    this._currentCursor = 'crosshair';
                }
                this._showCrosshair(eventObject);
                return false;
            } else {
                return true;
            }
        },

        onLeaveGesture: function (eventObject) {
            if (this.active() &&
                    ((eventObject.pointers[0].region && eventObject.pointers[0].region.type === 'series') ||
                        (eventObject.changedPointers[0].region && eventObject.changedPointers[0].region.type === 'series')
                    )
            ) {

                if (this.settings.$domElement) {
                    this.settings.$domElement.css('cursor', 'default');
                    this._currentCursor = 'default';
                }

                eventObject.pointers[0].graph.hideCrosshair();
                return false;
            } else {
                return true;
            }
        },
        
        dispose: function () {
            this.settings = null;
        }
    });
});
