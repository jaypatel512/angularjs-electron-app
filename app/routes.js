define([
  'app',
  'services/gitlab',
  'services/blinkai',
  // Load Controllers here
  'controllers/App',
  'controllers/Base',
  'controllers/Dashboard',
  'controllers/Detail',
  'controllers/Login',
  'controllers/StoreDetail',
  'controllers/ConversationChat'
], function (app) {
  'use strict';
  // definition of routes
  app.config([
    '$stateProvider',
    '$urlRouterProvider',
    '$loadingOverlayConfigProvider',
    function ($stateProvider, $urlRouterProvider, $loadingOverlayConfigProvider) {

      $loadingOverlayConfigProvider.defaultConfig('<div class="text-center"><i class="fa fa-refresh fa-spin"></i><br><b>Bitte Warten</b></div>');

      // url routes/states
      $urlRouterProvider.otherwise('login');

      $stateProvider
        // app states
        .state('login', {
            url: '/login',
            templateUrl: 'app/templates/user/login.html',
            controller: 'LoginCtrl'
        })
        .state('register', {
            url: '/register',
            templateUrl: 'app/templates/user/register.html',
            controller: 'LoginCtrl'
        })
        .state('forgot_password', {
            url: '/forgot-password',
            templateUrl: 'app/templates/user/forgot-password.html',
            controller: 'LoginCtrl'
        })
        .state('base', {
            url: '/',
            abstract: true,
            templateUrl: 'app/templates/base.html',
            controller: 'BaseCtrl'
        })
        .state('base.dashboard', {
            url: 'dashboard',
            templateUrl: 'app/templates/dashboard.html',
            controller: 'DashboardCtrl'
        })
        .state('base.storedetail', {
            url: 'storedetail',
            templateUrl: 'app/templates/store/detail.html',
            controller: 'StoreDetailCtrl'
        })
        .state('base.conversationChat', {
            url: 'conversationchat',
            templateUrl: 'app/templates/conversation/chat.html',
            controller: 'ConversationChatCtrl'
        });

    }
  ]);
});
