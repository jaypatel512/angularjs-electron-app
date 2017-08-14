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
        $scope.currentPage=0;
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
        $scope.clickPreviousStoreDetail=function(){
          $scope.currentPage=$scope.currentPage-1;

        }
        $scope.clickNextStoreDetail=function(){
          $scope.currentPage=$scope.currentPage+1;
        }
    }
  ]);
});
