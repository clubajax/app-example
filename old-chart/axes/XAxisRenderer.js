define([
    'dcl/dcl',
    'common/Utilities',
    'chart/printers/CanvasPrinter',
    'common/Rect'
], function (dcl, utilities, CanvasPrinter, rect) {

    var
        labelAction = {
            ignore: 0, del: 1, add: 2
        },
        monthFormats = {
            monthText: "MM",            //Apr
            monthNumber: "mm",          //4
            monthTextYear: "MM/'yy",    //Apr'12
            monthNumberYear: "mm/'yy"   //4'12
        },
        labelTypes = {
            year: 6,
            month: 5,
            week: 4,
            day: 3,
            hour: 2,
            minute: 1,
            second: 0
        },
        labelTypeDetails = ["ss", monthFormats.monthNumber, "hh", "dd", "dd", monthFormats.monthText, "'yy"],
        markers = [],
        months;


    return dcl(null, {
        declaredClass: 'XAxisRenderer',
        constructor: function(parent, settings){

            var self = this;

            this.parent = parent;
            this.settings = settings;

            this.id = settings.id;

            this.minimumTypeVisible = -1;
            this.minimumSubTypeVisible = -1;

            this._physicalRect = rect();

            months = settings.resourceManager.getResource('lblMonths_short_key');

            this.rect = utilities.settingProperty(settings, 'rect',
                function () {
                    self.resize();
                }
            );

            this.leftLabelsLimit = utilities.settingProperty(settings, 'leftLabelsLimit');

            this.rightLabelsLimit = utilities.settingProperty(settings, 'rightLabelsLimit');



            this.axisHeight = utilities.settingProperty(settings, 'axisHeight');

            this.showVerticalLines = utilities.settingProperty(settings, 'showVerticalLines', function () {
                self.render();
            });

            this.changeLabelsVisibility = function (labelVisibility, axisHeight) {
                settings.showLabels = labelVisibility;
                settings.axisHeight = axisHeight;
            };

            this.showLabels = function () { return settings.showLabels; };

            this.showLabels = utilities.settingProperty(settings, 'showLabels');

            this.printer =
                new CanvasPrinter(
                    parent, {
                        physicalRect: this._physicalRect,
                        rect: settings.rect,
                        zIndex: utilities.zindex('xaxis'),
                        cssText: "background-color: transparent; position:absolute;",
                        className: 'xAxis'
                    }
                );

            this.resize();

        },

        label: function(value){
            utilities.mixin(this.settings.theme.label, value);
        },
        
        dimensions: function (iRect, leftLabelsLimit, rightLabelsLimit) {
            this.settings.rightLabelsLimit = rightLabelsLimit;
            this.settings.leftLabelsLimit = leftLabelsLimit;
            this.settings.rect = iRect;
            this.resize();
        },

        computeRecommendedHeight: function (labelsVisibility) {

            var settings = this.settings;

            if (labelsVisibility === undefined) {
                labelsVisibility = settings.showLabels;
            }

            return (labelsVisibility ? settings.labelAxisDistance + this.printer.measureTextHeight(settings.theme.label.font, 'Hg') : 0) + settings.labelBorderDistance;
        },

        render: function () {

            var printer = this.printer,
                settings = this.settings,
                iRect = settings.rect,
                y = Math.floor(iRect.bottom - iRect.top - settings.axisHeight) + 0.5,
                x, length, timeAxisLabels, timeLabel,
                isShowLabels = settings.showLabels,
                isShowVerticalLines = settings.showVerticalLines,
                labelFont = null,
                labelColor = null,
                labelAxisDistance = null,
                markerLength = null,
                intradayColor = null,
                noIntradayColor = null,
                verticalLinesStyle = null,
                top = null;
            
            printer.cleanPlotArea();

            // horizontal line
            if (settings.showLabels) {
                printer.plotLine(0, y, iRect.right, y, settings.theme.axis.strokeStyle, 3);
            }

            // left line
            if (settings.leftLabelsLimit) {
                x = Math.floor(settings.leftLabelsLimit) + 0.5;
                printer.plotLine(x, iRect.top, x, y, settings.theme.axis.strokeStyle, 3);
            }

            // right line
            if (settings.rightLabelsLimit) {
                x = Math.floor(iRect.right - iRect.left - settings.rightLabelsLimit) + 0.5;
                printer.plotLine(x, iRect.top, x, y, settings.theme.axis.strokeStyle, 3);
            }

            if (isShowVerticalLines || isShowLabels) {
                if (isShowVerticalLines) {
                    intradayColor = settings.theme.grid.intradayColor;
                    verticalLinesStyle = {
                        width: settings.theme.grid.width
                    };
                    noIntradayColor = settings.theme.grid.noIntraDayColor;
                    intradayColor = settings.theme.grid.intradayColor;
                    top = iRect.top;
                }

                if (isShowLabels) {
                    labelColor = settings.theme.label;
                    labelFont = labelColor.font;
                    labelColor = labelColor.color;
                    labelAxisDistance = y + settings.labelAxisDistance;
                    markerLength = y + settings.markerLength;
                }

                timeAxisLabels = this._preRender();

                length = timeAxisLabels.length;

                for (timeLabel = timeAxisLabels[0]; length; timeLabel = timeAxisLabels[--length]) {
                    x = Math.floor(timeLabel.centerPosition) + 0.5;
                    if (isShowVerticalLines) {
                        verticalLinesStyle.color = timeLabel.type < 2 ? intradayColor : noIntradayColor;
                        printer.plotLine(x, top, x, y, verticalLinesStyle);
                    }

                    if (isShowLabels) {
                        markers.push({
                            x0: x,
                            y0: y,
                            x1: x,
                            y1: markerLength
                        });
                        printer.plotText(this.formatTimeForAxis(timeLabel.time, labelTypeDetails[timeLabel.type]), x, labelAxisDistance, labelFont, "top", "center", labelColor);
                        printer.plotLines(markers, settings.theme.axis.strokeStyle);
                    }
                }
                markers.length = 0;
            }

        },

        dispose: function () {
            this.rect = null;
            this.leftLabelsLimit = null;
            this.rightLabelsLimit = null;
            this.axisHeight = null;
            this.showVerticalLines = null;
            this.printer.dispose();
            this.printer = null;
        },

        resize: function () {

            var rect = this.parent.getBoundingClientRect(),
                physicalRect = this._physicalRect,
                printer = this.printer,
                printerSettings = this.printer.settings;

            physicalRect.left = this.settings.rect.left || 0;
            physicalRect.top = this.settings.rect.top || 0;
            physicalRect.right = rect.width;
            physicalRect.bottom = rect.height;

            this.printer.settings.rect = this.settings.rect;
            this.printer.settings.physicalRect = physicalRect;

            this.printer.changeRect();
        },

        xresize: function () {

            var rect = this.parent.getBoundingClientRect();

            this.printer.resize({
                top: this.settings.rect.top || 0,
                left: this.settings.rect.left || 0,
                width: rect.width,
                height: rect.height
            });
        },

        _getSubTypeYearValue: function (year) {
            if ((year % 10) === 0) {
                return 3;
            }
            if ((year % 5) === 0) {
                return 2;
            }
            if ((year % 2) === 0) {
                return 1;
            }
            return 0;
        },

        _getSubTypeMonthValue: function (month) {
            if ((month % 12) === 0) {
                return 4;
            }
            if ((month % 6) === 0) {
                return 3;
            }
            if ((month % 4) === 0) {
                return 2;
            }
            if ((month % 2) === 0) {
                return 1;
            }
            return 0;
        },

        _getSubTypeWeekValue: function (week) {
            if ((week % 4) === 0) {
                return 2;
            }
            if ((week % 2) === 0) {
                return 1;
            }
            return 0;
        },

        _getSubTypeDayValue: function (day) {
            if ((day % 10) === 0) {
                return 3;
            }
            if ((day % 5) === 0) {
                return 2;
            }
            if ((day % 2) === 0) {
                return 1;
            }
            return 0;
        },

        _getSubTypeHourValue: function (hour) {
            if ((hour % 12) === 0) {
                return 4;
            }
            if ((hour % 6) === 0) {
                return 3;
            }
            if ((hour % 4) === 0) {
                return 2;
            }
            if ((hour % 2) === 0) {
                return 1;
            }
            return 0;
        },

        _getSubTypeMinuteValue: function (minute) {
            if ((minute % 30) === 0) {
                return 4;
            }
            if ((minute % 15) === 0) {
                return 3;
            }
            if ((minute % 10) === 0) {
                return 2;
            }
            if ((minute % 5) === 0) {
                return 1;
            }
            return 0;
        },

        _getSubTypeSecondValue: function (second) {
            if ((second % 30) === 0) {
                return 4;
            }
            if ((second % 15) === 0) {
                return 3;
            }
            if ((second % 10) === 0) {
                return 2;
            }
            if ((second % 5) === 0) {
                return 1;
            }
            return 0;
        },

        _categorizeLabel: function (prevBarTime, curBarTime, labelDetail) {

            if (prevBarTime === undefined || curBarTime === undefined) {
                return false;
            }

            labelDetail.time = curBarTime;
            //special case for the first bar visible for now will be mark new day
            if (prevBarTime.getTime() === curBarTime.getTime()) {
                labelDetail.type = labelTypes.day;
                return true;
            }

            labelDetail.type = labelTypes.second;
            labelDetail.subtype = 0;

            if (utilities.fullYearComparator(prevBarTime, curBarTime)) { // new Year
                labelDetail.type = labelTypes.year;
                labelDetail.subtype = this._getSubTypeYearValue(curBarTime.getFullYear());
                return true;
            }

            if (utilities.monthOfYearComparator(prevBarTime, curBarTime, true)) { // New Month
                labelDetail.type = labelTypes.month;
                labelDetail.subtype = this._getSubTypeMonthValue(curBarTime.getMonth());
                return true;
            }

            if (utilities.weekOfYearComparator(prevBarTime, curBarTime, true)) { //New Week
                labelDetail.type = labelTypes.week;
                labelDetail.subtype = this._getSubTypeWeekValue(utilities.getWeek(curBarTime));
                return true;
            }

            if (utilities.dayOfMonthComparator(prevBarTime, curBarTime, true)) { //New day
                labelDetail.type = labelTypes.day;
                labelDetail.subtype = this._getSubTypeDayValue(curBarTime.getDate());
                return true;
            }

            if (utilities.hourOfDayComparator(prevBarTime, curBarTime, true)) { //New hours
                if (curBarTime.getMinutes() === 0) { // hours
                    labelDetail.type = labelTypes.hour;
                    labelDetail.subtype = this._getSubTypeHourValue(curBarTime.getHours());
                    return true;
                } else {
                    labelDetail.type = labelTypes.minute;
                    labelDetail.subtype = this._getSubTypeMinuteValue(curBarTime.getMinutes());
                    return true;
                }
            }

            if (utilities.MinuteOfHourComparator(prevBarTime, curBarTime, true)) { //New Minute
                labelDetail.type = labelTypes.minute;
                labelDetail.subtype = this._getSubTypeMinuteValue(curBarTime.getMinutes());
                return true;
            }

            if (utilities.SecondOfMinuteComparator(prevBarTime, curBarTime, true)) { //New Second
                labelDetail.type = labelTypes.second;
                labelDetail.subtype = this._getSubTypeSecondValue(curBarTime.getSeconds());
                return true;
            }
            return false;
        },

        _isItemVisible: function (type, index, tempLabels, labelGap, labelWidth, leftLabelsLimit, rightLabelsLimit) {

            //check left side
            var prev,
                pos,
                length,
                currentposition = tempLabels[index].centerPosition,
                curtype = tempLabels[index].type,
                curSubType = tempLabels[index].subtype,
                subType,
                halfLabelWidth = Math.round((labelWidth + labelGap) / 2),
                position;


            if (type !== curtype) {
                return labelAction.ignore;
            }

            if (currentposition - halfLabelWidth < leftLabelsLimit || currentposition + halfLabelWidth >= rightLabelsLimit) {
                return labelAction.del;
            }

            prev = index - 1;

            while (prev >= 0) {
                type = tempLabels[prev].type;

                position = tempLabels[prev].centerPosition + halfLabelWidth;
                subType = tempLabels[prev].subtype;

                //not overlap
                if ((currentposition - halfLabelWidth) > position) {
                    break;
                }
                //if overlap and low priority
                if (curtype < type) {
                    return labelAction.del;
                }
                //if overlap and same priority
                if (curtype === type && curSubType <= subType) {
                    return labelAction.del;
                }
                prev--;
            }

            pos = index + 1;
            length = tempLabels.length;

            while (pos < length) {

                type = tempLabels[pos].type;
                position = tempLabels[pos].centerPosition - halfLabelWidth;
                subType = tempLabels[pos].subtype;

                //not overlap
                if ((currentposition + halfLabelWidth) < position) {
                    break;
                }

                //if overlap and low priority
                if (curtype < type) {
                    return labelAction.del;
                }

                //if overlap and same priority
                if (curtype === type && curSubType <= subType) {
                    return labelAction.del;
                }

                pos++;
            }

            return labelAction.add;
        },

        _preRender: function () {
            var
                i, j,
                labelDetail = {
                    type: labelTypes.minute,
                    subtype: 1,
                    //screensize: 0,
                    centerPosition: 0,
                    time: new Date(),
                    barIndex: 0
                },
                settings = this.settings,
                labelWidth = this.printer.meassureText('XXXXX', settings.theme.label.font),
                prevDate,
                //curDate,
                tmp,
                tempLabels = [], timeAxisLabels = [],
                leftLabelsLimit = settings.leftLabelsLimit,
                rightLabelsLimit = settings.rect.right - settings.rightLabelsLimit,
                labelGap = settings.minLabelDistance,
                indexedData = settings.indexedData,
                ilabelAction, data = indexedData.data,
                endIndex = indexedData.endIndex,
                beginIndex = indexedData.beginIndex;

            if (data.length) {

                prevDate = new Date(data[beginIndex - (beginIndex ? 1 : 0)].timeStamp);

                for (i = beginIndex; i <= endIndex; i++) {
                    tmp = data[i];
                    this._categorizeLabel(prevDate, tmp.timeStamp, labelDetail);

                    tempLabels.push({
                        barIndex: i,
                        type: labelDetail.type,
                        subtype: labelDetail.subtype,
                        centerPosition: tmp.viewPortSlot.center + leftLabelsLimit,
                        time: tmp.timeStamp
                    });

                    prevDate = tmp.timeStamp;
                }

                for (i = labelTypeDetails.length - 1; i >= 0; i--) {

                    for (j = tempLabels.length - 1; j >= 0; j--) {

                        ilabelAction = this._isItemVisible(i, j, tempLabels, labelGap, labelWidth, leftLabelsLimit, rightLabelsLimit);

                        if (ilabelAction === labelAction.add) {

                            tmp = tempLabels[j];

                            timeAxisLabels.push({
                                barIndex: tmp.barIndex,
                                type: tmp.type,
                                subtype: tmp.subtype,
                                centerPosition: tmp.centerPosition,
                                time: tmp.time
                            });

                        } else if (ilabelAction === labelAction.del) {
                            tempLabels.splice(j, 1);
                        }
                    }
                }
            }

            return timeAxisLabels;
        },

        formatTimeForAxis: function (date, format) {

            switch (format) {
                case "'yy":
                    // year
                    return "\'" + date.getFullYear().toString().substr(2);
                case "mm/'yy":
                    // month
                    return (date.getMonth() + 1) + "/ \'" + date.getFullYear().toString().substr(2);
                case "MM/'yy":
                    // month
                    return months[date.getMonth()] + "/ \'" + date.getFullYear().toString().substr(2);
                case "MM":
                    // month
                    return months[date.getMonth()];
                case "#MM":
                    // month
                    return (date.getMonth() + 1);
                case "dd":
                    // week, day
                    return date.getDate();
                case "hh":
                case "mm":
                    // hours
                    return date.getHours() + ":" + utilities.formatNumberWithSpecificLength(date.getMinutes(), 2);
                case "ss":
                    return date.getHours() + date.getMinutes() + ":" + utilities.formatNumberWithSpecificLength(date.getSeconds(), 2);
                default:
                    throw new Error('unsupported format for time axis');
            }
        }
    });
});
