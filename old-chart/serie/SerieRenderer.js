define([
    'dcl/dcl',
    'common/Utilities',
    './SerieSectionRenderer',
    'common/EventTarget'
], function (dcl, utilities, SerieSectionRenderer, EventTarget) {

    function noop(){}
    
    return dcl(null, {
        declaredClass:'SerieRenderer',
        constructor: function($parent, settings){

            var
                length,
                rect = settings.rect,
                sections,
                i;

            settings.sections = settings.sections || [];

            this.id = settings.id;

            this.settings = settings;

            this.$parent = $parent;

            this.rect = utilities.settingProperty(settings, 'rect', function () {
                this._resize();
            }.bind(this));

            this.scaler = utilities.settingProperty(settings, 'scaler', function (newValue) {
                var sectionRenderers = this.sections(),
                    length = sectionRenderers.length,
                    sectionRenderer;

                for (sectionRenderer = sectionRenderers[0]; length; sectionRenderer = sectionRenderers[--length]) {
                    sectionRenderer.scaler(newValue);
                }
            }.bind(this));

            this.sectionsMap = {};

            this.sections = utilities.settingArrayPropertyProxy(settings.serie.sections,
                this.addSection.bind(this),
                noop,
                this.removeSection.bind(this),
                this.clearSection.bind(this),
                this.createSection.bind(this)
            );

            this._labels = [];

            if ((rect.right - rect.left) || rect.bottom - rect.top) {
                this._resize();
            }
            sections = this.sections();
            length = sections.length;
            for (i = 0; i < length; i++) {
                if (sections[i].isSelected()) {
                    sections[i].isSelected(true);
                    break;
                }
            }
        },

        createSection: function (objectSetting) {
            var sets = utilities.mixin(objectSetting, {
                scaler: this.settings.scaler,
                rect: this.settings.rect,
                limits: this.settings.limits,
                indexedData: this.settings.indexedData,
                painterFactory: this.settings.painterFactory,
                serie: this.settings.serie,
                zOrder: this.settings.zOrder,
                theme:this.settings.theme,
                isSelectionChangeCallback: function(eventTarget, isSelection) {
                    this.isSelectionChange(eventTarget.target, isSelection);
                    eventTarget.targetParent = new EventTarget(this);
                    this.settings.isSelectionChangeCallback(eventTarget, isSelection);
                }.bind(this)
            });

            return new SerieSectionRenderer(this.$parent, sets );
        },

        addSection: function (index, addedObject) {
            this.sectionsMap[addedObject.id] = {
                object: addedObject
            };

            this.settings.zOrder += 1;

            if (this.settings.isSectionsCollectionHasChangedCallback) {
                this.settings.isSectionsCollectionHasChangedCallback();
            }
        },

        removeSection: function (index, removedObjects) {

            var
                removedObject,
                length = removedObjects.length;

            for (removedObject = removedObjects[0]; length; removedObject = removedObjects[--length]) {
                delete this.sectionsMap[removedObject.id];
                removedObject.dispose();
            }

            if (this.settings.isSectionsCollectionHasChangedCallback) {
                this.settings.isSectionsCollectionHasChangedCallback();
            }
        },
        clearSection: function (removedObjects) {
            var
                length = removedObjects.length,
                object,
                map = this.sectionsMap;

            for (object = removedObjects[0]; length; object = removedObjects[--length]) {
                delete map[object.id];
                object.dispose();
            }

            if (this.settings.isSectionsCollectionHasChangedCallback) {
                this.settings.isSectionsCollectionHasChangedCallback();
            }
        },
        
        isSelectionChange: function (serieSection, isSelection) {

            var
                sectionRenderers = this.sections(),
                length = sectionRenderers.length,
                id = serieSection.id,
                maxZOrder = this.settings.maxSelectionZOrder;
                
            if (isSelection) {

                serieSection.changeZOrder(--maxZOrder);

                do {
                    serieSection = sectionRenderers[--length];
                    if (serieSection.id !== id) {
                        serieSection.changeZOrder(--maxZOrder);
                    }
                } while (length);

            } else {

                do {
                    serieSection = sectionRenderers[--length];
                    serieSection.changeZOrder(serieSection.settings.zOrder);

                } while (length);
            }
        },

        _resize: function () {
            var
                sectionRenderers = this.sections(),
                length = sectionRenderers.length,
                rect = this.rect(),
                sectionRenderer;

            for (sectionRenderer = sectionRenderers[0]; length; sectionRenderer = sectionRenderers[--length]) {
                sectionRenderer.rect(rect);
            }
        },

        hitTest: function ( x, y) {
            var
                sections = this.sections(),
                length = sections.length,
                target;

            do {
                target = sections[--length].hitTest(x, y);

                if (target) {

                    if (target.targetParent) {
                        target.targetParent.targetParent = new EventTarget(this);
                    } else {
                        target.targetParent = new EventTarget(this);
                    }

                    return target;
                }
            } while (length);

            return null;

        },

        render: function () {
            var
                sectionRenderers = this.sections(),
                length = sectionRenderers.length,
                sectionRenderer;

            for (sectionRenderer = sectionRenderers[0]; length; sectionRenderer = sectionRenderers[--length]) {
                sectionRenderer.render();
            }
        },

        renderIndex: function (index) {
            var
                sectionRenderers = this.sections(),
                length = sectionRenderers.length,
                sectionRenderer;

            for (sectionRenderer = sectionRenderers[0]; length; sectionRenderer = sectionRenderers[--length]) {
                sectionRenderer.renderIndex(index);
            }
        },

        getLabelsForIndication: function () {
            var
                labels, i,
                sectionRenderers = this.sections(),
                length = sectionRenderers.length;

            if (length && this.settings.serie.data.length) {
                labels = sectionRenderers[0].getLabelsForIndication();

                for (i = 1; i < length; i++) {
                    labels.push.apply(labels, sectionRenderers[i].getLabelsForIndication());
                }

            } else {
                labels = null;
            }

            return labels;
        },

        dataInspect: function (index) {
            var
                sectionRenderers = this.sections(),
                length = sectionRenderers.length,
                result = {},
                data,
                dataPoint = this.settings.serie.data[index],
                i;

            result.timeStamp = dataPoint.timeStamp;
            result.values = dataPoint.values;
            result.layers = [];

            data = sectionRenderers[0].dataInspect(index);

            result.layers.push(data);

            for (i = 1; i < length; i++) {
                data = sectionRenderers[i].dataInspect(index);

                result.layers.push(data);
            }

            return result;
        },

        dispose: function () {
            this.rect = null;
            this.scaler = null;
            this.sections(null);
            this.sections = null;
            this.sectionsMap = null;
            this._labels.length = 0;
            this.settings = null;
        }
    });
});
