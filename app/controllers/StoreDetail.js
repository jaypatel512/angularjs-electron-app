define([
  'app',
  'services/blinkai'
], function (app) {
  'use strict';

  app.controller('StoreDetailCtrl', [
    '$scope',
    '$loadingOverlay',
    '$modal',
    'blinkaiService',
    'localStorageService',
    function ($scope, $loadingOverlay, $modal, blinkaiService, localStorageService) {
      $scope.pageSize = 1;
      $scope.storedata = [];
        $scope.privateToken = localStorageService.get('privateToken');
        $loadingOverlay.show();

        blinkaiService.getStoreDetail(localStorageService.get('store_id')).then(function (conversations) {
        //  console.log(store);
        $scope.conversations = conversations;
        }).finally(function () {
            $loadingOverlay.hide();
        });

        $scope.numberOfPages=function(){
             return Math.ceil($scope.conversations.entries.data.length/$scope.pageSize);
         }
    }
  ]);
});
