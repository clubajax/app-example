define([
    'dcl/dcl',
    'common/Utilities',
    '../defaults',
    'localLib/Evented'
], function(dcl, utilities, defaults, Evented){

    function adjust(clr, amt){
        var clrs = clr.split(',').map(function(str){
            str = parseInt(str.trim(), 10);
            str += amt;
            str = Math.min(str, 255);
            str = Math.max(str, 0);
            return str;
        });
        return clrs.join(',');
    }

    function darken(clr){
        return adjust(clr, -80);
    }

    function lighten(clr){
        return adjust(clr, 40);
    }

    var
        Settings,
        GRADIENT = [{ alpha: '0.95', offset: '0' }, { alpha: '0.05', offset: '1' }],
        FONT1 = 'normal 11px AramidBook',

        GRAY05 = '238,238,238',
        GRAY10 = '229,229,229',
        GRAY20 = '204,204,204',
        GRAY30 = '178,178,178',
        GRAY40 = '153,153,153',
        GRAY50 = '127,127,127',
        GRAY60 = '102,102,102',
        GRAY70 = '76,76,76',
        GRAY80 = '51,51,51',
        GRAY90 = '25,25,25',

        PURPLE =    '255, 0, 255',
        RED =       '255, 0, 0',
        BLUE =      '0, 0, 255',
        GREEN =     '0, 255, 0',
        ORANGE =    '255, 127, 0',
        BLACK =     '0,0,0',
        WHITE =     '255, 255, 255',
        CYAN =      '0, 255, 255',
        YELLOW =    '255, 255, 0',
        MAGENTA =   '204, 0, 255',
        MAUVE =     '211, 146, 206',
        SILVER =    '177, 186, 199',

        DARKGRIDLINES = GRAY80,
        LITEGRIDLINES = GRAY10,

        lightProps = {
            backgroundColor: '#eee',
            axis: {
                width: 1, // vertical yaxis stroke
                strokeStyle:{
                    color: 'rgb('+ GRAY90 +')',
                    width: 1 // horizontal xaxis stroke
                }
            },
            label: {
                color: 'rgb('+ BLACK +')',
                font: FONT1
            },
            grid: {
                intraDayColor: 'rgb('+ GRAY05 +')', // not using this is the tests
                horizontalColor: 'rgb('+ LITEGRIDLINES +')',
                verticalColor: 'rgb('+ LITEGRIDLINES +')',
                noIntraDayColor: 'rgb('+ LITEGRIDLINES +')',
                width: 1
            },
            crosshair: {
                draw: {
                    color: 'rgb('+ PURPLE +')',
                    width: 1
                },
                indication: {
                    color: 'rgb('+ BLACK +')',
                    fontColor: 'rgb('+ BLACK +')',
                    font: FONT1
                }
            },
            line:{
                color: 'rgba(255, 255, 0, 1)',
                width: 1
            },
            indication: {
                color: BLACK,
                font: FONT1
            },
            selection: {
                squareSide: 8,
                color: GRAY90,
                width: 0.5
            },
            draw: {
                id:'lightDraw',
                colorBear: darken(RED),
                colorBull: darken(GREEN),
                color: darken(GREEN),
                width: 0.5,
                radius:3,
                gradient: GRADIENT,
                indication: {
                    color: BLACK,
                    fontColor: WHITE,
                    font: FONT1
                },
                hotcold:{
                    id:'lightHotCold',
                    color: darken(GREEN),
                    colorBear: darken(BLUE),
                    colorBull: darken(RED),
                    width: 1,
                    gradient: GRADIENT,
                    indication: {
                        color: BLACK,
                        fontColor: WHITE,
                        font: FONT1
                    }
                },
                stopgo:{
                    id:'lightStopGo',
                    color: darken(GREEN),
                    colorBear: darken(RED),
                    colorBull: darken(GREEN),
                    width: 1,
                    gradient: GRADIENT,
                    indication: {
                        color: BLACK,
                        fontColor: WHITE,
                        font: FONT1
                    }
                },
                green:{
                    colorBear: RED,
                    colorBull: GREEN,
                    color: darken(GREEN),
                    width: 0.5,
                    radius:3,
                    gradient: GRADIENT,
                    indication: {
                        color: BLACK,
                        fontColor: WHITE,
                        font: FONT1
                    }
                },
                orange:{
                    color: darken(ORANGE),
                    colorBear: RED,
                    colorBull: GREEN,
                    width: 1,
                    gradient: GRADIENT,
                    indication: {
                        color: BLACK,
                        fontColor: WHITE,
                        font: FONT1
                    }
                },
                red:{
                    color: darken(RED),
                    colorBear: RED,
                    colorBull: GREEN,
                    width: 1,
                    gradient: GRADIENT,
                    indication: {
                        color: BLACK,
                        fontColor: WHITE,
                        font: FONT1
                    }
                },
                blue:{
                    color: darken(BLUE),
                    colorBear: RED,
                    colorBull: GREEN,
                    width: 1,
                    gradient: GRADIENT,
                    indication: {
                        color: BLACK,
                        fontColor: WHITE,
                        font: FONT1
                    }
                },
                purple:{
                    color: darken(PURPLE),
                    width: 1,
                    gradient: GRADIENT,
                    indication: {
                        color: BLACK,
                        fontColor: WHITE,
                        font: FONT1
                    }
                },
                yellow:{
                    color: darken(YELLOW),
                    width: 1,
                    gradient: GRADIENT,
                    indication: {
                        color: BLACK,
                        fontColor: WHITE,
                        font: FONT1
                    }
                },
                cyan:{
                    color: darken(CYAN),
                    width: 1,
                    gradient: GRADIENT,
                    indication: {
                        color: BLACK,
                        fontColor: WHITE,
                        font: FONT1
                    }
                },
                grey:{
                    color: darken(GRAY50),
                    width: 1,
                    gradient: GRADIENT,
                    indication: {
                        color: BLACK,
                        fontColor: WHITE,
                        font: FONT1
                    }
                },
                magenta:{
                    color: darken(MAGENTA),
                    width: 1,
                    gradient: GRADIENT,
                    indication: {
                        color: BLACK,
                        fontColor: WHITE,
                        font: FONT1
                    }
                },
                mauve:{
                    color: darken(MAUVE),
                    width: 1,
                    gradient: GRADIENT,
                    indication: {
                        color: BLACK,
                        fontColor: WHITE,
                        font: FONT1
                    }
                },
                white:{
                    color: 'rgb(249,249,249)',
                    width: 1,
                    gradient: GRADIENT,
                    indication: {
                        color: BLACK,
                        fontColor: WHITE,
                        font: FONT1
                    }
                },
                silver:{
                    color: darken(SILVER),
                    width: 1,
                    gradient: GRADIENT,
                    indication: {
                        color: BLACK,
                        fontColor: WHITE,
                        font: FONT1
                    }
                }
            }
        },

        darkProps = {
            backgroundColor: 'rgb('+ GRAY90 +')',
            axis: {
                width: 1, // vertical yaxis stroke
                strokeStyle:{
                    color: 'rgb('+ DARKGRIDLINES +')',
                    width: 1 // horizontal xaxis stroke
                }
            },
            label: {
                // for axis only, I think
                color: 'rgb('+ WHITE +')',
                font: FONT1
            },
            grid: {
                intraDayColor: 'rgb('+ GRAY90 +')', // not using this is the tests
                horizontalColor: 'rgb('+ DARKGRIDLINES +')',
                verticalColor: 'rgb('+ DARKGRIDLINES +')',
                noIntraDayColor: 'rgb('+ DARKGRIDLINES +')',
                width: 1
            },
            crosshair: {
                draw: {
                    color: 'rgb('+ GRAY20 +')',
                    width: 1
                },
                indication: {
                    color: 'rgb('+ BLACK +')',
                    fontColor: 'rgb('+ BLACK +')',
                    font: FONT1
                }
            },
            line:{
                color: 'rgba(255, 255,0, 1)',
                width: 1
            },
            indication: {
                color: BLACK,
                font: FONT1
            },
            selection: {
                squareSide: 8,
                color: GRAY10,
                width: 0.5
            },
            draw: {
                id:'darkDraw',
                color: lighten(GREEN),
                colorBear: lighten(RED),
                colorBull: lighten(GREEN),
                width: 0.5,
                radius:3,
                gradient: GRADIENT,
                indication: {
                    color: BLACK,
                    fontColor: WHITE,
                    font: FONT1
                },
                hotcold:{
                    id:'darkHotCold',
                    color: lighten(GREEN),
                    colorBear: lighten(BLUE),
                    colorBull: lighten(RED),
                    width: 1,
                    gradient: GRADIENT,
                    indication: {
                        color: BLACK,
                        fontColor: WHITE,
                        font: FONT1
                    }
                },
                stopgo:{
                    id:'darkStopGo',
                    colorBear: lighten(RED),
                    colorBull: lighten(GREEN),
                    color: lighten(CYAN),
                    width: 1,
                    gradient: GRADIENT,
                    indication: {
                        color: BLACK,
                        fontColor: WHITE,
                        font: FONT1
                    }
                },
                green:{
                    color: lighten(GREEN),
                    width: 0.5,
                    radius:3,
                    gradient: GRADIENT,
                    indication: {
                        color: BLACK,
                        fontColor: WHITE,
                        font: FONT1
                    }
                },
                orange:{
                    color: lighten(ORANGE),
                    width: 1,
                    gradient: GRADIENT,
                    indication: {
                        color: BLACK,
                        fontColor: WHITE,
                        font: FONT1
                    }
                },
                red:{
                    color: lighten(RED),
                    width: 1,
                    gradient: GRADIENT,
                    indication: {
                        color: BLACK,
                        fontColor: WHITE,
                        font: FONT1
                    }
                },
                blue:{
                    color: lighten(BLUE),
                    width: 1,
                    gradient: GRADIENT,
                    indication: {
                        color: BLACK,
                        fontColor: WHITE,
                        font: FONT1
                    }
                },
                purple:{
                    color: lighten(PURPLE),
                    width: 1,
                    gradient: GRADIENT,
                    indication: {
                        color: BLACK,
                        fontColor: WHITE,
                        font: FONT1
                    }
                },
                yellow:{
                    color: lighten(YELLOW),
                    width: 1,
                    gradient: GRADIENT,
                    indication: {
                        color: BLACK,
                        fontColor: WHITE,
                        font: FONT1
                    }
                },
                cyan:{
                    color: lighten(CYAN),
                    width: 1,
                    gradient: GRADIENT,
                    indication: {
                        color: BLACK,
                        fontColor: WHITE,
                        font: FONT1
                    }
                },
                grey:{
                    color: lighten(GRAY50),
                    width: 1,
                    gradient: GRADIENT,
                    indication: {
                        color: BLACK,
                        fontColor: WHITE,
                        font: FONT1
                    }
                },
                magenta:{
                    color: lighten(MAGENTA),
                    width: 1,
                    gradient: GRADIENT,
                    indication: {
                        color: BLACK,
                        fontColor: WHITE,
                        font: FONT1
                    }
                },
                mauve:{
                    color: lighten(MAUVE),
                    width: 1,
                    gradient: GRADIENT,
                    indication: {
                        color: BLACK,
                        fontColor: WHITE,
                        font: FONT1
                    }
                },
                white:{
                    color: 'rgb(249,249,249)',
                    width: 1,
                    gradient: GRADIENT,
                    indication: {
                        color: BLACK,
                        fontColor: WHITE,
                        font: FONT1
                    }
                },
                silver:{
                    color: lighten(SILVER),
                    width: 1,
                    gradient: GRADIENT,
                    indication: {
                        color: BLACK,
                        fontColor: WHITE,
                        font: FONT1
                    }
                }
            }
        };


    function mixLayers(layer){
        //console.log('    layer', layer);
    }

    function mixSeries(series){
        //console.log('mixSeries', series);
        //series.layers.forEach(mixLayers);
    }

    Settings = function(_settings, $parent){

        this.graphs = [];

        this.xAxis = {
            resourceManager: _settings.resourceManager,
            showLabels: true,
            showVerticalLines: true,
            minimumNumberOfVisibleBars: 5,
            maximumNumberOfVisibleBars: 60
        };

        this.style = {};

        utilities.mixin(true, this, _settings);
        this.resourceManager = _settings.resourceManager;
        this.$parent = $parent;

        this.setTheme = function(which){
            if(!this.theme || typeof this.theme === 'string'){
                this.theme = new Evented();
            }
            var
                key,
                thm = which === 'light' ? lightProps : darkProps;

            for(key in thm){
                if(thm.hasOwnProperty(key)){
                    this.theme[key] = thm[key];
                }
            }

            this.theme.emit('change', this.theme);

            return this.theme;
        };
        this.setTheme(_settings.theme || 'dark');

        this.dispose = function(){
            this.theme.removeAllListeners();
        };
        
        if(this.graphs.length){
            // first graph is the chart
            // graphs afterward are indicators
            if(this.graphs[0].axes && this.graphs[0].axes.length){
                this.graphs[0].axes[0].series.forEach(function(series, i){
                    mixSeries(series, i);
                });
            }
            //console.log('graphs', this.graphs[0].axes);
            //this.graphs[0].axes[0].series.forEach(mixSeries);
        }
    };

    return Settings;
});
