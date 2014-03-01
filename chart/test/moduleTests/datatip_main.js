require([
        "../../../../../lib/domReady.js",
        "../../../../../lib/jquery.js"],
    function (domReady) {

        domReady(function () {

            requirejs.config({
                baseUrl: '../../../../'
            });

            requirejs(["plugins/datatip/FlexibleDataTipRenderer", "common/utilities"], function (DataTipRenderer, utilities) {

                var container, refrence = container = $('#subgGrapBody'),
    				dataTipStyle;

                var settings = {
                    style: {
                        domElement: {
                            cssText: undefined,
                            cssClass: 'ui-dt-host'
                        },
                        table: {
                            cssText: undefined,
                            cssClass: 'ui-dt-table'
                        },
                        fields: {
                            cssText: undefined,
                            cssClass: 'ui-dt-field'
                        },
                        symbols: {
                            cssText: undefined,
                            cssClass: 'ui-dt-symbol'
                        },
                        crosshairValues: {
                            cssText: undefined,
                            cssClass: 'ui-dt-crosshair'
                        },
                        data: {
                            cssText: undefined,
                            cssClass: 'ui-dt-data'
                        }
                    },
                    time: {
                        data: '9/13/2012 03:30 pm',
                        cssText: undefined,
                        cssClass: 'ui-dt-time'
                    },
                    fields: [{
                        key: 'open',
                        data: 'Open',
                        cssText: undefined,
                        cssClass: undefined,
                        visible: true
                    }, {
                        key: 'high',
                        data: 'High',
                        cssText: undefined,
                        cssClass: undefined,
                        visible: true
                    }, {
                        key: 'low',
                        data: 'Low',
                        cssText: undefined,
                        cssClass: undefined,
                        visible: true
                    }, {
                        key: 'close',
                        data: 'Close',
                        cssText: undefined,
                        cssClass: undefined,
                        visible: true
                    }, {
                        key: 'volume',
                        data: 'Volume',
                        cssText: undefined,
                        cssClass: undefined,
                        visible: true
                    }],
                    symbols: [{
                        key: 'c1min',
                        data: 'C',
                        cssText: undefined,
                        cssClass: undefined,
                        visible: true
                    }, {
                        key: 'bac5min',
                        data: 'BAC',
                        cssText: undefined,
                        cssClass: undefined,
                        visible: true
                    }],
                    crosshairValues: [{
                        data: '$34.37',
                        cssClass: undefined
                    }, {
                        data: '$9.05',
                        cssClass: undefined
                    }],
                    data: [
        [{
            data: '$34.21',
            cssText: undefined,
            cssClass: 'ui-dt-value-bull'
        }, {
            data: '$34.26',
            cssText: undefined,
            cssClass: 'ui-dt-value-bull'

        }, {
            data: '$34.21',
            cssText: undefined,
            cssClass: 'ui-dt-value-bull'

        }, {
            data: '$34.25',
            cssText: undefined,
            cssClass: 'ui-dt-value-bull'
        }, {
            data: '12,000,000',
            cssText: undefined,
            cssClass: undefined
        }],
        [{
            data: '$9.34',
            cssText: undefined,
            cssClass: 'ui-dt-value-bear'
        }, {
            data: '$9.36',
            cssText: undefined,
            cssClass: 'ui-dt-value-bear'
        }, {
            data: '$9.33',
            cssText: undefined,
            cssClass: 'ui-dt-value-bear'
        }, {
            data: '$9.35',
            cssText: undefined,
            cssClass: 'ui-dt-value-bear'

        }, {
            data: '34,000,000',
            cssText: undefined,
            cssClass: undefined
        }]
    ]
                };

                var renderer = new DataTipRenderer(settings);

                window.dataTipRenderer = renderer;

                container.append(renderer.domElement);

                container.mousemove(function (e) {
                    var left = e.clientX, top = e.clientY,
    				    $element = renderer.$domElement,
    				    childPosition = $element.position,
    				    childTop = childPosition.top, childLeft = childPosition.left,
    					childWidth = $element.width(), childHeight = $element.height(),
    					containerWidth = container.width(), containerHeight = container.height();

                    if (left + childWidth > containerWidth) {
                        left = left - childWidth - 5;
                    }
                    if (top + childHeight > containerHeight) {
                        top = top - childHeight - 5;
                    }

                    dataTipStyle = 'position:absolute; top: ' + top + 'px; left: ' + left + 'px';
                    utilities.changeCssText(renderer.$domElement, dataTipStyle);
                });

                dataTipStyle = 'position:absolute; top: 50px; left: 50px';
                utilities.changeCssText(renderer.$domElement, dataTipStyle);


                window.timeTest = function () {
                    //time
                    window.dataTipRenderer.time.data('Sep 19 2012'); //data
                    window.dataTipRenderer.time.cssClass('ui-dt-value-neutral'); //cssClass 
                    window.dataTipRenderer.time.cssText('background-color:#aaa'); //cssText	
                };


                window.fieldTest = function () {
                    //fields
                    window.dataTipRenderer.fields(4).data('Vol.'); //data
                    window.dataTipRenderer.fields(3).cssClass('ui-dt-value-neutral'); //cssClass 
                    window.dataTipRenderer.fields(2).cssText('background-color:#aaa'); //cssText
                    window.dataTipRenderer.fields(1).visible(false); //visible 
                };

                window.crosshairTest = function () {
                    //crosshair
                    window.dataTipRenderer.crosshairValues(1).data('10.05'); //data
                    window.dataTipRenderer.crosshairValues(1).cssClass('ui-dt-value-neutral'); //cssClass
                    window.dataTipRenderer.crosshairValues(0).cssText('background-color:#aaa'); //cssText
                };

                window.symbolTest = function () {
                    //symbol
                    window.dataTipRenderer.symbols(0).data('C1Min'); //data
                    window.dataTipRenderer.symbols(1).cssClass('ui-dt-value-neutral'); //cssClass 
                    window.dataTipRenderer.symbols(0).cssText('background-color:#aaa'); //cssText
                    window.dataTipRenderer.symbols(1).visible(false); //visible 
                };

                window.dataTest = function () {
                    //symbol
                    window.dataTipRenderer.data(0)(0).data('$35.01'); //data
                    window.dataTipRenderer.data(0)(2).cssClass('ui-dt-value-neutral'); //cssClass 
                    window.dataTipRenderer.data(0)(3).cssText('background-color:#aaa'); //cssText
                };

            });

        });
    });