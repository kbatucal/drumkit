# Login Setup Guide

To enable the login/account system, you need to configure Firebase Authentication. This is free and works with static hosting (including GitHub Pages).

## Step 1: Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Add project** (or use an existing one)
3. Enter a project name (e.g. `beatmaker-drumkit`)
4. Disable Google Analytics if you don't need it (optional)
5. Click **Create project**

## Step 2: Add a Web app

1. On the project overview page, click the **Web** icon (`</>`)
2. Register your app with a nickname (e.g. `Beatmaker`)
3. Leave **Firebase Hosting** unchecked for now
4. Click **Register app**
5. Copy the config object shown (or keep this page open)

## Step 3: Enable Email/Password sign-in

1. In Firebase Console, go to **Authentication** (left sidebar)
2. Click **Get started** if prompted
3. Open the **Sign-in method** tab
4. Click **Email/Password**
5. Enable **Email/Password** and click **Save**

## Step 4: Add your config to the project

1. Open `firebase-config.js` in this project
2. Replace the placeholder values with your Firebase config:

```javascript
const FIREBASE_CONFIG = {
  apiKey: "AIza...",           // from Firebase
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

3. Save the file

## Step 5: Test locally

1. Open the project in your browser (e.g. `http://localhost:5500`)
2. You should see the Sign in / Sign up form
3. Click **Sign up**, enter an email and password (min 6 chars)
4. Create account, then you’ll be signed in and see the drumkit

## Without Firebase configured

If you haven’t configured Firebase yet, you’ll see a **Continue as guest** button so you can still use the beatmaker. No accounts or data are saved in guest mode.
