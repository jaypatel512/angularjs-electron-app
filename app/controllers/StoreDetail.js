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
        $scope.privateToken = localStorageService.get('privateToken');
        $loadingOverlay.show();

        blinkaiService.getStoreDetail(localStorageService.get('store_id')).then(function (store) {
          $scope.store = store;
        }).finally(function () {
            $loadingOverlay.hide();
        });

    }
  ]);
});
