define([
    'dcl/dcl',
    'common/Utilities',
    'chart/printers/CanvasPrinter',
    'chart/common/IndicationShape'
], function(dcl, utilities, CanvasPrinter, indicationShape){

    var
        lines = [{ x0: 0, y0: 0, x1: 0, y1: 0 }],
        horizontalLine = { x0: 0, y0: 0, x1: 0, y1: 0 };

    return dcl(null, {
        declaredClass:'CrosshairRenderer',
        constructor: function ($parent, settings) {
            this.$parent = $parent;
            this.settings = settings;

            this._printer = new CanvasPrinter($parent, {
                physicalRect: settings.rect,
                rect: settings.rect,
                cssText: "background-color: transparent; position:absolute;",
                zOrder: settings.zOrder + 100
            });

            this._frameHeight = this._printer.measureTextHeight(settings.theme.crosshair.indication.font, 'Hg');

            if (this._frameHeight % 2) {
                this._frameHeight += 3;
            } else {
                this._frameHeight += 4;
            }
        },

        render: function(x, y, leftAxisValue, rightAxisValue ) {
            var line = lines[0],
                settings = this.settings,
                printer = this._printer,
                rect = settings.rect,
                rightAxisWidth, leftAxisWidth, distance,
                frameTopY,
                textY,
                frameBottomY,
                labelAxisDistance = settings.labelAxisDistance,
                halfLabelToAxisDistance = labelAxisDistance / 2,
                frameHeight = this._frameHeight,
                halfFrameHeight = frameHeight / 2,
                shapeBackgroundStyle = {
                    color: 'rgba(0,0,0,1)',
                    width: 1
                };

            x = Math.floor(x) + 0.5;

            line.x0 = x;
            line.x1 = x;
            line.y0 = rect.top;
            line.y1 = rect.bottom;

            printer.cleanPlotArea();

            if (y) {

                leftAxisWidth = settings.leftAxisWidth;
                rightAxisWidth = rect.right - settings.rightAxisWidth;

                horizontalLine.x0 = rightAxisWidth;
                horizontalLine.x1 = leftAxisWidth;

                y = Math.floor(y) + 0.5;

                horizontalLine.y0 = y;
                horizontalLine.y1 = y;

                if (lines.length === 1) {
                    lines.push(horizontalLine);
                }
                
                if (leftAxisValue !== null || rightAxisValue !== null) {
                    shapeBackgroundStyle.width = settings.theme.crosshair.draw.width;

                    distance = rect.bottom - rect.top - y;

                    if (distance < halfFrameHeight) {

                        frameBottomY = Math.floor(y - distance - 4);
                        textY = frameBottomY - halfFrameHeight;
                        frameTopY = frameBottomY - frameHeight;

                    } else {
                        distance = y - rect.top;

                        if (distance < halfFrameHeight) {

                            frameTopY = Math.floor(y + distance + 4);
                            textY = frameTopY + halfFrameHeight;
                            frameBottomY = frameTopY + frameHeight;

                        } else {
                            frameTopY = Math.floor(y - halfFrameHeight);
                            textY = frameTopY + halfFrameHeight;
                            frameBottomY = Math.floor(y + halfFrameHeight);
                        }
                    }

                    indicationShape.frameTipPosition.y = y;
                    indicationShape.frameTopClosestToAxisPosition.y = frameTopY;
                    indicationShape.frameTopFarestToAxisPosition.y = frameTopY;
                    indicationShape.frameBottomClosestToAxisPosition.y = frameBottomY;
                    indicationShape.frameBottomFarestToAxisPosition.y = frameBottomY;

                    if (leftAxisValue !== null) {
                        indicationShape.frameTipPosition.x = leftAxisWidth;
                        indicationShape.frameTopClosestToAxisPosition.x = leftAxisWidth - halfLabelToAxisDistance;
                        indicationShape.frameTopFarestToAxisPosition.x = rect.left;
                        indicationShape.frameBottomClosestToAxisPosition.x = leftAxisWidth - halfLabelToAxisDistance;
                        indicationShape.frameBottomFarestToAxisPosition.x = rect.left;

                        printer.plotShape(indicationShape.frameShape, shapeBackgroundStyle, shapeBackgroundStyle.color);
                        printer.plotShape(indicationShape.frameShape, settings.theme.crosshair.draw, settings.theme.crosshair.draw.color, 2);

                        printer.plotText(
                               leftAxisValue,
                               leftAxisWidth - labelAxisDistance,
                               textY,
                               settings.theme.indication.font,
                               "middle",
                               "end",
                               settings.theme.indication.color);
                    }

                    if (rightAxisValue !== null) {
                        indicationShape.frameTipPosition.x = rightAxisWidth;
                        indicationShape.frameTopClosestToAxisPosition.x = rightAxisWidth + halfLabelToAxisDistance;
                        indicationShape.frameTopFarestToAxisPosition.x = rect.right;
                        indicationShape.frameBottomClosestToAxisPosition.x = rightAxisWidth + halfLabelToAxisDistance;
                        indicationShape.frameBottomFarestToAxisPosition.x = rect.right;

                        printer.plotShape(indicationShape.frameShape, shapeBackgroundStyle, shapeBackgroundStyle.color);
                        printer.plotShape(indicationShape.frameShape, settings.theme.crosshair.draw, settings.theme.crosshair.draw.color, 2);

                        printer.plotText(
                               rightAxisValue,
                               rightAxisWidth + labelAxisDistance,
                               textY,
                               settings.theme.crosshair.indication.font,
                               "middle",
                               "start",
                               settings.theme.crosshair.indication.fontColor);
                    }
                }


            } else {
                lines.length = 1;
            }
            printer.plotLines(lines, settings.theme.crosshair.draw, 3);

        },

        clean: function() {
            this._printer.cleanPlotArea();
        },

        dimensions: function(rect, leftAxisWidth, rightAxisWidth) {

            var settings = this.settings;

            settings.leftAxisWidth = leftAxisWidth;
            settings.rightAxisWidth = rightAxisWidth;
            settings.rect = rect;
            this._printer.changeRect();
        },

        dispose: function() {
            this._printer.dispose();

            this.$parent = null;
            this.settings = null;
            this._printer = null;
        }
    });
});

