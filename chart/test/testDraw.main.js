requirejs.config({
    baseUrl: '../',
    paths: {
        'chart': './src/chart',
        'plugins': './src/plugins',
        'common': './src/common',
        'lib': './src/lib',
        'i18n': './src/lib/i18n',
        'test': './test',

        'knockout': './src/shared/knockout',
        'pubsub': './src/shared/pubsub',
        'localLib/on': './src/shared/on',
        'localLib/mouse': './src/shared/mouse',
        'localLib/logger': './src/shared/logger',
        'has': './src/shared/has',
        'EventEmitter': './src/shared/EventEmitter',
        'localLib/Evented': './src/shared/Evented',
        'dcl': './src/shared/dcl-master',
        'jquery':'./src/shared/jquery-latest'
    }
});
function getLocaleShortDateString(d) {
    var
    f = { "ar-SA": "dd/MM/yy", "bg-BG": "dd.M.yyyy", "ca-ES": "dd/MM/yyyy", "zh-TW": "yyyy/M/d", "cs-CZ": "d.M.yyyy", "da-DK": "dd-MM-yyyy", "de-DE": "dd.MM.yyyy", "el-GR": "d/M/yyyy", "en-US": "M/d/yyyy", "fi-FI": "d.M.yyyy", "fr-FR": "dd/MM/yyyy", "he-IL": "dd/MM/yyyy", "hu-HU": "yyyy. MM. dd.", "is-IS": "d.M.yyyy", "it-IT": "dd/MM/yyyy", "ja-JP": "yyyy/MM/dd", "ko-KR": "yyyy-MM-dd", "nl-NL": "d-M-yyyy", "nb-NO": "dd.MM.yyyy", "pl-PL": "yyyy-MM-dd", "pt-BR": "d/M/yyyy", "ro-RO": "dd.MM.yyyy", "ru-RU": "dd.MM.yyyy", "hr-HR": "d.M.yyyy", "sk-SK": "d. M. yyyy", "sq-AL": "yyyy-MM-dd", "sv-SE": "yyyy-MM-dd", "th-TH": "d/M/yyyy", "tr-TR": "dd.MM.yyyy", "ur-PK": "dd/MM/yyyy", "id-ID": "dd/MM/yyyy", "uk-UA": "dd.MM.yyyy", "be-BY": "dd.MM.yyyy", "sl-SI": "d.M.yyyy", "et-EE": "d.MM.yyyy", "lv-LV": "yyyy.MM.dd.", "lt-LT": "yyyy.MM.dd", "fa-IR": "MM/dd/yyyy", "vi-VN": "dd/MM/yyyy", "hy-AM": "dd.MM.yyyy", "az-Latn-AZ": "dd.MM.yyyy", "eu-ES": "yyyy/MM/dd", "mk-MK": "dd.MM.yyyy", "af-ZA": "yyyy/MM/dd", "ka-GE": "dd.MM.yyyy", "fo-FO": "dd-MM-yyyy", "hi-IN": "dd-MM-yyyy", "ms-MY": "dd/MM/yyyy", "kk-KZ": "dd.MM.yyyy", "ky-KG": "dd.MM.yy", "sw-KE": "M/d/yyyy", "uz-Latn-UZ": "dd/MM yyyy", "tt-RU": "dd.MM.yyyy", "pa-IN": "dd-MM-yy", "gu-IN": "dd-MM-yy", "ta-IN": "dd-MM-yyyy", "te-IN": "dd-MM-yy", "kn-IN": "dd-MM-yy", "mr-IN": "dd-MM-yyyy", "sa-IN": "dd-MM-yyyy", "mn-MN": "yy.MM.dd", "gl-ES": "dd/MM/yy", "kok-IN": "dd-MM-yyyy", "syr-SY": "dd/MM/yyyy", "dv-MV": "dd/MM/yy", "ar-IQ": "dd/MM/yyyy", "zh-CN": "yyyy/M/d", "de-CH": "dd.MM.yyyy", "en-GB": "dd/MM/yyyy", "es-MX": "dd/MM/yyyy", "fr-BE": "d/MM/yyyy", "it-CH": "dd.MM.yyyy", "nl-BE": "d/MM/yyyy", "nn-NO": "dd.MM.yyyy", "pt-PT": "dd-MM-yyyy", "sr-Latn-CS": "d.M.yyyy", "sv-FI": "d.M.yyyy", "az-Cyrl-AZ": "dd.MM.yyyy", "ms-BN": "dd/MM/yyyy", "uz-Cyrl-UZ": "dd.MM.yyyy", "ar-EG": "dd/MM/yyyy", "zh-HK": "d/M/yyyy", "de-AT": "dd.MM.yyyy", "en-AU": "d/MM/yyyy", "es-ES": "dd/MM/yyyy", "fr-CA": "yyyy-MM-dd", "sr-Cyrl-CS": "d.M.yyyy", "ar-LY": "dd/MM/yyyy", "zh-SG": "d/M/yyyy", "de-LU": "dd.MM.yyyy", "en-CA": "dd/MM/yyyy", "es-GT": "dd/MM/yyyy", "fr-CH": "dd.MM.yyyy", "ar-DZ": "dd-MM-yyyy", "zh-MO": "d/M/yyyy", "de-LI": "dd.MM.yyyy", "en-NZ": "d/MM/yyyy", "es-CR": "dd/MM/yyyy", "fr-LU": "dd/MM/yyyy", "ar-MA": "dd-MM-yyyy", "en-IE": "dd/MM/yyyy", "es-PA": "MM/dd/yyyy", "fr-MC": "dd/MM/yyyy", "ar-TN": "dd-MM-yyyy", "en-ZA": "yyyy/MM/dd", "es-DO": "dd/MM/yyyy", "ar-OM": "dd/MM/yyyy", "en-JM": "dd/MM/yyyy", "es-VE": "dd/MM/yyyy", "ar-YE": "dd/MM/yyyy", "en-029": "MM/dd/yyyy", "es-CO": "dd/MM/yyyy", "ar-SY": "dd/MM/yyyy", "en-BZ": "dd/MM/yyyy", "es-PE": "dd/MM/yyyy", "ar-JO": "dd/MM/yyyy", "en-TT": "dd/MM/yyyy", "es-AR": "dd/MM/yyyy", "ar-LB": "dd/MM/yyyy", "en-ZW": "M/d/yyyy", "es-EC": "dd/MM/yyyy", "ar-KW": "dd/MM/yyyy", "en-PH": "M/d/yyyy", "es-CL": "dd-MM-yyyy", "ar-AE": "dd/MM/yyyy", "es-UY": "dd/MM/yyyy", "ar-BH": "dd/MM/yyyy", "es-PY": "dd/MM/yyyy", "ar-QA": "dd/MM/yyyy", "es-BO": "dd/MM/yyyy", "es-SV": "dd/MM/yyyy", "es-HN": "dd/MM/yyyy", "es-NI": "dd/MM/yyyy", "es-PR": "dd/MM/yyyy", "am-ET": "d/M/yyyy", "tzm-Latn-DZ": "dd-MM-yyyy", "iu-Latn-CA": "d/MM/yyyy", "sma-NO": "dd.MM.yyyy", "mn-Mong-CN": "yyyy/M/d", "gd-GB": "dd/MM/yyyy", "en-MY": "d/M/yyyy", "prs-AF": "dd/MM/yy", "bn-BD": "dd-MM-yy", "wo-SN": "dd/MM/yyyy", "rw-RW": "M/d/yyyy", "qut-GT": "dd/MM/yyyy", "sah-RU": "MM.dd.yyyy", "gsw-FR": "dd/MM/yyyy", "co-FR": "dd/MM/yyyy", "oc-FR": "dd/MM/yyyy", "mi-NZ": "dd/MM/yyyy", "ga-IE": "dd/MM/yyyy", "se-SE": "yyyy-MM-dd", "br-FR": "dd/MM/yyyy", "smn-FI": "d.M.yyyy", "moh-CA": "M/d/yyyy", "arn-CL": "dd-MM-yyyy", "ii-CN": "yyyy/M/d", "dsb-DE": "d. M. yyyy", "ig-NG": "d/M/yyyy", "kl-GL": "dd-MM-yyyy", "lb-LU": "dd/MM/yyyy", "ba-RU": "dd.MM.yy", "nso-ZA": "yyyy/MM/dd", "quz-BO": "dd/MM/yyyy", "yo-NG": "d/M/yyyy", "ha-Latn-NG": "d/M/yyyy", "fil-PH": "M/d/yyyy", "ps-AF": "dd/MM/yy", "fy-NL": "d-M-yyyy", "ne-NP": "M/d/yyyy", "se-NO": "dd.MM.yyyy", "iu-Cans-CA": "d/M/yyyy", "sr-Latn-RS": "d.M.yyyy", "si-LK": "yyyy-MM-dd", "sr-Cyrl-RS": "d.M.yyyy", "lo-LA": "dd/MM/yyyy", "km-KH": "yyyy-MM-dd", "cy-GB": "dd/MM/yyyy", "bo-CN": "yyyy/M/d", "sms-FI": "d.M.yyyy", "as-IN": "dd-MM-yyyy", "ml-IN": "dd-MM-yy", "en-IN": "dd-MM-yyyy", "or-IN": "dd-MM-yy", "bn-IN": "dd-MM-yy", "tk-TM": "dd.MM.yy", "bs-Latn-BA": "d.M.yyyy", "mt-MT": "dd/MM/yyyy", "sr-Cyrl-ME": "d.M.yyyy", "se-FI": "d.M.yyyy", "zu-ZA": "yyyy/MM/dd", "xh-ZA": "yyyy/MM/dd", "tn-ZA": "yyyy/MM/dd", "hsb-DE": "d. M. yyyy", "bs-Cyrl-BA": "d.M.yyyy", "tg-Cyrl-TJ": "dd.MM.yy", "sr-Latn-BA": "d.M.yyyy", "smj-NO": "dd.MM.yyyy", "rm-CH": "dd/MM/yyyy", "smj-SE": "yyyy-MM-dd", "quz-EC": "dd/MM/yyyy", "quz-PE": "dd/MM/yyyy", "hr-BA": "d.M.yyyy.", "sr-Latn-ME": "d.M.yyyy", "sma-SE": "yyyy-MM-dd", "en-SG": "d/M/yyyy", "ug-CN": "yyyy-M-d", "sr-Cyrl-BA": "d.M.yyyy", "es-US": "M/d/yyyy" },
    l = navigator.language ? navigator.language : navigator.userLanguage,
    y = d.getFullYear(),
    m = d.getMonth() + 1;

    d = d.getDate();

    f = (l in f) ? f[l] : "MM/dd/yyyy";
    function z(s) { s = '' + s; return s.length > 1 ? s : '0' + s; }
    f = f.replace(/yyyy/, y); f = f.replace(/yy/, String(y).substr(2));
    f = f.replace(/MM/, z(m)); f = f.replace(/M/, m);
    f = f.replace(/dd/, z(d)); f = f.replace(/d/, d);
    return f;
}

var
    dataTipDelay = 500,
    getDataTipSettings = function (graph) {
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

require([
        'jquery',
        'chart/main',

        'test/data/timestamped',
        'test/data/series',

        'plugins/resourceManager/ResourceManager',
        'plugins/interaction/broker/Broker',
        'plugins/interaction/selection/selection',
        'plugins/interaction/crosshair/crosshair',
        'plugins/interaction/drawing/DrawingCreator',
        'plugins/interaction/horizontalZoom/horizontalZoom',
        'plugins/interaction/verticalZoom/verticalZoom',
        'plugins/interaction/datatip/Datatip',
        'common/ChartTypes'
],function ($, main, data, seriesData, resourceMananger, Broker, Selection, Crosshair, DrawingCreator, HorizontalZoom, VerticalZoom, Datatip, chartTypes) {

    var $container = $('#chart'),
        additionAtPoint,
        broker = new Broker(),
        drawing,
        datatip;


    broker.add(new Selection());

    drawing = new DrawingCreator({
        $domElement: $container.get(0),
        broker:broker,
        defaultAxisIndex: 0,
        isActive: false,
        isPersistent: false,
        drawingTemplate: null
    });

    drawing.on('new', function(e){
        console.log('new drawing', e);
    });
    drawing.on('edit', function(e){
        console.log('edited a drawing', e);
    });

    document.getElementById('line').addEventListener('click', function(){
        drawing.template({
            inputAmount:2,
            layers: [{
                chartType: {
                    name: chartTypes.trendLine,
                    settings: {
                        lineStyle:'orange'
                    }
                }
            }]
        });
    }, false);
    document.getElementById('ray').addEventListener('click', function(){
        drawing.template({
            inputAmount:2,
            layers: [{
                chartType: {
                    name: chartTypes.trendRay,
                    settings: {
                        lineStyle:'purple'
                    }
                }
            }]
        });
    }, false);
    document.getElementById('horz').addEventListener('click', function(){
        drawing.template({
            inputAmount:1,
            layers: [{
                chartType: {
                    name: chartTypes.horizontalLine,
                    settings: {
                        lineStyle:'cyan'
                    }
                }
            }]
        });
    }, false);
    document.getElementById('vert').addEventListener('click', function(){
        drawing.template({
            inputAmount:1,
            layers: [{
                chartType: {
                    name: chartTypes.verticalLine,
                    settings: {
                        lineStyle:'green'
                    }
                }
            }]
        });
    }, false);
    document.getElementById('off').addEventListener('click', function(){
        drawing.template(null);
    }, false);

    document.getElementById('addDrawing').addEventListener('click', function(){
        var
            serie = {
                id:'SERIE_DYN',
                definesScaling: false,
                inputs: [{ name: 'point1', value: { timeStamp: new Date(2012, 1, 5, 9, 37, 0, 0), price: null } }],
                data: [],
                layers: [{
                    id:'LAYER_DYN',
                    isSelected: false,
                    chartType: {
                        name: "verticalLine",
                        settings: {
                            lineStyle:'red'
                        }
                    }
                }]
            },
            chain = window.chart.getChain('MAIN_GROUP');

        window.chart.addSerie(chain.graphId, chain.groupId, serie, 1);
        //group.series.add();
    }, false);

    



    //broker.pluginsStack.push(
    //    new DrawingObjectEditor({
    //);


    //broker.add(new HorizontalZoom());
    broker.add(new VerticalZoom());


    broker.add(drawing);

    broker.add(new Crosshair({ $domElement: $container }));
    datatip = new Datatip({
        alwaysEnabled: false,
        forwardEvent: true,
        onRetrieveSettings: getDataTipSettings,
        delay: dataTipDelay
    });
    
    broker.add(datatip, 0);

    
    //broker.pluginsStack.push(new Selection());


    //console.log('broker.pluginsStack', broker);


    window.chart = new main.Chart($container, {
        resourceManager: resourceMananger,
        userInteractionType: main.userInteractionTypes.desktop,
        onEventCallback: function (eventType, eventObject) {
            return broker.onEventCallback(eventType, eventObject);
        },
        xAxis: {
            limits: 'auto',
            maximumNumberOfVisibleBars: 100,
            minimumNumberOfVisibleBars: 5,
            showLabels: true,
            showVerticalLines: true
        },
        graphs: [
            //#region subgraph 1
            {
                id:'MAIN_GRAPH',
                realEstatePercentage: 1,
                axes: [{
                    id:'MAIN_GROUP',
                    position: 'right',
                    showHorizontalLines: true,
                    showLabels: true,
                    limits: 'auto',
                    scalingType: 'linear',
                    minMove: 0.01,
                    numberFormat: 3,
                    series: [{
                        id:'SERIE_DEFAULT',
                        data: data,
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
                                    lineStyle:'hotcold'
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
                    },{
                        id:'SERIE_BLUE',
                        definesScaling: false,
                        inputs: [{ name: 'point1', value: { timeStamp: new Date(2012, 1, 10, 9, 37, 0, 0), price: null } }],
                        data: [],
                        layers: [{
                            id:'LAYER_BLUE',
                            isSelected: false,
                            chartType: {
                                name: "verticalLine",
                                settings: {
                                    lineStyle:'blue'
                                }
                            }
                        }]
                    },
                    {
                        id:'SERIE_PURPLE',
                        definesScaling: false,
                        inputs: [{ name: 'point1', value: { timeStamp: null, price: 13.53 } }],
                        data: [],
                        layers: [{
                            isSelected: false,
                            chartType: {
                                name: "horizontalLine",
                                settings: {
                                    lineStyle:'purple',
                                    style:{
                                        lineStyle:'red'
                                    }
                                }
                            }
                        }]
                    },
                    {
                        definesScaling: false,
                        inputs: [{ name: 'point1', value: { timeStamp: new Date(2012, 2, 4, 9, 37, 0, 0), price: 14.70 } },
                                 { name: 'point2', value: { timeStamp: new Date(2012, 2, 30, 9, 37, 0, 0), price: 13.50 } }],
                        data: [],
                        layers: [{
                            isSelected: false,
                            chartType: {
                                name: "trendRay",
                                settings: {
                                    lineStyle:'orange'
                                }
                            }
                        }]
                    },
                    {
                        definesScaling: false,
                        inputs: [{ name: 'point1', value: { timeStamp: new Date(2012, 2, 20, 9, 37, 0, 0), price: 15.00 } },
                                 { name: 'point1', value: { timeStamp: new Date(2012, 2, 14, 9, 37, 0, 0), price: 13.80 } }],
                        data: [],
                        layers: [{
                            isSelected: false,
                            chartType: {
                                name: "trendLine",
                                settings: {
                                    lineStyle:'blue'
                                }
                            }
                        }]
                    }]

                }, {
                    position: 'left',
                    showHorizontalLines: false,
                    showLabels: true,
                    limits: 'auto',
                    scalingType: 'linear',
                    minMove: 0.01,
                    numberFormat: 3,
                    series: [{
                        data: seriesData,
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
                                    lineStyle:'purple'
                                },
                                dataPointDefinitions: [{
                                    key: 3,
                                    indication: true
                                }]
                            }
                        }]
                    }]
                }],
                header: {
                    domElement: "<div style='width:100%; text-align:center;font-size: 30px'><span style='color: blue'>Drawing Tests</span></div>",
                    onRectChanged: function (rect) {
                    },
                    height: 30
                }
            }
        ]
    });
});

