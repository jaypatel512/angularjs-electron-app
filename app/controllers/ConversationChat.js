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

      var socket = io.connect('http://localhost:9092');
      const container = document.getElementById('chatlist');
      var init = function(){

    socket.emit('messages', {
            privateToken: localStorageService.get('privateToken'),
            id: localStorageService.get('conversation_id')
          }, function(resp) {
            if (resp === false) {
              alert("We seemed to have some issues fetching old messages. Please try again");
            } else {
              //console.log(resp);
            $scope.conversationList=resp;
            /* angular.forEach(resp, function(value, key){
                const li = document.createElement('li');
                li.innerHTML = value.data.text;
                container.appendChild(li);
             });*/
            }
          });
      };

      init();

      $scope.chatMessage=function(message){
        const container = document.getElementById('chatlist');
        const li = document.createElement('li');
        // You would want to expand this out to include pertinent attributes, and timestamps, etc...
        li.innerHTML = message;
        container.appendChild(li);
        socket.on('notifications', eventHandler());
        //console.log(localStorageService.get('conversation_id'));
        socket.emit('reply', {
          text: message,  // text
          privateToken: localStorageService.get('privateToken'), // private Token received during login. Found in agent database
          id: localStorageService.get('conversation_id')  // conversationid. found in conversations. Try to use the one with Facebook.
        }, function(resp) {
          if (resp === true) {
            document.getElementById('reply').value='';
            document.getElementById('reply').focus();
            //alert("Sending successful.");
          } else {
            //alert("We seemed to have some issue getting acknowledgement back from server. Please try again");
            document.getElementById('reply').focus();
          }
        });

        function eventHandler() {
    			return function (data) {
      			  outputNotifications(data);
      			}
		     }

       document.addEventListener('DOMContentLoaded', function () {
           if (!Notification) {
             alert('Desktop notifications not available in your browser. Try Chromium.');
             return;
           }

           if (Notification.permission !== "granted")
             Notification.requestPermission();
         });

  		function outputNotifications(data) {
        var text=data.data.agent.name+'<br>'+message;
        if (Notification.permission !== "granted") {
                Notification.requestPermission();
              }  else {
              var notification = new Notification('blikai notification', {
                icon: 'http://dashboard.blinkai.com/web_assets/img/blink_ai.png',
                body: text,
              });
              notification.onclick = function () {
                window.open("http://stackoverflow.com/a/13328397/1269037");
              };
            }
  	  }

      }


    }
  ]);
});
