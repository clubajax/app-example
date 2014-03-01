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
    function CircleStreamPainter(settings) {
        SingleSlotSeriePainter.call(this, settings);
    }

    CircleStreamPainter.prototype = $.extend(
        true,
        new SingleSlotSeriePainter(), {
            _render: function () {

                _settings = this.settings;

                _i0Tmp = _settings.serie.limits.time;

                _xMinLimit = _i0Tmp.minValueIndex;
                _xMaxLimit = _i0Tmp.maxValueIndex;

                _printer = _settings.printer;
                _datas = _settings.serie.data;
                _valueIndex = _settings.valueIndexes[0];
                _scaler = _settings.scaler.calculate;

                _i1Tmp = _settings.style;
                _strokeStyle.width = _i1Tmp.draw.width;

                _isSelected = _settings.isSelected;
                _drawColor = _i1Tmp.draw.color;
                _radius = _i1Tmp.draw.radius;

                _i0Tmp = _datas[_xMinLimit];

                if (_isSelected) {

                    _lastMarkerIndex = 0;

                    _i2Tmp = _i1Tmp.selection.squareSide;
                    _i1Tmp = Math.floor(_i0Tmp.indexedDataPoint.viewPortSlot);

                    _selectionMarkerDistance = this.calculateSelectionDistance(_i2Tmp, _i1Tmp.right - _i1Tmp.left);
                    _halfSelectionMarker = _i2Tmp / 2;

                    _selectionMarkers = this.selectionMarkers;
                }

                _prevColor = _i0Tmp.values[_valueIndex].color || _drawColor;

                while (_xMinLimit <= _xMaxLimit) {

                    _i0Tmp = _datas[_xMinLimit];
                    _i1Tmp = _i0Tmp.indexedDataPoint.viewPortSlot.center;

                    _i0Tmp = _i0Tmp.values[_valueIndex];

                    _color = _i0Tmp.color || _drawColor;

                    if (_prevColor !== _color) {

                        _strokeStyle.color = 'rgba(' + _prevColor + ', 1)';

                        _printer.plotCircles(_shapes, _strokeStyle);

                        _shapes.length = 0;

                        _prevColor = _color;
                    }

                    _i0Tmp = Math.floor(_scaler(_i0Tmp.value));
                    
                    _shapes.push({
                        x: _i1Tmp,
                        y: _i0Tmp,
                        radius: _radius
                    });

                    if (_isSelected) {
                        if (_lastMarkerIndex === _selectionMarkerDistance && (_xMaxLimit - _xMinLimit) > _selectionMarkerDistance) {
                            _selectionMarkers.push({
                                x: Math.floor(_i1Tmp - _halfSelectionMarker) + 0.5,
                                y: Math.floor(_i0Tmp - _halfSelectionMarker) + 0.5
                            });
                            _lastMarkerIndex = 0;
                        } else {
                            _lastMarkerIndex++;
                        }
                    }

                    _xMinLimit++;
                }

                _strokeStyle.color = 'rgba(' + _prevColor + ', 1)';

                _printer.plotCircles(_shapes, _strokeStyle);

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
        _i0Tmp,
        _i1Tmp,
        _i2Tmp,
        _color,
        _drawColor,
        _prevColor,
        _radius;

    return CircleStreamPainter;

});