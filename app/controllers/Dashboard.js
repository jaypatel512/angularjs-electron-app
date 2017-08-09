define([
  'app',
  'services/blinkai'
], function (app) {
  'use strict';

  app.controller('DashboardCtrl', [
    '$scope',
    '$loadingOverlay',
    '$modal',
    'blinkaiService',
    'localStorageService',
    function ($scope, $loadingOverlay, $modal, blinkaiService, localStorageService) {
        $scope.privateToken = localStorageService.get('privateToken');
        $loadingOverlay.show();
        blinkaiService.getProjects().then(function (projects) {
            $scope.projects = projects;
        }).finally(function () {
            $loadingOverlay.hide();
        });

        $scope.load = function (url) {
            $loadingOverlay.show();
            blinkaiService.getProjects(url).then(function (projects) {
                $scope.projects = projects;
            }).finally(function () {
                $loadingOverlay.hide();
            });
        };

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
