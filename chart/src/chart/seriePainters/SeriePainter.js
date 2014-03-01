define([
    'dcl/dcl',
    'common/Utilities'
], function(dcl, utilities){

    return dcl(null, {
        declaredClass:'SeriePainter',
        constructor: function(settings) {
            if (settings) {

                this.settings = settings;
                this.style = utilities.settingProperty(settings, 'style');

                this.scaler = utilities.settingProperty(settings, 'scaler');
                this.rect = utilities.settingProperty(settings, 'rect');
                this.changeRect = function (rect, scaler) {
                    settings.rect = rect;
                    settings.scaler = scaler;
                };
            }
        },

        renderIndex: function (index) {
            this.cleanIndex(index);

            var time = this.settings.serie.limits.time,
                currentXMinlinmit = time.minValueIndex,
                currentXMaxlinmit = time.maxValueIndex;

            time.minValueIndex = index;
            time.maxValueIndex = index;

            this._render();

            time.minValueIndex = currentXMinlinmit;
            time.maxValueIndex = currentXMaxlinmit;
        },

        render: function () {
            this.clean();
            if (this.settings.indexedData.data.length && (!this.settings.serie.definesScaling || this.settings.serie.limits)) {
                return this._render();
            }
            return null;
        },

        clean: function () {
            this.settings.printer.cleanPlotArea();
        },

        preRender: function (index, valueKey) {

            var
                value = this.settings.serie.data[index].values[valueKey],
                draw = this.settings.theme.draw;

            if(this.settings.style && this.settings.style.lineStyle){
                draw = draw[this.settings.style.lineStyle];
            }

            return {
                color: value.color || draw.color,
                value: value.value,
                fontColor: draw.indication.fontColor
            };
        },

        dispose: function () {
            this.clean();
            this.settings = null;
            this.style = null;
            this.scaler = null;
            this.rect = null;

        }
    });
});
