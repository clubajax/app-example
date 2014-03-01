require([
        "../../../../../lib/domReady",
        "../../../../../lib/order!../../../../../lib/jquery.js"],

 function (domReady) {

     domReady(function () {

         requirejs.config({
             baseUrl: '../../../'
         });

         requirejs(["plugins/statusLine/StatusRenderer", "common/utilities"], function (StatusRenderer, utilities) {

             var host = $('#slContainer'), i = 0,
                 cell1 = {
                     data: 'hello ' + (i++)
                 },
                 cell2 = {
                     data: 'hello ' + (i++),
                     cssText: 'color : Blue'
                 },
                 cell3 = {
                     data: 'hello ' + (i++),
                     cssClass: 'ui-sl-value-bull'
                 },
                 cell4 = {
                     data: 'hello ' + (i++),
                     cssText: 'color : Orange',
                     cssClass: 'ui-sl-value-bull'
                 },
                 sc1,
                 sc2,
                 sc3,
                 sc4,
                 section1 = {
                     style: {
                         cssText: 'padding-left:10px'
                     },
                     cellDefaults:
                         {
                             cssClass: 'ui-sl-value-bull'
                         },
                     data: [cell1, cell2, cell3, cell4]
                 },
                 section2 = {
                     style: {
                         cssText: 'padding-right:10px'
                     },
                     cellDefaults:
                         {
                             cssClass: 'ui-sl-value-bear'
                         },
                     data: [cell4, cell3, cell2, cell1]
                 };

             window.statusLine = new StatusRenderer(host,
                     {
                         style: {
                             cssText: 'padding-left:10px'
                         },
                         sectionDefaults:
                         {
                             cssClass: 'ui-sl-value-bear'
                         },
                         sections: [section1, section2]
                     }
             );

             //                var $table = $('<table></table>').appendTo(host),
             //                    $row = $('<row></row>').appendTo($table), $col = $('<td></td>'), $rcol;

             //                $rcol = $col.clone().appendTo($row);
             //                sc1 = new ElementWrapperRenderer($rcol, cell1);

             //                $rcol = $col.clone().appendTo($row);
             //                sc2 = new ElementWrapperRenderer($rcol, cell2);

             //                $rcol = $col.clone().appendTo($row);
             //                sc3 = new ElementWrapperRenderer($rcol, cell3);

             //                $rcol = $col.clone().appendTo($row);
             //                sc4 = new ElementWrapperRenderer($col.clone().appendTo($row), cell4);


         });
     });
 });