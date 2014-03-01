define([
    'dcl/dcl',
    'common/Utilities',
    'chart/printers/CanvasPrinter',
    'chart/axes/YAxisPosition',
    'common/Rect'
], function(dcl, utilities, CanvasPrinter, yAxisPosition, rect){
    var
        availableDecimalFrationIncrement = [1, 5, 2, 4],
        markerLength = 4,
        freeYFractional = [
            0.00390625, // 1/256
            0.0078125, // 1/128
            0.015625, // 1/64
            0.3125, // 1/32
            0.0625, // 1/16
            0.125, // 1/8
            0.25, // 1/4
            0.5  // 1/2
        ],
        labels,
        sortAssending = function (a, b) { return a - b; },
        bands = [];

    return dcl(null, {
        declaredClass:'YAxisLabelRenderer',
        constructor: function ($parent, settings) {

            if (settings.markerLength === undefined) {
                settings.markerLength = markerLength;
            }

            this.settings = settings;
            this.$parent = $parent;

            this._physicalRect = rect();

            this._valueLimits = {
                minValue: 0.0,
                maxValue: 0.0
            };

            this._positionLimits = {
                minValue: 0,
                maxValue: 0
            };

            this.id = utilities.idGenerator('yaxis_label');

            this.labels = [];
            this.labelsSignature = null;

            this._aveCharInPx = null;

            this.printer = new CanvasPrinter($parent, {
                physicalRect: this._physicalRect,
                rect: settings.rect,
                cssText: "background-color: transparent; position:absolute;"
            });

            this._textHeight = this.printer.measureTextHeight(settings.theme.label.font, 'Hg');

            this.rect = utilities.settingProperty( settings, 'rect', function() {
                this._resize();
            }.bind(this));

            this.axisPosition = utilities.settingProperty(settings, 'axisPosition');

            this.showLabels = utilities.settingProperty(settings, 'showLabels');

            this.scaler = utilities.settingProperty(settings, 'scaler');

            this.numberFormat = utilities.settingProperty( settings, 'numberFormat', function() {
                this._aveCharInPx = null;
            }.bind(this));

            this.minMove = utilities.settingProperty(settings, 'minMove', function() {
                this.render();
            }.bind(this));

            var iRect = settings.rect;

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

        preRender: function() {
            var
                settings = this.settings,
                scaler = settings.scaler,
                idealDistanceFactor = 4,
                maxSpacingFactor = 1.1,
                numberFormat = settings.numberFormat,
                iRect = settings.rect,
                height = iRect.bottom - iRect.top,
                textHeight = this._textHeight,
                maxValue = scaler.valueLimits() && scaler.valueLimits().maxValue,
                minValue = scaler.valueLimits() && scaler.valueLimits().minValue,
                higherPricePosition = scaler.calculate(maxValue),
                idealDistance = 0,
                minMove = settings.minMove,
                minSpacingFactor = 0.66,
                midValue = (maxValue - minValue) / 2,
                lowerPricePosition = scaler.calculate(minValue),
                midPricePosition = scaler.calculate(midValue);

            this.labels.length = 0;
            this.labelsSignature = new Date().getTime();

            if (scaler.isLimits()) {


                labels = this.labels;

                while (idealDistanceFactor > 1) {
                    idealDistance = idealDistanceFactor * textHeight;

                    if (height - (maxSpacingFactor * idealDistance) > 0) {
                        break;
                    }

                    idealDistanceFactor -= 0.2;
                }

                if (idealDistanceFactor > 1) {


                    // tryin with the fraction piece of the price

                    if (!this._computeLabels(
                        minSpacingFactor * idealDistance,
                        maxSpacingFactor * idealDistance,
                        height,
                        minValue,
                        maxValue,
                        midValue,
                        this._findFractionPowers(numberFormat, minValue, maxValue),
                        this._findFractionIncrements(numberFormat, minMove),
                        scaler,
                        textHeight,
                        lowerPricePosition,
                        higherPricePosition,
                        midPricePosition)) {

                        if (!this._computeLabels(
                            minSpacingFactor * idealDistance,
                            maxSpacingFactor * idealDistance,
                            height,
                            minValue,
                            maxValue,
                            midValue,
                            this._computeIntegerPowers(Math.abs(maxValue).toString().length > Math.abs(minValue).toString().length ? Math.floor(Math.abs(maxValue)) : Math.floor(Math.abs(minValue))),
                            availableDecimalFrationIncrement,
                            scaler,
                            textHeight,
                            lowerPricePosition,
                            higherPricePosition,
                            midPricePosition
                        )) {

                            this.labels.push({ position: Math.floor(scaler.calculate(maxValue)) + 0.5, label: maxValue });
                        }
                    }
                }
            }
        },

        _computeLabels: function (minLabelSpacing, maxLabelSpacing, height, minValue, maxValue, midValue, powers, availableIncrements, yScale, textHeight, lowerPricePosition, higherPricePosition, midPricePosition) {

            var
                topMost,
                bottomMost,
                result = null,
                powersLenth = powers.length,
                availableIncrementsLength = availableIncrements.length,
                i, j, basePrice, power, minBand, midBand, maxBand,
                smallestBand, biggestBand, MIN_LABEL_SPACING, MAX_LABEL_SPACING, MAX_LABEL_DISTANCE_INCREMENT, MIN_LABEL_DISTANCE_INCREMENT,
                lastTimeMinOrMaxIncreased = true,
                labelCalc, valueCalc, valueIncrement;

            i = textHeight / 2;

            topMost = higherPricePosition > i ? higherPricePosition : i;
            bottomMost = height - i < lowerPricePosition ? height - i : lowerPricePosition;

            MIN_LABEL_SPACING = textHeight + 2;

            MIN_LABEL_DISTANCE_INCREMENT = textHeight / 3;

            MAX_LABEL_DISTANCE_INCREMENT = 0.1 * (lowerPricePosition - higherPricePosition);

            MAX_LABEL_SPACING = lowerPricePosition - higherPricePosition - MIN_LABEL_SPACING;

            while (minLabelSpacing > MIN_LABEL_SPACING && maxLabelSpacing < MAX_LABEL_SPACING) {

                for (i = 0; i < powersLenth; i++) {

                    power = Math.pow(10, powers[i] + 1);

                    basePrice = Math.ceil(maxValue / power) / (1 / power);

                    power = Math.pow(10, powers[i]);

                    for (j = 0; j < availableIncrementsLength; j++) {
                        valueIncrement = availableIncrements[j] * power;

                        minBand = lowerPricePosition - yScale.calculate(minValue + valueIncrement);
                        midBand = midPricePosition - yScale.calculate(midValue + valueIncrement);
                        maxBand = yScale.calculate(maxValue - valueIncrement) - higherPricePosition;

                        if (minBand === midBand && midBand === maxBand) {

                            smallestBand = minBand;
                            biggestBand = smallestBand;

                        } else if (!(isNaN(maxBand) || isNaN(minBand) || isNaN(midBand))) {

                            bands[0] = maxBand;
                            bands[1] = minBand;
                            bands[2] = midBand;

                            bands.sort(sortAssending);

                            smallestBand = bands[0];
                            biggestBand = bands[2];
                        } else {
                            break;
                        }

                        if (smallestBand >= minLabelSpacing && biggestBand <= maxLabelSpacing) {

                            valueCalc = basePrice - valueIncrement;

                            labelCalc = yScale.calculate(valueCalc);

                            while ((labelCalc <= topMost) && (valueCalc > minValue)) {
                                valueCalc -= valueIncrement;
                                labelCalc = yScale.calculate(valueCalc);
                            }

                            if (valueCalc > minValue) {

                                do {

                                    labels.push({ position: Math.floor(labelCalc) + 0.5, label: valueCalc });

                                    valueCalc -= valueIncrement;
                                    labelCalc = yScale.calculate(valueCalc);

                                } while (labelCalc < bottomMost);

                                return true;
                            }
                        }
                    }
                }

                if ((minLabelSpacing - MIN_LABEL_DISTANCE_INCREMENT) > MIN_LABEL_SPACING && (maxLabelSpacing + MAX_LABEL_DISTANCE_INCREMENT) < MAX_LABEL_SPACING) {
                    if (lastTimeMinOrMaxIncreased) {
                        maxLabelSpacing += MAX_LABEL_DISTANCE_INCREMENT;
                        lastTimeMinOrMaxIncreased = false;
                    } else {
                        minLabelSpacing -= MIN_LABEL_DISTANCE_INCREMENT;
                        lastTimeMinOrMaxIncreased = true;
                    }
                } else if ((maxLabelSpacing + MAX_LABEL_DISTANCE_INCREMENT) < MAX_LABEL_SPACING) {
                    maxLabelSpacing += MAX_LABEL_DISTANCE_INCREMENT;
                } else if ((minLabelSpacing - MIN_LABEL_DISTANCE_INCREMENT) > MIN_LABEL_SPACING) {
                    minLabelSpacing -= MIN_LABEL_DISTANCE_INCREMENT;
                } else {
                    break;
                }
            }

            bands.length = 0;

            return result;
        },

        _computeFractionalPowers: function (number) {

            var powers = [], yLength = number.toString().length, i;

            while (yLength) {
                powers.push(-1 * yLength--);
            }

            return powers;
        },

        _computeIntegerPowers: function (number) {

            var powers = [], yLength = number.toString().length, i;

            for (i = 0; i < yLength; i++) {
                powers.push(i);
            }

            return powers;
        },

        _findFractionPowers: function (numberFormat, minY, maxY) {

            var power;

            switch (numberFormat) {
                // automatic
                case 0:
                    var str, position,
                minYLength = (str = minY.toString()).substr((position = str.indexOf('.')), str.length - position),
                maxYLength = (str = maxY.toString()).substr((position = str.indexOf('.')), str.length - position);

                    if (minYLength < maxYLength) {
                        minYLength = maxYLength;
                    }

                    power = this._computeFractionalPowers(minYLength);

                    break;
                    // decimals
                case 1:
                    power = [];
                    break;
                case 2:
                    power = this._computeFractionalPowers(1);
                    break;
                case 3:
                    power = this._computeFractionalPowers(10);
                    break;
                case 4:
                    power = this._computeFractionalPowers(100);
                    break;
                case 5:
                    power = this._computeFractionalPowers(1000);
                    break;
                case 6:
                    power = this._computeFractionalPowers(10000);
                    break;
                    // simplestFraction
                case 7:
                    // 1/2
                case 8:
                    // 1/4
                case 9:
                    // 1/8
                case 10:
                    // 1/16
                case 11:
                    // 1/32
                case 12:
                    // 1/64
                case 13:
                    // 1/128
                case 14:
                    // 1/256
                case 15:
                    // 1/32 and 1/2
                case 17:
                    // 1/32 and 1/4
                case 18:
                    power = [-1];
                    break;
                case 23:
                    // decimals
                    power = this._computeFractionalPowers(100000);
                    break;
                default:
                    throw new Error('unsupported displayY: ' + numberFormat);
            }

            return power;

        },

        _findFractionIncrements: function (numberFormat, minMove) {

            var increments, value, i;

            switch (numberFormat) {
                // decimals, automatic
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 23:
                    increments = availableDecimalFrationIncrement;
                    break;
                    // simplestFraction
                case 7:
                    increments = [];

                    for (i = 2; i < 8; i++) {
                        if ((value = minMove * freeYFractional[i]) < 1) {
                            increments.push(10 * value);
                        }
                    }

                    break;
                    // 1/2
                case 8:
                    increments = this._computeSerieSingleFractionalIncrement(2, minMove);

                    break;
                    // 1/4
                case 9:
                    increments = this._computeSerieSingleFractionalIncrement(4, minMove);

                    break;
                    // 1/8
                case 10:
                    increments = this._computeSerieSingleFractionalIncrement(8, minMove);

                    break;
                    // 1/16
                case 11:
                    increments = this._computeSerieSingleFractionalIncrement(16, minMove);

                    break;
                    // 1/32
                case 12:
                    increments = this._computeSerieSingleFractionalIncrement(32, minMove);

                    break;
                    // 1/64
                case 13:
                    increments = this._computeSerieSingleFractionalIncrement(64, minMove);

                    break;
                    // 1/128
                case 14:
                    increments = this._computeSerieSingleFractionalIncrement(128, minMove);

                    break;
                    // 1/256
                case 15:
                    increments = this._computeSerieSingleFractionalIncrement(256, minMove);

                    break;
                    // 1/32 and 1/2
                case 17:
                    increments = this._computeSerieMultipleFractionalIncrement(32, 2, minMove);

                    break;
                    // 1/32 and 1/4
                case 18:
                    increments = this._computeSerieMultipleFractionalIncrement(32, 4, minMove);

                    break;
                default:
                    throw new Error('unsupported displayY: ' + numberFormat);
            }

            return increments;
        },

        _computeSerieSingleFractionalIncrement: function (fractionDenominator, minMove) {
            var increments = [], decimal = 1 / fractionDenominator, value, i;

            for (i = 1; i < fractionDenominator; i++) {
                if ((value = /*minMove **/ i * decimal) < 1) {
                    increments.push(/*10 **/ value);
                } else {
                    break;
                }
            }

            return increments;
        },

        _computeSerieMultipleFractionalIncrement: function (firstFractionDenominator, secondFractionDenominator, minMove) {
            var increments = [], firstDecimal = 1 / firstFractionDenominator, secondDecimal = 1 / secondFractionDenominator, value, i, j;

            for (i = 0; i < firstFractionDenominator; i++) {
                for (j = 0; j < secondFractionDenominator; j++) {
                    if ((value = /*minMove **/ ((i * firstDecimal) + (j * secondDecimal * firstDecimal))) < 1) {
                        if (value > 0) {
                            increments.push(/*10 **/ value);
                        }

                    } else {
                        break;
                    }
                }
            }

            return increments;
        },

        computeRecommendedWidth: function (text) {

            var settings = this.settings, aveCharInPx = this._aveCharInPx;

            if (!aveCharInPx) {
                aveCharInPx = Math.ceil(this.printer.meassureText(text, settings.theme.label.font) / text.length);

                this._aveCharInPx = aveCharInPx;
            }

            return (settings.showLabels ? settings.labelAxisDistance + (text.length * aveCharInPx) : settings.markerLength) + settings.labelBorderDistance;

        },

        render: function() {
            var
                settings = this.settings,
                //scaler = settings.scaler,
                x, y,
                showLabels = settings.showLabels,
                printer = this.printer,
                theme = settings.theme,
                labelFont = theme.label.font,
                labelColor = theme.label.color,
                iMarkerLength = settings.markerLength,
                tickStyle = {
                    color: theme.grid.verticalColor,
                    width: theme.grid.width
                },
                formatter = utilities.getFormatter(settings.numberFormat),
                length,
                item,
                labelAxisDistance,
                linexMin,
                linexMax,
                align;
                
            printer.cleanPlotArea();

            labels = this.labels;
            length = labels.length;

            if (settings.axisPosition === yAxisPosition.right) {
                x = linexMin = 0;
                linexMax = iMarkerLength;
                align = 'start';
                labelAxisDistance = settings.labelAxisDistance;

            } else {
                labelAxisDistance = -1 * settings.labelAxisDistance;
                linexMax = x = settings.rect.right;
                linexMin = x + (-1 * iMarkerLength);
                align = 'end';
            }

            x += labelAxisDistance;

            if (showLabels) {
                for (item = labels[0]; length; item = labels[--length]) {

                    y = item.position;

                    printer.plotText(formatter(item.label), x, y, labelFont, "middle", align, labelColor);

                    printer.plotLine(linexMin, y, linexMax, y, tickStyle);
                }
            } else {
                for (item = labels[0]; length; item = labels[--length]) {

                    y = item.position;

                    printer.plotLine(linexMin, y, linexMax, y, tickStyle);
                }
            }
        },

        dispose: function() {
            this.rect = null;
            this.axisPosition = null;
            this.numberFormat = null;
            this.scaler = null;
            this.minMove = null;
            this.printer.dispose();
            this.printer = null;
            this.settings = null;
            this.$parent = null;
        }
    });
});

//<sumary>
//  settings:{
//      axisPosition: axisPosition.right || axisPosition.left,
//      rect: @object<Rect>,
//      scaler: @object <scaler> {
//              positionLimits: {
//                  maxValue: @number
//                  minValue: @number
//              },
//              valueLimits: {
//                  maxValue: @number
//                  minValue: @number
//              },
//              calculate : function(value)
//      },
//      minMove: @number,
//      numberFormat: @number,
//      showLabels: @boolean,
//      markerLength: @number,           (px)
//      labelAxisDistance: @number,      (px)
//      labelBorderDistance: @number,    (px)
//      style: {
//          label: {
//              font: 'normal 11px AramidBook',
//              color: 'rgba(...)'
//          },
//          lines:{
//              color: 'rgba(...)',
//              width: 1
//          }
//      }
//  }
//</summary>
