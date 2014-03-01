require([
        "../../../../lib/domReady.js",
        "../../../../lib/jquery.js"],
    function (domReady) {

        domReady(function () {

            requirejs.config({
                baseUrl: '../../../'
            });

            requirejs(["plugins/common/ElementWrapperRenderer"], function (ElementWrapperRenderer) {

                var host = $('#reference'), i = 0,
                    cell1 = {
                        data: 'hello ' + (i++)
                    },
                    cell2 = {
                        data: 'hello ' + (i++),
                        cssText: 'color : Blue'
                    },
                    cell3 = {
                        data: 'hello ' + (i++),
                        cssClass: 'ui-sc-value-bull'
                    },
                    cell4 = {
                        data: 'hello ' + (i++),
                        cssText: 'color : Blue',
                        cssClass: 'ui-sc-value-bull'
                    },
                    sc1,
                    sc2,
                    sc3,
                    sc4;

                var $table = $('<table></table>').appendTo(host),
                    $row = $('<row></row>').appendTo($table), $col = $('<td></td>'), $rcol;

                $rcol = $col.clone().appendTo($row);
                sc1 = new ElementWrapperRenderer($rcol, cell1);

                $rcol = $col.clone().appendTo($row);
                sc2 = new ElementWrapperRenderer($rcol, cell2);

                $rcol = $col.clone().appendTo($row);
                sc3 = new ElementWrapperRenderer($rcol, cell3);

                $rcol = $col.clone().appendTo($row);
                sc4 = new ElementWrapperRenderer($col.clone().appendTo($row), cell4);
            });

        });
    });