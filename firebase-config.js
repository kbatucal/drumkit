/**
 * Firebase configuration for the beatmaker login system.
 *
 * SETUP: Get these values from Firebase Console
 * 1. Go to https://console.firebase.google.com
 * 2. Create a project (or use existing)
 * 3. Add a Web app
 * 4. Copy the config values below
 *
 * Enable Email/Password auth:
 * - Firebase Console → Authentication → Sign-in method → Email/Password → Enable
 */
const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
