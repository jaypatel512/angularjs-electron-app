define([
  'app',
  'services/blinkai',
  'settings',
], function (app, settings) {
  'use strict';

  app.controller('DashboardCtrl', [
    '$scope',
    '$state',
    '$loadingOverlay',
    '$modal',
    'blinkaiService',
    'localStorageService',
    function ($scope,$state, $loadingOverlay, $modal, blinkaiService, localStorageService,$location) {
        $scope.privateToken = localStorageService.get('privateToken');
        $scope.username = localStorageService.get('username');
        $scope.avatar = localStorageService.get('avatar');

        /*if($scope.store_id){
            $state.go('base.storedetail');
        }*/

        $loadingOverlay.show();
        blinkaiService.getStores().then(function (stores) {
          $scope.stores = stores;
        }).finally(function () {
            $loadingOverlay.hide();
        });

        blinkaiService.getActivities($scope.store_id).then(function (activities) {
            $scope.activities = activities;
            console.log(activities);
        }).finally(function () {
            $loadingOverlay.hide();
        });

        $scope.load = function (url) {
            $loadingOverlay.show();
            blinkaiService.getStores(url).then(function (stores) {
                $scope.stores = stores;

            }).finally(function () {
                $loadingOverlay.hide();
            });


            blinkaiService.getActivities($scope.store_id).then(function (activities) {
                $scope.activities = activities;

            }).finally(function () {
                $loadingOverlay.hide();
            });
        };

        $scope.getStoreDetailFunction=function(store_id){
          $scope.store_id=localStorageService.get('store_id');
          localStorageService.set('store_id',store_id);
          $state.go('base.storedetail');
        }
    }
  ]);
});
