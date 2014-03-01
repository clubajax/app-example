define([
    'dcl/dcl',
    'common/Utilities',
    'chart/printers/CanvasPrinter',
    'chart/axes/YAxisPosition',
    'common/Rect',
    'chart/common/IndicationShape'
], function (dcl, utilities, CanvasPrinter, yAxisPosition, rect, indicationShape) {

    return dcl(null, {
        declaredClass:'YAxisIndicationRenderer',
        constructor: function($parent, settings) {

            var
                iRect = settings.rect;

            this.$parent = $parent;
            this.settings = settings;

            if(!settings.labels) {
                settings.labels = [];
            }

            this._physicalRect = rect();

            this.id = utilities.idGenerator('yaxis_indicator');

            this.printer = new CanvasPrinter($parent, {
                physicalRect: this._physicalRect,
                rect: settings.rect,
                cssText: "background-color: transparent; position:absolute;"
            });

            this._frameHeight = this.printer.measureTextHeight(settings.theme.label.font, 'Hg');

            if (this._frameHeight % 2) {
                this._frameHeight += 3;
            } else {
                this._frameHeight += 4;
            }

            this.rect = utilities.settingProperty(settings, 'rect', function() {
                this._resize();
            }.bind(this));

            this.axisPosition = utilities.settingProperty(settings, 'axisPosition');
            this.formatter = utilities.settingProperty(settings, 'formatter');
            this.labels = utilities.settingProperty(settings, 'labels');
            this.scaler = utilities.settingProperty(settings, 'scaler');

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

            var
                settings = this.settings,
                labels = settings.labels,
                printer = this.printer,
                length = labels.length,
                label, i, y, distance,
                frameHeight = this._frameHeight,
                scaler = settings.scaler,
                bottomPosition = scaler.positionLimits() || {minValue:0, maxValue:0},
                topPosition = bottomPosition.minValue,
                halfFrameHeight = frameHeight / 2,
                labelAxisDistance = settings.labelAxisDistance,
                halfLabelToAxisDistance = labelAxisDistance / 2,
                formatter = settings.formatter,
                font = settings.theme.label,
                fontColor = font.color,
                axisXPosition, frameClosestToAxisX, frameFarestToAxisX, frameTopY,
                frameBottomY, textY, textX, textXAlign,
                shapeBackgroundStyle = {
                    color: 'rgba(0,0,0,1)',
                    width: 1
                },
                shapeStyle = {
                    color: null,
                    width: 1
                };

            printer.cleanPlotArea();

            if (labels.length) {

                bottomPosition = bottomPosition.maxValue;
                font = font.font;

                if (settings.axisPosition === yAxisPosition.left) {
                    axisXPosition = settings.rect.right;
                    textX = axisXPosition - labelAxisDistance;
                    frameClosestToAxisX = axisXPosition - halfLabelToAxisDistance;
                    frameFarestToAxisX = settings.rect.left;
                    textXAlign = "end";
                } else {
                    axisXPosition = 0;
                    textX = axisXPosition + labelAxisDistance;
                    frameClosestToAxisX = axisXPosition + halfLabelToAxisDistance;
                    frameFarestToAxisX = settings.rect.right - settings.rect.left;
                    textXAlign = "start";
                }

                indicationShape.frameTipPosition.x = axisXPosition;
                indicationShape.frameTopClosestToAxisPosition.x = frameClosestToAxisX;
                indicationShape.frameTopFarestToAxisPosition.x = frameFarestToAxisX;
                indicationShape.frameBottomClosestToAxisPosition.x = frameClosestToAxisX;
                indicationShape.frameBottomFarestToAxisPosition.x = frameFarestToAxisX;

                for (i = 0; i < length; i++) {
                    label = labels[i];

                    y = Math.floor(scaler.calculate(label.value));

                    if (y >= topPosition && y <= bottomPosition) {

                        distance = bottomPosition - y;

                        if (distance < halfFrameHeight) {

                            frameBottomY = Math.floor(y - distance - 4);
                            textY = frameBottomY - halfFrameHeight;
                            frameTopY = frameBottomY - frameHeight;

                        } else {
                            distance = y - topPosition;

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

                        printer.plotShape(indicationShape.frameShape, shapeBackgroundStyle, shapeBackgroundStyle.color);

                        shapeStyle.color = label.color;

                        printer.plotShape(indicationShape.frameShape, shapeStyle, shapeStyle.color, 2);
                        printer.plotText(
                            (label.formatter || formatter)(label.value),
                            textX,
                            textY,
                            font,
                            "middle",
                            textXAlign,
                            label.fontColor || fontColor);
                    }
                }
            }
        },

        dispose: function() {
            this.rect = null;
            this.axisPosition = null;
            this.formatter = null;
            this.scaler = null;
            this.labels = null;
            this.printer.dispose();
            this.printer = null;
            this.$parent = null;
            this.settings = null;
        }
    });
});
