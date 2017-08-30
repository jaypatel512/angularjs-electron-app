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
    'socket',
    function ($scope,$state, $loadingOverlay, $modal, blinkaiService, localStorageService,socket) {
      $scope.chatMessage=function(message){
        const container = document.getElementById('chatlist');
        const li = document.createElement('li');
        // You would want to expand this out to include pertinent attributes, and timestamps, etc...
        li.innerHTML = message;
        container.appendChild(li);
        document.getElementById('reply').value='';
        document.getElementById('reply').focus();

        socket.emit('send:message', {message: message});
        socket.on('notifications', eventHandler());
        function eventHandler() {
    			return function (data) {
      			  outputNotifications(data);
      			}
		     }

  		function outputNotifications(data) {
    		console.log(data);
    		var e = document.createElement('pre');
    		var hr = document.createElement('hr');
    		e.innerHTML = JSON.stringify(data, null, ' ');
    		document.getElementById("messages").appendChild(e);
    		document.getElementById("messages").appendChild(hr);
  	  }
      //  var socket = io.connect('http://localhost:3000');
        /*socket.on('connection', function(socket){
          socket.on('chat-message', function(reply){
            socket.emit('chat-message', reply);
            console.log('test');
          });
        });
        */

      }

            // this is socket
            // this is socket
    }
  ]);
});
