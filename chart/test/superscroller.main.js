
requirejs.config({
    baseUrl: '../',
    paths: {
        'chart': './src/chart',
        'plugins': './src/plugins',
        'common': './src/common',
        'lib': './src/lib',
        'i18n': './src/lib/i18n',
        'test': './test',

        'pubsub': './src/shared/pubsub',
        'localLib/on': './src/shared/on',
        'localLib/mouse': './src/shared/mouse',
        'localLib/logger': './src/shared/logger',
        'has': './src/shared/has',
        'EventEmitter': './src/shared/EventEmitter',
        'dcl': './src/shared/dcl-master',
        'jquery':'./src/shared/jquery-latest'
    }
});

require([
    "plugins/superScroller/HorizontalScrollBar",
    "jquery"
], function(HorizontalScrollBar, $) {

    var $chartWrapper = $('#chartWrapper');

    window.superScroller = new HorizontalScrollBar($chartWrapper, {
        totalRange: {
            minValue: 0,
            maxValue: 330
        },
        activeRange: {
            minValue: 30,
            maxValue: 300
        },
        leftHandleMargin: 20,
        rightHandleMargin: 20,
        onBeginRangeChangeCallback: function() {
            console.info('beginRangeChange');
        },
        onRangeChangeCallback: function(range) {
            console.info('rangeChange, minValue: ' + range.minValue + ', maxValue: ' + range.maxValue);
        },
        onEndRangeChangeCallback: function() {
            console.info('endRangeChange');
        }
    });
});
