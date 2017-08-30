// The main app definition
// --> where you should load other module depdendencies
define([
  'angular',
  'ui-bootstrap',
  'ui-router',
  'angular-local-storage',
  'ng-loading-overlay'
], function (angular) {
  'use strict';
  // the app with its used plugins
  var app = angular.module('app', [
    'ui.router',
    'LocalStorageModule',
    'ui.bootstrap',
    'ngLoadingOverlay',
  ]);

  app.factory('socket', function ($rootScope) {
  var socket = io.connect('http://localhost:3000');
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      //console.log(eventName);
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});
  // return the app so you can require it in other components
  return app;
});
