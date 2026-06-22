// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // Config do Firebase (T0.4). Substituir os placeholders pelos valores reais
  // capturados ao registrar o Web App no console (T0.3).
  firebase: {
    apiKey: "AIzaSyAvTxCFmLft93fxbWoq-V28o3Go2ClS1As",
    authDomain: "vacina-kids-94e19.firebaseapp.com",
    projectId: "vacina-kids-94e19",
    storageBucket: "vacina-kids-94e19.firebasestorage.app",
    messagingSenderId: "576730530285",
    appId: "1:576730530285:web:91a66c96bbe732b129a7e4"
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
