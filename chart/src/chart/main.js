define([
    './chart/Chart',
    './axes/YAxisPosition',
    './scalers/LogarithmicScaler',
    './scalers/LinearScaler',
    'common/utilities',
    'common/ChartTypes',
    'common/userInteractionTypes'
], function (Chart, yAxisPosition, LogarithmicScaler, LinearScaler, utilities, chartTypes, userInteractionTypes) {
    return {
        Chart:Chart,
        userInteractionTypes: userInteractionTypes
    };
});
