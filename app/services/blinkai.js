define([
    'app',
    'settings',
    'services/pager'
], function (app, settings) {
    'use strict';

    app.service('blinkaiService', [
        '$q',
        '$http',
        'localStorageService',
        'pagerService',
        function ($q, $http, localStorageService, pagerService) {
            this.login = function (params) {
                var deferred = $q.defer();
                  //console.log(params);
                $http.post(settings.blinkai + 'session', params).then(function (res) {
                    //console.log(res.data);
                  if (res.data.success == false) {
                    return deferred.reject(res.data.error);
                  }

                  localStorageService.set('privateToken', res.data.data.privateToken);
                  localStorageService.set('username', res.data.data.username);
                  localStorageService.set('image', res.data.data.avatar_url);
                  deferred.resolve(res.data);
                }, deferred.reject);

                return deferred.promise;
            };

            this.me = function () {
                var deferred = $q.defer(),
                    options = {
                        url: settings.blinkai + 'user',
                        headers: {
                            'PRIVATE-TOKEN': localStorageService.get('privateToken')
                        },
                        method: 'get'
                    };


                $http(options).then(function (res) {
                    deferred.resolve(res.data);
                }, deferred.reject);

                return deferred.promise;
            };

            this.getStores = function (url) {
                url = url || settings.blinkai + 'stores';
                var deferred = $q.defer(),
                    options = {
                        url: url,
                        headers: {
                            'PRIVATE-TOKEN': localStorageService.get('privateToken')
                        },
                        method: 'get'
                    };

                $http(options).then(function (res) {
                    deferred.resolve({
                        entries: res.data
                    });
                }, deferred.reject);

                return deferred.promise;
            };

            this.getStoreDetail= function(store_id){
            var url = settings.blinkai + 'stores/' + store_id + '/conversations';
            console.log(url);
              var deferred = $q.defer(),
              options = {
                  url: url,
                  headers: {
                      'PRIVATE-TOKEN': localStorageService.get('privateToken')
                  },
                  method: 'get'
              };

              $http(options).then(function (res) {
                console.log(res.data);
                  deferred.resolve(res.data);
              }, deferred.reject);

              return deferred.promise;
            };

            this.getProjects = function (url) {
                url = url || settings.blinkai + 'projects';
                var deferred = $q.defer(),
                    options = {
                        url: url,
                        headers: {
                            'PRIVATE-TOKEN': localStorageService.get('privateToken')
                        },
                        params: {
                            'per_page': 20,
                            'order_by': 'last_activity_at',
                            'sort': 'desc'
                        },
                        method: 'get'
                    };

                $http(options).then(function (res) {
                    deferred.resolve({
                        entries: res.data,
                        pager: pagerService.getPager(res.headers)
                    });
                }, deferred.reject);

                return deferred.promise;
            };

            this.searchProjects = function (query, url) {
                url = settings.blinkai + 'projects';
                var deferred = $q.defer(),
                    options = {
                        url: url,
                        headers: {
                            'PRIVATE-TOKEN': localStorageService.get('privateToken')
                        },
                        params: {
                            'search': query,
                            'per_page': 20,
                            'order_by': 'last_activity_at',
                            'sort': 'desc'
                        },
                        method: 'get'
                    };

                $http(options).then(function (res) {
                    deferred.resolve({
                        entries: res.data,
                        pager: pagerService.getPager(res.headers)
                    });
                }, deferred.reject);

                return deferred.promise;
            };

            this.getProject = function (id) {
                var deferred = $q.defer(),
                    baseUrl = settings.blinkai + 'projects/' + id,
                    options = {
                        headers: {
                            'PRIVATE-TOKEN': localStorageService.get('privateToken')
                        },
                        method: 'get'
                    };

                $q.all([
                    $http(angular.extend({}, options, {url: baseUrl})),
                    $http(angular.extend({}, options, {url: baseUrl + '/repository/branches'})),
                    $http(angular.extend({}, options, {url: baseUrl + '/repository/tags'}))
                ]).then(function (results) {
                    var result = results[0].data;
                    result.branches = results[1].data;
                    result.tags = results[2].data;
                    deferred.resolve(result);
                }, deferred.reject);

                return deferred.promise;
            };

            this.logout = function () {
                localStorageService.remove('privateToken');
                localStorageService.remove('username');
                localStorageService.remove('avatar');
            };
        }
    ]);
});
