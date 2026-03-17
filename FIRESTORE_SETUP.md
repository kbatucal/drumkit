# Firestore Setup for Saving Beats

To allow logged-in users to save and load beats, you need to enable Firebase Firestore and add security rules.

## Step 1: Create a Firestore database

1. In [Firebase Console](https://console.firebase.google.com), open your project
2. Go to **Firestore Database** (left sidebar)
3. Click **Create database**
4. Choose **Start in test mode** (or **Production** if you want stricter rules)
5. Pick a location (e.g. `us-central1`) and click **Enable**

## Step 2: Add security rules

1. In Firestore, open the **Rules** tab
2. Replace the rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/beats/{beatId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **Publish**

These rules ensure users can only read and write their own beats.

## Step 3: Create indexes (if needed)

The app queries beats with `orderBy("createdAt", "desc")`. Firestore may prompt you to create an index when you first load beats. If you see an error with an index link in the console, click it to create the index.

---

After setup, logged-in users will see the **Record**, **Save**, and **My beats** section. Guests do not see the save toolbar.
