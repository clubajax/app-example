define([
    'dcl/dcl',
    'common/Rect',
    'common/Utilities'
], function (dcl, rect, util) {

    var threeHundredAndSixtyDegrees = 2 * Math.PI,
        context,
        xDisplacement,
        mSpan,
        mBlock,
        mDiv;
        
    function buildPathForShape(contx, xDispl, lines, style) {

        var
            length = lines.length,
            line, i;

        contx.strokeStyle = style.color;
        contx.lineWidth = style.width;

        line = lines[0];
        contx.moveTo(line.x + xDispl, line.y);

        for (i = 1; i < length; i++) {
            line = lines[i];
            contx.lineTo(line.x + xDispl, line.y);
        }
    }



    return dcl(null, {
        declaredClass: 'CanvasPrinter',
        constructor: function(parent, settings){
            //console.error('CanvasPrinter');
            if(!parent){
                console.warn('no parent passed to CanvasPrinter');
            }
            this.settings = settings;

            //init canvas
            this.parent = parent;
            this.layers = [];

            var canvas = util.dom('canvas', {
                className: settings.className || 'printer'
            }, parent);


            this.layers.push({ uiElement: canvas, context: canvas.getContext("2d") });

            this.changeRect();
        },

        resize: function(rect){
            var layers = this.layers,
                uiElement,
                physicalRect = rect,
                top = physicalRect.top,
                left = physicalRect.left,
                width = physicalRect.right - left,
                height = physicalRect.bottom - top,
                length = layers.length;

            // There is always ONE!
            for (uiElement = layers[0].uiElement; length; uiElement = layers[--length].uiElement) {
                if (left !== uiElement.left || top !== uiElement.top || width !== uiElement.width || height !== uiElement.height) {
                    uiElement.left = left;
                    uiElement.top = top;

                    util.style(uiElement, {top:top, left:left});
                }
                uiElement.width = width;
                uiElement.height = height;
            }
            this.xDisplacement = this.settings.rect.left - physicalRect.left;
        },

        changeRect: function () {
            // love to replace this with something sane..
            // tripped up a bit by rect & physicalRect
            var layers = this.layers,
                uiElement,
                physicalRect = this.settings.physicalRect,
                top = physicalRect.top,
                left = physicalRect.left,
                width = physicalRect.right - left,
                height = physicalRect.bottom - top,
                length = layers.length;

            // There is always ONE!
            for (uiElement = layers[0].uiElement; length; uiElement = layers[--length].uiElement) {
                if (left !== uiElement.left || top !== uiElement.top || width !== uiElement.width || height !== uiElement.height) {
                    uiElement.left = left;
                    uiElement.top = top;

                    util.style(uiElement, {top:top, left:left});
                }
                uiElement.width = width;
                uiElement.height = height;
            }

            //if(this.settings.rect.left === undefined || isNaN(this.settings.rect.left)){
            //    //debugger
            //}

            ///console.error('CHAGE RECT', this.settings.rect, physicalRect);
            this.xDisplacement = this.settings.rect.left - physicalRect.left;
        },

        addLayer: function () {
            // This makes no sense
            // but it is used somewhere when the chart is in the app.
            var
                uiElement = this.layers[0].uiElement,
                canvas = util.dom('canvas', {
                attr:{
                    id:util.uid('layer'),
                    height: uiElement.height,
                    width: uiElement.width
                },
                cssText: uiElement.style.cssText
            }, this.parent, true);

            this.layers.push({ uiElement: canvas, context: canvas.getContext("2d") });

            return this.layers.length;
        },

        removeLayer: function (layer) {
            var canvas = this.layers[layer].uiElement;

            delete canvas.hitTest;
            delete canvas.ondragstart;
            delete canvas.ondrag;
            delete canvas.ondragend;
            delete canvas.onselect;
            delete canvas.ondeselect;

            this.$parent.get(0).removeChild(canvas);

            this.layers.splice(layer, 1);
        },

        dispose: function () {
            var
                layers = this.layers,
                canvas,
                length = layers.length;

            for (canvas = layers[0].uiElement; length; canvas = layers[--length].uiElement) {
                util.destroy(canvas);
            }

            layers.length = 0;
        },

        cleanPlotArea: function () {

            var
                width,
                height,
                length = this.layers.length,
                uiElement = this.layers[0].uiElement;
            
            if (length > 1) {

                width = uiElement.width;
                height = uiElement.height;

                do {
                    this._cleanRectangle(0, 0, uiElement.width, uiElement.height, --length);
                }
                while (length);

            } else {
                this._cleanRectangle(0, 0, uiElement.width, uiElement.height, 0);
            }
        },

        _cleanRectangle: function (x, y, width, height, layer) {

            this.layers[layer].context.clearRect(x, y, width, height);
        },

        cleanRectangle: function (x, y, width, height, layer) {

            var length = this.layers.length;

            do {
                this._cleanRectangle(x + this.xDisplacement, y, width, height, --length);
            } while (length);
        },

        plotCircles: function (circles, strokeStyle, layer) {

            layer |= 0;

            var
                circle,
                length = circles.length;

            context = this.layers[layer].context;
            context.fillStyle = strokeStyle.color;

            for (circle = circles[0]; length; circle = circles[--length]) {
                context.beginPath();
                context.arc(circle.x, circle.y, circle.radius, 0, threeHundredAndSixtyDegrees, true);
                context.fill();
            }

            context.closePath();
        },

        plotRectangle: function (x0, y0, width, height, fillStyle, layer) {

            layer |= 0;

            context = this.layers[layer].context;
            xDisplacement = this.xDisplacement;

            context.fillStyle = fillStyle;

            context.fillRect(x0 + xDisplacement, y0, width, height);
        },

        plotFrame: function (x0, y0, width, height, strokeStyle, rep, layer) {

            layer |= 0;

            context = this.layers[layer].context;
            xDisplacement = this.xDisplacement;

            rep = rep || 1;

            context.strokeStyle = strokeStyle.color;
            context.lineWidth = strokeStyle.width;

            while (rep--) {
                context.strokeRect(x0 + xDisplacement, y0, width, height);
            }
        },

        plotLine: function (x0, y0, x1, y1, strokeStyle, rep, layer) {

            layer |= 0;

            context = this.layers[layer].context;
            xDisplacement = this.xDisplacement;

            rep = rep || 1;

            context.beginPath();

            context.strokeStyle = strokeStyle.color;
            context.lineWidth = strokeStyle.width;

            context.moveTo(x0 + xDisplacement, y0);
            context.lineTo(x1 + xDisplacement, y1);

            while (rep--) {
                context.stroke();
            }
        },

        plotLines: function (lines, strokeStyle, rep, layer) {
            layer |= 0;

            context = this.layers[layer].context;
            xDisplacement = this.xDisplacement;
            rep = rep || 1;

            var
                line,
                length = lines.length;

            context.beginPath();

            context.strokeStyle = strokeStyle.color;
            context.lineWidth = strokeStyle.width;

            for (line = lines[0]; length; line = lines[--length]) {
                context.moveTo(line.x0 + xDisplacement, line.y0);
                context.lineTo(line.x1 + xDisplacement, line.y1);
            }

            while (rep--) {
                context.stroke();
            }
        },

        plotOpenShape: function (lines, strokeStyle, rep, layer) {
            layer |= 0;

            context = this.layers[layer].context;

            rep = rep || 1;

            context.beginPath();

            buildPathForShape(context, this.xDisplacement, lines, strokeStyle);

            while (rep--) {
                context.stroke();
            }
        },

        plotShape: function (lines, strokeStyle, fillColor, rep, layer) {
            layer |= 0;

            context = this.layers[layer].context;

            context.beginPath();
            context.fillStyle = fillColor;

            buildPathForShape(context, this.xDisplacement, lines, strokeStyle);

            rep = rep || 1;

            while (rep--) {
                context.fill();
            }
        },

        createLinearGradient: function (x0, y0, x1, y1, colorStops) {

            context = this.layers[0].context;
            xDisplacement = this.xDisplacement;

            var length = colorStops.length,
                colorStop,
                i,
                grd = context.createLinearGradient(x0 + xDisplacement, y0, x1 + xDisplacement, y1);

            for (i = 0; i < length; i++) {
                colorStop = colorStops[i];
                grd.addColorStop(colorStop.offset, colorStop.color);
            }

            return grd;
        },

        meassureText: function (text, font) {

            context = this.layers[0].context;

            if (font) {
                context.font = font;
            }

            return context.measureText(text).width;
        },

        measureTextHeight: function (font, text) {

            if(!mDiv){
                mDiv = util.dom('div');
                mSpan = util.dom('span', {
                    style:{
                        font: font
                    }
                }, mDiv);
                mBlock = util.dom('div', {
                    style:{
                        display:'inline-block',
                        width:1,
                        height:0
                    }
                }, mDiv);
            }

            mSpan.innerHTML = text || 'Hg';
            document.body.appendChild(mDiv);

            var result = {};


            util.style(mBlock, 'verticalAlign', 'baseline');
            result.ascent = util.box(mBlock).top - util.box(mSpan).top;

            util.style(mBlock, 'verticalAlign', 'bottom');
            result.height = util.box(mBlock).top - util.box(mSpan).top;

            // fwiw
            result.descent = result.height - result.ascent;

            document.body.removeChild(mDiv);
            //console.log('measure text', result.height);
            return result.height;
        },

        plotText: function (text, x, y, font, baseline, align, color, layer) {
            //console.log('    text', text, x, y);
            layer |= 0;

            context = this.layers[layer].context;
            xDisplacement = this.xDisplacement;

            context.font = font;
            context.textBaseline = baseline;
            context.textAlign = align;
            context.fillStyle = color;
            context.fillText(text, x + xDisplacement, y);

        },

        fill: function (color, layer) {
            layer |= 0;

            context = this.layers[layer].context;

            context.fillStyle = color;
            context.fill();
        },

        hitTest: function (x, y, layer) {

            layer |= 0;
            x += this.xDisplacement;

            var
                image = this.layers[layer].context.getImageData(x - 3, y - 3, 6, 6),
                imageData = image.data,
                i,
                length = imageData.length;

            for (i = 0; i < length; i += 4) {
                if (imageData[i] || imageData[i + 1] || imageData[i + 2]) {
                    return imageData[i] + ',' + imageData[i + 1] + ',' + imageData[i + 2];
                }
            }

            // background
            return false;
        }
    });
});
