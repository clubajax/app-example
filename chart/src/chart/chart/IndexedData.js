define([
    'dcl/dcl',
    'localLib/Evented',
    'common/Utilities'
], function(dcl, Evented, utilities){

    return dcl(Evented, {
        declaredClass:'IndexedData',

        beginIndex: -2,
        endIndex: -1,
        constructor: function(engine){
            this.engine = engine;
            this.data = [];
        },

        // extrenal references (engine, renderer) are handled here
        processSerieValueLimits: function(serie, beginIdx, endIdx, limits){
            this.engine.processSerieValueLimits(serie, beginIdx, endIdx, limits);
        },
        getGroups: function(){
            return this.engine.getGroups();
        },
        getViewportSize: function(){
            return this.engine.renderer.viewPortSize;
        },
        xAxisReset: function(){
            this.engine.chart.xAxis().settings.limits = 'auto';
        },
        getViewPortSize: function(){
            return this.engine.renderer._viewPort;
        },





        getPositionByTimeStamp: function (timeStamp) {
            return utilities.searchClosestTimeStamp(this.data, { timeStamp: timeStamp });
        },

        getTimeStampByPosition: function (index) {
            return index < 0 || index >= this.data.length ? null : this.data[index].timeStamp;
        },

        getLimitCalculationData: function (currentRange, newRange) {
            // @eturn {false || true || Object}
            //    false if newRange === currentRange
            //    true if requires new Limits calculation
            //    {added : [{minValueIndex, maxValueIndex}], removed : [{minValueIndex, maxValueIndex}]} ranges added or removed
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
        

        addDataRange: function (event) {

            var
                data = event.data,
                analyzeLimits = event.analyzeLimits,
                length = data.length,
                i,
                indexedDataPoint;
            

            if (this.data.length) {
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
                    this.data.push(indexedDataPoint);
                }
            }
            if (analyzeLimits) {
                this.setIndexes(-20, -10);
                this._lastRange = null;
                this.setLimits(this.limits);
                this.render();
            }
        },

        setIndexes: function (beginIndex, endIndex) {
            this.setBeginIndex(beginIndex);
            this.setEndIndex(endIndex);
        },

        setBeginIndex: function (beginIndex) {
            this.beginIndex = beginIndex;
            if (beginIndex >= 0) {
                this.beginValue = this.data[beginIndex].timeStamp;
            } else {
                this.beginValue = null;
            }
        },

        setEndIndex: function (endIndex) {
            this.endIndex = endIndex;
            if (endIndex >= 0) {
                this.endValue = this.data[endIndex].timeStamp;
            } else {
                this.endValue = null;
            }
        },
        
        addDataPointToIndexedData: function (datapoint, isNew) {
            var
                indexedDataPoint,
                isNewIndexedData,
                indexedDataSearch;

            //setting the last datapoint
            if (!isNew) {
                indexedDataPoint = datapoint.indexedDataPoint;
                isNewIndexedData = !indexedDataPoint;
                if (isNewIndexedData) {
                    indexedDataSearch = this.addToIndexedData(datapoint);
                } else {
                    indexedDataSearch = { found: true };
                }
            } else {
                indexedDataSearch = this.addToIndexedData(datapoint);
            }
            return indexedDataSearch;
        },

        addToIndexedData: function (datapoint) {
            //add it to indexedData
            var
                indexedDataPoint,
                search = utilities.binarySearch(this.data, datapoint, utilities.timeStampedObjectComparator);

            if (!search.found) {
                indexedDataPoint = {
                    timeStamp: datapoint.timeStamp,
                    streamCount: 1
                };
                if (search.index < 0) {
                    search.index = 0;
                }
                this.data.splice(search.index, 0, indexedDataPoint);
            } else {
                indexedDataPoint = this.data[search.index];
                indexedDataPoint.streamCount++;
            }

            //while painting, quickly find the indexed point and its viewPortPixel
            datapoint.indexedDataPoint = indexedDataPoint;

            return search;
        },

        isInPaintableRange: function (dpTimeStamp, isNewIndexedData) {
            var
                endTimeStamp,
                beginTimeStamp = this.data[this.beginIndex].timeStamp,
                result = dpTimeStamp >= beginTimeStamp;

            if (result) {
                endTimeStamp = this.data[this.endIndex].timeStamp;
                result = dpTimeStamp <= endTimeStamp;
                if (!result) {
                    //at the end?
                    result = !this.data[this.endIndex + (isNewIndexedData ? 2 : 1)];
                }
            }
            return result;
        },

        getActualLimits: function () {
            if (this.data.length) {
                return {
                    minValueIndex: this.beginIndex,
                    minValue: this.data[this.beginIndex] && this.data[this.beginIndex].timeStamp,
                    maxValueIndex: this.endIndex,
                    maxValue: this.data[this.endIndex] && this.data[this.endIndex].timeStamp
                };
            }
            return null;
        },

        findFloorIndex: function (data, timeStamp) {
            // duplicated in engine
            var
                search = utilities.binarySearch(data, timeStamp, utilities.mixTimeStampComparator);
            if (!search.found) {
                if (search.index > 0) {
                    search.index--;
                }
            }
            return search.index;
        },

        compact: function (calculate) {
            // Not sure this works correctly, if at all
            // Not even sure of the intent
            // 
            var
                indexedData = this,
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

            this.emit('trigger-limit-change', {
                limits: this.getActualLimits(),
                total: this.data.length-1
            });
            //this.triggerLimitChange();
        },

        calculateNewTimeLimits: function (endTimeStamp) {
            var
                indexedData = this,
                data = indexedData.data,
                viewPortSize = this.getViewPortSize(),
                endsearchIndex,
                length = data.length;
            if (length) {

                endsearchIndex = utilities.findCeilIndex(data, endTimeStamp);

                if (endsearchIndex >= data.length) {
                    endsearchIndex = data.length - 1;
                }

                if (endsearchIndex >= viewPortSize - 1) {
                    this.setIndexes(endsearchIndex - (viewPortSize - 1), endsearchIndex);
                } else {
                    this.setBeginIndex(0);

                    //console.error('Call to _setEndIndex not found');
                    // What is this? _setEndIndex
                    //if (length > viewPortSize) {
                    //    this._setEndIndex(viewPortSize - 1);
                    //} else {
                    //    this._setEndIndex(length - 1);
                    //}
                }
            } else {
                this.setIndexes(-20, -10);
                //this.chart.xAxis().limits({})
                //this.chart.xAxis().settings.limits = {minValue:null, maxValue:null, minValueIndex:0, maxValueIndex:0};
                this.xAxisReset();

            }
        },




        addData: function (event) {

            var
                yScaleGroup = event.group,
                serie = event.serie,
                datapoint = event.item,
                data = event.data,
                index = event.index,
                found = event.found,

                indexedData = this,
                dataLength = indexedData.data.length,
                isBirdView,
                isOverflowed,
                isSpecial = !dataLength || (indexedData.limits && !!indexedData.limits.length),
                lastTimeStamp = dataLength && indexedData.data[dataLength - 1].timeStamp,
                dpTimeStamp = datapoint.timeStamp,
                maxValueIndex,
                minValueIndex,
                limits,
                minValue,
                maxValue,
                isHistoryorVisible = isSpecial || dpTimeStamp <= lastTimeStamp,
                isPast,
                addedRange,
                removedRange,
                isInPaintableRange,
                indexedDataSearch,
                isNew;

            if(!datapoint){
                console.error('addData not passed event.item');
            }
            //console.log('addData', event);

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
                    this.emit('trigger-render');
                    //this.render();

                    // this adds a new time range to the xaxis
                   // this.triggerLimitChange();
                   this.emit('trigger-limit-change', {
                        limits: this.getActualLimits(),
                        total: this.data.length-1
                    });

                } else {
                    isInPaintableRange = isSpecial || this.isInPaintableRange(datapoint.timeStamp, isNew);
                    //if it is still new and is history or visible, then we need to shift to the right
                    //TODO: optimize that only the affected stream limits are affected and the indexed data
                    if (isNew && isInPaintableRange) {
                        //scroll by one the end
                        this.setIndexes(-20, -10);
                        this.setLimits(indexedData.limits);
                        this.emit('trigger-render');
                        //this.render();
                    } else
                        //if not new and in viewport and the yScaleGroup is auto
                        if (!isNew && isInPaintableRange && yScaleGroup.isAutoScale) {
                            limits = yScaleGroup.limits();
                            if (limits) {
                                minValue = limits.minValue;
                                maxValue = limits.maxValue;
                                console.log('process limits', index, index, limits);
                                this.processSerieValueLimits(serie, index, index, limits);
                                //if the limits changed => render yScaleGroup
                                if (limits.minValue !== minValue || limits.maxValue !== maxValue) {
                                    console.log('addData.change limits', limits);
                                    yScaleGroup.limits(limits);
                                    yScaleGroup.render();
                                } else {
                                    console.log('renderIndex', index);
                                    //let's just render the value
                                    serie.renderIndex(index);
                                }
                            }
                        }
                }
            } else {

                this.setIndexes(indexedData.beginIndex + 1, indexedData.endIndex + 1);
                //fix the affected stream time limits
                console.error('indexedData serie.setTimeLimitsInRange check');
                serie.setTimeLimitsInRange(indexedData.beginValue, indexedData.endValue);

                //this.findTimeLimitsInSerieRange(serie, indexedData.beginValue, indexedData.endValue);
                //do nothing else because the other streams limits should have been kept the same
                //this.scroll();
                this.emit('trigger-scroll');
            }

            //if the index is the last in the serie
            //update indication
            if (index === data.length - 1) {
                yScaleGroup.renderIndication(serie.id);
            }

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

        //removeData: function (graphId, yScaleGroupId, serieId, removedData) {
        //    var
        //        lostIndexedDataPoints = this.removeDataRange(removedData),
        //        yScaleGroup = this.getYScaleGroupById(graphId, yScaleGroupId),
        //        serie = this.getSerieById(graphId, yScaleGroupId, serieId);
        //
        //    if (lostIndexedDataPoints) {
        //        this.compactIndexedData(true);
        //    }
        //
        //    this.setIndexes(-20, -10);
        //    serie.settings.serie.limits.time = null;
        //    this.setLimits(this.indexedData.limits);
        //
        //    yScaleGroup.renderIndication(serieId);
        //
        //    return lostIndexedDataPoints;
        //},



        setLimits: function (newLimits/*, viewPortSize, yScales*/) {
            //console.log('setLimits', newLimits);
            var
                viewPortSize = this.getViewportSize(),
                groups = this.getGroups(),
                minValueIndex = newLimits.minValueIndex,
                maxValueIndex = newLimits.maxValueIndex,
                result = null,
                isSpecial = true,
                 i, length,
                hasData = this.data.length,
                changeVisibleBars = false,
                changeRange;

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
                        maxValueIndex = this.data.length - 1;
                        minValueIndex = maxValueIndex - (viewPortSize -1 || 0);
                    } else {
                        this.limits = result || newLimits;

                        
                        length = groups.length;

                        for (i = 0; i < length; i++) {
                            groups[i].limits(null);
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
                    //console.log('not special', maxValueIndex);
                }
            } else {
                result = newLimits || 'birdview';
                if (hasData) {
                    minValueIndex = 0;
                    maxValueIndex = this.data.length - 1;
                } else {
                    this.limits = result || newLimits;
                    return result;
                }
            }

            if (minValueIndex < 0) {
                minValueIndex = 0;
            }

            if (!isSpecial && maxValueIndex === this.data.length - 1) {
                if (minValueIndex === 0) {
                    result = "birdview";
                    changeVisibleBars = true;
                    isSpecial = true;
                } else {
                    result = "auto";
                    isSpecial = true;
                }

            }

            if(minValueIndex < 0){
                minValueIndex = 0;
            }

            if(maxValueIndex >= this.data.length){
                // throws an error - fix it!

                console.error('\n\n\nFIX RANGE ERROR\n\n\n');
                console.log('maxValueIndex: ', maxValueIndex, 'this.indexedData.data.length: ', this.data.length);
                window.hscroll.totalRange({minValue:0, maxValue:this.data.length});
                maxValueIndex = this.data.length - 1;
            }


            //validates the input
            if (minValueIndex >= 0 && maxValueIndex < this.data.length) {
                //if good, issue a range changed
                changeRange = { minValueIndex: minValueIndex, maxValueIndex: maxValueIndex };
                this.emit('change-range', changeRange);

                //if is value limits
                if (!isSpecial) {
                    //update them
                    result = this.getActualLimits();
                }
            } else {
                console.error('invalid limits', minValueIndex, maxValueIndex, this.data.length);
                throw new Error('invalid limits');
            }

            this.limits = result || newLimits;

            // nobody seems to care about this original return being "results"
            return this.limits;
        }
    });
});
