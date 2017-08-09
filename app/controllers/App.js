define([
    'app',
    'services/blinkai'
], function (app) {
    'use strict';

    app.controller('AppCtrl', [
        '$q',
        '$location',
        '$state',
        'localStorageService',
        'blinkaiService',
        function ($q, $location, $state, localStorageService, blinkaiService) {
            blinkaiService.me().then(function () {
                $state.go('base.dashboard');
            }, function () {
                $state.go('login');
            });
        }
    ]);
});
