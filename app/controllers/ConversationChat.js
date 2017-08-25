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
      $scope.chatMessage=function(reply){
        const container = document.getElementById('chatlist');
        const li = document.createElement('li');
        // You would want to expand this out to include pertinent attributes, and timestamps, etc...
        li.innerHTML = reply;
        container.appendChild(li);
        document.getElementById('reply').value='';
        document.getElementById('reply').focus();

        var socket = io.connect('http://localhost:3000');
        socket.on('connection', function(socket){
          socket.on('chat-message', function(reply){
            socket.emit('chat-message', reply);
            console.log('test');
          });
        });

      }
    }
  ]);
});
