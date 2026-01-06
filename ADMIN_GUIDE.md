# Admin Guide

## Credentials
The app is currently set up in "Single User Mode".
- **Email**: `demo@flow.com` (or any email)
- **Password**: `password` (or any password)

## How to Switch to Real Database (Firebase)
To support multiple users on different devices, you need to enable Firebase.

1.  Go to [console.firebase.google.com](https://console.firebase.google.com) and create a project.
2.  Enable **Authentication** (Email/Password).
3.  Enable **Firestore Database**.
4.  Copy your firebase config keys.
5.  Edit `app.js`:
    - Find the `Store` object.
    - Replace the `localStorage` logic with `firebase.firestore().collection(...)` calls.

*(Currently, the app uses LocalStorage, so data is saved only on YOUR browser, which is perfect for a personal tool or demo.)*
