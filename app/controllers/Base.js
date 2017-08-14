define([
  'app',
  'services/blinkai',
  'directives/sideMenu'
], function (app) {
  'use strict';

  app.controller('BaseCtrl', [
    '$scope',
    '$state',
    'localStorageService',
    'blinkaiService',
    function ($scope, $state, localStorageService, blinkaiService) {
        var oldSearchString;

        $scope.avatar = localStorageService.get('avatar');
        $scope.privateToken = localStorageService.get('privateToken');
        $scope.logout = function () {
            blinkaiService.logout();
            $state.go('login');
        };

        $scope.dashboard=function(){
          $state.go('base.dashboard');
        }

        $scope.formatDate = function (dateString) {
            var date = new Date(dateString);
            return date.toLocaleDateString();
        };

        $scope.formatTime = function (dateString) {
            var date = new Date(dateString);
            return date.toLocaleTimeString();
        };

        $scope.search = function () {
            if ($scope.searchString || $scope.searchString !== oldSearchString) {
                oldSearchString = $scope.searchString;
                $scope.$broadcast('search', $scope.searchString);
            }
        };
    }
  ]);
});
