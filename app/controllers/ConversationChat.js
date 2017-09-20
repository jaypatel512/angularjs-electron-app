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
    '$moment',
    function ($scope,$state, $loadingOverlay, $modal, blinkaiService, localStorageService,$moment) {

      var socket = io.connect('http://localhost:9092');
      const container = document.getElementById('chatlist');
      $scope.conversation=localStorageService.get('conversation');
      var init = function(){
    socket.emit('messages', {
            privateToken: localStorageService.get('privateToken'),
            id: localStorageService.get('conversation_id')
          }, function(resp) {
            if (resp === false) {
              alert("We seemed to have some issues fetching old messages. Please try again");
            } else {
              console.log(resp);
              //$scope.conversationList=resp;
              container.innerHTML='';
             angular.forEach(resp, function(value, key){
                const li = document.createElement('li');
                // left div start
                const leftdiv=document.createElement('div');
                leftdiv.className='chat-left image clearfix pull-left';
                const image=document.createElement('img');
                image.src=value.data.agent.profile;
                image.setAttribute('alt',value.data.agent.name);
                image.setAttribute('class','img-rounded img-responsive has-popover');
                image.setAttribute('width','40');
                image.setAttribute('height','40');
                leftdiv.appendChild(image);
                // left div end

                // right div start
                const rightdiv=document.createElement('div');
                rightdiv.className='chat-right clearfix chat-body';

                li.appendChild(leftdiv);

                const namespan=document.createElement('span');
                namespan.className='username left image';
                namespan.innerHTML=value.data.agent.name;

                const timespan=document.createElement('span');
                timespan.className='time right date';

                timespan.innerHTML=$moment(value.data.date).format('ddd , MMM DD @ LT');

                const headerdiv=document.createElement('div');
                const clockspan=document.createElement('span');
                clockspan.className='fa fa-clock-o';

                headerdiv.className='header-section';
                headerdiv.appendChild(namespan);
                headerdiv.appendChild(clockspan);
                headerdiv.appendChild(timespan);
                rightdiv.appendChild(headerdiv);

                const bodydiv=document.createElement('div');
                bodydiv.className='body-section';
                bodydiv.innerHTML=value.data.text;
                rightdiv.appendChild(bodydiv);
                // right div end

                li.appendChild(rightdiv);
                container.appendChild(li);
                container.scrollIntoView(false);

             });
            }
          });
      };

      init();

      $scope.chatMessage=function(message){
        const container = document.getElementById('chatlist');

        /*
        li.innerHTML = message;
        container.appendChild(li);*/

        socket.on('notifications', eventHandlerChat());
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

        function eventHandlerChat() {
    			return function (data) {console.log(data);
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

            // left div start
            const li = document.createElement('li');
            const leftdiv=document.createElement('div');
            leftdiv.className='chat-left image clearfix pull-left';
            const image=document.createElement('img');
            image.src=data.data.agent.profile;
            image.setAttribute('alt',data.data.agent.name);
            image.setAttribute('class','img-rounded img-responsive has-popover');
            image.setAttribute('width','40');
            image.setAttribute('height','40');
            leftdiv.appendChild(image);
            // left div end

            // right div start
            const rightdiv=document.createElement('div');
            rightdiv.className='chat-right clearfix chat-body';

            li.appendChild(leftdiv);

            const namespan=document.createElement('span');
            namespan.className='username left image';
            namespan.innerHTML=data.data.agent.name;

            const timespan=document.createElement('span');
            timespan.className='time right date';

            timespan.innerHTML=$moment(data.data.date).format('ddd , MMM DD @ LT');

            const headerdiv=document.createElement('div');
            const clockspan=document.createElement('span');
            clockspan.className='fa fa-clock-o';

            headerdiv.className='header-section';
            headerdiv.appendChild(namespan);
            headerdiv.appendChild(clockspan);
            headerdiv.appendChild(timespan);
            rightdiv.appendChild(headerdiv);

            const bodydiv=document.createElement('div');
            bodydiv.className='body-section';
            bodydiv.innerHTML=message;
            rightdiv.appendChild(bodydiv);
            // right div end

            li.appendChild(rightdiv);
            container.appendChild(li);
            container.scrollIntoView(false);
  	       }
         }
    }
  ]);
});
