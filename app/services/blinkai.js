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
                    console.log(res.data);
                  if (res.data.success == false) {
                    return deferred.reject(res.data.error);
                  }

                  localStorageService.set('privateToken', res.data.data.privateToken);
                  localStorageService.set('username', res.data.data.username);
                  localStorageService.set('avatar', res.data.data.avatar_url);
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
                //console.log(url);
                var deferred = $q.defer(),
                    options = {
                        url: url,
                        headers: {
                            'PRIVATE-TOKEN': localStorageService.get('privateToken')
                        },
                        method: 'get'
                    };

                $http(options).then(function (res) {console.log(res.data);
                    deferred.resolve({
                        entries: res.data
                    });
                }, deferred.reject);

                return deferred.promise;
            };

        this.getconversationDetail=function(id){
          var url = settings.blinkai + 'stores/' + id + '/conversations';
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
              //console.log(res.data);
                deferred.resolve({'entries':res.data});

            }, deferred.reject);

            return deferred.promise;
        }

        this.getStoreDetail= function(store_id){
            var url = settings.blinkai + 'stores/' + store_id + '/conversations';
            //console.log(url);
              var deferred = $q.defer(),
              options = {
                  url: url,
                  headers: {
                      'PRIVATE-TOKEN': localStorageService.get('privateToken')
                  },
                  method: 'get'
              };

              $http(options).then(function (res) {
                //console.log(res.data);
                  deferred.resolve({'entries':res.data});

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
