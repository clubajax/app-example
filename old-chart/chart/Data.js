define([
    'dcl/dcl',
    'common/Utilities',
    'localLib/logger'
], function(dcl, utilities, logger){

    var log = logger('DA', 1, 'Chart Data');

    return dcl(null, {
        declaredClass: 'Data',
        data: null,
        renderer:null, // set directly by Engine
        beginIndex: -2,
        endIndex: -1,
        constructor: function(engine){
            this.engine = engine;
            this.data = {
                data:[]
            };
        },

        addDataRange: function (graphId, yScaleGroupId, serieId, data, analyzeLimits) {
            log('addDataRange', this.data);
            var
                length = data.length,
                i,
                indexedDataStorage = this.data.data,
                indexedDataPoint;

            if (indexedDataStorage.length) {
                //adding to indexData
                for (i = 0; i < length; i++) {
                    this.addDataPointToIndexedData(data[i], false);
                }
            } else {
                //if no indexedData, we just add it
                //NOTE: data is supposed to be sorted
                //by timeStamp ascending
                for (i = 0; i < length; i++) {
                    indexedDataPoint = {
                        timeStamp: data[i].timeStamp,
                        streamCount: 1
                    };
                    data[i].indexedDataPoint = indexedDataPoint;
                    indexedDataStorage.push(indexedDataPoint);
                }
            }
            if (analyzeLimits) {
                this.setIndexes(-20, -10);
                this._lastRange = null;
                this.setLimits(this.data.limits);
                this.engine.render();
            }
        },

        getPositionByTimeStamp: function (timeStamp) {
            var
                data = this.data;
            return utilities.searchClosestTimeStamp(data, { timeStamp: timeStamp });
        },

        getTimeStampByPosition: function (index) {
            var
                data = this.data;
            return index < 0 || index >= data.length ? null : data[index].timeStamp;
        },
        
        getRealTimeRange: function () {
            // not used?
            // makes the view port go to real time.
            var
                numberOfBars = this.engine._chartSettings.xAxis._settings.maximumNumberOfVisibleBars,
                indexedData = this.data,
                data = indexedData.data,
                datalength = data.length,
                newRange, delta;

            if (!this.isBirdView) {
                delta = numberOfBars;
            } else {
                delta = datalength;
            }

            if (datalength < numberOfBars) {
                delta = datalength;
            }

            newRange = {
                minValueIndex: datalength - delta,
                maxValueIndex: datalength - 1
            };

            return newRange;
        },

        batchUpdateChart: function (newRange) {
            // updates the chart to a new range.
            //
            // @method batchUpdateChart
            // @newRange {Object} the new range
            // @return nothing
            this.isBirdView = this.data.endIndex - this.data.beginIndex >= this.data.data.length - 2;
            this.setLimitsInRange(newRange);
        },

        onRangeChanged: function (newRange, changeVisibleBars) {
            // reacts to a new range.
            // @method onRangeChanged
            // @newRange {Object} the new range
            // @return nothing

            var
                lastRange = this._lastRange,
                actualRange,
                minimumNumberofVisibleBars = this.minViewPortSize,
                indexedData = this.data,
                newViewPortSize,
                min = newRange.minValueIndex,
                max = newRange.maxValueIndex;

            log('onRangeChanged');

            changeVisibleBars = changeVisibleBars === undefined || changeVisibleBars;
            //try {
                //if no change compared to the last one then do nothing
                if (lastRange && lastRange.minValueIndex === min && lastRange.maxValueIndex === max) {
                    return;
                }

                this._lastRange = newRange;

                //if no change compared to the indexdata range then do nothing
                if (min === indexedData.beginIndex && max === indexedData.endIndex) {
                    return;
                }

                //if limits are less than the minimum number of bars
                if ((max - min + 1) < minimumNumberofVisibleBars) {
                    //if thre is enough bars to set the minimum
                    if (max - 1 > minimumNumberofVisibleBars) {
                        min = max - minimumNumberofVisibleBars + 1;
                    } else {
                        min = 0;
                        max = minimumNumberofVisibleBars - 1;
                    }
                }

                if (changeVisibleBars) {
                    newViewPortSize = max - min + 1;
                    if (this.renderer.viewPortSize !== newViewPortSize) {

                        this.renderer.viewPortSize = newViewPortSize;
                    }
                }

                actualRange = {
                    minValueIndex: min >= 0 ? min : 0,
                    maxValueIndex: max < indexedData.data.length - 1 ? max : indexedData.data.length - 1
                };

                this.batchUpdateChart(actualRange);

            //} catch (e) {
            //    console.error(e.stack);
            //    throw new Error(e);
            //}
        },

        /**
        * calculates limit calculation actions on range change.
        *
        * @method getLimitCalculationRanges
        * @currentRange {Object} the current range
        * @newRange {Object} the new range
        * @return {false || true || Object}
        *    false if newRange === currentRange
        *    true if requires new Limits calculation
        *    {added : [{minValueIndex, maxValueIndex}], removed : [{minValueIndex, maxValueIndex}]} ranges added or removed
        */
        getLimitCalculationData: function (currentRange, newRange) {
            var
                result = false,
                newMin = newRange.minValueIndex,
                newMax = newRange.maxValueIndex,
                currentMin = currentRange.minValueIndex,
                currentMax = currentRange.maxValueIndex, isAdding;

            if (newMin !== currentMin || newMax !== currentMax) {
                //if we are outside of range
                if (newMax < currentMin || newMin > currentMax) {
                    result = true;
                } else {
                    result = {
                        added: [],
                        removed: []
                    };
                    if (newMin !== currentMin) {
                        isAdding = newMin < currentMin;
                        if (isAdding) {
                            result.added.push({
                                minValueIndex: newMin,
                                maxValueIndex: currentMin - 1
                            });
                        } else {
                            result.removed.push({
                                minValueIndex: currentMin,
                                maxValueIndex: newMin
                            });
                        }
                    }

                    if (newMax !== currentMax) {
                        isAdding = newMax > currentMax;
                        if (isAdding) {
                            result.added.push({
                                minValueIndex: currentMax + 1,
                                maxValueIndex: newMax
                            });
                        } else {
                            result.removed.push({
                                minValueIndex: newMax,
                                maxValueIndex: currentMax
                            });
                        }
                    }
                }
            }
            return result;
        },

        removeDataRange: function (data) {
            var
                i, length = data.length,
                dataPoint, indexedDataPoint, result = false;
            for (i = 0; i < length; i++) {
                dataPoint = data[i];
                indexedDataPoint = dataPoint.indexedDataPoint;
                indexedDataPoint.streamCount--;
                result = result || indexedDataPoint.streamCount === 0;
            }
            return result;
        },

        compactIndexedData: function (calculate) {
            var
                indexedData = this.data,
                data = indexedData.data,
                endTimeStamp = data[indexedData.endIndex].timeStamp,
                i, length = data.length,
                indexedDataPoint, j = 0;

            for (i = 0; i < length; i++) {
                indexedDataPoint = data[i];
                if (indexedDataPoint.streamCount) {
                    data[j] = data[i];
                    j++;
                }
            }
            data.length = j;
            if (calculate) {
                this.calculateNewTimeLimits(endTimeStamp);
            } else {
                if (!j) {
                    this.setIndexes(-20, -10);
                }
            }

            this.triggerLimitChange();
        },

        triggerLimitChange: function () {
            // calls onLimitsChanged in app
            if (this.engine.onLimitsChanged) {
                this.engine.onLimitsChanged({
                    limits: this.getActualLimits(),
                    total: this.data.data.length-1
                });
            }
        },

        calculateNewTimeLimits: function (endTimeStamp) {
            var
                indexedData = this.data,
                data = indexedData.data,
                viewPortSize = this.engine.renderer.viewPortSize,
                endsearchIndex,
                length = data.length;

            if (length) {

                endsearchIndex = this.findCeilIndex(data, endTimeStamp);

                if (endsearchIndex >= data.length) {
                    endsearchIndex = data.length - 1;
                }

                if (endsearchIndex >= viewPortSize - 1) {
                    this.setIndexes(endsearchIndex - (viewPortSize - 1), endsearchIndex);
                } else {
                    this._setBeginIndex(0);

                    if (length > viewPortSize) {
                        this._setEndIndex(viewPortSize - 1);
                    } else {
                        this._setEndIndex(length - 1);
                    }
                }
            } else {
                this.setIndexes(-20, -10);
            }
        },

        addToIndexedData: function (indexedData, datapoint) {
            //add it to indexedData
            var
                indexedDataPoint,
                search = utilities.binarySearch(indexedData, datapoint, utilities.timeStampedObjectComparator);

            if (!search.found) {
                indexedDataPoint = {
                    timeStamp: datapoint.timeStamp,
                    streamCount: 1
                };
                if (search.index < 0) {
                    search.index = 0;
                }
                indexedData.splice(search.index, 0, indexedDataPoint);
            } else {
                indexedDataPoint = indexedData[search.index];
                indexedDataPoint.streamCount++;
            }

            //while painting, quickly find the indexed point and its viewPortPixel
            datapoint.indexedDataPoint = indexedDataPoint;

            return search;
        },

        addDataPointToIndexedData: function (datapoint, isNew) {
            var
                indexedData = this.data,
                indexedDataPoint,
                isNewIndexedData,
                indexedDataSearch;

            //setting the last datapoint
            if (!isNew) {
                indexedDataPoint = datapoint.indexedDataPoint;
                isNewIndexedData = !indexedDataPoint;
                if (isNewIndexedData) {
                    indexedDataSearch = this.addToIndexedData(indexedData.data, datapoint);
                } else {
                    indexedDataSearch = { found: true };
                }
            } else {
                indexedDataSearch = this.addToIndexedData(indexedData.data, datapoint);
            }
            return indexedDataSearch;
        },

        isInPaintableRange: function (indexedData, dpTimeStamp, isNewIndexedData) {
            var
                endTimeStamp,
                beginTimeStamp = indexedData.data[indexedData.beginIndex].timeStamp,
                result = dpTimeStamp >= beginTimeStamp;

            if (result) {
                endTimeStamp = indexedData.data[indexedData.endIndex].timeStamp;
                result = dpTimeStamp <= endTimeStamp;
                if (!result) {
                    //at the end?
                    result = !indexedData.data[indexedData.endIndex + (isNewIndexedData ? 2 : 1)];
                }
            }
            return result;
        },

        isRealTime: function (indexedData, isNewData) {
            var
                offset = isNewData ? 2 : 1;

            return !!indexedData.data[indexedData.endIndex + offset];
        },

        //updateDataValue: function (graphId, yScaleGroupId, serieId, datapoint, index) {
        //    this.addData(graphId, yScaleGroupId, serieId, datapoint, index, true);
        //},

        addData: function (graphId, yScaleGroupId, serieId, datapoint, index, found) {
            log('addData');
            var
                yScaleGroup = this.engine.getYScaleGroupById(graphId, yScaleGroupId),
                serie = this.engine.getSerieById(graphId, yScaleGroupId, serieId),
                indexedData = this.data,
                dataLength = indexedData.data.length,
                isBirdView,
                //isOverflowed,
                isSpecial = !dataLength || (indexedData.limits && !!indexedData.limits.length),
                //lastTimeStamp = dataLength && indexedData.data[dataLength - 1].timeStamp,
                dpTimeStamp = datapoint.timeStamp,
                //maxValueIndex,
                //minValueIndex,
                limits,
                minValue,
                maxValue,
                //isHistoryorVisible = isSpecial || dpTimeStamp <= lastTimeStamp,
                isPast,
                //addedRange,
                //removedRange,
                isInPaintableRange,
                indexedDataSearch,
                isNew;


            //if is in the past
            //  scroll indexedData and calculate new stream time limits for the affected stream
            //if is in the viewable area
            //  increment endIndex on Indexed Data
            //  if viewport overflow, increment beginIndex in the data
            //  calculate new limits for the yScaleGroup
            //  calculate new timeLimits for all the streams
            //if is realtime
            // same as above
            //else do nothing

            //if limits is special =>
            //  if new,
            //      we need to set Limits
            //else
            //  if new and index <=endindex
            //      we need to scroll to endindex+1-viewportsize until endindex+1
            // if not new but in paintable area
            //  if combine limits for the YScaleGroup
            //  renderIndex

            indexedDataSearch = this.addDataPointToIndexedData(datapoint, !found);
            isNew = !indexedDataSearch.found;

            isBirdView = indexedData.limits === 'birdview';
            isPast = dataLength && !isBirdView && dpTimeStamp < indexedData.data[indexedData.beginIndex].timeStamp;

            if (!isPast) {
                //if is Special and isNew, set whatever limits we are supposed to have
                if (isSpecial && isNew) {
                    //reset indexedData
                    this.setIndexes(-20, -10);
                    this.setLimits(indexedData.limits);
                    this.engine.render();
                } else {
                    isInPaintableRange = isSpecial || this.isInPaintableRange(indexedData, datapoint.timeStamp, isNew);
                    //if it is still new and is history or visible, then we need to shift to the right
                    //TODO: optimize that only the affected stream limits are affected and the indexed data
                    if (isNew && isInPaintableRange) {
                        //scroll by one the end
                        this.setIndexes(-20, -10);
                        this.setLimits(indexedData.limits);
                        this.engine.render();
                    } else
                        //if not new and in viewport and the yScaleGroup is auto
                        if (!isNew && isInPaintableRange && yScaleGroup.settings.isAutoScale) {
                            limits = yScaleGroup.limits();
                            if (limits) {
                                minValue = limits.minValue;
                                maxValue = limits.maxValue;
                                this.engine.processSerieValueLimits(serie, index, index, limits);
                                //if the limits changed => render yScaleGroup
                                if (limits.minValue !== minValue || limits.maxValue !== maxValue) {
                                    log('addData.change limits', limits);
                                    yScaleGroup.limits(limits);
                                    yScaleGroup.render();
                                } else {
                                    //let's just render the value
                                    serie.renderIndex(index);
                                }
                            }
                        }
                }
            } else {
                this.setIndexes(indexedData.beginIndex + 1, indexedData.endIndex + 1);
                //fix the affected stream time limits
                this.findTimeLimitsInSerieRange(serie, indexedData.beginValue, indexedData.endValue);
                //do nothing else because the other streams limits should have been kept the same
                this.engine.scroll();
            }

            //if the index is the last in the serie
            //update indication
            if (index === serie.settings.serie.data.length - 1) {
                yScaleGroup.renderIndication(serieId);
            }

        },

        removeData: function (graphId, yScaleGroupId, serieId, removedData) {
            var
                lostIndexedDataPoints = this.removeDataRange(removedData),
                yScaleGroup = this.engine.getYScaleGroupById(graphId, yScaleGroupId),
                serie = this.engine.getSerieById(graphId, yScaleGroupId, serieId);

            if (lostIndexedDataPoints) {
                this.compactIndexedData(true);
            }

            this.setIndexes(-20, -10);
            serie.settings.serie.limits.time = null;
            this.setLimits(this.data.limits);

            yScaleGroup.renderIndication(serieId);

            return lostIndexedDataPoints;
        },

        findGlobalLimits: function (indexedData, yScaleGroups, beginIndex, endIndex) {
            var
                beginTimeStamp = indexedData.data[beginIndex].timeStamp,
                endTimeStamp = indexedData.data[endIndex].timeStamp,
                length = yScaleGroups.length,
                yScaleGroup, i;

            for (i = 0; i < length; i++) {
                yScaleGroup = yScaleGroups[i];
                this.engine.setYScaleLimitsInRange(yScaleGroup, beginTimeStamp, endTimeStamp);
            }
        },

        removeRanges: function (indexedData, indexedDataLength, ranges, yScaleGroups) {
            var
                rangeLength = ranges.length,
                isRemoved = rangeLength,
                length = yScaleGroups.length,
                j, range, beginTimeStamp, endTimeStamp, yScaleGroup, i,
                beginIndex, endIndex;

            for (j = 0; j < rangeLength; j++) {
                range = ranges[j];
                beginIndex = range.minValueIndex >= 0 ? range.minValueIndex : 0;
                endIndex = range.maxValueIndex < indexedDataLength ? range.maxValueIndex : indexedDataLength - 1;
                beginTimeStamp = indexedData.data[beginIndex].timeStamp;
                endTimeStamp = indexedData.data[endIndex].timeStamp;
                for (i = 0; i < length; i++) {
                    yScaleGroup = yScaleGroups[i];
                    if (yScaleGroup.limits()) {
                        this.removeSeriesTimeLimits(yScaleGroup, beginTimeStamp, endTimeStamp);
                        this.checkYScaleGroupsLimitsonRemove(yScaleGroup, beginIndex, endIndex);
                    }
                }
            }
            return isRemoved;
        },

        addRanges: function (indexedData, ranges, yScaleGroups, isRemoved) {
            var
                rangeLength = ranges.length,
                length = yScaleGroups.length,
                j, range, beginTimeStamp, endTimeStamp, yScaleGroup, i,
                currentLimits;

            for (i = 0; i < length; i++) {
                yScaleGroup = yScaleGroups[i];
                currentLimits = yScaleGroup.limits();
                if (currentLimits) {
                    //if not removed range or the valuelimits have not changed
                    if (!isRemoved) {// || !yScaleGroup._dirtyValueLimits) {
                        for (j = 0; j < rangeLength; j++) {
                            range = ranges[j];

                            beginTimeStamp = indexedData.data[range.minValueIndex].timeStamp;
                            endTimeStamp = indexedData.data[range.maxValueIndex].timeStamp;

                            this.engine.setYScaleLimitsInRange(yScaleGroup, beginTimeStamp, endTimeStamp, true);
                        }

                    } else {
                        //console.log('redoing the stream limits' + beginTimeStamp.toString() + ' ' + endTimeStamp.toString());
                        //we lost our limits so let's calculate the whole range including added but not removed
                        beginTimeStamp = indexedData.data[indexedData.beginIndex].timeStamp;
                        endTimeStamp = indexedData.data[indexedData.endIndex].timeStamp;
                        //console.log('lost YScale limits => need to recalculate all limits for : ' + beginIndex + ' ' + endIndex);
                        this.engine.setYScaleLimitsInRange(yScaleGroup, beginTimeStamp, endTimeStamp);
                    }
                } else {
                    beginTimeStamp = indexedData.data[indexedData.beginIndex].timeStamp;
                    endTimeStamp = indexedData.data[indexedData.endIndex].timeStamp;
                    this.engine.setYScaleLimitsInRange(yScaleGroup, beginTimeStamp, endTimeStamp);
                }
            }
        },

        setIndexes: function (beginIndex, endIndex) {
            this._setBeginIndex(beginIndex);
            this._setEndIndex(endIndex);
            this._lastRange = null;
        },
        _setBeginIndex: function (beginIndex) {
            this.data.beginIndex = beginIndex;
            if (beginIndex >= 0) {
                this.data.beginValue = this.data.data[beginIndex].timeStamp;
            } else {
                this.data.beginValue = null;
            }
        },

        _setEndIndex: function (endIndex) {
            this.data.endIndex = endIndex;
            if (endIndex >= 0) {
                this.data.endValue = this.data.data[endIndex].timeStamp;
            } else {
                this.data.endValue = null;
            }
        },



        setLimitsInRange: function (newRange) {
            log('setLimitsInRange', newRange);
            var
                indexedData = this.data,
                currentRange = { minValueIndex: indexedData.beginIndex, maxValueIndex: indexedData.endIndex },
                calculateRange, yScaleGroups,
                yScaleGroup, length, i, findLimits, series, data,
                serie, k, serieLength,
                beginIndex, endIndex,
                beginTimeStamp, endTimeStamp, isRemoved,
                indexedDataLength = indexedData.data.length;

            yScaleGroups = this.engine.getAllYScaleGroups();
            length = yScaleGroups && yScaleGroups.length;
            if (length) {
                beginIndex = newRange.minValueIndex >= 0 ? newRange.minValueIndex : 0;
                endIndex = newRange.maxValueIndex < indexedDataLength ? newRange.maxValueIndex : indexedDataLength - 1;
                this.setIndexes(beginIndex, endIndex);
                calculateRange = this.getLimitCalculationData(currentRange, newRange);

                if (calculateRange) {
                    findLimits = calculateRange === true;
                    if (findLimits) {
                        this.findGlobalLimits(indexedData, yScaleGroups, beginIndex, endIndex);
                    } else {
                        beginTimeStamp = indexedData.data[newRange.minValueIndex] && indexedData.data[newRange.minValueIndex].timeStamp;
                        endTimeStamp = indexedData.data[newRange.maxValueIndex] && indexedData.data[newRange.maxValueIndex].timeStamp;
                        length = yScaleGroups.length;
                        for (i = 0; i < length; i++) {
                            yScaleGroup = yScaleGroups[i];
                            series = yScaleGroup.series();
                            serieLength = series.length;
                            for (k = 0; k < serieLength; k++) {
                                serie = series[k];
                                data = serie.settings.serie.data;
                                if (serie.settings.serie.limits && (!data || data[0].timeStamp > endTimeStamp || data[data.length - 1].timeStamp < beginTimeStamp)) {
                                    serie.settings.serie.limits = null;
                                }
                            }
                        }
                        isRemoved = this.removeRanges(indexedData, indexedDataLength, calculateRange.removed, yScaleGroups);
                        this.addRanges(indexedData, calculateRange.added, yScaleGroups, isRemoved);
                    }
                }
            }
        },

        getActualLimits: function () {
            //get the limits from chartEngine
            var
                result,
                indexedData = this.data,
                data = indexedData.data;

            if (data.length) {
                result = {
                    minValueIndex: indexedData.beginIndex,
                    minValue: data[indexedData.beginIndex] && data[indexedData.beginIndex].timeStamp,
                    maxValueIndex: indexedData.endIndex,
                    maxValue: data[indexedData.endIndex] && data[indexedData.endIndex].timeStamp
                };
            }
            return result;
        },

        setLimits: function (newLimits, changeVisibleBars) {
            log('setLimits', newLimits);
            var
                indexedData = this.data,
                minValueIndex = newLimits.minValueIndex,
                maxValueIndex = newLimits.maxValueIndex,
                result = null,
                isSpecial = true,
                yScales, i, length,
                hasData = indexedData.data.length;

            this.limits = newLimits;


            //find minValueIndex and maxValueIndex
            //  1. null || false || 'birdview' => minValueIndex = 0, maxValueIndex = indexedData.data.length -1 [goto 3]
            //  2. 'auto' => minValueIndex = indexedData.data.length - 1 - viewPortSize, maxValueIndex = indexedData.data.length - 1 [goto 3]
            //  3. {minValueIndex, maxValueIndex} => values should be a valid range
            //  4. {minValue, maxValueIndex} => minValueIndex = findFloorIndex(minValue), maxValueIndex [goto 3]
            //  5. {minValueIndex, maxValue} => minValueIndex, maxValueIndex = findCeilIndex(minValue) [goto 3]
            //  6. {minValue, maxValue} minValueIndex = findFloorIndex(minValue), maxValueIndex = findCeilIndex(minValue) [goto 3]
            //  7. {minValueIndex, minValue, maxValueIndex, maxValue} minValueIndex, maxValueIndex [goto 3]
            if (newLimits && newLimits !== 'birdview') {
                if (newLimits === 'auto') {
                    result = newLimits;
                    if (hasData) {
                        maxValueIndex = this.data.data.length - 1;
                        minValueIndex = maxValueIndex - (this.renderer.viewPortSize -1 || 0);
                    } else {
                        indexedData.limits = result || newLimits;

                        yScales = this.engine.getAllYScaleGroups();
                        length = yScales.length;

                        for (i = 0; i < length; i++) {
                            yScales[i].limits(null);
                        }
                        return result;
                    }
                } else {
                    isSpecial = false;
                    if (!newLimits.minValueIndex) {
                        minValueIndex = this.findFloorIndex(newLimits.minValue);
                    }

                    if (!newLimits.maxValueIndex) {
                        maxValueIndex = this.findCeilIndex(newLimits.maxValue);
                    }
                }
            } else {
                result = newLimits || 'birdview';
                if (hasData) {
                    minValueIndex = 0;
                    maxValueIndex = this.data.data.length - 1;
                } else {
                    indexedData.limits = result || newLimits;
                    return result;
                }
            }

            if (minValueIndex < 0) {
                minValueIndex = 0;
            }

            if (!isSpecial && indexedData && maxValueIndex === indexedData.data.length - 1) {
                if (minValueIndex === 0) {
                    result = "birdview";
                    changeVisibleBars = true;
                    isSpecial = true;
                } else {
                    result = "auto";
                    isSpecial = true;
                }
            }

            log('    ', 'minValueIndex: ', minValueIndex, 'maxValueIndex: ', maxValueIndex, 'this.data.data.length: ', this.data.data.length);
            //if(!this.testLimits){
            //    this.testLimits = 1;
            //    var o = {
            //        maxValueIndex:maxValueIndex,
            //        minValueIndex: minValueIndex - 200
            //    };
            //    this.renderer.xAxis.setLimits(o);
            //    return this.setLimits(o);
            //}

            if(minValueIndex < 0){
                minValueIndex = 0;
            }

            if(maxValueIndex >= this.data.data.length){
                // throws an error - fix it!

                console.error('\n\n\nnFIX RANGE ERROR\n\n\n');
                window.hscroll.totalRange({minValue:0, maxValue:this.data.data.length});
                maxValueIndex = this.data.data.length - 1;
            }


            //validates the input
            if (minValueIndex >= 0 && maxValueIndex < this.data.data.length) {
                //if good, issue a range changed
                this.onRangeChanged({ minValueIndex: minValueIndex, maxValueIndex: maxValueIndex }, changeVisibleBars);
                //if is value limits
                if (!isSpecial) {
                    //update them
                    result = this.getActualLimits();
                }
            } else {
                console.error('invalid limits', minValueIndex, maxValueIndex, this.data.data.length);
                throw new Error('invalid limits');
            }

            indexedData.limits = result || newLimits;
            return result;
        }
    });
});
