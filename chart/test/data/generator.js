define([
    'dcl/dcl'
], function(dcl){


    return function(options){
        options = options || {};
        var
            i,
            datum,
            data = [],
            bars = options.bars || 10,
            points = options.points || 4,
            pointsRange = options.pointsRange || 5,

            beg = options.beg || 10,
            end = options.end || 100,
            increment = options.increment || 'day',
            updates = options.updates,
            date = new Date(),
            skipDayEvery = 100,
            orgSkipDayEvery = skipDayEvery,
            changeDate;

        date.setMonth(0);
        date.setDate(1);

        switch(increment){
            case 'day':
                changeDate = function(){
                    date.setDate(date.getDate() - 1);
                };
                break;
            case  'min':
                changeDate = function(){
                    skipDayEvery--;
                    if(skipDayEvery < 1){
                        skipDayEvery = orgSkipDayEvery;
                        date.setDate(date.getDate() - 2);
                    }
                    date.setMinutes(date.getMinutes() - 1);
                };
                break;
        }

        function rand(beg, end, precision){
            var
                p = precision === undefined ? 2 : precision,
                r = Math.random(),
                range = end - beg;

            return (beg + (r * range));//.toFixed(p);
        }

        function makeData(date){
            var
                i,
                seed = rand(beg, end),
                value = rand(beg, end),
                data = {
                    timeStamp:date,
                    values:[]
                };
            for(i = 0; i < points; i++){
                data.values.push({
                    value:rand(seed - pointsRange/2, end + pointsRange/2)
                });
            }
            return data;
        }

        for(i = 0; i < bars; i++){
            
            data.unshift(makeData(new Date(date)));

            changeDate();
        }

        return data;
    };
    
});
