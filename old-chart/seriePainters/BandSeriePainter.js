define(
    [
        'chart/seriePainters/GradientSeriePainter'
    ], function (GradientSeriePainter) {

    //<summary>

    //    settings: {
    //      printer @painterInstance,
    //      scaler:  @function(value) : @value,
    //      isSelected: @boolean,
    //      indexData: @array,
    //      serie: @object,
    //      valueIndexes : @array
    //      rect: @object
    //      style:@object
    //    }

    //<summary>
    function BandStreamPainter(settings) {

        GradientSeriePainter.call(this, settings);

        this._strokeStyle = {
            colors: []
        };
    }

    BandStreamPainter.prototype = $.extend(
        true,
        new GradientSeriePainter(), {
            _buildStyle: function () {

                _i2Tmp = this.settings.theme.draw;

                _i4Tmp = this._strokeStyle;

                _i4Tmp.width = _i2Tmp.width;

                _i0Tmp = _i2Tmp.colors;

                _i4Tmp = _i4Tmp.colors;

                if (_i4Tmp.length) {
                    _i4Tmp[0] = 'rgba(' + _i0Tmp[0] + ',1)';
                    _i4Tmp[1] = 'rgba(' + _i0Tmp[1] + ',1)';
                } else {
                    _i4Tmp.push(
                        'rgba(' + _i0Tmp[0] + ',1)',
                        'rgba(' + _i0Tmp[1] + ',1)'
                    );
                }

                _i4Tmp = this._gradient;
                _i3Tmp = _i2Tmp.gradient;

                if (_i4Tmp.length) {
                    _i5Tmp = _i4Tmp[0];

                    _i5Tmp.color = 'rgba(' + _i0Tmp[0] + ',' + _i3Tmp[0].alpha + ')';
                    _i5Tmp.offset = _i3Tmp[0].offset;

                    _i5Tmp = _i4Tmp[1];

                    _i5Tmp.color = 'rgba(' + _i0Tmp[1] + ',' + _i3Tmp[1].alpha + ')';
                    _i5Tmp.offset = _i3Tmp[1].offset;

                } else {
                    _i4Tmp.push({
                        color: 'rgba(' + _i0Tmp[0] + ',' + _i3Tmp[0].alpha + ')',
                        offset: _i3Tmp[0].offset
                    }, {
                        color: 'rgba(' + _i0Tmp[1] + ',' + _i3Tmp[1].alpha + ')',
                        offset: _i3Tmp[1].offset
                    });
                }
            },

            _render: function () {

                _settings = this.settings;

                _i5Tmp = _settings.serie.data;
                _valueIndexOne = _settings.valueIndexes[0];
                _valueIndexTwo = _settings.valueIndexes[1];

                _scaler = _settings.scaler.calculate;
                _printer = _settings.printer;
                _strokeStyle = this._strokeStyle;
                _selectionMarkers = this.selectionMarkers;
                
                _i3Tmp = _settings.serie.limits.time;

                _i4Tmp = _i3Tmp.minValueIndex;
                _i3Tmp = _i3Tmp.maxValueIndex;

                if (_i4Tmp === _i3Tmp) {

                    _i2Tmp = _i5Tmp[_i3Tmp];

                    _i4Tmp = _i2Tmp.indexedDataPoint.viewPortSlot;

                    if (_i4Tmp) {

                        _i2Tmp = _i2Tmp.values;

                        _yMax = Math.floor(_scaler(_i2Tmp[_valueIndexOne].value));
                        _i0Tmp = _yMax + 0.5;

                        _i3Tmp = _i4Tmp.left;
                        _i4Tmp = _i4Tmp.right;

                        _shapeOne.push({
                            x: _i3Tmp,
                            y: _i0Tmp
                        }, {
                            x: _i4Tmp,
                            y: _i0Tmp
                        });

                        _yMin = Math.floor(_scaler(_i2Tmp[_valueIndexTwo].value));

                        _i1Tmp = _yMin + 0.5;

                        _shapeTwo.push({
                            x: _i3Tmp,
                            y: _i1Tmp
                        }, {
                            x: _i4Tmp,
                            y: _i1Tmp
                        });

                    }

                } else {

                    _i0Tmp = _settings.style;
                    _isSelected = _settings.isSelected;

                    if (_isSelected) {

                        _lastMarkerIndex = 0;

                        _i0Tmp = _i0Tmp.selection.squareSide;
                        _i1Tmp = _i5Tmp[_i4Tmp].indexedDataPoint.viewPortSlot;

                        _selectionMarkerDistance = this.calculateSelectionDistance(_i0Tmp, _i1Tmp.right - _i1Tmp.left);
                        _halfSelectionMarker = _i0Tmp / 2;
                    }

                    if (_i4Tmp > 0) {
                        _i2Tmp = _i5Tmp[_i4Tmp - 1];

                        _i0Tmp = _i2Tmp.indexedDataPoint.viewPortSlot;

                        if (_i0Tmp) {
                            _i0Tmp = _i0Tmp.center;
                        } else {
                            _i0Tmp = (3 * _i5Tmp[_i4Tmp].indexedDataPoint.viewPortSlot.center - _i5Tmp[_i4Tmp + 1].indexedDataPoint.viewPortSlot.center) / 2;
                        }

                    } else {
                        _i2Tmp = _i5Tmp[0];

                        _i0Tmp = _i2Tmp.indexedDataPoint.viewPortSlot.center;

                        _i4Tmp++;
                        _lastMarkerIndex++;
                    }

                    _i0Tmp = Math.floor(_i0Tmp);

                    _yMax = Math.floor(_scaler(_i2Tmp.values[_valueIndexOne].value));

                    _shapeOne.push({
                        x: _i0Tmp,
                        y: _yMax
                    });

                    _yMin = Math.floor(_scaler(_i2Tmp.values[_valueIndexTwo].value));

                    _shapeTwo.push({
                        x: _i0Tmp,
                        y: _yMin
                    });

                    for (_i1Tmp = _i4Tmp; _i1Tmp <= _i3Tmp; _i1Tmp++) {

                        _i2Tmp = _i5Tmp[_i1Tmp];

                        _i0Tmp = Math.floor(_i2Tmp.indexedDataPoint.viewPortSlot.center);

                        _i2Tmp = _i2Tmp.values;

                        _i4Tmp = Math.floor(_scaler(_i2Tmp[_valueIndexTwo].value));

                        if (_yMin > _i4Tmp) {
                            _yMin = _i4Tmp;
                        }

                        _i2Tmp = Math.floor(_scaler(_i2Tmp[_valueIndexOne].value));

                        if (_yMax < _i2Tmp) {
                            _yMax = _i2Tmp;
                        }

                        _shapeOne.push({
                            x: _i0Tmp,
                            y: _i2Tmp
                        });

                        _shapeTwo.push({
                            x: _i0Tmp,
                            y: _i4Tmp
                        });

                        if (_isSelected) {
                            if (_lastMarkerIndex === _selectionMarkerDistance && (_i3Tmp - _i1Tmp) > _selectionMarkerDistance) {

                                _i0Tmp -= _halfSelectionMarker;

                                _selectionMarkers.push({
                                    x: Math.floor(_i0Tmp) + 0.5,
                                    y: Math.floor(_i2Tmp - _halfSelectionMarker) + 0.5
                                });

                                if (_i4Tmp - _i2Tmp > 4 * _halfSelectionMarker) {
                                    _selectionMarkers.push({
                                        x: Math.floor(_i0Tmp) + 0.5,
                                        y: Math.floor(_i4Tmp - _halfSelectionMarker) + 0.5
                                    });
                                }

                                _lastMarkerIndex = 0;
                            } else {
                                _lastMarkerIndex++;
                            }
                        }
                    }

                    if (_i3Tmp < _i5Tmp.length - 1) {

                        _i2Tmp = _i5Tmp[_i3Tmp + 1];

                        _i0Tmp = _i2Tmp.indexedDataPoint.viewPortSlot;

                        if (_i0Tmp) {
                            _i0Tmp = _i0Tmp.center;
                        } else {
                            _i0Tmp = (3 * _i5Tmp[_i3Tmp].indexedDataPoint.viewPortSlot.center - _i5Tmp[_i3Tmp - 1].indexedDataPoint.viewPortSlot.center) / 2;
                        }

                        _i0Tmp = Math.floor(_i0Tmp);
                        _i2Tmp = _i2Tmp.values;

                        _i1Tmp = Math.floor(_scaler(_i2Tmp[_valueIndexOne].value));

                        if (_yMax < _i1Tmp) {
                            _yMax = _i1Tmp;
                        }

                        _shapeOne.push({
                            x: _i0Tmp,
                            y: _i1Tmp
                        });

                        _i1Tmp = Math.floor(_scaler(_i2Tmp[_valueIndexTwo].value));

                        if (_yMin > _i1Tmp) {
                            _yMin = _i1Tmp;
                        }

                        _shapeTwo.push({
                            x: _i0Tmp,
                            y: _i1Tmp
                        });
                    }


                }

                _strokeStyle.color = _strokeStyle.colors[0];

                _printer.plotOpenShape(_shapeOne, _strokeStyle, 3);

                _strokeStyle.color = _strokeStyle.colors[1];

                _printer.plotOpenShape(_shapeTwo, _strokeStyle, 3);

                _shapeTwo.splice(0, 0, _shapeOne[0]);

                _shapeTwo.reverse();

                _gradient = _printer.createLinearGradient(0, _yMin, 0, _yMax, this._gradient);

                _printer.plotShape(
                    _shapeOne.concat(_shapeTwo),
                    _strokeStyle,
                    _gradient,
                    1);

                if (_selectionMarkers.length) {
                    this.renderSelection(_selectionMarkers);

                    _selectionMarkers.length = 0;
                }

                _shapeOne.length = 0;
                _shapeTwo.length = 0;

                return null; // no hotspots
            },

            preRender: function (dataIndex, valueKey) {

                _i4Tmp = this.settings;
                
                _i1Tmp = _i4Tmp.serie.limits;
                _i2Tmp = _i1Tmp.minValue;
                _i3Tmp = _i2Tmp + ((_i1Tmp.maxValue - _i2Tmp) / 2);

                _i0Tmp = _i4Tmp.serie.data[dataIndex].values[valueKey].value;

                _i2Tmp = _i4Tmp.style.draw;

                return {
                    color: _i0Tmp > _i3Tmp ? _i2Tmp.colors[0] : _i2Tmp.colors[1],
                    width: _i2Tmp.width,
                    value: _i0Tmp
                };
            },

            dispose: function () {
                GradientSeriePainter.prototype.dispose.call(this);
            }
        });

    var _settings,
        _valueIndexOne,
        _valueIndexTwo,
        _gradient,
        _printer,
        _strokeStyle,
        _shapeOne = [],
        _shapeTwo = [],
        _isSelected,
        _lastMarkerIndex,
        _selectionMarkerDistance,
        _halfSelectionMarker,
        _selectionMarkers,
        _yMax,
        _yMin,
        _i0Tmp,
        _i1Tmp,
        _i2Tmp,
        _i3Tmp,
        _i4Tmp,
        _i5Tmp,
        _scaler;

    return BandStreamPainter;
});