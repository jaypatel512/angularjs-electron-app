define([
  'app',
  'services/blinkai'
], function (app) {
  'use strict';

  app.controller('ConversationChatCtrl', [
    '$scope',
    '$state',
    '$loadingOverlay',
    '$modal',
    'blinkaiService',
    'localStorageService',
    function ($scope,$state, $loadingOverlay, $modal, blinkaiService, localStorageService) {
      console.log('ddddddddd');
    }
  ]);
});
