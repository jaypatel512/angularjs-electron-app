/*globals define, Image*/
define([
    'app'
], function (app) {

    'use strict';

    app.directive('displayMessage', [
        function () {
            return {
                scope: {
                    message: '='
                },
                transclude: true,
                restrict: 'E',
                template: '<div ng-if="message" class="alert alert-danger text-center uppercase" role="alert"><b>{{message}}</b></div>'
            };
        }
    ]);
});
