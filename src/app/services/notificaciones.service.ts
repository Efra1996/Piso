import { Injectable } from '@angular/core';
import { initializeApp } from "firebase/app";

import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { getMessaging,getToken  } from "firebase/messaging";
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  app = initializeApp(environment.firebaseConfig);
  

  constructor() {
    const messaging = getMessaging(this.app);
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log(permission);
        getToken(messaging, { vapidKey: 'BAIPn4mCfm0YfS4JdIz6ezrJWxYJpxvl-lEQjkcYKp6mkoIAUQlueLCBAA7IlbrybYeu84PUgBbvKEqa5NizcmY' }).then((currentToken) => {
          if (currentToken) {
            // Send the token to your server and update the UI if necessary
            // ...
          } else {
            // Show permission request UI
            console.log('No registration token available. Request permission to generate one.');
            // ...
          }
        }).catch((err) => {
          console.log('An error occurred while retrieving token. ', err);
          // ...
        });  
      }
    })

   }
   
   requestPermission() {
    console.log('Requesting permission...');
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
      }
    })
    
  }
}

      

const addListeners = async () => {
  await PushNotifications.addListener('registration', token => {
    console.info('Registration token: ', token.value);
  });

  await PushNotifications.addListener('registrationError', err => {
    console.error('Registration error: ', err.error);
  });

  await PushNotifications.addListener('pushNotificationReceived', notification => {
    console.log('Push notification received: ', notification);
  });

  await PushNotifications.addListener('pushNotificationActionPerformed', notification => {
    console.log('Push notification action performed', notification.actionId, notification.inputValue);
  });
}

const registerNotifications = async () => {
  let permStatus = await PushNotifications.checkPermissions();

  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions();
  }

  if (permStatus.receive !== 'granted') {
    throw new Error('User denied permissions!');
  }

  await PushNotifications.register();
}

const getDeliveredNotifications = async () => {
  const notificationList = await PushNotifications.getDeliveredNotifications();
  console.log('delivered notifications', notificationList);
}