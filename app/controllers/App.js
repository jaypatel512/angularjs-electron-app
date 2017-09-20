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
         /*text=text.replace("href='/web/admin/agent?id=596be51cd1ac664a6b85532d'",'ng-click="show_agent()"');
         text=text.replace("href='/web/admin/store?id=596be51bd1ac664a6b855320'",'ng-click="show_store()"');
         text=text.replace('/web/conversations?store=','show_conversation(');
         text=text.replace('">',')">');
         text=text.replace('">',')">');
         text=text.replace('href=','ng-click=');
        text=text.replace('href=','ng-click=');*/
         return $sce.trustAsHtml(text);
       };
     }]);
    app.controller('AppCtrl', [
      '$scope',
        '$q',
        '$location',
        '$state',
        'localStorageService',
        'blinkaiService',
        function ($scope,$q, $location, $state, localStorageService, blinkaiService) {
            blinkaiService.me().then(function () {
                //$state.go('base.dashboard');
            }, function () {
                $state.go('login');
            });

            $scope.openWindow=function(url) {
                window.open(url, '_blank', 'location=no');
            }
        }
    ]);
});
