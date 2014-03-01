define([], function () {

    var
        isDimension = {
            width:1,
            height:1,
            top:1,
            left:1,
            right:1,
            bottom:1
        },
        uids = {},
        destroyer = document.createElement('div');

    function eventDelegator(eventType, eventObject){
        switch (eventType) {
            case "downGesture":
                return this.onDownGesture(eventObject);
            case "moveGesture":
                return this.onMoveGesture(eventObject);
            case "leaveGesture":
                return this.onLeaveGesture(eventObject);
            case "upGesture":
                return this.onUpGesture(eventObject);
            default:
                return true;
        }
    }

    function uid(type){
        if(!uids[type]){
            uids[type] = [];
        }
        var id = type + '_' + (uids[type].length + 1);
        uids[type].push(id);
        return id;
    }

    function isArray(item){
        return Object.prototype.toString.call( item ) === '[object Array]';
    }
    
    function notNull(item){
        return item !== null && item !== undefined;
    }

    function isObject(item){
        // Dates, nodes, arrays, and the window will fail this test
        return typeof item === 'object' && Object.prototype.toString.call(item) === '[object Object]';
    }

    function isNode(item){
        return (/HTML/).test(Object.prototype.toString.call( item ));
    }

    function getNode(item){
        // de-jqueryify
        if(!item){ return item; }
        return item.get ? item.get(0) : item;
    }

    function arrayProperty(object, propertyName, callback) {
        if (!object || !propertyName) { throw new Error('invalid storage'); }

        function value (index, newValue) {
            var
                removed,
                arg0 = index,
                jslint,
                isNoIndexAssignment = (arguments.length === 1 && (arg0 === null || arg0 === undefined || isArray(arg0)));

            if (arguments.length <= 1 && !isNoIndexAssignment) {
                if (arguments.length) {
                    if (arg0 < 0) {
                        throw new Error('invalid index');
                    } else if (arg0 >= 0) {
                        if (object[propertyName]) {
                            return object[propertyName][index];
                        } else {
                            return undefined;
                        }
                    } else {

                        arg0 = isArray(arg0) ? arg0 : [arg0];

                        removed = object[propertyName];
                        object[propertyName] = arg0;

                        jslint = callback && callback(undefined, arg0, undefined, removed);

                        return object[propertyName];
                    }
                } else {
                    return object[propertyName];
                }
            } else {
                if (isNoIndexAssignment) {
                    newValue = index;
                    index = undefined;
                }
                //if there is an index
                if (index !== undefined) {

                    if (!object[propertyName]) {
                        object[propertyName] = [];
                    }

                    removed = object[propertyName][index];

                    object[propertyName][index] = newValue;

                    if (callback) {

                        if (removed === newValue) {
                            //update
                            removed = undefined;
                        }

                        callback(index, undefined, newValue, removed);
                    }
                } else {

                    removed = object[propertyName];
                    object[propertyName] = newValue;
                    if (callback) {
                        //replace value
                        callback(undefined, newValue, undefined, removed);
                    }
                }
                return newValue;
            }
        }

        value.splice = function (index, deleteCount, items) {
            if (index >= 0) {
                var result;
                if (object[propertyName]) {
                    if (items) {
                        result = Array.prototype.splice.apply(object[propertyName], arguments);
                    } else {
                        result = Array.prototype.splice.apply(object[propertyName], [index, deleteCount]);
                    }

                    if (callback) {
                        result = result && result.length ? result : undefined;
                        //splice, no update
                        callback(index, items, undefined, result);
                    }
                }
                return result;
            } else {
                if (index < 0) {
                    throw new Error('negative index not supported');
                } else {
                    throw new Error('index is required');
                }
            }
        };

        value.push = function () {
            var
                result,
                args = Array.prototype.slice.call(arguments);

            if (object[propertyName]) {
                result = object[propertyName].length;
                object[propertyName].push.apply(object[propertyName], args);
                if (callback) {
                    //push, added after result
                    callback(result, args, undefined, undefined);
                }
            }
            return result;
        };

        return value;
    }

    function property(object, propertyName, callback) {
        if (!object || !propertyName) { throw new Error('invalid storage'); }

        function value(newValue) {
            if (!arguments.length) {
                return object[propertyName];
            } else {

                var previous = object[propertyName];
                object[propertyName] = newValue;
                if (callback) {
                    callback(newValue, previous);
                }
                return newValue;
            }
        }
        return value;
    }

    function addSingleFunction (index, setting, settings, settingsObjects, onCreateNewSettingObject, addAction, executeAction) {
        //create the settings object
        var settingObject = (onCreateNewSettingObject && onCreateNewSettingObject(setting)) || setting;
        //update the setting objects array
        settingsObjects[index] = settingObject;
        //let's update the actual settings
        if (index >= 0) {
            settings[index] = setting;
        } else {
            settings.push(setting);
        }
        //add to the rendering model (it will internally deal with objects vs array)
        if(executeAction && addAction){
            addAction.call(settingsObjects, index, settingObject);
        }
        //Note: once the addActionCall returns, !!settingObject.id === true,
        //meaning the contructor or the addAction will set the value for id.
        //settingObject.id = renderingObject && (renderingObject.id || renderingObject._id);
        return settingObject;
    }

    function addedFunction (index, added, settings, settingsObjects, addAction, onCreateNewSettingObject, executeAction) {
        var length, i, setting;
        //if array, let's add all the elements
        if (isArray(added)) {
            length = added.length;
            for (i = 0; i < length; i++) {
                setting = added[i];
                addSingleFunction(index + i, setting, settings, settingsObjects, onCreateNewSettingObject, addAction, executeAction);
            }
        } else {
            addSingleFunction(index, added, settings, settingsObjects, onCreateNewSettingObject, addAction, executeAction);
        }
    }

    function createArrayPropertyProxy (settings, addAction, updateAction, removeAction, clearAction, onCreateNewSettingObject, executeAction) {
        var
            settingObjects = { array: [] },
            result;

        executeAction = executeAction === undefined || executeAction;

        function callbackFunction (index, added, updated, removed) {
            var
                settingObject,
                formerObject;

            //if it was an update...
            if (updated) {
                formerObject = settingObjects[index];
                //create a new settings object
                settingObject = (onCreateNewSettingObject && onCreateNewSettingObject(updated)) || updated;
                //it will only be one element. There is no way to update multiple elements at a time
                //lets update the settings
                settings[index] = updated;
                //put it in the repository
                settingObjects.array[index] = settingObject;
                //it was just update => (no crazy splice)
                //update the rendering repository
                updateAction.call(settingObjects.array, index, settingObject, formerObject);

            } else {
                //if index => splice
                if (index >= 0) {
                    //if there were elements removed
                    if (removed) {
                        //lets synchronize the settings => if array, then do many else 1
                        settings.splice(index, removed.splice ? removed.length : 1);
                        //update the repository first (we will render multiple times)
                        removeAction.call(settingObjects.array, index, removed);
                    }
                    //if there were elements added
                    if (added) {
                        addedFunction(index, added, settings, settingObjects.array, addAction, onCreateNewSettingObject, executeAction);
                    }
                } else {
                    //quickly remove all the graphs and set them
                    if (!clearAction) {
                        throw new Error('clear action is required. I know but we can\'t take the responsibility');
                    }
                    //settingObjects.array = settingObjects.array || [];
                    settingObjects.array = [];
                    if (executeAction) {
                        clearAction.call(settingObjects.array, removed || []);
                    }
                    if (added) {
                        addedFunction(0, added, settings, settingObjects.array, addAction, onCreateNewSettingObject, executeAction);
                    }
                }
            }
        }

        result = arrayProperty(settingObjects, "array", callbackFunction);
        callbackFunction(undefined, settings);
        executeAction = true;
        result.setingsObject = settingObjects.array;
        result.settings = settings;

        return result;
    }

    function createPropertyProxy (settings, propertyName, changeAction, onCreateSettingObject, executeAction) {
        var
            storage = { value: undefined },
            result;

        executeAction = executeAction === undefined || executeAction;
        function onNewValue (newValue, oldValue) {
            var newStorage = onCreateSettingObject ? onCreateSettingObject(newValue) : newValue;
            settings[propertyName] = newValue;
            storage.value = newStorage;

            if (executeAction) {
                changeAction(newStorage, oldValue);
            }

            result.setingsObject = storage.value;
            result.settings = settings;
        }

        result = property(storage, 'value', onNewValue);

        //let's initialize
        onNewValue(settings[propertyName]);
        executeAction = true;
        result.setingsObject = storage.value;
        result.settings = settings;

        return result;
    }

    //function Utilities(){}
    //Utilities.prototype =

    return {
        isArray: isArray,
        isObject:isObject,
        getNode:getNode,
        notNull:notNull,
        isNode: isNode,

        eventDelegation: function(enabled){
            return enabled ? eventDelegator : null;
        },

        cap : function (text) {
            return text? text.charAt(0).toUpperCase() + text.slice(1):text;
        },

        uncap: function (object) {
            var newPropName, prop;
            for (prop in object) {
                if (object.hasOwnProperty(prop)) {
                    newPropName = prop.charAt(0).toLowerCase() + prop.slice(1);
                    if (newPropName !== prop) {
                        object[newPropName] = object[prop];
                        delete object[prop];
                    }
                }
            }
            return object;
        },

        changeCssText: function (el, newValue, oldValue) {
            el = getNode(el);
            if (newValue) {
                el.style.cssText = newValue;
            } else {
                if (oldValue) {
                    el.style.cssText = '';
                }
            }
        },

        changeCssClass: function (el, newValue, oldValue) {
            el = getNode(el);
            if (oldValue) {
                el.classList.remove(oldValue);
            }
            if (newValue) {
                el.classList.add(newValue);
            }
        },

        style: function(node, prop, value){
            var key;
            if(typeof prop === 'object'){
                for(key in prop){
                    if(prop.hasOwnProperty(key)){
                        this.style(node, key, prop[key]);
                    }
                }
                return null;
            }else if(value !== undefined){
                if(typeof value === 'number' && isDimension[prop]){
                    value += 'px';
                }
                node.style[prop] = value;

                if(prop === 'userSelect'){
                    this.style(node, {
                        webkitTouchCallout: 'none',
                        webkitUserSelect: 'none',
                        khtmlUserSelect: 'none',
                        mozUserSelect: 'none',
                        msUserSelect: 'none'
                    });
                }
            }

            // TODO - make more robust
            return node.style[prop];
        },

        atts: function(node, prop, value){
            var key;
            if(typeof prop === 'object'){
                for(key in prop){
                    if(prop.hasOwnProperty(key)){
                        this.atts(node, key, prop[key]);
                    }
                }
                return null;
            }else if(value !== undefined){
                node.setAttribute(prop, value);
            }

            // TODO - make more robust
            return node.getAttribute(prop);
        },

        box: function(node){
            return getNode(node).getBoundingClientRect();
        },

        zindexes:{
            'chart':0,
            'xaxis':0
        },

        zindex: function(type){
            return (++this.zindexes[type]);
        },

        show: function(node){
            getNode(node).classList.remove('off');
        },

        hide: function(node){
            getNode(node).classList.add('off');
        },

        dom: function(nodeType, options, parent, prepend){
            options = options || {};
            var
                className = options.css || options.className,
                node = document.createElement(nodeType);

            parent = getNode(parent);

            if(className){
                node.className = className;
            }

            if(options.html){
                node.innerHTML = options.html;
            }

            if(options.cssText){
                node.style.cssText = options.cssText;
            }

            if(options.style){
                this.style(node, options.style);
            }

            if(options.atts){
                this.atts(node, options.atts);
            }

            if(parent && isNode(parent)){
                if(prepend && parent.hasChildNodes()){
                    parent.insertBefore(node, parent.children[0]);
                }else{
                    parent.appendChild(node);
                }
            }

            return node;
        },

        destroy: function(node){
            destroyer.appendChild(node);
            destroyer.innerHTML = '';
        },

        mixin: function(){
            var
                options, name, src, copy, copyIsArray, clone,
                target = arguments[0] || {},
                i = 1,
                length = arguments.length,
                deep = false;

            // Handle a deep copy situation
            if ( typeof target === "boolean" ) {
                deep = target;
                target = arguments[1] || {};
                // skip the boolean and the target
                i = 2;
            }

            // Handle case when target is a string or something (possible in deep copy)
            if ( typeof target !== "object" && typeof target !== 'function' ) {
                target = {};
            }

            for ( ; i < length; i++ ) {
                options = arguments[ i ];
                // Only deal with non-null/undefined values
                if ( notNull(options) ) {
                    // Extend the base object
                    for ( name in options ) {
                        //if(options.hasOwnProperty(name)){
                            src = target[ name ];
                            copy = options[ name ];

                            // Prevent never-ending loop
                            if ( target === copy ) {
                                continue;
                            }

                            // Recurse if we're merging plain objects or arrays
                            if ( deep && copy && ( isObject(copy) || (copyIsArray = isArray(copy)))) {
                                if ( copyIsArray ) {
                                    copyIsArray = false;
                                    clone = src && isArray(src) ? src : [];

                                } else {
                                    clone = src && isObject(src) ? src : {};
                                }

                                // Never move original objects, clone them
                                target[ name ] = this.mixin( deep, clone, copy );

                            // Don't bring in undefined values
                            } else if ( copy !== undefined ) {
                                target[ name ] = copy;
                            }
                        //}
                    }
                }
            }

            // Return the modified object
            return target;
        },

        _clearId: function (setting, processed) {
            // recursively remove all IDs in an object
            var
                i,
                prop,
                value = 1,
                length,
                type = setting && typeof (setting),
                result = false;
            
            if (setting && (type === 'object' || isArray(setting))) {
                if (!this.linearSearch(processed, setting).found) {
                    processed.push(setting);
                    //if it is an array
                    if (isArray(setting)) {
                        length = setting.length;

                        for (i = 0; i < length; i++) {
                            value = setting[i];
                            type = typeof(value);
                            if (value && (type === 'object' || value.splice)) {
                                result = this._clearId(value, processed) || result;
                                if (!result) {
                                    break;
                                }
                            }
                        }
                    } else {
                        result = !!setting.id;
                        delete setting.id;
                        for (prop in setting) {
                            if (setting.hasOwnProperty(prop) && prop.indexOf('$')<0) {
                                value = setting[prop];
                                type = typeof (value);
                                if (value && (type === 'object' || value.splice)) {
                                    result = this._clearId(value, processed) || result;
                                }
                            }
                        }
                    }
                }
            }
            return result;
        },

        retrieveSettings : function (settingsObject) {
            // make a copy of the settings object
            var
                object = this.getValue(settingsObject),
                settings = object && (object._settings || object),
                result,
                processed = [];

            if (settings) {
                //result = this.mixin(true, {}, settings);
                result = this.mixin(true, {}, settings);
                this._clearId(result, processed);
            }
            return result;
        },

        //pushArray: function (arr, arr2) {
        //    if (arr2 && arr2.length) {
        //        arr.push.apply(arr, arr2);
        //    }
        //},

        settingProperty: function (settings, propertyName, callback) {
            return property(settings, propertyName, callback);
        },

        settingArrayProperty: function (settings, propertyName, callback) {
            return arrayProperty(settings, propertyName, callback);
        },

        settingPropertyProxy: function (settings, propertyName, changeAction, onCreateSettingObject, autoInit) {
            return createPropertyProxy(settings, propertyName, changeAction, onCreateSettingObject, autoInit);
        },

        settingArrayPropertyProxy: function (settings, addAction, updateAction, removeAction, clearAction, onCreateSettingObject, autoInit) {
            return createArrayPropertyProxy(settings, addAction, updateAction, removeAction, clearAction, onCreateSettingObject, autoInit);
        },

        settingsToJS: function (settings) {
            var result, type = typeof settings, field;
            switch (type) {
                case 'function':
                    result = settings();
                    break;
                case 'object':
                case 'array':
                    result = isArray(settings) ? [] : {};
                    for (field in settings) {
                        if (settings.hasOwnProperty(field)) {
                            if (isArray(settings)) {
                                result[field] = this.settingsToJS(settings[field]);
                            }
                        }
                    }
                    break;
                default:
                    result = settings;
            }
            return result;
        },

        property: function (options) {
            if (options.get && typeof options.get !== "function") {
                throw new Error('invalid property get');
            }
            options.get = options.get || function () {
                throw new Error("Property is write-only");
            };
            if (options.set && typeof options.set !== "function") {
                throw new Error('invalid property get');
            }
            options.set = options.set || function (value) {
                throw new Error("Property is read-only");
            };
            var
                owner = options.owner,
                property = function (newValue) {
                    if (!arguments.length) {
                        return options.get.call(owner);
                    } else {
                        return options.set.call(owner, newValue);
                    }
                };
            return property;
        },

        areArraysEqual: function (array1, array2) {
            return this.isEqual(array1, array2, []);
        },
        
        getValue: function (o) {
            return (typeof o === 'function' ? o() : o);
        },
        
        isEqual: function (a, b) {
            return JSON.stringify(a) === JSON.stringify(b);
        },

        linearSearch: function (buffer, find) {
            var
                length = buffer && buffer.length,
                i,
                result = {index: length, found: false};
                
            for (i = 0; i < length; i++) {
                if (find === buffer[i]) {
                    result.index = i;
                    return result;
                }
            }
            return result;
        },

        findTimeIndexinData: function (data, timeStamp) {
            //TODO: optimize
            return this.binarySearch(data, { timeStamp: timeStamp }, this.timeStampedObjectComparator);
        },

        findFloorIndex: function (data, timeStamp) {
            var
                search = this.binarySearch(data, timeStamp, this.mixTimeStampComparator);
            if (!search.found) {
                if (search.index > 0) {
                    search.index--;
                }
            }
            return search.index;
        },

        findFloor: function (data, timeStamp) {
            var search = this.binarySearch(data, timeStamp, this.mixTimeStampComparator);
            if (!search.found) {
                if (search.index > 0) {
                    search.index--;
                }
            }
            return search;
        },

        findCeil: function (data, timeStamp) {
            var search = this.binarySearch(data, timeStamp, this.mixTimeStampComparator);
            return search;
        },

        findCeilIndex: function (data, timeStamp) {
            var search = this.binarySearch(data, timeStamp, this.mixTimeStampComparator);
            return search.index;
        },

        binarySearch: function (buffer, find, comparator, low, high) {
            var
                result = {
                    index: 1,
                    found: false
                },
                mid, comparison, found = false;
                
            if (buffer && buffer.length) {
                if (arguments.length < 4) {
                    low = 0;
                    high = buffer.length - 1;
                }

                //compare with the highest index
                comparison = comparator(find, buffer[high]);
                //if it would be higher than that                
                if (comparison >= 0) {
                    //should be added
                    result.found = comparison === 0;
                    result.index = high + (result.found? 0 : 1);
                } else {
                    //compare with the lower end
                    comparison = comparator(find, buffer[low]);
                    //if is less than lower
                    if (comparison <= 0) {
                        //should be added
                        result.found = comparison === 0;
                        result.index = low + (result.found ? 0 : -1);
                    } else {

                        while (low <= high) {
                            mid = Math.floor((low + high) / 2);

                            comparison = comparator(find, buffer[mid]);

                            if (comparison === 0) {
                                found = true;
                                low = mid;
                                break;
                            }

                            if (comparison > 0) {
                                low = mid + 1;
                            } else {
                                high = mid - 1;

                            }
                        }

                        result.index = low;
                        result.found = found;
                    }
                }
            }

            return result;
        },

        binarySet: function (buffer, find, comparator) {
            var
                idx,
                search = this.binarySearch(buffer, find, comparator);

            if (search.found) {
                this.mixin(true, buffer[search.index], find);
            } else {
                idx = search.index;

                if (idx >= 0 && idx < buffer.length) {
                    buffer.splice(idx, 0, find);
                } else if (idx < 0) {
                    buffer.splice(0, 0, find);
                } else {
                    buffer.push(find);
                    search.index = buffer.length - 1;
                }
            }
            return search;
        },

        searchClosestTimeStamp: function (buffer, find) {
            var
                search,
                b1,
                b2;

            if (buffer && buffer.length) {
                search = this.binarySearch(buffer, find, this.timeStampedObjectComparator);
                if (!search.found) {
                    if (search.index >= 0 && search.index < buffer.length) {
                        b1 = Math.abs(buffer[search.index].timeStamp - find.timeStamp);
                        b2 = Math.abs(buffer[search.index - 1].timeStamp - find.timeStamp);
                        b2 = b2 - (b2 % 1);
                        if (b2 < b1) {
                            search.index = search.index - 1;
                        }
                        search.found = true;
                    } else if (search.index >= buffer.length) {
                        search.index = buffer.length - 1;
                        search.found = true;
                    } else {
                        search.index = 0;
                        search.found = true;
                    }
                }
            } else {
                search = {
                    found: false,
                    index: -1
                };

            }
            return search;
        },

        //binary search expects -1..1
        timeStampedObjectComparator: function (dpa, dpb) {
            return  dpa.timeStamp - dpb.timeStamp;
        },

        mixTimeStampComparator: function (dpa, dpb) {
            return dpa - dpb.timeStamp;
        },

        rangeComparator: function (oldValues, newValues) {
            return oldValues[0] !== newValues[0] || oldValues[1] !== newValues[1];
        },

        fullYearComparator: function (date1, date2) {
            return date1.getFullYear() - date2.getFullYear();
        },

        monthOfYearComparator: function (date1, date2) {
            return date1.getMonth() - date2.getMonth();
        },

        weekOfYearComparator: function (date1, date2) {
            return this.getWeek(date1) - this.getWeek(date2); /* MT: this.getMyWeek(date2 ) was causing errors */
        },

        dayOfMonthComparator: function (date1, date2) {
            return date1.getDate() - date2.getDate();
        },

        hourOfDayComparator: function (date1, date2) {
            return date1.getHours() - date2.getHours();
        },

        MinuteOfHourComparator: function (date1, date2) {
            return date1.getMinutes() - date2.getMinutes();
        },

        SecondOfMinuteComparator: function (date1, date2) {
            return date1.getSeconds() - date2.getSeconds();
        },

        DateFromWcf: function (json) {
            var
                pattern = /Date\(([^)]+)\)/,
                results = pattern.exec(json);

            if (results.length !== 2) {
                throw new Error(json + " is not .net json date.");
            }
            return new Date(parseFloat(results[1]));
        },

        identityFunction: function (value) {
            return value;
        },

        DateToWcf: function (json) {
            var
                d = new Date(json);

            if (isNaN(d)) {
                throw new Error("input not date");
            }

            return '\/Date(' + d.getTime() + ')\/';
        },

        formatNumberWithSpecificLength: function (number, length) {
            var output = '00000000000000' + number.toString();
            return output.substring(output.length - length);
        },

        limitsCalculator: function (stream, dataPoint, previousLimits) {

            var
                minValue, maxValue, length, value,
                dataValues = dataPoint.values,
                paintablePoints;


            if (!previousLimits) {
                minValue = Number.MAX_VALUE;
                maxValue = Number.MIN_VALUE;
                previousLimits = {
                    minValue: minValue,
                    maxValue: maxValue
                };
            }
            paintablePoints = stream.paintablePoints;

            if (paintablePoints) {
                length = paintablePoints.length;
                maxValue = minValue = dataValues[paintablePoints[0]].value;
                length--;

                for (value = dataValues[paintablePoints[length]].value; length; value = dataValues[paintablePoints[--length]].value) {
                    if (value > maxValue) {
                        maxValue = value;
                    }

                    if (value < minValue) {
                        minValue = value;
                    }
                }
            } else {
                minValue = dataValues[stream.minValueDataDefinitionIndex].value;
                maxValue = dataValues[stream.maxValueDataDefinitionIndex].value;
            }

            previousLimits.minValue = minValue;
            previousLimits.maxValue = maxValue;

            return previousLimits;
        },

        removeLimits: function (stream, beginTimeStamp, endTimeStamp) {
            //Note: the timestamps are the indexedData timestamps not the stream's
            var
                result, timeLimits, streamBegin, streamBeginIndex, streamEnd, streamEndIndex, valueLimits,
                data = stream.data,
                timeLimit, dirtyTimeLimits = false,
                valueLimit = null,
                isTrimOnLeft;

            if (stream.limits) {

                //console.log('removing ' + stream.name + ' | begin: ' + beginTimeStamp + ', end:' + endTimeStamp + ', limits: ' + JSON.stringify(stream.limits, null, 2));

                timeLimits = stream.limits.time;
                streamBegin = this.findTimeIndexinData(data, timeLimits, beginTimeStamp);
                streamBeginIndex = streamBegin.index;

                if (streamBeginIndex < 0) {
                    streamBeginIndex = 0;
                }

                streamEnd = this.findTimeIndexinData(data, timeLimits, endTimeStamp);
                streamEndIndex = streamEnd.index;

                if (!streamEnd.found) {
                    streamEndIndex = streamEndIndex - 1;
                }

                //if no values to remove, return the current limits
                if (streamEndIndex - streamBeginIndex < 0) {
                    return stream.limits;
                }

                valueLimits = stream.limits.value;
                //if min index or max index for values out to be removed
                if ((valueLimits.minValueIndex >= streamBeginIndex && valueLimits.minValueIndex <= streamEndIndex) ||
                    (valueLimits.maxValueIndex >= streamBeginIndex && valueLimits.maxValueIndex <= streamEndIndex)) {
                    //no value limits
                    valueLimit = null;
                } else {
                    //we keep the value limits
                    valueLimit = valueLimits;
                }

                dirtyTimeLimits = timeLimits.minValueIndex !== streamBeginIndex || timeLimits.maxValueIndex !== streamEndIndex;

                if (dirtyTimeLimits) {
                    isTrimOnLeft = timeLimits.minValueIndex === streamBeginIndex;
                    if (isTrimOnLeft && !streamEnd.found) {
                        streamEndIndex = streamEndIndex + 1;
                        if (streamEndIndex > stream.data.length) {
                            streamEndIndex = stream.data.length - 1;
                        }
                    }

                    if (!isTrimOnLeft && streamBeginIndex > 0) {
                        streamBeginIndex = streamBeginIndex - 1;
                    }


                    timeLimit = {
                        minValueIndex: isTrimOnLeft ? streamEndIndex : timeLimits.minValueIndex,
                        minValue: isTrimOnLeft ? data[streamEndIndex].timeStamp : data[timeLimits.minValueIndex].timeStamp,
                        maxValueIndex: isTrimOnLeft ? timeLimits.maxValueIndex : streamBeginIndex,
                        maxValue: isTrimOnLeft ? data[timeLimits.maxValueIndex].timeStamp : data[streamBeginIndex].timeStamp
                    };
                } else {
                    return null;
                }

                result = {
                    value: valueLimit,
                    dirtyValueLimits: valueLimit === null,
                    time: timeLimit,
                    dirtyTimeLimits: dirtyTimeLimits
                };
                
                return result;
            } else {
                return null;
            }

        },

        combineLimitsItem: function (limits, newLimits) {
            var
                condMin,
                condMax,
                limit;

            condMin = limits.minValue > newLimits.minValue;
            condMax = limits.maxValue < newLimits.maxValue;
            limit = {
                minValueIndex: (condMin) ? newLimits.minValueIndex : limits.minValueIndex,
                minValue: condMin ? newLimits.minValue : limits.minValue,
                maxValue: (condMax) ? newLimits.maxValue : limits.maxValue,
                maxValueIndex: condMax ? newLimits.maxValueIndex : limits.maxValueIndex
            };

            limit.hasChanged = condMin || condMax;

            return limit;
        },

        combineLimits: function (limits, newLimits) {
            var
                result = null,
                newTimeLimits,
                valueLimits,
                newValueLimits,
                timeLimits;

            if (limits && limits.time) {
                timeLimits = limits.time;
                valueLimits = limits.value;

                if (newLimits && newLimits.time) {
                    newTimeLimits = this.combineLimitsItem(timeLimits, newLimits.time);

                    newValueLimits = this.combineLimitsItem(valueLimits, newLimits.value);
                } else {
                    newTimeLimits = timeLimits;
                    newValueLimits = valueLimits;
                }

                result = {
                    time: newTimeLimits,
                    dirtyTimeLimits: newTimeLimits.hasChanged,
                    value: newValueLimits,
                    dirtyValueLimits: newValueLimits.hasChanged,
                    hasChanged: newTimeLimits.hasChanged || newValueLimits.hasChanged
                };
            }

            return result;
        },

        findTimeIndexinData: function (data, timeLimit, timeStamp) {
            //TODO: optimize ?
            return this.binarySearch(data, timeStamp, this.mixTimeStampComparator);
        },

        getNewValueLimits: function (stream, datapoint, index, oldLimits) {
            var
                limits = this.temporaryValueLimits = this.limitsCalculator(stream, datapoint, this.temporaryValueLimits),
                streamLimits = oldLimits; // ? oldLimits : stream.limits.value;

            limits.dirtyValueLimits = false;
            if (limits.minValue < streamLimits.minValue) {
                limits.dirtyValueLimits = true;
                limits.minValueIndex = index;
            } else {
                limits.minValue = streamLimits.minValue;
                limits.minValueIndex = streamLimits.minValueIndex;
            }
            if (limits.maxValue > streamLimits.maxValue) {
                limits.dirtyValueLimits = true;
                limits.maxValueIndex = index;
            } else {
                limits.maxValue = streamLimits.maxValue;
                limits.maxValueIndex = streamLimits.maxValueIndex;
            }
            if (limits.dirtyValueLimits) {
                return limits;
            } else {
                return null;
            }
        },

        copyLimits: function (source, target) {
            target = target || {};
            target.minValue = source.minValue;
            target.minValueIndex = source.minValueIndex;
            target.maxValue = source.maxValue;
            target.maxValueIndex = source.maxValueIndex;
            target.dirtyValueLimits = source.dirtyValueLimits;
            return target;
        },

        findStreamValueLimits: function (stream, beginIdx, endIdx) {
            var
                idx, valueLimits, resultValueLimits,
                datapoint,
                data = stream.data,
                dataLength = data ? data.length : 0;

            this.temporaryValueLimits = null;

            valueLimits = this.temporaryValueLimits = this.limitsCalculator(stream, data[beginIdx], this.temporaryValueLimits);
            valueLimits.minValueIndex = beginIdx;
            valueLimits.maxValueIndex = beginIdx;

            resultValueLimits = this.copyLimits(valueLimits);

            valueLimits.dirtyValueLimits = false;

            for (idx = beginIdx + 1; idx <= endIdx && idx < dataLength; idx++) {
                datapoint = data[idx];
                valueLimits = this.getNewValueLimits(stream, datapoint, idx, resultValueLimits);

                if (valueLimits) {
                    this.copyLimits(valueLimits, resultValueLimits);
                    valueLimits.dirtyValueLimits = false;
                }
            }
            return resultValueLimits;
        },

        colorToHex: function (color) {
            if (color.substr(0, 1) === '#') {
                return color;
            }
            var
                digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(color),
                red = parseInt(digits[2], 10),
                green = parseInt(digits[3], 10),
                blue = parseInt(digits[4], 10),
                rgb = blue | (green << 8) | (red << 16);

            return digits[1] + '#' + rgb.toString(16);
        },

        hexToR: function (h) { return parseInt(h.substring(0, 2), 16); },

        hexToG: function (h) { return parseInt(h.substring(2, 4), 16); },

        hexToB: function (h) { return parseInt(h.substring(4, 6), 16); },

        cutHex: function (h) { return (h.charAt(0) === "#") ? h.substring(1, 7) : h; },

        hexToColor: function (hex) {
            if (hex && hex.charAt(0) === "#") {
                var
                    h = this.cutHex(hex),
                    r = this.hexToR(h),
                    g = this.hexToG(h),
                    b = this.hexToB(h);

                return r + ', ' + g + ', ' + b;
            }
            else {
                return hex;
            }
        },

        searchIndexesInDataPoints: function (dataPoints, nameMap) {
            var
                i, dp,
                dpLength = dataPoints && dataPoints.length;

            if (dpLength && nameMap) {
                for (i = 0; i < dpLength; i++) {
                    dp = dataPoints[i];
                    if (nameMap[dp.name]) {
                        nameMap[dp.name] = i;
                    }
                }
            }
            return nameMap;
        },

        findLimitsInStreamRange: function (stream, beginTimeStamp, endTimeStamp) {
            var
                data = stream.data,
                currentLimits = stream.limits || null,
                timelimits = currentLimits || null,
                begin, beginIdx, end, endIdx,
                result = null;
            if (data.length) {
                begin = this.findTimeIndexinData(data, timelimits, beginTimeStamp);
                beginIdx = begin.index;
                end = this.findTimeIndexinData(data, timelimits, endTimeStamp);
                endIdx = end.index;
                if (!end.found) {
                    endIdx--;
                }

                if (beginIdx <= data.length - 1 && endIdx >= 0 && endIdx >= beginIdx) {
                    if (beginIdx < 0) {
                        beginIdx = 0;
                    }
                    if (endIdx >= data.length) {
                        endIdx = data.length - 1;
                    }
                    result = {
                        time: {
                            minValueIndex: beginIdx,
                            minValue: data[beginIdx].timeStamp,
                            maxValue: data[endIdx].timeStamp,
                            maxValueIndex: endIdx
                        },
                        value: this.findStreamValueLimits(stream, beginIdx, endIdx)
                    };
                }
            }
            return result;
        },

        //guidGenerator: function () {
        //    var s4 = function () {
        //        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        //    };
        //    return (s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4());
        //},

        idGenerator: function (type) {
            if(!type){
                console.trace('');
            }
            return uid(type);
        },

        uid: function(type){
            return uid(type);
        },

        getWeek: function (date) {
            var onejan = new Date(date.getFullYear(), 0, 1);
            return Math.ceil((((date - onejan) / 86400000) + onejan.getDay() + 1) / 7);
        },


        // given the precision computes the length (number of digits) for a price 
        computePriceLength: function (price, priceScale) {
            return price.toFixed(this.computeDecimalPlaces(priceScale)).toString().length;
        },

        computeDecimalPlaces: function (priceScale) {
            return Math.ceil(1 / priceScale).toString().length - 1;
        },

        format: function (date, format, resourceManager) {
            var
                curChar, i, returnStr = '',
                replace = this.replaceChars;

            for (i = 0; i < format.length; i++) {
                curChar = format.charAt(i);
                if (i - 1 >= 0 && format.charAt(i - 1) === "\\") {
                    returnStr += curChar;
                } else if (replace[curChar]) {
                    returnStr += replace[curChar].call(date, resourceManager);
                } else if (curChar !== "\\") {
                    returnStr += curChar;
                }
            }
            return returnStr;
        },

        replaceChars: {
            shortMonths: function (resourceManager) { return resourceManager.getResource('lblMonths_short_key'); },
            longMonths: function (resourceManager) { return resourceManager.getResource('lblMonths_key'); },
            shortDays: function (resourceManager) { return resourceManager.getResource('lblDays_short_key'); },
            longDays: function (resourceManager) { return resourceManager.getResource('lblDays_key'); },
            am_pm: [
                function (resourceManager) { return resourceManager.getResource('lblam_short_key'); },
                function (resourceManager) { return resourceManager.getResource('lblAM_short_key'); },
                function (resourceManager) { return resourceManager.getResource('lblpm_short_key'); },
                function (resourceManager) { return resourceManager.getResource('lblPM_short_key'); }],
            d: function () { return (this.getDate() < 10 ? '0' : '') + this.getDate(); },
            D: function (resourceManager) { return this.replaceChars.shortDays(resourceManager)[this.getDay()]; },
            j: function () { return this.getDate(); },
            l: function (resourceManager) { return this.replaceChars.longDays(resourceManager)[this.getDay()]; },
            N: function () { return this.getDay() + 1; },
            S: function () { return (this.getDate() % 10 === 1 && this.getDate() !== 11 ? 'st' : (this.getDate() % 10 === 2 && this.getDate() !== 12 ? 'nd' : (this.getDate() % 10 === 3 && this.getDate() !== 13 ? 'rd' : 'th'))); },
            w: function () { return this.getDay(); },
            z: function () {
                var d = new Date(this.getFullYear(), 0, 1);
                return Math.ceil((this - d) / 86400000);
            },
            W: function () {
                var d = new Date(this.getFullYear(), 0, 1);
                return Math.ceil((((this - d) / 86400000) + d.getDay() + 1) / 7);
            },
            F: function (resourceManager) { return this.replaceChars.longMonths(resourceManager)[this.getMonth()]; },
            m: function () { return (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1); },
            M: function (resourceManager) { return this.replaceChars.shortMonths(resourceManager)[this.getMonth()]; },
            n: function () { return this.getMonth() + 1; },
            t: function () {
                var d = new Date();
                return new Date(d.getFullYear(), d.getMonth(), 0).getDate();
            },
            L: function () {
                var year = this.getFullYear();
                return (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0));
            },
            o: function () {
                var d = new Date(this.valueOf());
                d.setDate(d.getDate() - ((this.getDay() + 6) % 7) + 3);
                return d.getFullYear();
            },
            Y: function () { return this.getFullYear(); },
            y: function () { return (this.getFullYear().toString()).substr(2); },
            a: function (resourceManager) { return this.getHours() < 12 ? resourceManager.getResource('lblam_short_key') : resourceManager.getResource('lblpm_short_key'); },
            A: function (resourceManager) { return this.getHours() < 12 ? resourceManager.getResource('lblAM_short_key') : resourceManager.getResource('lblPM_short_key'); },
            B: function () { return Math.floor((((this.getUTCHours() + 1) % 24) + this.getUTCMinutes() / 60 + this.getUTCSeconds() / 3600) * 1000 / 24); },
            g: function () { return this.getHours() % 12 || 12; },
            G: function () { return this.getHours(); },
            h: function () { return ((this.getHours() % 12 || 12) < 10 ? '0' : '') + (this.getHours() % 12 || 12); },
            H: function () { return (this.getHours() < 10 ? '0' : '') + this.getHours(); },
            i: function () { return (this.getMinutes() < 10 ? '0' : '') + this.getMinutes(); },
            s: function () { return (this.getSeconds() < 10 ? '0' : '') + this.getSeconds(); },
            u: function () {
                var m = this.getMilliseconds();
                return (m < 10 ? '00' : (m < 100 ? '0' : '')) + m;
            },
            e: function () { return "Not Yet Supported"; },
            I: function () { return "Not Yet Supported"; },
            O: function () { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + '00'; },
            P: function () { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + ':00'; },
            T: function () {
                var result, m = this.getMonth();
                this.setMonth(0);
                result = this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/, '$1');
                this.setMonth(m);
                return result;
            },
            Z: function () { return -this.getTimezoneOffset() * 60; },
            c: function () { return this.format("Y-m-d\\TH:i:sP"); },
            r: function () { return this.toString(); },
            U: function () { return this.getTime() / 1000; }
        },



        //0: "Automatic"-
        //1: "0 Decimals"-
        //2: "1 Decimals"-
        //3: "2 Decimals"-
        //4: "3 Decimals"-
        //5: "4 Decimals"-
        //6: "5 Decimals"-
        //7: "Simplest Fraction"- 
        //8: "1/2-Halves"-
        //9: "1/4-Fourths"
        //10: "1/8-Eights"
        //11: "1/16-Sixteenths"
        //12: "1/32-ThirtySeconds"
        //13: "1/64-SixtyFourths"
        //14: "1/128-OneTwentyEigths"
        //15: "1/256-TwoFiftySixths"
        //16: "10ths and Quarters"
        //17: "32nds and Halves"
        //18: "32nds and Quarters"
        //19: "32nds and Eights"
        //20: "32nds and Tenths"
        //21: "64ths and Halves"
        //22: "64ths and Tenths"
        //23: "6 Decimals"

        formatPrice_OneFraction: function (price, denominator) {
            var parts = price.toString().split('.'), formattedPrice = '', fraction = 0;

            if (parts.length > 1) {
                fraction = Math.floor(parseFloat(parts[1]) * denominator * Math.pow(10, -1 * parts[1].length));
            }

            if (fraction) {
                formattedPrice = fraction + '/' + denominator;
            }

            if (parseInt(parts[0], 10)) {

                if (formattedPrice.length) {
                    formattedPrice = parts[0] + ' ' + formattedPrice;
                } else {
                    formattedPrice = parts[0];
                }
            }

            return formattedPrice;
        },

        formatPrice_halves: function (price) {
            return this.formatPrice_OneFraction(price, 2);
        },

        formatPrice_fourths: function (price) {
            return this.formatPrice_OneFraction(price, 4);
        },

        formatPrice_eights: function (price) {
            return this.formatPrice_OneFraction(price, 8);
        },

        formatPrice_sixteenths: function (price) {
            return this.formatPrice_OneFraction(price, 16);
        },

        formatPrice_thirtySeconds: function (price) {
            return this.formatPrice_OneFraction(price, 32);
        },

        formatPrice_sixtyFourths: function (price) {
            return this.formatPrice_OneFraction(price, 64);
        },

        formatPrice_oneTwentyEigths: function (price) {
            return this.formatPrice_OneFraction(price, 128);
        },

        formatPrice_twoFiftySixths: function (price) {
            return this.formatPrice_OneFraction(price, 256);
        },

        formatPrice_tenthsAndQuaters: function (price) {
            var parts = price.toString().split('.'), formattedPrice = '', fraction, intOfFraction;

            if (parts.length > 1) {
                parts = (parseFloat(parts[1]) / 0.1).toString().split('.');

                intOfFraction = parts[0];

                fraction = parseFloat(parts[1]) / 0.25;

                formattedPrice = ' \'' + intOfFraction + '.' + fraction;
            }

            if (parseInt(parts[0], 10)) {

                if (formattedPrice.length) {
                    formattedPrice = parts[0] + formattedPrice;
                } else {
                    formattedPrice = parts[0] + ' \'00.0';
                }
            }

            return formattedPrice;
        },

        formatPrice_thirtySecondsAndAny: function (price) {
            var parts = price.toString().split('.'), formattedPrice = '', fraction, intOfFraction;

            price = parts[0];

            if (parts.length > 1) {

                parts = (parseFloat(parts[1]) * 32 * Math.pow(10, -1 * parts[1].length)).toString().split('.');

                intOfFraction = parts[0];

                if (parts.length > 1) {
                    fraction = parts[1].substr(0, 1);
                } else {
                    fraction = 0;
                }

                formattedPrice = ' \'' + (intOfFraction.length < 2 ? '0' : '') + intOfFraction + '.' + fraction;
            }

            if (parseInt(price, 10)) {

                if (formattedPrice.length) {
                    formattedPrice = price + formattedPrice;
                } else {
                    formattedPrice = price + ' \'00.0';
                }
            }

            return formattedPrice;
        },

        formatPriceSimpleFraction: function (price) {
            var formattedPrice = '', fractionNumerator, fractionDenominator,
            parts = price.toString().split('.'),
            fraction = 0;

            if (parts.length > 1) {
                fraction = parseFloat(parts[1]);
            }

            if (fraction) {
                if (fraction === 0.5) {
                    fractionNumerator = '1';
                    fractionDenominator = '2';
                } else {
                    fractionNumerator = Math.floor(fraction / 0.25);

                    if (fraction === 0.25 * fractionNumerator) {

                        fractionDenominator = '4';

                    } else {

                        fractionNumerator = Math.floor(fraction / 0.125);

                        if (fraction === 0.125 * fractionNumerator) {

                            fractionDenominator = '8';

                        } else {

                            fractionNumerator = Math.floor(fraction / 0.0625);

                            if (fraction === 0.625 * fractionNumerator) {

                                fractionDenominator = '16';

                            } else {

                                fractionNumerator = Math.floor(fraction / 0.3125);

                                if (fraction === 0.3125 * fractionNumerator) {

                                    fractionDenominator = '32';

                                } else {

                                    fractionNumerator = Math.floor(fraction / 0.015625);
                                    fractionDenominator = '64';
                                }
                            }
                        }
                    }
                }

                formattedPrice = fractionNumerator + '/' + fractionDenominator;
            }

            if (parseInt(parts[0], 10)) {

                if (formattedPrice.length) {
                    formattedPrice = parts[0] + ' ' + formattedPrice;
                } else {
                    formattedPrice = parts[0];
                }
            }

            return formattedPrice;
        },

        formatPrice_0_decimals: function (price) {
            return this.formatString(price.toFixed(0));
        },

        formatPrice_1_decimals: function (price) {
            return this.formatString(price.toFixed(1));
        },

        formatPrice_2_decimals: function (price) {
            return this.formatString(price.toFixed(2));
        },

        formatPrice_3_decimals: function (price) {
            return this.formatString(price.toFixed(3));
        },

        formatPrice_4_decimals: function (price) {
            return this.formatString(price.toFixed(4));
        },

        formatPrice_5_decimals: function (price) {
            return this.formatString(price.toFixed(5));
        },

        formatPrice_6_decimals: function (price) {
            return this.formatString(price.toFixed(6));
        },

        formatPriceAuto: function (price) {
            return this.formatString(price);
        },

        formatPercent: function (value) {
            return value.toFixed(2) + '%';
        },

        formatString: function (value) {
            if ((value + 1 - 1) === value) {
                return value.toString();
            } else {
                return ''.concat(value);
            }
        },

        getFormatter: function (displayType) {

            var formatter;

            switch (displayType) {
                case 0:
                    formatter = this.formatPriceAuto;
                    break;
                case 1:
                    formatter = this.formatPrice_0_decimals;
                    break;
                case 2:
                    formatter = this.formatPrice_1_decimals;
                    break;
                case 3:
                    formatter = this.formatPrice_2_decimals;
                    break;
                case 4:
                    formatter = this.formatPrice_3_decimals;
                    break;
                case 5:
                    formatter = this.formatPrice_4_decimals;
                    break;
                case 6:
                    formatter = this.formatPrice_5_decimals;
                    break;
                case 7:
                    formatter = this.formatPriceSimpleFraction;
                    break;
                case 8:
                    formatter = this.formatPrice_halves;
                    break;
                case 9:
                    formatter = this.formatPrice_fourths;
                    break;
                case 10:
                    formatter = this.formatPrice_eights;
                    break;
                case 11:
                    formatter = this.formatPrice_sixteenths;
                    break;
                case 12:
                    formatter = this.formatPrice_thirtySeconds;
                    break;
                case 13:
                    formatter = this.formatPrice_sixtyFourths;
                    break;
                case 14:
                    formatter = this.formatPrice_oneTwentyEigths;
                    break;
                case 15:
                    formatter = this.formatPrice_twoFiftySixths;
                    break;
                case 17:
                case 18:
                    formatter = this.formatPrice_thirtySecondsAndAny;
                    break;
                case 23:
                    formatter = this.formatPrice_6_decimals;
                    break;
                case 100:
                    formatter = this.formatPercent;
                    break;
                case 'Text':
                    formatter = this.formatString;
                    break;
                default:
                    throw new Error('Unsupported displayType: ' + displayType);
            }

            return formatter.bind(this);
        },

        areStreamsBuffering: function (streams) {
            var i, len = streams.length;

            for(i = 0; i < len; i++){
                if(streams[i].isBuffering && streams[i].isBuffering()){
                    return true;
                }
            }
            return false;
        },

        priceFormatterForMeasure: function (price, displayType) {

            var formattedPrice = (this.getFormatter(displayType))(price).split(" ")[0];

            if (displayType > 7 && displayType < 19) {
                if (displayType > 7 && displayType <= 10) {
                    formattedPrice += ' 0/0';
                } else if (displayType > 10 && displayType <= 13) {
                    formattedPrice += ' 00/00';
                } else if (displayType === 14 || displayType === 15) {
                    formattedPrice += ' 000/000';
                } else if (displayType === 17 || displayType === 18) {
                    formattedPrice += ' \'00.0';
                }
            }

            return formattedPrice.replace(/[1-9]/gi, '0');
        },

        endsWith: function (string, substring) {
            var
                length = string.length,
                substrlength = substring.length,
                start = length - substrlength,
                stringEnd = string.substring(start, length);

            return stringEnd.toLowerCase() === substring.toLowerCase();
        },

        //This function fixes problems with wrong position in Chrome
        getRelativeLeftPosition: function ($obj) {
            return $obj.offset().left - $obj.parent().offset().left;
        },

        throwError: function (e) {
            var errObj = new Error(e.message);
            errObj.stack = e.stack || 'no stack provided';
            throw errObj;
        }
    };

    //var coordinatesComparator = function (a, b) {
    //
    //    if (b.left > a) {
    //        return -1;
    //    }
    //    else if (b.right < a) {
    //        return 1;
    //    }
    //
    //    return 0;
    //};

    //return new Utilities();
});
