define([
    'app',
    'services/blinkai',
    'directives/loadingSpinner',
    'directives/displayMessage'
], function (app) {
    'use strict';

    app.controller('LoginCtrl', [
        '$scope',
        '$state',
        'blinkaiService',
        function ($scope, $state, blinkaiService) {
            $scope.auth = {};
            $scope.isLoading = false;

            $scope.login = function () {
              $scope.isLoading = true;
              blinkaiService.login($scope.auth).then(function (data) {
                //console.log(data);
                $state.go('base.dashboard');
              }, function (error) {
                console.log(error);
                $scope.message = error.message;
              }).finally(function () {
                $scope.isLoading = false;
                });
            };
            $scope.user_register=function(){
                $state.go('register');
            }
            $scope.user_login=function(){
              $state.go('login');
            }

            $scope.forgot_password=function(){
              $state.go('forgot_password');
            }
        }
    ]);
});
