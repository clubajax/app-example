define(['common/ChartTypes',
        'chart/seriePainters/LineSeriePainter',
        'chart/seriePainters/OhlcSeriePainter',
        'chart/seriePainters/CandleStickSeriePainter',
        'chart/seriePainters/AreaSeriePainter',
        'chart/seriePainters/HistogramSeriePainter',
        'chart/seriePainters/CircleSeriePainter',
        'chart/seriePainters/HorizontalLineDoSeriePainter',
        'chart/seriePainters/VerticalLineDoSeriePainter',
        'chart/seriePainters/TrendLineDoSeriePainter',
        'chart/seriePainters/BandSeriePainter'
    ], function (chartTypes, LineSeriePainter, OhlcSeriePainter, CandleStickSeriePainter, AreaSeriePainter, HistogramSeriePainter,
        CircleSeriePainter, HorizontalLineDoSeriePainter, VerticalLineDoSeriePainter, TrendLineDoSeriePainter, BandSeriePainter) {

        function SeriePainterFactory() {
        }

        SeriePainterFactory.prototype = {
            create: function(chartType, settings) {

                var result;

                switch (chartType) {
                case chartTypes.line:
                    result = new LineSeriePainter(settings);
                    break;
                case chartTypes.ohlc:
                    result = new OhlcSeriePainter(settings);
                    break;
                case chartTypes.candlestick:
                    result = new CandleStickSeriePainter(settings);
                    break;
                case chartTypes.area:
                    result = new AreaSeriePainter(settings);
                    break;
                case chartTypes.histogram:
                    result = new HistogramSeriePainter(settings);
                    break;
                case chartTypes.circle:
                    result = new CircleSeriePainter(settings);
                    break;
                case chartTypes.horizontalLine:
                    result = new HorizontalLineDoSeriePainter(settings);
                    break;
                case chartTypes.verticalLine:
                    result = new VerticalLineDoSeriePainter(settings);
                    break;
                    case chartTypes.trendLine:
                        settings.stop = true;
                    result = new TrendLineDoSeriePainter(settings);
                        break;
                    case chartTypes.trendRay:
                        settings.stop = false;
                    result = new TrendLineDoSeriePainter(settings);
                    break;
                case chartTypes.band:
                    result = new BandSeriePainter(settings);
                    break;
                default:
                    throw new Error('unsupported chart type, ' + chartType);
                }

                return result;

            }
        };

        return new SeriePainterFactory();
    });
