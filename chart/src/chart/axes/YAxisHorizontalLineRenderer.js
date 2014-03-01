define([
    'dcl/dcl',
    'common/Utilities',
    'chart/printers/CanvasPrinter',
    'common/Rect'
], function (dcl, utilities, CanvasPrinter, rect) {

    return dcl(null, {
        delcaredClass:'YAxisHorizontalLineRenderer',
        constructor: function($parent, settings){
            var
                iRect = settings.rect;
            
            this.$parent = $parent;
            this.settings = settings;

            this._physicalRect = rect();

            this.rect = utilities.settingProperty(settings, 'rect', function() {
                this._resize();
            }.bind(this));

            this.labels = function(labels, labelsSignature) {
                settings.labels = labels;
                settings.labelsSignature = labelsSignature;
            };

            this.printer = new CanvasPrinter($parent, {
                physicalRect: this._physicalRect,
                rect: settings.rect,
                cssText: "background-color: transparent; position:absolute;",
                zOrder: settings.zOrder,
                id: 'yAxisHL'
            });


            if ((iRect.right - iRect.left) || iRect.bottom - iRect.top) {
                this._resize();
            }
        },

        _resize: function() {
            this.printer.settings.rect = this.settings.rect;
            this.printer.settings.physicalRect.right = utilities.box(this.$parent).width;
            this.printer.settings.physicalRect.bottom = utilities.box(this.$parent).height;
            this.printer.changeRect();
        },

        render: function() {

            this.printer.cleanPlotArea();

            var settings = this.settings,
                lines = [],
                labels = settings.labels,
                length = labels.length,
                iRect = settings.rect,
                i,
                x1 = iRect.right - iRect.left, y;

            for (i = 0; i < length; i++) {

                y = labels[i].position;

                lines.push({
                    x0: 0,
                    y0: y,
                    x1: x1,
                    y1: y
                });
            }

            this.printer.plotLines(lines, {color:settings.theme.grid.verticalColor, width:settings.theme.grid.width});

            lines.length = 0;
        },

        dispose: function() {
            this.rect = null;
            this.printer.dispose();
            this.printer = null;
            this._physicalRect = null;
            this.settings = null;
            this.$parent = null;
        }
    });
});
