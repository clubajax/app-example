define([], function(){

    return {
        chart:{
            className:'chart',
            backgroundColor: '#000',
            label:{
                color: 'rgba(235, 235, 235, 1)',
                font: 'normal 11px AramidBook'
            },
            grid: {
                intraDayColor: 'rgba(23, 26, 32, 1)',
                horizontalColor: 'rgba(23, 26, 32, 1)',
                noIntraDayColor: 'rgba(41, 45, 53, 1)',
                width: 1
            },
            axes:{
                color: 'rgba(62, 65, 70,1)',
                width: 1
            },
            crosshair: {
                draw: {
                    color: 'rgba(255, 255, 255, 1)',
                    width: 1
                },
                indication: {
                    color: 'rgba(0, 0, 0, 1)',
                    font: 'normal 11px AramidBook'
                }
            }
        }
    };
});
