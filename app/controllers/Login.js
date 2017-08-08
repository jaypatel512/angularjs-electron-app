define([
    'app',
    'services/gitlab',
    'directives/loadingSpinner'
], function (app) {
    'use strict';

    app.controller('LoginCtrl', [
        '$scope',
        '$state',
        'gitlabService',
        function ($scope, $state, gitlabService) {
            $scope.auth = {};
            $scope.isLoading = false;

            $scope.login = function () {
                $scope.isLoading = true;
              //  console.log('dddd');
                gitlabService.login($scope.auth).then(function () {
                    $state.go('base.dashboard');
                }, function () {

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
