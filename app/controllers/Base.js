define([
  'app',
  'services/blinkai',
  'directives/sideMenu'
], function (app) {
  'use strict';


  app.controller('StoreChangeCtrl', [
    '$scope',
    '$state',
    '$loadingOverlay',
    'localStorageService',
    'blinkaiService',
    function ($scope, $state,$loadingOverlay, localStorageService, blinkaiService) {
      $state.go('base.storedetail');
    }
  ]);

  app.controller('BaseCtrl', [
    '$scope',
    '$state',
    '$loadingOverlay',
    'localStorageService',
    'blinkaiService',
    function ($scope, $state,$loadingOverlay, localStorageService, blinkaiService) {
        var oldSearchString;
        $scope.name = localStorageService.get('name');
        $scope.privateToken = localStorageService.get('privateToken');
        $scope.username = localStorageService.get('username');
        $scope.avatar = localStorageService.get('avatar');
        $scope.logout = function () {
            blinkaiService.logout();
            $state.go('login');
        };

        $scope.dashboard=function(){
        //  $scope.store_id='';
          $state.go('base.dashboard');
        }


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
          //console.log(store_id);
          localStorageService.set('store_id',store_id);
          $scope.store_id=localStorageService.get('store_id');
          //console.log($scope.store_id);
          //$state.go('base.storedetail');
          $state.go('base.storechange');
        }
    }
  ]);
});
