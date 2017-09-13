define([
  'app',
  'services/blinkai'
], function (app) {
  'use strict';

  app.controller('StoreDetailCtrl', [
    '$scope',
    '$state',
    '$loadingOverlay',
    '$modal',
    'blinkaiService',
    'localStorageService',
    function ($scope,$state, $loadingOverlay, $modal, blinkaiService, localStorageService) {
      $scope.pageSize = 1;
      $scope.storedata = [];
        $scope.currentPage=0;
        $scope.privateToken = localStorageService.get('privateToken');
        $loadingOverlay.show();

        blinkaiService.getStoreDetail($scope.store_id).then(function (conversations) {
          //console.log('this is conversation '+conversations);
        $scope.conversations = conversations;
        }).finally(function () {
            $loadingOverlay.hide();
        });


        $scope.clickPreviousStoreDetail=function(){
          $scope.currentPage=$scope.currentPage-1;

        }
        $scope.clickNextStoreDetail=function(){
          $scope.currentPage=$scope.currentPage+1;
        }

        $scope.numberOfPages=function(){
             return Math.ceil($scope.conversations.entries.data.length/$scope.pageSize);
         }

        $scope.conversationDetail=function(id){  //console.log('this is test '+id);
          localStorageService.set('conversation_id',id);
          blinkaiService.getconversationDetail(id).then(function (conversationList) {
            console.log(conversationList);
            $scope.conversationList = conversationList;
            $state.go('base.conversationChat')
          })
        }
    }
  ]);
});
