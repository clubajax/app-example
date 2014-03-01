define([
    'dcl/dcl',
    'jquery',
    'plugins/common/ElementWrapperRenderer',
    'common/Utilities'
], function (dcl, $, ElementWrapperRenderer, utilities) {

    return dcl(null, {
        declaredClass:'DataTipRenderer',
        constructor: function(settings){

            var
                self = this,
                defaultStyles = settings.style,
                initialLayout = this._createLayout(1),
                fieldSettings = settings.fields,
                length = fieldSettings.length,
                i, j,
                fields,
                result,
                symbolSettings = settings.symbols,
                crosshairSettings = settings.crosshairValues,
                symbolObject,
                dataSettings = settings.data,
                dataLength,
                symbolData,
                symbols,
                symbolDataSettings,
                crosshairValues,
                observableData;

            this.style = function () {
                return $.extend({}, defaultStyles);
            };

            this.$domElement = initialLayout.$domElement;
            if (defaultStyles && defaultStyles.domElement) {
                utilities.changeCssText(initialLayout.$domElement, defaultStyles.domElement.cssText);
                utilities.changeCssClass(initialLayout.$domElement, defaultStyles.domElement.cssClass);
            }
            this.domElement = this.$domElement.get(0);
            this._$tbody = initialLayout.$tbody;
            this._$thead = initialLayout.$thead;

            if (defaultStyles && defaultStyles.table) {
                utilities.changeCssText(initialLayout.$table, defaultStyles.table.cssText);
                utilities.changeCssClass(initialLayout.$table, defaultStyles.table.cssClass);
            }

            this.setHostCssText = function (newStyle, override) {
                var finalStyle = newStyle;
                if (!override && defaultStyles && defaultStyles.domElement && defaultStyles.domElement.cssText) {
                    finalStyle = defaultStyles.domElement.cssText + ';' + finalStyle;
                }
                utilities.changeCssText(initialLayout.$domElement, finalStyle);
            };

            this.time = new ElementWrapperRenderer(initialLayout.$timeCell, settings.time);


            function readonlyCollection (observableArray) {
                var result = function (index, newValue) {
                    return observableArray.apply(observableArray, arguments);
                };
                result._clear = function () {
                    observableArray([]);
                };
                return result;
            }


            //#region fields

            //1. create fields
            for (i = 0; i < length; i++) {
                //don't care about the additional cells
                //the collection should though
                result = self._addField(this, i);
                fieldSettings[i]._$parent = result.$field;
            }

            fields = utilities.settingArrayPropertyProxy(settings.fields,
               function (index, newValue) {
                   throw new Error('not implemented');
               },
               function (index, newValue, oldValue) {
                   throw new Error('not implemented');
               },
               function (index, oldValue) {
                   throw new Error('not implemented');
               },
               function (removed) {
                   var i, length = removed && removed.length;
                   for (i = 0; i < length; i++) {
                       removed[i].dispose();
                   }
               },
               function (setting) {
                   var id = utilities.idGenerator('datatip'), result;
                   setting.id = id;

                   setting._$parent = setting._$parent || $('<td></td>');
                   setting.cssText = setting.cssText || (defaultStyles && defaultStyles.fields && defaultStyles.fields.cssText);
                   setting.cssClass = setting.cssClass || (defaultStyles && defaultStyles.fields && defaultStyles.fields.cssClass);

                   result = new ElementWrapperRenderer(setting._$parent, setting);
                   result.key = utilities.settingProperty(setting, 'key');
                   function onVisibleChange (newValue, oldValue) {
                       var visibility = newValue ? 'visible' : 'collapse',
                           display = newValue ? 'table-row' : 'none';
                       result._$element.parent().parent().css('visibility', visibility);
                       result._$element.parent().parent().css('display', display);
                       return newValue;
                   }

                   result.visible = utilities.settingProperty(setting, 'visible', onVisibleChange);
                   onVisibleChange(setting.visible);
                   delete setting._$parent;
                   return result;
               },
               false);

            this.fields = readonlyCollection(fields);

            //2. create symbols

            length = symbolSettings.length;

            for (i = 0; i < length; i++) {
                result = this._addSymbol(this, i, 1);
                crosshairSettings[i]._$parent = result.$crosshairElement;

                symbolSettings[i]._index = i;

                symbolSettings[i]._$parent = result.$symbolElement;

                //data
                symbolDataSettings = dataSettings[i];
                dataLength = symbolDataSettings.length;
                for (j = 0; j < dataLength; j++) {
                    symbolDataSettings[j]._$parent = result.$dataCells[j];
                }
            }


            symbols = utilities.settingArrayPropertyProxy(settings.symbols,
                function (index, symbolSettingWrapper) {
                    throw new Error('not implemented');
                },
                function (newSection, old) {
                    throw new Error('not implemented');
                },
                function (removed, index) {
                    throw new Error('not implemented');
                },
                function (removed) {
                    var i, length = removed && removed.length;
                    for (i = 0; i < length; i++) {
                        removed[i].dispose();
                    }
                },
                function (setting) {
                    var id = utilities.idGenerator('datatip'), result;
                    setting.id = id;
                    setting._$parent = setting._$parent || $('<th></th>');
                    setting.cssText = setting.cssText || (defaultStyles && defaultStyles.symbols && defaultStyles.symbols.cssText);
                    setting.cssClass = setting.cssClass || (defaultStyles && defaultStyles.symbols && defaultStyles.symbols.cssClass);
                    result = new ElementWrapperRenderer(setting._$parent, setting);
                    result.key = utilities.settingProperty(setting, 'key');
                    function onVisibleChange (newValue, oldValue) {
                        self._setSymbolVisibility(this, setting._index, newValue);
                        return newValue;
                    }

                    result.visible = utilities.settingProperty(setting, 'visible', onVisibleChange);
                    onVisibleChange(setting.visible);
                    delete setting._$parent;
                    return result;
                },
                false);

            this.symbols = readonlyCollection(symbols);

            crosshairValues = utilities.settingArrayPropertyProxy(settings.crosshairValues,
               function (index, newValue) {
                   throw new Error('not implemented');
               },
               function (index, newValue, oldValue) {
                   throw new Error('not implemented');
               },
               function (index, oldValue) {
                   throw new Error('not implemented');
               },
               function (removed) {
                   var i, length = removed && removed.length;
                   for (i = 0; i < length; i++) {
                       removed[i].dispose();
                   }
               },
               function (setting) {
                   var id = utilities.idGenerator('crosshair'), result;
                   setting.id = id;
                   setting._$parent = setting._$parent || $('<th></th>');
                   setting.cssText = setting.cssText || (defaultStyles && defaultStyles.symbols && defaultStyles.crosshairValues.cssText);
                   setting.cssClass = setting.cssClass || (defaultStyles && defaultStyles.symbols && defaultStyles.crosshairValues.cssClass);
                   result = new ElementWrapperRenderer(setting._$parent, setting);
                   delete setting._$parent;
                   return result;
               },
               false);

            this.crosshairValues = readonlyCollection(crosshairValues);

            function createSymbolData (setting) {
                var observable = utilities.settingArrayPropertyProxy(setting,
                    function (index, newValue) {
                        throw new Error('not implemented');
                    },
                    function (index, newValue, oldValue) {
                        throw new Error('not implemented');
                    },
                    function (index, oldValue) {
                        throw new Error('not implemented');
                    },
                    function (removed) {
                        var i, length = removed && removed.length;
                        for (i = 0; i < length; i++) {
                            removed[i].dispose();
                        }
                    },
                    function (setting2) {
                        var id = utilities.idGenerator('symbol'), result;
                        setting2.id = id;
                        setting2._$parent = setting2._$parent || $('<td></td>');
                        setting2.cssText = setting2.cssText || (defaultStyles && defaultStyles.data && defaultStyles.data.cssText);
                        setting2.cssClass = setting2.cssClass || (defaultStyles && defaultStyles.data && defaultStyles.data.cssClass);
                        result = new ElementWrapperRenderer(setting2._$parent, setting2);
                        delete setting2._$parent;
                        return result;
                    },
                    false),

                result2 = readonlyCollection(observable);
                result2._observable = observable;
                return result2;
            }

            observableData = utilities.settingArrayPropertyProxy(settings.data,
                function (index, newValue) {
                    throw new Error('not implemented');
                },
                function (index, newValue, oldValue) {
                    throw new Error('not implemented');
                },
                function (index, oldValue) {
                    throw new Error('not implemented');
                },
                function (removed) {
                    var i, length = removed && removed.length;
                    for (i = 0; i < length; i++) {
                        removed([]);
                    }
                },
                function (setting) {
                    return createSymbolData(setting);
                },
                false);

            this.data = readonlyCollection(observableData);
        },

        _addField: function (index) {
            var
                result = {
                    $field: undefined,
                    $dataCells: []
                },
                //change the colspan on the time
                //add a th in the rest of the rows
                $thead = this._$thead,
                $tbody = this._$tbody,
                i, columnsLength, anchor, rowsLength,
                rows, columns,
                row, column,
                cell;

            rows = $thead.children();
            columns = $(rows[1]).children();
            columnsLength = columns.length;

            rows = $tbody.children();

            rowsLength = rows.length;

            if (index < rowsLength) {
                anchor = $(rows[index]);
                row = $("<tr></tr>").insertBefore(anchor);
            } else {
                row = $("<tr></tr>").appendTo($tbody);
            }

            i = 0;
            cell = $('<td></td>').appendTo(row);
            result.$field = $('<div></div>').appendTo(cell);

            for (i = 1; i < columnsLength - 1; i++) {
                cell = $('<td></td>').appendTo(row);
                column = $('<div></div>').appendTo(cell);
                result.$dataCells.push(column);
            }
            return result;
        },

        _addSymbol: function (index, numberOfSymbols) {
            //data index is one more because of the fields column
            index++;
            var
                result = {
                    $crosshairElement: undefined,
                    $symbolElement: undefined,
                    $dataCells: []
                },

                //change the colspan on the time
                //add a th in the rest of the rows
                $thead = this._$thead, $tbody = this._$tbody,
                i, columnsLength, anchor, rowsLength,
                rows, columns, cell,
                row, column;

            //#region header
            rows = $thead.children();
            if (numberOfSymbols > 1) {
                //#region crosshairs
                //crosshair values
                row = $(rows[1]);
                columns = row.children();
                columnsLength = columns.length;
                if (index < columnsLength) {
                    anchor = columns[index];
                    cell = $('<th></th>').insertBefore(anchor);
                    column = $('<div></div>').insertBefore(cell);
                } else {
                    cell = $('<th></th>').appendTo(row);
                    column = $('<div></div>').appendTo(cell);
                }
                result.$crosshairElement = column;

                row = $(rows[2]);
                columns = row.children();
                columnsLength = columns.length;
                if (index < columnsLength) {
                    anchor = columns[index];
                    cell = $('<th></th>').insertBefore(anchor);
                    column = $('<div></div>').insertBefore(cell);
                } else {
                    cell = $('<th></th>').appendTo(row);
                    column = $('<div></div>').appendTo(cell);
                }
                result.$symbolElement = column;
            } else {
                row = $(rows[1]);
                //symbol values
                columns = row.children();
                columnsLength = columns.length;
                cell = $('<th></th>').appendTo(row);
                column = $('<div></div>').appendTo(cell);
                result.$symbolElement = column;
                //crosshair
                columns = row.children();
                columnsLength = columns.length;
                cell = $('<th></th>').appendTo(row);
                column = $('<div></div>').appendTo(cell);
                result.$crosshairElement = column;
            }
            
            //time cell needs to change the colspan
            //time cell will always be there
            row = $(rows[0]);
            column = $(row.children()[1]);
            column.attr('colspan', numberOfSymbols>1? columns.length : 2);

            rows = $tbody.children();

            rowsLength = rows.length;

            for (i = 0; i < rowsLength; i++) {
                row = $(rows[i]);
                columns = row.children();
                columnsLength = columns.length;
                if (index < columnsLength) {
                    anchor = columns[index];
                    cell = $('<td></td>').insertBefore(anchor);
                    column = $('<div></div>').insertBefore(cell);
                } else {
                    cell = $('<td></td>').appendTo(row);
                    column = $('<div></div>').appendTo(cell);
                }
                result.$dataCells.push(column);
            }

            return result;
        },

        _setSymbolVisibility: function (index, isVisible, numberOfSymbols) {

            index++;
            //change the colspan on the time
            //add a th in the rest of the rows
            var $thead = this._$thead, $tbody = this._$tbody,
               i, anchor, rowsLength,
               rows, columns,
               row, column, display = isVisible ? 'table-cell' : 'none';

            rows = $thead.children();

            //crosshair values
            row = $(rows[1]);
            columns = row.children();
            anchor = $(columns[index]);
            anchor.css('display', display);

            //symbol values
            row = $(rows[2]);
            columns = row.children();
            anchor = $(columns[index]);
            anchor.css('display', display);

            //time cell needs to change the colspan
            //time cell will always be there
            row = $(rows[0]);
            column = $(row.children()[0]);
            if (numberOfSymbols > 1) {
                column.attr('colspan', columns.length - 2 - (isVisible ? 0 : 1));
            } else {
                column.attr('colspan', 2);
            }

            rows = $tbody.children();

            rowsLength = rows.length;

            for (i = 0; i < rowsLength; i++) {
                row = $(rows[i]);
                columns = row.children();
                anchor = $(columns[index]);
                anchor.css('display', display);
            }
        },

        _createLayout: function (numberOfSymbols) {
            var $root = $('<span style="display: inline-block"></span>'),
               $table = $('<table></table>').appendTo($root),
               $header = $('<thead></thead>').appendTo($table),

               $timeHostRow = $('<tr></tr>').appendTo($header),
               $emptyTimeCell,
               $emptyCrossHairCell,
               $symbolRow,
               $emptySymbolCell,

               cell = $('<th colspan="2"></th>').appendTo($timeHostRow),
               $timeHostCell = $('<div></div>').appendTo(cell),

               $crossHairRow = $('<tr></tr>').appendTo($header),
               $dataBody = $('<tbody></tbody>').appendTo($table),
               result;

            if (numberOfSymbols !== undefined && numberOfSymbols > 1) {
                $emptyTimeCell = $('<th></th>').appendTo($timeHostRow);
                $emptyCrossHairCell = $('<th></th>').appendTo($crossHairRow);
                $symbolRow = $('<tr></tr>').appendTo($header);
                $emptySymbolCell = $('<th></th>').appendTo($symbolRow);
            }

            result = {
                $domElement: $root,
                $table: $table,
                $thead: $header,
                $timeCell: $timeHostCell,
                $tbody: $dataBody
            };
            return result;
        },

        dispose: function () {

            this.$domElement.off();
            this.$domElement.empty();
            delete this.$domElement;
            delete this.domElement;
            delete this.style;
            delete this._$tbody;
            delete this._$thead;
            this.time.dispose();
            delete this.time;
            this.fields._clear();
            delete this.fields;
            this.symbols._clear();
            delete this.symbols;
            this.crosshairValues._clear();
            delete this.crosshairValues;
            delete this.data;
        }
    });
});
