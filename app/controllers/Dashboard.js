define([
  'app',
  'services/blinkai'
], function (app) {
  'use strict';

  app.controller('DashboardCtrl', [
    '$scope',
    '$state',
    '$loadingOverlay',
    '$modal',

    'blinkaiService',
    'localStorageService',
    function ($scope,$state, $loadingOverlay, $modal, blinkaiService, localStorageService) {
        $scope.privateToken = localStorageService.get('privateToken');
        $loadingOverlay.show();
        blinkaiService.getStores().then(function (stores) {
          $scope.stores = stores;
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
        };

        $scope.getStoreDetailFunction=function(store_id){
          localStorageService.set('store_id',store_id);
          $state.go('base.storedetail');
        }

        $scope.$on('search', function (event, searchString) {
            $loadingOverlay.show();
            blinkaiService.searchProjects(searchString).then(function (projects) {
                $scope.projects = projects;
            }).finally(function () {
                $loadingOverlay.hide();
            });
        });

        $scope.openDetails = function (id) {
            $modal.open({
                'templateUrl': 'app/templates/detail.html',
                controller: 'DetailCtrl',
                size: 'large',
                resolve: {
                    'id': id
                }
            });
        };
    }
  ]);
});
