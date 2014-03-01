define([], function(){

    var
        range,
        tests = [],
        chart,
        timeBetweenTests = 500,
        suiteTitleNode = document.getElementById('testSuite'),
        testTitleNode = document.getElementById('testCase');

    function setOptions(options){
        if(options.timeBetweenTests){
            timeBetweenTests = options.timeBetweenTests;
        }
    }

    function title(str){
        testTitleNode.innerHTML = str;
    }

    function setSuiteName(str){
        suiteTitleNode.innerHTML = str;
    }

    function tick(callback, ms){
        ms = ms || timeBetweenTests;
        setTimeout(callback, ms);
    }

    function runTests(){
        function runTest(test){
            if(test){
                setSuiteName(test.suiteName);
                test();
                if(test.callback){
                    test.callback.end = function(){
                        runTest(tests.shift());
                    };
                }else{
                    tick(function(){
                        runTest(tests.shift());
                    });
                }
            }else{
                console.log('tests complete.');
                document.getElementById('testsCompleteNotice').style.display = 'block';
            }
        }
        runTest(tests.shift());
    }

    function addTest(test, suiteName){
        var testMethod = function(){
            title(test.title);
            test.run();
        };
        testMethod.suiteName = suiteName;
        if(test.end){
            testMethod.callback = test;
        }else if(test.tick){
            testMethod.tick = test.tick;
        }
        tests.push(testMethod);
    }

    function loadTests(tests, suiteName, range){
        var i = 0, len = tests.length;
        if(range){
            if((range.length === 3 && range[0] !== 0) && range.length > 2){
                // [1, 3, 5] 1, 3, and 5
                for(i = 0; i < range.length; i++){
                    if(!tests[range[i]].skip){
                        addTest(tests[range[i]], suiteName);
                    }
                }
                len = 0;
            }
            else if(range.length === 3 && range[0] === 0){
                // [0, 24, 32] // 0 creates chart
                addTest(tests[0], suiteName);
                i = range[1];
                len = range[2] + 1;
            }
            else{
                // [ 1, 5] 1 through 5
                i = range[0];
                len = range[1] + 1;
            }
        }
        for(i; i < len; i++){
            if(!tests[i].skip){
                addTest(tests[i], suiteName);
            }
        }
    }

    //if(cases.range){
    //    range = cases.ranges[cases.range];
    //}
    //loadTests(cases.tests, range);
    //
    //runTests();

    return {
        setOptions: setOptions,
        load:loadTests,
        run:runTests
    };
});
