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
      $scope.chatMessage=function(message){

        var socket = io.connect('http://localhost:9092');

        const container = document.getElementById('chatlist');
        const li = document.createElement('li');
        // You would want to expand this out to include pertinent attributes, and timestamps, etc...
        li.innerHTML = message;

        container.appendChild(li);
        //socket.emit('send:message', {message: message});
        socket.on('notifications', eventHandler());

        socket.emit('reply', {
          text: message,  // text
          privateToken: '7162e1f8-6957-487f-93d1-9cafd6864f1d', // private Token received during login. Found in agent database
          id: '5982c1fc97387eb8a68a0d42'  // conversationid. found in conversations. Try to use the one with Facebook.
        }, function(resp) {
          if (resp === true) {
            document.getElementById('reply').value='';
            document.getElementById('reply').focus();
            alert("Sending successful.");
          } else {
            alert("We seemed to have some issue getting acknowledgement back from server. Please try again");
            document.getElementById('reply').focus();
          }
        });

        function eventHandler() {
    			return function (message) {
      			  outputNotifications(message);
      			}
		     }

  		function outputNotifications(message) {
    		console.log(message);
    		var e = document.createElement('pre');
    		var hr = document.createElement('hr');
    		e.innerHTML = JSON.stringify(message, null, ' ');
    		container.appendChild(e);
    		container.appendChild(hr);
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
