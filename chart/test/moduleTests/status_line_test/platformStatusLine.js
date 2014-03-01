require([
        "../../../../../lib/domReady",
        "../../../../../lib/order!../../../../../lib/jquery.js"],
    function (domReady) {

        domReady(function () {

            requirejs.config({
                baseUrl: '../../../'
            });

            requirejs(["plugins/statusline/FlexibleStatusLineRenderer", "common/utilities"], function (StatusLineRenderer, utilities) {

                var refrence = $('#reference'), container = refrence; // $('#slContainer');

                var settings = {
                    style: {
                        domElement: {
                            cssText: undefined,
                            cssClass: 'ui-sl-body'
                        },
                        navigation: {
                            cssText: undefined,
                            cssClass: 'ui-sl-scrollerBody'
                        },
                        scrollRight: {
                            cssText: undefined,
                            cssClass: 'ui-sl-scrollRight'
                        },
                        scrollLeft: {
                            cssText: undefined,
                            cssClass: 'ui-sl-scrollLeft'
                        }
                    },
                    content: {
                        style: {
                            cssText: 'color: white;'
                        },
                        sections: [
                        {
                            style: {
                                cssClass: 'ui-sl-labelValueGroup'
                            },
                            data: [
                                {
                                    data: 'Bollinger Bands (',
                                    cssText: 'color: white; font-family:verdana;font-size:12px;'
                                },
                                {
                                    data: 'Close,',
                                    cssText: 'color: white; font-family:verdana;font-size:12px;'
                                }
                                , {
                                    data: 'Close,',
                                    cssText: 'color: white; font-family:verdana;font-size:12px;'
                                },
                                {
                                    data: 'Close,',
                                    cssText: 'color: white; font-family:verdana;font-size:12px;'
                                },
                                {
                                    data: '20,',
                                    cssText: 'color: white; font-family:verdana;font-size:12px;'
                                },
                                {
                                    data: '2,',
                                    cssText: 'color: white; font-family:verdana;font-size:12px;'
                                },
                                {
                                    data: '-2,',
                                    cssText: 'color: white; font-family:verdana;font-size:12px;'
                                }
                                , {
                                    data: '0,',
                                    cssText: 'color: white; font-family:verdana;font-size:12px;'
                                },
                                {
                                    data: 'true,',
                                    cssText: 'color: white; font-family:verdana;font-size:12px;'
                                },
                                 {
                                     data: 'Yellow,',
                                     cssText: 'color: yellow; font-family:verdana;font-size:12px;'
                                 },
                                {
                                    data: 'Red,',
                                    cssText: 'color: red; font-family:verdana;font-size:12px;'
                                },
                                {
                                    data: 'Magenta,',
                                    cssText: 'color: magenta; font-family:verdana;font-size:12px;'
                                },
                                 {
                                     data: 'Cyan) ',
                                     cssText: 'color: cyan; font-family:verdana;font-size:12px;'
                                 },
                                {
                                    data: ' 19.14',
                                    cssText: 'color: red; font-family:verdana;font-size:12px;'
                                },
                                {
                                    data: ' 19.00',
                                    cssText: 'color: magenta; font-family:verdana;font-size:12px;'
                                },
                                 {
                                     data: ' 19.08    ',
                                     cssText: 'color: cyan; font-family:verdana;font-size:12px;'
                                 }
                            ]
                        },

                        ]
                    }
                };

                var renderer = new StatusLineRenderer(settings);

                window.statusLineRenderer = renderer;

                container.append($(renderer.domElement));

                window.statusLineRenderer.content.sections.push({
                    style: {
                        cssClass: 'ui-sl-labelValueGroup'
                    },
                    cellDefaults: {
                },
                data: [
                            {
                                data: 'ADX(14,20,true,Yellow,Red,Cyan,true,DarkGray)',
                                cssText: 'color: white; font-family:verdana;font-size:12px;'
                            },
                            {
                                data: ' 24.71',
                                cssText: 'color: yellow; font-family:verdana;font-size:12px;'
                            },
                            {
                                data: ' 20.00',
                                cssText: 'color: green; font-family:verdana;font-size:12px;'
                            },
                            {
                                data: 'tobedeleted',
                                cssText: 'color: green; font-family:verdana;font-size:12px;'
                            }
                            ]
            });
                        window.statusLineRenderer.content.sections(1).data(1).data(25.43);
                        window.statusLineRenderer.content.sections(1).data.splice(3, 1);

        });

    });
});