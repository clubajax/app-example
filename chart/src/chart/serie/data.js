define([
    'common/Utilities'
], function(utilities){

    //use cases
    //        0- data();
    //        1- data([]);
    //        2- data([data1, data2]);
    //        3- data(4);

    //        4- data.length();
    //        5- data.add(datax);
    //        6- data.removeAt(index);
    //        7- data.remove({ timeStamp: xx });

    function factory(settings){

        function data(value){

            if(typeof value === 'number'){
                return settings.data[value];
            }
            if(value === null){
                value = [];
            }
            if(Array.isArray(value)){
                settings.data = value;
                data.emit();
            }
            
            return settings.data;
        }

        data.emit = function(){
            settings.serie.eventTree.emit(settings.serie.eventTree.events.data, {
                serie: settings.serie,
                data: settings.data
            });
        };

        data.add = function(value){
            var
                dataLength = settings.data ? settings.data.length : 0,
                result;

            //add to storage with btree
            if (dataLength) {
                result = utilities.binarySet(settings.data, value, utilities.timeStampedObjectComparator);
            } else {
                result = settings.data || [];
                settings.data.push(value);
                result.index = 0;
            }

            //engine.addData(graph._settings.id, yScaleGroup._settings.id, owner._settings.id, data[result.index], result.index, result.found);
            settings.serie.eventTree.emit(settings.serie.eventTree.events.dataPoint, {
                serie: settings.serie,
                data: settings.data,
                item: settings.data[result.index],
                index: result.index,
                found: result.found
            });

            return result;
        };

        data.remove = function(){

        };

        data.removeAt = function(){

        };

        data(settings.data);

        return data;
    }

    return factory;

});
