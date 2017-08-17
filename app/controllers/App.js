define([
    'app',
    'services/blinkai'
],

function (app) {
    'use strict';
    app.filter('roundup', function () {
            return function (value) {
                return Math.ceil(value);
            };
        });
        app.filter('to_trusted', ['$sce', function($sce) {
           return function(text) {
             return $sce.trustAsHtml(text);
           };
         }]);
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
