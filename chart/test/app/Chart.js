define([
    'jquery',
    './ChartSettings',
    './scrollbarSettings',
    'chart/Chart',
    'plugins/interaction/Broker/Broker',
    'plugins/interaction/crosshair/crosshair',
    'plugins/interaction/selection/selection',
    'plugins/interaction/graphResizing/graphResizing',
    'plugins/interaction/horizontalZoom/horizontalZoom',
    'plugins/interaction/verticalZoom/verticalZoom',
    'plugins/superScroller/HorizontalScrollBar'//,
    //'plugins/interaction/datatip/Datatip',
    //'../managers/DataTipManager'
], function ($, ChartSettings, scrollbarSettings, Chart, Broker, Crosshair, Selection, GR, HorizontalZoom, VZ, HorizontalScrollBar) {

    return function(options, el) {

        /*var Broker = chartLibs.plugins.broker,
            Selection = chartLibs.plugins.selection,
            Crosshair = chartLibs.plugins.crossHair,
            Datatip = chartLibs.plugins.dataTip,
            HorizontalZoom = chartLibs.plugins.horizontalZoom,
            HorizontalScrollBar = chartLibs.plugins.HorizontalScrollBar,
            dataTipManager = new DataTipManager(options.metaData),
            chart, broker, scrollbar, chartSettings, scrollSettings, oldChartResize, drawingManager;
        */

        var
            chart, scrollbar, chartSettings, scrollSettings, oldChartResize,
            broker = new Broker();

        broker.pluginsStack.push(new Selection());
        //broker.pluginsStack.push(new Datatip(dataTipManager));
        broker.pluginsStack.push(new HorizontalZoom({
            onRangeChangeCallback: function (range) {
                scrollbar.activeRange(range);
            }
        }));

        // OOF. Circular dependencies. Between chart and scroller. Tread carefully!
        chartSettings = new ChartSettings(broker);
        chart = new Chart(el, chartSettings);

        scrollSettings = scrollbarSettings(chart);
        scrollbar = new HorizontalScrollBar($(el).parent(), scrollSettings);
        scrollSettings.setScrollbar(scrollbar);
        chartSettings.setScrollbar(scrollbar);

        chart.instanceId = 'chart_' + options.instanceId;
        broker.instanceId = 'broker_' + options.instanceId;

        // Hack to call resize on SuperScroller
        // Could hack into other plugins here if needed
        oldChartResize = chart.resize;
        chart.resize = function(){
            oldChartResize.apply(chart, arguments);
            scrollbar.resize.apply(scrollbar, arguments);
        };

        // crosshair has to be last because its onDownGesture does not always return true
        broker.pluginsStack.push(new Crosshair());

        return chart;
    };
});
