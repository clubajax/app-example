define([
    'auto/runner',
    './graphs',
    './lines',
    './mouse',
    './type'
], function(runner, graphs, lines, mouse, type){

    runner.setOptions({
        //timeBetweenTests:1000
    });
    runner.load(graphs.tests, graphs.suite);
    runner.load(lines.tests, lines.suite);
    runner.load(mouse.tests, mouse.suite);
    runner.load(type.tests, type.suite);
    runner.run();

});
