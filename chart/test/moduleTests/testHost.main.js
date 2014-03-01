require([
    "../../../../../lib/domReady",
    "../../../../../lib/knockout.js",
    "../../../../../lib/jquery.js",
    "./assets/ext-all-debug.js",
    "./assets/jquery.js"],

    function (domReady, ko) {

        domReady(function () {

            requirejs.config({
                baseUrl: '../../../../../',
                paths: {
                    'chart': './src/chart',
                    'plugins': './src/plugins',
                    'common': './src/common',
                    'i18n': './lib/i18n',
                    'knockout': './lib/knockout'
                }
            });

            requirejs(["chart/chart", "chart/SeriePainters/SeriePainterFactory", "plugins/resourceManager/ResourceManager", "plugins/interaction/Broker/Broker", "common/userInteractionTypes", "common/utilities", "plugins/interaction/crosshair/crosshair", "plugins/interaction/selection/selection", "plugins/interaction/graphResizing/graphResizing", "plugins/interaction/horizontalZoom/horizontalZoom", "plugins/interaction/verticalZoom/verticalZoom", "plugins/superScroller/HorizontalScrollBar", "plugins/interaction/drawingObjectCreation/drawingObjectCreator", "plugins/interaction/drawingObjectEdition/drawingObjectEditor", "plugins/interaction/datatip/Datatip", "common/ChartTypes"], function (Chart, seriePainterFactory, resourceMananger, Broker, userInteractionTypes, utilities, Crosshair, Selection, GraphResizing, HorizontalZoom, VerticalZoom, HorizontalScrollBar, DrawingObjectCreator, DrawingObjectEditor, Datatip, chartTypes) {
                window.ko = ko;

                Ext.require(['*']);

                var intBroker = new Broker();

                Ext.onReady(function () {

                    Ext.QuickTips.init();

                    // NOTE: This is an example showing simple state management. During development,
                    // it is generally best to disable state management as dynamically-generated ids
                    // can change across page loads, leading to unpredictable results.  The developer
                    // should ensure that stable state ids are set for stateful components in real apps.
                    Ext.state.Manager.setProvider(Ext.create('Ext.state.CookieProvider'));

                    var objectTemplateTrendRay = {
                        inputs: [
                        {
                            name: 'point1',
                            value: {
                                price: null,
                                timeStamp: null
                            }
                        }, {
                            name: 'point2',
                            value: {
                                price: null,
                                timeStamp: null
                            }
                        }],
                        definesScaling: false,
                        data: [],
                        layers: [{
                            isSelected: false,
                            chartType: {
                                name: 'trendRay',
                                settings: {
                                    draw: {
                                        color: '218, 112, 214',
                                        width: 0.5
                                    },
                                    selection: {
                                        squareSide: 8,
                                        color: '255, 255, 255',
                                        width: 0.5
                                    }
                                }
                            }
                        }]
                    };

                    var objectTemplateTrendLine = {
                        inputs: [
                        {
                            name: 'point1',
                            value: {
                                price: null,
                                timeStamp: null
                            }
                        }, {
                            name: 'point2',
                            value: {
                                price: null,
                                timeStamp: null
                            }
                        }],
                        definesScaling: false,
                        data: [],
                        layers: [{
                            isSelected: false,
                            chartType: {
                                name: 'trendLine',
                                settings: {
                                    draw: {
                                        color: '255, 255, 0',
                                        width: 0.5
                                    },
                                    selection: {
                                        squareSide: 8,
                                        color: '255, 255, 255',
                                        width: 0.5
                                    }
                                }
                            }
                        }]
                    };

                    var objectTemplateHorizontalLine = {
                        inputs: [
                        {
                            name: 'point1',
                            value: {
                                price: null,
                                timeStamp: null
                            }
                        }],
                        definesScaling: false,
                        data: [],
                        layers: [{
                            isSelected: false,
                            chartType: {
                                name: 'horizontalLine',
                                settings: {
                                    draw: {
                                        color: '38, 238, 255',
                                        width: 0.5     // (px)
                                    },
                                    selection: {
                                        squareSide: 8,
                                        color: '255, 255, 255',
                                        width: 0.5
                                    }
                                }
                            }
                        }]
                    };

                    var objectTemplateVerticalLine = {
                        inputs: [
                        {
                            name: 'point1',
                            value: {
                                price: null,
                                timeStamp: null
                            }
                        }],
                        definesScaling: false,
                        data: [],
                        layers: [{
                            isSelected: false,
                            chartType: {
                                name: 'verticalLine',
                                settings: {
                                    draw: {
                                        color: '38, 238, 255',
                                        width: 0.5      // (px)
                                    },
                                    selection: {
                                        squareSide: 8,
                                        color: '255, 255, 255',
                                        width: 0.5
                                    }
                                }
                            }
                        }]
                    };

                    var objectTemplateRainBow = {
                        inputs: [
                        {
                            name: 'point1',
                            value: {
                                price: null,
                                timeStamp: null
                            }
                        }, {
                            name: 'point2',
                            value: {
                                price: null,
                                timeStamp: null
                            }
                        }, {
                            name: 'point3',
                            value: {
                                price: null,
                                timeStamp: null
                            }
                        }],
                        definesScaling: false,
                        data: [],
                        layers: [
                        {
                            isSelected: false,
                            chartType: {
                                name: "horizontalLine",
                                settings: {
                                    draw: {
                                        color: '125, 125, 255',
                                        width: 1.5
                                    },
                                    selection: {
                                        squareSide: 8,
                                        color: '255, 255, 255',
                                        width: 0.5
                                    }
                                },
                                dataPointDefinitions: [{
                                    key: 0
                                }]
                            }
                        },
                        {
                            isSelected: false,
                            chartType: {
                                name: "horizontalLine",
                                settings: {
                                    draw: {
                                        color: '25, 255, 25',
                                        width: 1.5
                                    },
                                    selection: {
                                        squareSide: 8,
                                        color: '255, 255, 255',
                                        width: 0.5
                                    }
                                },
                                dataPointDefinitions: [{
                                    key: 1
                                }]
                            }
                        },
                        {
                            isSelected: false,
                            chartType: {
                                name: "horizontalLine",
                                settings: {
                                    draw: {
                                        color: '250, 250, 250',
                                        width: 1.5
                                    },
                                    selection: {
                                        squareSide: 8,
                                        color: '255, 255, 255',
                                        width: 0.5
                                    }
                                },
                                dataPointDefinitions: [{
                                    key: 2
                                }]
                            }
                        },
                        {
                            isSelected: false,
                            chartType: {
                                name: "verticalLine",
                                settings: {
                                    draw: {
                                        color: '250, 250, 250',
                                        width: 1.5
                                    },
                                    selection: {
                                        squareSide: 8,
                                        color: '255, 255, 255',
                                        width: 0.5
                                    }
                                },
                                dataPointDefinitions: [{
                                    key: 2
                                }]
                            }
                        },
                        {
                            isSelected: false,
                            chartType: {
                                name: "verticalLine",
                                settings: {
                                    draw: {
                                        color: '125, 125, 255',
                                        width: 1.5
                                    },
                                    selection: {
                                        squareSide: 8,
                                        color: '255, 255, 255',
                                        width: 0.5
                                    }
                                },
                                dataPointDefinitions: [{
                                    key: 0
                                }]
                            }
                        },
                        {
                            isSelected: false,
                            chartType: {
                                name: "verticalLine",
                                settings: {
                                    draw: {
                                        color: '25, 255, 25',
                                        width: 1.5
                                    },
                                    selection: {
                                        squareSide: 8,
                                        color: '255, 255, 255',
                                        width: 0.5
                                    }
                                },
                                dataPointDefinitions: [{
                                    key: 1
                                }]
                            }
                        },
                            {
                                isSelected: false,
                                chartType: {
                                    name: "trendRay",
                                    settings: {
                                        draw: {
                                            color: '255, 55, 25',
                                            width: 1.5
                                        },
                                        selection: {
                                            squareSide: 8,
                                            color: '255, 255, 255',
                                            width: 0.5
                                        }
                                    },
                                    dataPointDefinitions: [{
                                        key: 0
                                    }, {
                                        key: 1
                                    }]
                                }
                            }
                        ]
                    };

                    Ext.create('Ext.Viewport', {
                        id: 'border-example',
                        layout: 'border',
                        items: [

                        {
                            region: 'west',
                            stateId: 'navigation-panel',
                            id: 'west-panel', // see Ext.getCmp() below
                            title: 'Settings',
                            split: true,
                            width: 200,
                            minWidth: 175,
                            maxWidth: 400,
                            collapsible: true,
                            collapsed: false,
                            animCollapse: true,
                            margins: '0 0 0 5',
                            layout: 'accordion',
                            items: [{
                                xtype: 'panel',
                                title: 'Drawing Objects',
                                iconCls: 'settings',
                                width: '100%',
                                layout: {
                                    type: 'vbox',
                                    padding: '5',
                                    pack: 'center',
                                    align: 'center'
                                },
                                defaults: { margins: '0 0 5 0' },
                                items: [
                                {
                                    xtype: 'button',
                                    height: '30',
                                    enableToggle: true,
                                    text: 'AutoSnap',
                                    pressed: true,
                                    handler: function () {
                                        if (this.pressed) {
                                            intBroker.pluginsStack()[2].autoSnapCallback(function (snapTos) {
                                                var snapTo = null, length = snapTos.length, index = null, i, shortestDistance = Number.MAX_VALUE, distance;
                                                for (i = 0; i < length; i++) {

                                                    snapTo = snapTos[i];

                                                    distance = Math.sqrt(Math.pow(snapTo.distanceX, 2) + Math.pow(snapTo.distanceY, 2));

                                                    if (shortestDistance > distance) {
                                                        index = i;
                                                        shortestDistance = distance;
                                                    }
                                                }
                                                return index === null ? false : snapTos[index];
                                            });
                                        }
                                        else {
                                            intBroker.pluginsStack()[2].autoSnapCallback(function (snapTos) { return false; });
                                        }
                                    }
                                },
                                {
                                    xtype: 'button',
                                    height: '30',
                                    enableToggle: true,
                                    text: 'TrendLine',
                                    toggleGroup: 'DrawingObjects',
                                    handler: function () {
                                        intBroker.pluginsStack()[0].isActive(this.pressed);
                                        intBroker.pluginsStack()[0].objectSettingsTemplate(objectTemplateTrendLine);
                                    }

                                },
                                {
                                    xtype: 'button',
                                    height: '30',
                                    enableToggle: true,
                                    text: 'TrendRay',
                                    toggleGroup: 'DrawingObjects',
                                    handler: function () {
                                        intBroker.pluginsStack()[0].isActive(this.pressed);
                                        intBroker.pluginsStack()[0].objectSettingsTemplate(objectTemplateTrendRay);
                                    }
                                },
                                {
                                    xtype: 'button',
                                    height: '30',
                                    enableToggle: true,
                                    text: 'HorizontalLine',
                                    toggleGroup: 'DrawingObjects',
                                    handler: function () {
                                        intBroker.pluginsStack()[0].isActive(this.pressed);
                                        intBroker.pluginsStack()[0].objectSettingsTemplate(objectTemplateHorizontalLine);
                                    }
                                },
                                {
                                    xtype: 'button',
                                    height: '30',
                                    enableToggle: true,
                                    text: 'VerticalLine',
                                    toggleGroup: 'DrawingObjects',
                                    handler: function () {
                                        intBroker.pluginsStack()[0].isActive(this.pressed);
                                        intBroker.pluginsStack()[0].objectSettingsTemplate(objectTemplateVerticalLine);
                                    }
                                },
                                {
                                    xtype: 'button',
                                    height: '30',
                                    enableToggle: true,
                                    text: 'Box Pattern',
                                    toggleGroup: 'DrawingObjects',
                                    handler: function () {
                                        intBroker.pluginsStack()[0].isActive(this.pressed);
                                        intBroker.pluginsStack()[0].objectSettingsTemplate(objectTemplateRainBow);
                                    }
                                },
                                {
                                    xtype: 'button',
                                    height: '30',
                                    enableToggle: true,
                                    text: 'Dock Datatip',
                                    toggleGroup: 'DrawingObjects',
                                    handler: function () {
                                        if (this.pressed) {
                                            window.datatip.settings.parent = $('#inside');
                                        }
                                        else {
                                            window.datatip.settings.parent = null;
                                        }
                                    }
                                }],
                                flex: 1
                            },
                            {
                                title: 'Chart Plugins',
                                html: '<ul id="sortable" class="ui-sortable"><li class="ui-state-default"><span class="ui-icon ui-icon-arrowthick-2-n-s"></span>Drawing Object Creator</li><li class="ui-state-default"><span class="ui-icon ui-icon-arrowthick-2-n-s"></span>Selection</li> <li class="ui-state-default"><span class="ui-icon ui-icon-arrowthick-2-n-s"></span>Drawing Object Editor</li> <li class="ui-state-default"><span class="ui-icon ui-icon-arrowthick-2-n-s"></span>Datatip</li> <li class="ui-state-default"><span class="ui-icon ui-icon-arrowthick-2-n-s"></span>Crosshair</li> <li class="ui-state-default"><span class="ui-icon ui-icon-arrowthick-2-n-s"></span>Horizontal Zoom</li> <li class="ui-state-default"><span class="ui-icon ui-icon-arrowthick-2-n-s"></span>Vertical Zoom</li> </ul>',
                                iconCls: 'settings'
                            }, {
                                title: 'Information',
                                html: '<p>Some info in here.</p>',
                                iconCls: 'info'
                            }],
                            listeners: {
                                collapse: function () {
                                    window.chart.resize();
                                },
                                expand: function () {
                                    window.chart.resize();
                                }
                            }
                        },
                        {
                            xtype: 'tabpanel',
                            region: 'east',
                            title: 'Properties',
                            dockedItems: [{
                                dock: 'top',
                                xtype: 'toolbar',
                                items: ['->', {
                                    xtype: 'button',
                                    text: 'test',
                                    tooltip: 'Test Button'
                                }]
                            }],
                            animCollapse: true,
                            collapsible: true,
                            collapsed: true,
                            split: true,
                            width: 225, // give east and west regions a width
                            minSize: 175,
                            maxSize: 400,
                            margins: '0 5 0 0',
                            activeTab: 1,
                            tabPosition: 'bottom',
                            items: [{
                                html: '<p>A TabPanel component can be a region.</p>',
                                title: 'A Tab',
                                autoScroll: true
                            }, Ext.create('Ext.grid.PropertyGrid', {
                                title: 'Property Grid',
                                closable: true,
                                source: {
                                    "(name)": "Properties Grid",
                                    "color": "TBD",
                                    "width": "TBD",
                                    "dataPointDefinitions": "TBD",
                                    "selection": "TBD",
                                    "chartType": "TBD",
                                    "squareSide": "TBD",
                                    "width": "TBD"
                                }
                            })],
                            listeners: {
                                collapse: function () {
                                    if (window.chart) {
                                        window.chart.resize();
                                    }
                                },
                                expand: function () {
                                    if (window.chart) {
                                        window.chart.resize();
                                    }
                                }
                            }
                        },
                // in this instance the TabPanel is not wrapped by another panel
                // since no title is needed, this Panel is added directly
                // as a Container
                Ext.create('Ext.tab.Panel', {
                    region: 'center', // a center region is ALWAYS required for border layout
                    deferredRender: false,
                    activeTab: 0,     // first tab initially active
                    tabPosition: 'bottom',
                    items: [{
                        contentEl: 'parent',
                        title: 'Chart Sandbox',
                        closable: false,
                        autoScroll: false
                    }]

                })
                        ]
                    });
                });


                $(document).ready(function () {

                    var $container = $('#parent'),
                        prevViewPortLeftMargin = 0,
                        currentViewPortLeftMargin = 0,
                        prevViewPortRightMargin = 0,
                        currentViewPortRightMargin = 0,
                        userInteractiontype, crosshairDelay, dataTipDelay,
                        barData = [{ timeStamp: new Date(2012, 0, 1, 9, 37, 0, 0), values: [{ value: 11.83 }, { value: 11.87 }, { value: 11.50 }, { value: 11.57 }, { value: 215071520 }] },
                        { timeStamp: new Date(2012, 0, 2, 9, 37, 0, 0), values: [{ value: 11.61 }, { value: 12.07 }, { value: 11.60 }, { value: 12.00 }, { value: 235158078 }] },
                        { timeStamp: new Date(2012, 0, 3, 9, 37, 0, 0), values: [{ value: 12.26 }, { value: 12.69 }, { value: 12.25 }, { value: 12.65 }, { value: 328638931 }] },
                        { timeStamp: new Date(2012, 0, 4, 9, 37, 0, 0), values: [{ value: 12.65 }, { value: 12.85 }, { value: 12.47 }, { value: 12.80 }, { value: 224667692 }] },
                        { timeStamp: new Date(2012, 0, 5, 9, 37, 0, 0), values: [{ value: 12.86 }, { value: 12.88 }, { value: 12.52 }, { value: 12.54 }, { value: 189201488 }] },
                        { timeStamp: new Date(2012, 0, 6, 9, 37, 0, 0), values: [{ value: 12.57 }, { value: 12.71 }, { value: 12.33 }, { value: 12.40 }, { value: 161365713 }] },
                        { timeStamp: new Date(2012, 0, 7, 9, 37, 0, 0), values: [{ value: 12.38 }, { value: 12.54 }, { value: 12.28 }, { value: 12.29 }, { value: 160612493 }] },
                        { timeStamp: new Date(2012, 0, 8, 9, 37, 0, 0), values: [{ value: 12.47 }, { value: 12.77 }, { value: 12.38 }, { value: 12.52 }, { value: 309278321 }] },
                        { timeStamp: new Date(2012, 0, 9, 9, 37, 0, 0), values: [{ value: 12.55 }, { value: 12.65 }, { value: 12.45 }, { value: 12.57 }, { value: 154544133 }] },
                        { timeStamp: new Date(2012, 0, 10, 9, 37, 0, 0), values: [{ value: 12.59 }, { value: 12.75 }, { value: 12.57 }, { value: 12.62 }, { value: 113899774 }] },
                        { timeStamp: new Date(2012, 0, 11, 9, 37, 0, 0), values: [{ value: 12.73 }, { value: 12.98 }, { value: 12.70 }, { value: 12.98 }, { value: 163167072 }] },
                        { timeStamp: new Date(2012, 0, 12, 9, 37, 0, 0), values: [{ value: 13.01 }, { value: 13.45 }, { value: 13.00 }, { value: 13.38 }, { value: 240617989 }] },
                        { timeStamp: new Date(2012, 0, 13, 9, 37, 0, 0), values: [{ value: 13.26 }, { value: 13.30 }, { value: 12.97 }, { value: 13.06 }, { value: 184254478 }] },
                        { timeStamp: new Date(2012, 0, 14, 9, 37, 0, 0), values: [{ value: 12.98 }, { value: 13.40 }, { value: 12.96 }, { value: 13.27 }, { value: 116010928 }] },
                        { timeStamp: new Date(2012, 0, 15, 9, 37, 0, 0), values: [{ value: 13.38 }, { value: 13.49 }, { value: 13.34 }, { value: 13.34 }, { value: 119303510 }] },
                        { timeStamp: new Date(2012, 0, 16, 9, 37, 0, 0), values: [{ value: 13.39 }, { value: 13.42 }, { value: 13.31 }, { value: 13.31 }, { value: 74986117 }] },
                        { timeStamp: new Date(2012, 0, 17, 9, 37, 0, 0), values: [{ value: 13.32 }, { value: 13.40 }, { value: 13.26 }, { value: 13.28 }, { value: 88176216 }] },
                        { timeStamp: new Date(2012, 0, 18, 9, 37, 0, 0), values: [{ value: 13.23 }, { value: 13.38 }, { value: 13.22 }, { value: 13.34 }, { value: 63089159 }] },
                        { timeStamp: new Date(2012, 0, 19, 9, 37, 0, 0), values: [{ value: 13.85 }, { value: 14.23 }, { value: 13.80 }, { value: 14.19 }, { value: 354322256 }] },
                        { timeStamp: new Date(2012, 0, 20, 9, 37, 0, 0), values: [{ value: 14.23 }, { value: 14.25 }, { value: 14.02 }, { value: 14.24 }, { value: 218978104 }] },
                        { timeStamp: new Date(2012, 0, 21, 9, 37, 0, 0), values: [{ value: 14.19 }, { value: 14.60 }, { value: 14.15 }, { value: 14.50 }, { value: 246151179 }] },
                        { timeStamp: new Date(2012, 0, 22, 9, 37, 0, 0), values: [{ value: 14.54 }, { value: 14.69 }, { value: 14.34 }, { value: 14.44 }, { value: 241658478 }] },
                        { timeStamp: new Date(2012, 0, 23, 9, 37, 0, 0), values: [{ value: 14.54 }, { value: 14.68 }, { value: 13.98 }, { value: 14.25 }, { value: 392328622 }] },
                        { timeStamp: new Date(2012, 0, 24, 9, 37, 0, 0), values: [{ value: 14.17 }, { value: 14.43 }, { value: 14.09 }, { value: 14.40 }, { value: 185382517 }] },
                        { timeStamp: new Date(2012, 0, 25, 9, 37, 0, 0), values: [{ value: 14.61 }, { value: 14.73 }, { value: 14.53 }, { value: 14.69 }, { value: 212239368 }] },
                        { timeStamp: new Date(2012, 0, 26, 9, 37, 0, 0), values: [{ value: 14.89 }, { value: 14.99 }, { value: 14.85 }, { value: 14.99 }, { value: 204060755 }] },
                        { timeStamp: new Date(2012, 0, 27, 9, 37, 0, 0), values: [{ value: 15.01 }, { value: 15.02 }, { value: 14.72 }, { value: 14.77 }, { value: 159253054 }] },
                        { timeStamp: new Date(2012, 0, 28, 9, 37, 0, 0), values: [{ value: 14.73 }, { value: 15.31 }, { value: 14.68 }, { value: 15.25 }, { value: 282493775 }] },
                        { timeStamp: new Date(2012, 0, 29, 9, 37, 0, 0), values: [{ value: 15.08 }, { value: 15.16 }, { value: 14.85 }, { value: 15.00 }, { value: 198400484 }] },
                        { timeStamp: new Date(2012, 0, 30, 9, 37, 0, 0), values: [{ value: 14.85 }, { value: 14.95 }, { value: 14.35 }, { value: 14.37 }, { value: 247013181 }] },
                        { timeStamp: new Date(2012, 0, 31, 9, 37, 0, 0), values: [{ value: 14.27 }, { value: 14.60 }, { value: 13.94 }, { value: 14.54 }, { value: 245219566 }] },
                        { timeStamp: new Date(2012, 1, 1, 9, 37, 0, 0), values: [{ value: 14.41 }, { value: 14.71 }, { value: 14.22 }, { value: 14.25 }, { value: 291812578 }] },
                        { timeStamp: new Date(2012, 1, 2, 9, 37, 0, 0), values: [{ value: 14.25 }, { value: 14.26 }, { value: 13.88 }, { value: 13.92 }, { value: 225424630 }] },
                        { timeStamp: new Date(2012, 1, 3, 9, 37, 0, 0), values: [{ value: 13.78 }, { value: 13.84 }, { value: 13.40 }, { value: 13.63 }, { value: 303642014 }] },
                        { timeStamp: new Date(2012, 1, 4, 9, 37, 0, 0), values: [{ value: 13.71 }, { value: 13.77 }, { value: 13.55 }, { value: 13.55 }, { value: 145810244 }] },
                        { timeStamp: new Date(2012, 1, 5, 9, 37, 0, 0), values: [{ value: 13.58 }, { value: 13.67 }, { value: 13.48 }, { value: 13.67 }, { value: 153086043 }] },
                        { timeStamp: new Date(2012, 1, 6, 9, 37, 0, 0), values: [{ value: 13.83 }, { value: 14.06 }, { value: 13.58 }, { value: 13.60 }, { value: 226452444 }] },
                        { timeStamp: new Date(2012, 1, 7, 9, 37, 0, 0), values: [{ value: 13.71 }, { value: 13.79 }, { value: 13.64 }, { value: 13.73 }, { value: 118000791 }] },
                        { timeStamp: new Date(2012, 1, 8, 9, 37, 0, 0), values: [{ value: 13.90 }, { value: 14.37 }, { value: 13.87 }, { value: 14.31 }, { value: 211978400 }] },
                        { timeStamp: new Date(2012, 1, 9, 9, 37, 0, 0), values: [{ value: 14.33 }, { value: 14.35 }, { value: 14.13 }, { value: 14.24 }, { value: 140312631 }] },
                        { timeStamp: new Date(2012, 1, 10, 9, 37, 0, 0), values: [{ value: 14.16 }, { value: 14.47 }, { value: 14.15 }, { value: 14.43 }, { value: 145885245 }] },
                        { timeStamp: new Date(2012, 1, 11, 9, 37, 0, 0), values: [{ value: 14.43 }, { value: 14.47 }, { value: 14.11 }, { value: 14.29 }, { value: 141015157 }] },
                        { timeStamp: new Date(2012, 1, 12, 9, 37, 0, 0), values: [{ value: 14.51 }, { value: 14.77 }, { value: 14.43 }, { value: 14.67 }, { value: 149423470 }] },
                        { timeStamp: new Date(2012, 1, 13, 9, 37, 0, 0), values: [{ value: 14.64 }, { value: 14.76 }, { value: 14.50 }, { value: 14.61 }, { value: 158426197 }] },
                        { timeStamp: new Date(2012, 1, 14, 9, 37, 0, 0), values: [{ value: 14.46 }, { value: 14.69 }, { value: 14.41 }, { value: 14.64 }, { value: 150179061 }] },
                        { timeStamp: new Date(2012, 1, 15, 9, 37, 0, 0), values: [{ value: 14.51 }, { value: 14.64 }, { value: 14.47 }, { value: 14.49 }, { value: 132240785 }] },
                        { timeStamp: new Date(2012, 1, 16, 9, 37, 0, 0), values: [{ value: 14.37 }, { value: 14.87 }, { value: 14.35 }, { value: 14.77 }, { value: 156195945 }] },
                        { timeStamp: new Date(2012, 1, 17, 9, 37, 0, 0), values: [{ value: 14.77 }, { value: 14.95 }, { value: 14.71 }, { value: 14.89 }, { value: 112574112 }] },
                        { timeStamp: new Date(2012, 1, 18, 9, 37, 0, 0), values: [{ value: 14.80 }, { value: 14.88 }, { value: 14.69 }, { value: 14.77 }, { value: 109532236 }] },
                        { timeStamp: new Date(2012, 1, 19, 9, 37, 0, 0), values: [{ value: 14.81 }, { value: 14.88 }, { value: 14.70 }, { value: 14.84 }, { value: 132821824 }] },
                        { timeStamp: new Date(2012, 1, 20, 9, 37, 0, 0), values: [{ value: 14.75 }, { value: 14.91 }, { value: 14.73 }, { value: 14.81 }, { value: 103495339 }] },
                        { timeStamp: new Date(2012, 1, 21, 9, 37, 0, 0), values: [{ value: 14.84 }, { value: 14.89 }, { value: 14.67 }, { value: 14.75 }, { value: 98368937 }] },
                        { timeStamp: new Date(2012, 1, 22, 9, 37, 0, 0), values: [{ value: 14.38 }, { value: 14.52 }, { value: 14.09 }, { value: 14.18 }, { value: 187522725 }] },
                        { timeStamp: new Date(2012, 1, 23, 9, 37, 0, 0), values: [{ value: 14.17 }, { value: 14.44 }, { value: 13.92 }, { value: 14.17 }, { value: 196363566 }] },
                        { timeStamp: new Date(2012, 1, 24, 9, 37, 0, 0), values: [{ value: 14.11 }, { value: 14.16 }, { value: 13.79 }, { value: 13.97 }, { value: 201697481 }] },
                        { timeStamp: new Date(2012, 1, 25, 9, 37, 0, 0), values: [{ value: 14.16 }, { value: 14.32 }, { value: 14.12 }, { value: 14.20 }, { value: 126872985 }] },
                        { timeStamp: new Date(2012, 1, 26, 9, 37, 0, 0), values: [{ value: 14.27 }, { value: 14.48 }, { value: 14.16 }, { value: 14.29 }, { value: 137039110 }] },
                        { timeStamp: new Date(2012, 1, 27, 9, 37, 0, 0), values: [{ value: 14.31 }, { value: 14.35 }, { value: 13.91 }, { value: 13.93 }, { value: 161267380 }] },
                        { timeStamp: new Date(2012, 1, 28, 9, 37, 0, 0), values: [{ value: 13.92 }, { value: 14.07 }, { value: 13.81 }, { value: 13.83 }, { value: 115609354 }] },
                        { timeStamp: new Date(2012, 2, 1, 9, 37, 0, 0), values: [{ value: 14.05 }, { value: 14.29 }, { value: 14.05 }, { value: 14.27 }, { value: 139516278 }] },
                        { timeStamp: new Date(2012, 2, 2, 9, 37, 0, 0), values: [{ value: 14.30 }, { value: 14.31 }, { value: 13.98 }, { value: 14.12 }, { value: 146239668 }] },
                        { timeStamp: new Date(2012, 2, 3, 9, 37, 0, 0), values: [{ value: 14.18 }, { value: 14.27 }, { value: 13.92 }, { value: 14.03 }, { value: 139041926 }] },
                        { timeStamp: new Date(2012, 2, 4, 9, 37, 0, 0), values: [{ value: 14.27 }, { value: 14.70 }, { value: 14.20 }, { value: 14.69 }, { value: 250546601 }] },
                        { timeStamp: new Date(2012, 2, 5, 9, 37, 0, 0), values: [{ value: 14.66 }, { value: 14.69 }, { value: 14.48 }, { value: 14.59 }, { value: 148378728 }] },
                        { timeStamp: new Date(2012, 2, 6, 9, 37, 0, 0), values: [{ value: 14.42 }, { value: 14.46 }, { value: 14.26 }, { value: 14.26 }, { value: 155649097 }] },
                        { timeStamp: new Date(2012, 2, 7, 9, 37, 0, 0), values: [{ value: 14.11 }, { value: 14.43 }, { value: 14.10 }, { value: 14.38 }, { value: 111594336 }] },
                        { timeStamp: new Date(2012, 2, 8, 9, 37, 0, 0), values: [{ value: 14.26 }, { value: 14.35 }, { value: 14.07 }, { value: 14.23 }, { value: 112180235 }] },
                        { timeStamp: new Date(2012, 2, 9, 9, 37, 0, 0), values: [{ value: 13.77 }, { value: 14.06 }, { value: 13.71 }, { value: 13.96 }, { value: 167883605 }] },
                        { timeStamp: new Date(2012, 2, 10, 9, 37, 0, 0), values: [{ value: 14.01 }, { value: 14.10 }, { value: 13.66 }, { value: 13.69 }, { value: 178753961 }] },
                        { timeStamp: new Date(2012, 2, 11, 9, 37, 0, 0), values: [{ value: 13.89 }, { value: 14.04 }, { value: 13.75 }, { value: 13.98 }, { value: 131784620 }] },
                        { timeStamp: new Date(2012, 2, 12, 9, 37, 0, 0), values: [{ value: 14.20 }, { value: 14.29 }, { value: 13.98 }, { value: 14.04 }, { value: 199257454 }] },
                        { timeStamp: new Date(2012, 2, 13, 9, 37, 0, 0), values: [{ value: 14.20 }, { value: 14.22 }, { value: 13.90 }, { value: 14.05 }, { value: 114396968 }] },
                        { timeStamp: new Date(2012, 2, 14, 9, 37, 0, 0), values: [{ value: 14.04 }, { value: 14.05 }, { value: 13.88 }, { value: 13.88 }, { value: 86449108 }] },
                        { timeStamp: new Date(2012, 2, 15, 9, 37, 0, 0), values: [{ value: 13.72 }, { value: 13.74 }, { value: 13.37 }, { value: 13.65 }, { value: 230635542 }] },
                        { timeStamp: new Date(2012, 2, 16, 9, 37, 0, 0), values: [{ value: 13.56 }, { value: 13.59 }, { value: 13.32 }, { value: 13.48 }, { value: 170865143 }] },
                        { timeStamp: new Date(2012, 2, 17, 9, 37, 0, 0), values: [{ value: 13.49 }, { value: 13.53 }, { value: 13.32 }, { value: 13.34 }, { value: 115332233 }] },
                        { timeStamp: new Date(2012, 2, 18, 9, 37, 0, 0), values: [{ value: 13.42 }, { value: 13.56 }, { value: 13.37 }, { value: 13.37 }, { value: 78642394 }] },
                        { timeStamp: new Date(2012, 2, 19, 9, 37, 0, 0), values: [{ value: 13.41 }, { value: 13.41 }, { value: 13.16 }, { value: 13.35 }, { value: 117741630 }] },
                        { timeStamp: new Date(2012, 2, 20, 9, 37, 0, 0), values: [{ value: 13.40 }, { value: 13.56 }, { value: 13.27 }, { value: 13.45 }, { value: 121113035 }] },
                        { timeStamp: new Date(2012, 2, 21, 9, 37, 0, 0), values: [{ value: 13.35 }, { value: 13.39 }, { value: 13.29 }, { value: 13.33 }, { value: 87122914 }] },
                        { timeStamp: new Date(2012, 2, 22, 9, 37, 0, 0), values: [{ value: 13.45 }, { value: 13.61 }, { value: 13.35 }, { value: 13.37 }, { value: 95052790 }] },
                        { timeStamp: new Date(2012, 2, 23, 9, 37, 0, 0), values: [{ value: 13.40 }, { value: 13.59 }, { value: 13.40 }, { value: 13.44 }, { value: 71139078 }] },
                        { timeStamp: new Date(2012, 2, 24, 9, 37, 0, 0), values: [{ value: 13.43 }, { value: 13.50 }, { value: 13.37 }, { value: 13.47 }, { value: 65763004 }] },
                        { timeStamp: new Date(2012, 2, 25, 9, 37, 0, 0), values: [{ value: 13.60 }, { value: 13.78 }, { value: 13.53 }, { value: 13.72 }, { value: 136154424 }] },
                        { timeStamp: new Date(2012, 2, 26, 9, 37, 0, 0), values: [{ value: 13.79 }, { value: 13.88 }, { value: 13.54 }, { value: 13.61 }, { value: 119233696 }] },
                        { timeStamp: new Date(2012, 2, 27, 9, 37, 0, 0), values: [{ value: 13.63 }, { value: 13.72 }, { value: 13.45 }, { value: 13.48 }, { value: 87742979 }] },
                        { timeStamp: new Date(2012, 2, 28, 9, 37, 0, 0), values: [{ value: 13.50 }, { value: 13.59 }, { value: 13.43 }, { value: 13.49 }, { value: 63352850 }] },
                        { timeStamp: new Date(2012, 2, 29, 9, 37, 0, 0), values: [{ value: 13.40 }, { value: 13.58 }, { value: 13.31 }, { value: 13.47 }, { value: 100578453 }] },
                        { timeStamp: new Date(2012, 2, 30, 9, 37, 0, 0), values: [{ value: 13.61 }, { value: 13.64 }, { value: 13.21 }, { value: 13.27 }, { value: 124675884 }] },
                        { timeStamp: new Date(2012, 2, 31, 9, 37, 0, 0), values: [{ value: 13.16 }, { value: 13.26 }, { value: 13.07 }, { value: 13.13 }, { value: 115641585 }] }];

                    (function () {
                        var ua = navigator.userAgent.toLowerCase();
                        var isAndroid = ua.indexOf("android") > -1;
                        var isiPad = ua.indexOf("ipad") > -1;
                        if (isAndroid || isiPad) {
                            userInteractiontype = userInteractionTypes.mobile;
                            crosshairDelay = 1000;
                            dataTipDelay = 1000;
                        } else {
                            userInteractiontype = userInteractionTypes.desktop;
                            crosshairDelay = 0;
                            dataTipDelay = 500;
                        }
                        
                        
                    })();

                    function getLocaleShortDateString(d) {
                        var f = { "ar-SA": "dd/MM/yy", "bg-BG": "dd.M.yyyy", "ca-ES": "dd/MM/yyyy", "zh-TW": "yyyy/M/d", "cs-CZ": "d.M.yyyy", "da-DK": "dd-MM-yyyy", "de-DE": "dd.MM.yyyy", "el-GR": "d/M/yyyy", "en-US": "M/d/yyyy", "fi-FI": "d.M.yyyy", "fr-FR": "dd/MM/yyyy", "he-IL": "dd/MM/yyyy", "hu-HU": "yyyy. MM. dd.", "is-IS": "d.M.yyyy", "it-IT": "dd/MM/yyyy", "ja-JP": "yyyy/MM/dd", "ko-KR": "yyyy-MM-dd", "nl-NL": "d-M-yyyy", "nb-NO": "dd.MM.yyyy", "pl-PL": "yyyy-MM-dd", "pt-BR": "d/M/yyyy", "ro-RO": "dd.MM.yyyy", "ru-RU": "dd.MM.yyyy", "hr-HR": "d.M.yyyy", "sk-SK": "d. M. yyyy", "sq-AL": "yyyy-MM-dd", "sv-SE": "yyyy-MM-dd", "th-TH": "d/M/yyyy", "tr-TR": "dd.MM.yyyy", "ur-PK": "dd/MM/yyyy", "id-ID": "dd/MM/yyyy", "uk-UA": "dd.MM.yyyy", "be-BY": "dd.MM.yyyy", "sl-SI": "d.M.yyyy", "et-EE": "d.MM.yyyy", "lv-LV": "yyyy.MM.dd.", "lt-LT": "yyyy.MM.dd", "fa-IR": "MM/dd/yyyy", "vi-VN": "dd/MM/yyyy", "hy-AM": "dd.MM.yyyy", "az-Latn-AZ": "dd.MM.yyyy", "eu-ES": "yyyy/MM/dd", "mk-MK": "dd.MM.yyyy", "af-ZA": "yyyy/MM/dd", "ka-GE": "dd.MM.yyyy", "fo-FO": "dd-MM-yyyy", "hi-IN": "dd-MM-yyyy", "ms-MY": "dd/MM/yyyy", "kk-KZ": "dd.MM.yyyy", "ky-KG": "dd.MM.yy", "sw-KE": "M/d/yyyy", "uz-Latn-UZ": "dd/MM yyyy", "tt-RU": "dd.MM.yyyy", "pa-IN": "dd-MM-yy", "gu-IN": "dd-MM-yy", "ta-IN": "dd-MM-yyyy", "te-IN": "dd-MM-yy", "kn-IN": "dd-MM-yy", "mr-IN": "dd-MM-yyyy", "sa-IN": "dd-MM-yyyy", "mn-MN": "yy.MM.dd", "gl-ES": "dd/MM/yy", "kok-IN": "dd-MM-yyyy", "syr-SY": "dd/MM/yyyy", "dv-MV": "dd/MM/yy", "ar-IQ": "dd/MM/yyyy", "zh-CN": "yyyy/M/d", "de-CH": "dd.MM.yyyy", "en-GB": "dd/MM/yyyy", "es-MX": "dd/MM/yyyy", "fr-BE": "d/MM/yyyy", "it-CH": "dd.MM.yyyy", "nl-BE": "d/MM/yyyy", "nn-NO": "dd.MM.yyyy", "pt-PT": "dd-MM-yyyy", "sr-Latn-CS": "d.M.yyyy", "sv-FI": "d.M.yyyy", "az-Cyrl-AZ": "dd.MM.yyyy", "ms-BN": "dd/MM/yyyy", "uz-Cyrl-UZ": "dd.MM.yyyy", "ar-EG": "dd/MM/yyyy", "zh-HK": "d/M/yyyy", "de-AT": "dd.MM.yyyy", "en-AU": "d/MM/yyyy", "es-ES": "dd/MM/yyyy", "fr-CA": "yyyy-MM-dd", "sr-Cyrl-CS": "d.M.yyyy", "ar-LY": "dd/MM/yyyy", "zh-SG": "d/M/yyyy", "de-LU": "dd.MM.yyyy", "en-CA": "dd/MM/yyyy", "es-GT": "dd/MM/yyyy", "fr-CH": "dd.MM.yyyy", "ar-DZ": "dd-MM-yyyy", "zh-MO": "d/M/yyyy", "de-LI": "dd.MM.yyyy", "en-NZ": "d/MM/yyyy", "es-CR": "dd/MM/yyyy", "fr-LU": "dd/MM/yyyy", "ar-MA": "dd-MM-yyyy", "en-IE": "dd/MM/yyyy", "es-PA": "MM/dd/yyyy", "fr-MC": "dd/MM/yyyy", "ar-TN": "dd-MM-yyyy", "en-ZA": "yyyy/MM/dd", "es-DO": "dd/MM/yyyy", "ar-OM": "dd/MM/yyyy", "en-JM": "dd/MM/yyyy", "es-VE": "dd/MM/yyyy", "ar-YE": "dd/MM/yyyy", "en-029": "MM/dd/yyyy", "es-CO": "dd/MM/yyyy", "ar-SY": "dd/MM/yyyy", "en-BZ": "dd/MM/yyyy", "es-PE": "dd/MM/yyyy", "ar-JO": "dd/MM/yyyy", "en-TT": "dd/MM/yyyy", "es-AR": "dd/MM/yyyy", "ar-LB": "dd/MM/yyyy", "en-ZW": "M/d/yyyy", "es-EC": "dd/MM/yyyy", "ar-KW": "dd/MM/yyyy", "en-PH": "M/d/yyyy", "es-CL": "dd-MM-yyyy", "ar-AE": "dd/MM/yyyy", "es-UY": "dd/MM/yyyy", "ar-BH": "dd/MM/yyyy", "es-PY": "dd/MM/yyyy", "ar-QA": "dd/MM/yyyy", "es-BO": "dd/MM/yyyy", "es-SV": "dd/MM/yyyy", "es-HN": "dd/MM/yyyy", "es-NI": "dd/MM/yyyy", "es-PR": "dd/MM/yyyy", "am-ET": "d/M/yyyy", "tzm-Latn-DZ": "dd-MM-yyyy", "iu-Latn-CA": "d/MM/yyyy", "sma-NO": "dd.MM.yyyy", "mn-Mong-CN": "yyyy/M/d", "gd-GB": "dd/MM/yyyy", "en-MY": "d/M/yyyy", "prs-AF": "dd/MM/yy", "bn-BD": "dd-MM-yy", "wo-SN": "dd/MM/yyyy", "rw-RW": "M/d/yyyy", "qut-GT": "dd/MM/yyyy", "sah-RU": "MM.dd.yyyy", "gsw-FR": "dd/MM/yyyy", "co-FR": "dd/MM/yyyy", "oc-FR": "dd/MM/yyyy", "mi-NZ": "dd/MM/yyyy", "ga-IE": "dd/MM/yyyy", "se-SE": "yyyy-MM-dd", "br-FR": "dd/MM/yyyy", "smn-FI": "d.M.yyyy", "moh-CA": "M/d/yyyy", "arn-CL": "dd-MM-yyyy", "ii-CN": "yyyy/M/d", "dsb-DE": "d. M. yyyy", "ig-NG": "d/M/yyyy", "kl-GL": "dd-MM-yyyy", "lb-LU": "dd/MM/yyyy", "ba-RU": "dd.MM.yy", "nso-ZA": "yyyy/MM/dd", "quz-BO": "dd/MM/yyyy", "yo-NG": "d/M/yyyy", "ha-Latn-NG": "d/M/yyyy", "fil-PH": "M/d/yyyy", "ps-AF": "dd/MM/yy", "fy-NL": "d-M-yyyy", "ne-NP": "M/d/yyyy", "se-NO": "dd.MM.yyyy", "iu-Cans-CA": "d/M/yyyy", "sr-Latn-RS": "d.M.yyyy", "si-LK": "yyyy-MM-dd", "sr-Cyrl-RS": "d.M.yyyy", "lo-LA": "dd/MM/yyyy", "km-KH": "yyyy-MM-dd", "cy-GB": "dd/MM/yyyy", "bo-CN": "yyyy/M/d", "sms-FI": "d.M.yyyy", "as-IN": "dd-MM-yyyy", "ml-IN": "dd-MM-yy", "en-IN": "dd-MM-yyyy", "or-IN": "dd-MM-yy", "bn-IN": "dd-MM-yy", "tk-TM": "dd.MM.yy", "bs-Latn-BA": "d.M.yyyy", "mt-MT": "dd/MM/yyyy", "sr-Cyrl-ME": "d.M.yyyy", "se-FI": "d.M.yyyy", "zu-ZA": "yyyy/MM/dd", "xh-ZA": "yyyy/MM/dd", "tn-ZA": "yyyy/MM/dd", "hsb-DE": "d. M. yyyy", "bs-Cyrl-BA": "d.M.yyyy", "tg-Cyrl-TJ": "dd.MM.yy", "sr-Latn-BA": "d.M.yyyy", "smj-NO": "dd.MM.yyyy", "rm-CH": "dd/MM/yyyy", "smj-SE": "yyyy-MM-dd", "quz-EC": "dd/MM/yyyy", "quz-PE": "dd/MM/yyyy", "hr-BA": "d.M.yyyy.", "sr-Latn-ME": "d.M.yyyy", "sma-SE": "yyyy-MM-dd", "en-SG": "d/M/yyyy", "ug-CN": "yyyy-M-d", "sr-Cyrl-BA": "d.M.yyyy", "es-US": "M/d/yyyy" };

                        var l = navigator.language ? navigator.language : navigator['userLanguage'], y = d.getFullYear(), m = d.getMonth() + 1, d = d.getDate();
                        f = (l in f) ? f[l] : "MM/dd/yyyy";
                        function z(s) { s = '' + s; return s.length > 1 ? s : '0' + s; }
                        f = f.replace(/yyyy/, y); f = f.replace(/yy/, String(y).substr(2));
                        f = f.replace(/MM/, z(m)); f = f.replace(/M/, m);
                        f = f.replace(/dd/, z(d)); f = f.replace(/d/, d);
                        return f;
                    }

                    var getDataTipSettings = function (graph) {
                        var result = {
                            style: {
                                domElement: {
                                    cssText: 'z-index:30000; font-size:12px;font-family:Arial;',//'z-index:27998',
                                    cssClass: 'ui-dt-host1'
                                },
                                table: {
                                    cssText: undefined,
                                    cssClass: 'ui-dt-table1'
                                },
                                fields: {
                                    cssText: undefined,
                                    cssClass: 'ui-dt-field1'
                                },
                                symbols: {
                                    cssText: undefined,
                                    cssClass: 'ui-dt-symbol1'
                                },
                                crosshairValues: {
                                    cssText: undefined,
                                    cssClass: 'ui-dt-crosshair'
                                },
                                data: {
                                    cssText: undefined,
                                    cssClass: 'ui-dt-data1'
                                }
                            },
                            time: {
                                cssText: undefined,
                                cssClass: 'ui-dt-time',
                                formatter: function (time) {
                                    var result = '';
                                    if (time) {
                                        result = getLocaleShortDateString(time);
                                    }
                                    return result;
                                }
                            },
                            fields: [{
                                data: 'Open',
                                cssText: undefined,
                                cssClass: undefined,
                                visible: true
                            }, {
                                data: 'High',
                                cssText: undefined,
                                cssClass: undefined,
                                visible: true
                            }, {
                                data: 'Low',
                                cssText: undefined,
                                cssClass: undefined,
                                visible: true
                            }, {
                                data: 'Close',
                                cssText: undefined,
                                cssClass: undefined,
                                visible: true
                            }, {
                                data: 'Volume',
                                cssText: undefined,
                                cssClass: undefined,
                                visible: graph > 0
                            }],
                            symbols: [{
                                data: 'C',
                                cssText: undefined,
                                cssClass: undefined,
                                visible: true
                            }],
                            crosshairValues: [{
                                data: '',
                                cssClass: undefined
                            }]
                        };

                        if (graph === 0) {
                            result.data =
                                [
                                    [{
                                        graph: 0,
                                        axis: 0,
                                        serie: 0,
                                        key: 0
                                    },
                                        {
                                            graph: 0,
                                            axis: 0,
                                            serie: 0,
                                            key: 1
                                        },
                                        {
                                            graph: 0,
                                            axis: 0,
                                            serie: 0,
                                            key: 2
                                        },
                                        {
                                            graph: 0,
                                            axis: 0,
                                            serie: 0,
                                            key: 3
                                        },
                                        {
                                            graph: 0,
                                            axis: 0,
                                            serie: 0,
                                            key: 4
                                        }]
                                ];
                        } else {
                            result.data =
                                [
                                    [{
                                        graph: 0,
                                        axis: 0,
                                        serie: 0,
                                        key: 0
                                    },
                                        {
                                            graph: 0,
                                            axis: 0,
                                            serie: 0,
                                            key: 1
                                        },
                                        {
                                            graph: 0,
                                            axis: 0,
                                            serie: 0,
                                            key: 2
                                        },
                                        {
                                            graph: 0,
                                            axis: 0,
                                            serie: 0,
                                            key: 3
                                        },
                                        {
                                            graph: 0,
                                            axis: 0,
                                            serie: 0,
                                            key: 4
                                        }]
                                ];
                        }
                        return result;
                    };

                    intBroker.pluginsStack.push(
                        new DrawingObjectCreator({
                            $domElement: $container,
                            defaultAxisIndex: 0,
                            isActive: false,
                            isPersistent: false,
                            beforeAddCallback: function (objectSettings) {
                                return true;
                            },
                            afterAddCallback: function (serie) {
                            },
                            objectSettingsTemplate: null
                        })
                    );

                    intBroker.pluginsStack.push(new Selection());
                    intBroker.pluginsStack.push(
                            new DrawingObjectEditor({
                                $domElement: $container,
                                autoSnapSensibility: 10,
                                autoSnapCallback: function (snapTos) {
                                    var snapTo = null, length = snapTos.length, index = null, i, shortestDistance = Number.MAX_VALUE, distance;
                                    for (i = 0; i < length; i++) {

                                        snapTo = snapTos[i];

                                        distance = Math.sqrt(Math.pow(snapTo.distanceX, 2) + Math.pow(snapTo.distanceY, 2));

                                        if (shortestDistance > distance) {
                                            index = i;
                                            shortestDistance = distance;
                                        }
                                    }
                                    return index === null ? false : snapTos[index];
                                }
                            })
                        );


                    var datatip = new Datatip(
                        {
                            alwaysEnabled: false,
                            forwardEvent: true,
                            onRetrieveSettings: getDataTipSettings,
                            delay: dataTipDelay
                        });

                    window.datatip = datatip;

                    intBroker.pluginsStack.push(datatip);

                    intBroker.pluginsStack.push(new Crosshair({ $domElement: $container, delay: crosshairDelay }));
                    HorizontalZoom = new HorizontalZoom();
                    intBroker.pluginsStack.push(HorizontalZoom);
                    intBroker.pluginsStack.push(new VerticalZoom());

                    window.chart = new Chart($container, {
                        painterFactory: seriePainterFactory,
                        resourceManager: resourceMananger,
                        userInteractionType: userInteractiontype,
                        onEventCallback: function (eventType, eventObject) {
                            return intBroker.onEventCallback(eventType, eventObject);
                        },
                        xAxis: {
                            limits: 'auto',
                            maximumNumberOfVisibleBars: 100,
                            minimumNumberOfVisibleBars: 5,
                            showLabels: true,
                            showVerticalLines: true
                        },
                        graphs: [{
                            realEstatePercentage: 70,
                            axes: [{
                                position: 'right',
                                showHorizontalLines: true,
                                showLabels: true,
                                limits: 'auto',
                                fixed: {
                                    maxValue: 15.31,
                                    minValue: 4.92
                                },
                                scalingType: 'linear',
                                minMove: 0.01,
                                numberFormat: 3,
                                series: [{
                                    data: barData,
                                    limits: {
                                        time: {
                                            minValueIndex: 40,
                                            minValue: null,
                                            maxValueIndex: 200,
                                            maxValue: null
                                        },
                                        value: {
                                            minValueIndex: null,
                                            minValue: null,
                                            maxValueIndex: null,
                                            maxValue: null
                                        }
                                    },
                                    layers: [{
                                        isSelected: false,
                                        chartType: {
                                            name: "candlestick",
                                            settings: {
                                                draw: {
                                                    colorBear: '255, 0, 0',
                                                    colorBull: '0, 0, 255',
                                                    width: 0.5      // (px)
                                                },
                                                selection: {
                                                    squareSide: 8,
                                                    color: '255, 255, 255',
                                                    width: 0.5
                                                },
                                                indication: {
                                                    fontColor: '0,0,0'
                                                }

                                            },
                                            dataPointDefinitions: [{
                                                key: 0
                                            }, {
                                                key: 1
                                            }, {
                                                key: 2
                                            }, {
                                                key: 3,
                                                indication: true
                                            }]
                                        }

                                    }]
                                }]
                            },
                            {
                                position: 'left',
                                showHorizontalLines: false,
                                showLabels: true,
                                limits: 'auto',
                                fixed: {
                                    maxValue: 15.31,
                                    minValue: 4.92
                                },
                                scalingType: 'linear',
                                minMove: 0.01,
                                numberFormat: 3,
                                series: [{
                                    data: barData,
                                    limits: {
                                        time: {
                                            minValueIndex: 40,
                                            minValue: null,
                                            maxValueIndex: 200,
                                            maxValue: null
                                        },
                                        value: {
                                            minValueIndex: null,
                                            minValue: null,
                                            maxValueIndex: null,
                                            maxValue: null
                                        }
                                    },
                                    layers: [{
                                        isSelected: false,
                                        chartType: {
                                            name: "line",
                                            settings: {
                                                draw: {
                                                    color: '255, 0, 0',
                                                    width: 0.5      // (px)
                                                },
                                                selection: {
                                                    squareSide: 8,
                                                    color: '255, 255, 255',
                                                    width: 0.5
                                                },
                                                indication: {
                                                    fontColor: '0,0,0'
                                                }

                                            },
                                            dataPointDefinitions: [{
                                                key: 2
                                            }]
                                        }

                                    }]
                                }]
                            }
                            ],
                            header: {
                                domElement: "<div style='width:100%; text-align:left;font-size: 10px; font-family:arial;'><span style='color: White'>Candle Stick Blue/Red</span></div>",
                                onRectChanged: function (rect) {
                                },
                                height: 12
                            }
                        },
                        {
                            realEstatePercentage: 15,
                            axes: [{
                                position: 'right',
                                showHorizontalLines: false,
                                showLabels: true,
                                limits: 'auto',
                                fixed: {
                                    maxValue: 15.31,
                                    minValue: 4.92
                                },
                                scalingType: 'linear',
                                minMove: 0.01,
                                numberFormat: 3,
                                series: [{
                                    data: barData,
                                    limits: {
                                        time: {
                                            minValueIndex: 40,
                                            minValue: null,
                                            maxValueIndex: 200,
                                            maxValue: null
                                        },
                                        value: {
                                            minValueIndex: null,
                                            minValue: null,
                                            maxValueIndex: null,
                                            maxValue: null
                                        }
                                    },
                                    layers: [{
                                        isSelected: false,
                                        chartType: {
                                            name: "line",
                                            settings: {
                                                draw: {
                                                    color: '255, 0, 0',
                                                    width: 2.5      // (px)
                                                },
                                                selection: {
                                                    squareSide: 8,
                                                    color: '255, 255, 255',
                                                    width: 0.5
                                                },
                                                indication: {
                                                    fontColor: '0,0,0'
                                                }

                                            },
                                            dataPointDefinitions: [{
                                                key: 2
                                            }]
                                        }

                                    }]
                                }]
                            }
                            ],
                            header: {
                                domElement: "<div style='width:100%; text-align:left;font-size: 10px; font-family:arial;'><span style='color: White'>Candle Stick Blue/Red</span></div>",
                                onRectChanged: function (rect) {
                                },
                                height: 12
                            }
                        },
                        {
                            realEstatePercentage: 15,
                            axes: [{
                                position: 'left',
                                showHorizontalLines: false,
                                showLabels: true,
                                limits: 'auto',
                                fixed: {
                                    maxValue: 15.31,
                                    minValue: 4.92
                                },
                                scalingType: 'linear',
                                minMove: 0.01,
                                numberFormat: 3,
                                series: [{
                                    data: barData,
                                    limits: {
                                        time: {
                                            minValueIndex: 40,
                                            minValue: null,
                                            maxValueIndex: 200,
                                            maxValue: null
                                        },
                                        value: {
                                            minValueIndex: null,
                                            minValue: null,
                                            maxValueIndex: null,
                                            maxValue: null
                                        }
                                    },
                                    layers: [{
                                        isSelected: false,
                                        chartType: {
                                            name: "line",
                                            settings: {
                                                draw: {
                                                    color: '255, 255, 0',
                                                    width: 2.5      // (px)
                                                },
                                                selection: {
                                                    squareSide: 8,
                                                    color: '255, 255, 255',
                                                    width: 0.5
                                                },
                                                indication: {
                                                    fontColor: '0,0,0'
                                                }

                                            },
                                            dataPointDefinitions: [{
                                                key: 3
                                            }]
                                        }

                                    }]
                                }]
                            }
                            ],
                            header: {
                                domElement: "<div style='width:100%; text-align:left;font-size: 10px; font-family:arial;'><span style='color: White'>Candle Stick Blue/Red</span></div>",
                                onRectChanged: function (rect) {
                                },
                                height: 12
                            }
                        }],
                        style: {
                            backgroundColor: '#000',
                            axes: {
                                color: 'rgba(62, 65, 70,1)',
                                width: 1
                            },
                            label: {
                                color: 'rgba(235, 235, 235, 1)',
                                font: 'normal 11px AramidBook'
                            },
                            grid: {
                                intraDayColor: 'rgba(23, 26, 32, 1)',
                                horizontalColor: 'rgba(23, 26, 32, 1)',
                                noIntraDayColor: 'rgba(41, 45, 53, 1)',
                                width: 1
                            },
                            crosshair: {
                                draw: {
                                    color: 'rgba(0, 255, 255, 1)',
                                    width: 1
                                },
                                indication: {
                                    color: 'rgba(0, 0, 0, 1)',
                                    font: 'normal 11px AramidBook'
                                }
                            }
                        },
                        onViewPortLeftMarginChange: function (margin) { },
                        onViewPortRightMarginChange: function (margin) { }
                    });

                    var isScrolling, prevHeaderRect, currentHeaderRect;

                    window.superScroller = new HorizontalScrollBar($container, {
                        totalRange: {
                            minValue: 0,
                            maxValue: window.chart.xAxis().totalRangeMax()
                        },
                        activeRange: {
                            minValue: window.chart.xAxis().getActualLimits().minValueIndex,
                            maxValue: window.chart.xAxis().getActualLimits().maxValueIndex
                        },
                        leftHandleMarging: currentViewPortLeftMargin,
                        rightHandleMarging: currentViewPortRightMargin,
                        onBeginRangeChangeCallback: function () {
                            isScrolling = true;
                        },
                        onRangeChangeCallback: function (range) {
                            var actualLimits = window.chart.xAxis().getActualLimits();
                            if (range.minValue !== actualLimits.minValueIndex || range.maxValue !== actualLimits.maxValueIndex) {
                                window.chart.xAxis().limits({
                                    minValueIndex: range.minValue,
                                    maxValueIndex: range.maxValue
                                });
                            }
                        },
                        onEndRangeChangeCallback: function () {
                            isScrolling = false;

                            if (prevViewPortRightMargin !== currentViewPortRightMargin) {
                                prevViewPortRightMargin = currentViewPortRightMargin;
                                window.scrollbar.rightHandleMarging(currentViewPortRightMargin);
                            }

                            if (prevViewPortLeftMargin !== currentViewPortLeftMargin) {
                                prevViewPortLeftMargin = currentViewPortLeftMargin;
                                window.scrollbar.rightHandleMarging(currentViewPortLeftMargin);
                            }

                            if (prevHeaderRect.rigth !== currentHeaderRect.right || prevHeaderRect.left !== currentHeaderRect.left) {
                                //window.statusLineRenderer.rect(currentHeaderRect);
                                prevHeaderRect = currentHeaderRect;
                            }
                        }
                    });


                });

                var resizeTimer;
                $(window).resize(function () {
                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(chartResize, 100);
                });

                function chartResize() {
                    window.chart.resize();
                };

                Ext.onReady(function () {
                    window.chart.resize();
                    /*$("#sortable").sortable();
                    $("#sortable").disableSelection();*/
                });

            });

        });
    });