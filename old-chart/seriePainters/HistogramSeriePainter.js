
define(
    [
        'chart/seriePainters/SingleSlotSeriePainter'
    ], function (SingleSlotSeriePainter) {

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
    function HistogramStreamPainter(settings) {
        SingleSlotSeriePainter.call(this, settings);
    }

    HistogramStreamPainter.prototype = $.extend(
            true,
            new SingleSlotSeriePainter(),
            {
                _render: function () {

                    _settings = this.settings;

                    _i0Tmp = _settings.serie.limits.time;

                    _xMinLimit = _i0Tmp.minValueIndex;
                    _xMaxLimit = _i0Tmp.maxValueIndex;

                    _printer = _settings.printer;
                    _datas = _settings.serie.data;
                    _valueIndex = _settings.valueIndexes[0];
                    _scaler = _settings.scaler; //.calculate;

                    _i2Tmp = _settings.style;
                    _strokeStyle.width = _i2Tmp.draw.width;

                    _isSelected = _settings.isSelected;
                    _drawColor = _i2Tmp.draw.color;

                    _opacity = _i2Tmp.draw.opacity;

                    _opacity = _opacity || 1;

                    _i0Tmp = _datas[_xMinLimit];

                    _i1Tmp = _i0Tmp.indexedDataPoint.viewPortSlot;

                    _i1Tmp = _i1Tmp.right - _i1Tmp.left;

                    _isSubPixel = _i1Tmp < 2;

                    if (_isSelected) {

                        _lastMarkerIndex = 0;

                        _i2Tmp = _i2Tmp.selection.squareSide;

                        _selectionMarkerDistance = this.calculateSelectionDistance(_i2Tmp, _i1Tmp);
                        _halfSelectionMarker = _i2Tmp / 2;

                        _selectionMarkers = this.selectionMarkers;
                    }

                    _i1Tmp = _scaler.valueLimits().minValue;
                    _scaler = _scaler.calculate;

                    _i2Tmp = _scaler(_i1Tmp < 0 ? 0 : _i1Tmp);
                    _i1Tmp = _settings.rect;

                    if (_i2Tmp > _i1Tmp.bottom) {
                        _i2Tmp = _i1Tmp.bottom;
                    }

                    if (_i2Tmp < _i1Tmp.top) {
                        _i2Tmp = _i1Tmp.top;
                    }

                    _color = _i0Tmp.values[_valueIndex].color || _drawColor;

                    if (_isSubPixel) {
                        while (_xMinLimit <= _xMaxLimit) {

                            _i0Tmp = _datas[_xMinLimit];
                            _i1Tmp = _i0Tmp.indexedDataPoint.viewPortSlot.center;

                            _line = {
                                x0: _i1Tmp,
                                y0: null,
                                x1: _i1Tmp,
                                y1: null
                            };

                            _i0Tmp = _i0Tmp.values[_valueIndex];
                            _i1Tmp = _scaler(_i0Tmp.value);

                            _line.y1 = _i2Tmp;
                            _line.y0 = _i1Tmp;

                            _i1Tmp -= _i2Tmp;

                            if (_i1Tmp > 0 && _i1Tmp < 1) {
                                _line.y0 += 1;
                            } else if (_i1Tmp <= 0 && _i1Tmp > -1) {
                                _line.y0 -= 1;
                            } 

                            _i1Tmp = _i0Tmp.color || _drawColor;

                            if (_i1Tmp !== _color) {
                                _strokeStyle.color = 'rgba(' + _color + ', ' + _opacity + ')';

                                _printer.plotLines(_shapes, _strokeStyle, 3);

                                _shapes.length = 0;

                                _color = _i1Tmp;
                            }

                            _shapes.push(_line);

                            if (_isSelected) {
                                if (_lastMarkerIndex === _selectionMarkerDistance && (_xMaxLimit - _xMinLimit) > _selectionMarkerDistance) {
                                    _selectionMarkers.push({
                                        x: Math.floor(_line.x1 - _halfSelectionMarker) + 0.5,
                                        y: Math.floor(_line.y0 - _halfSelectionMarker) + 0.5
                                    });
                                    _lastMarkerIndex = 0;
                                } else {
                                    _lastMarkerIndex++;
                                }
                            }

                            _xMinLimit++;
                        }
                    } else {
                        while (_xMinLimit <= _xMaxLimit) {

                            _i0Tmp = _datas[_xMinLimit];
                            _i1Tmp = Math.floor(_i0Tmp.indexedDataPoint.viewPortSlot.center) + 0.5;

                            _line = {
                                x0: _i1Tmp,
                                y0: null,
                                x1: _i1Tmp,
                                y1: null
                            };

                            _i0Tmp = _i0Tmp.values[_valueIndex];
                            _i1Tmp = _scaler(_i0Tmp.value);

                            _line.y1 = _i2Tmp;
                            _line.y0 = _i1Tmp;

                            _i1Tmp -= _i2Tmp;

                            if (_i1Tmp > 0 && _i1Tmp < 1) {
                                _line.y0 += 1;
                            } else if (_i1Tmp <= 0 && _i1Tmp > -1) {
                                _line.y0 -= 1;
                            } 

                            _i1Tmp = _i0Tmp.color || _drawColor;

                            if (_i1Tmp !== _color) {
                                _strokeStyle.color = 'rgba(' + _color + ', ' + _opacity + ')';

                                _printer.plotLines(_shapes, _strokeStyle, 3);

                                _shapes.length = 0;

                                _color = _i1Tmp;
                            }

                            _shapes.push(_line);

                            if (_isSelected) {
                                if (_lastMarkerIndex === _selectionMarkerDistance && (_xMaxLimit - _xMinLimit) > _selectionMarkerDistance) {
                                    _selectionMarkers.push({
                                        x: Math.floor(_line.x1 - _halfSelectionMarker) + 0.5,
                                        y: Math.floor(_line.y0 - _halfSelectionMarker) + 0.5
                                    });
                                    _lastMarkerIndex = 0;
                                } else {
                                    _lastMarkerIndex++;
                                }
                            }

                            _xMinLimit++;
                        }
                    }

                    _strokeStyle.color = 'rgba(' + _color + ', ' + _opacity + ')';

                    _printer.plotLines(_shapes, _strokeStyle, 3);

                    _shapes.length = 0;

                    if (_isSelected) {

                        _i0Tmp = _settings.style.selection;

                        this.renderSelection(_selectionMarkers);

                        _selectionMarkers.length = 0;
                    }

                    return null; // no hotspots
                },

                dispose: function () {
                    SingleSlotSeriePainter.prototype.dispose.call(this);
                }
            });

    var _settings,
        _printer,
        _valueIndex,
        _isSelected,
        _lastMarkerIndex,
        _selectionMarkerDistance,
        _halfSelectionMarker,
        _selectionMarkers,
        _datas,
        _scaler,
        _strokeStyle = {},
        _shapes = [],
        _xMinLimit,
        _xMaxLimit,
        _isSubPixel,
        _opacity,
        _i0Tmp,
        _i1Tmp,
        _i2Tmp,
        _color,
        _drawColor,
        _line;

    return HistogramStreamPainter;

});