# 🔒 LockdIn

**LockdIn** is a minimalist, forced-commitment productivity app designed to keep you focused. Once you start a task, there is no escape until the timer runs out.

## 🚀 How to Test This App

The easiest way to test this app on your own phone is using **Expo Go**.

### 1️⃣ Prerequisites
1.  **Install Node.js** (if you haven't already) on your computer: [Download Here](https://nodejs.org/)
2.  **Download "Expo Go"** on your phone:
    *   [iOS (App Store)](https://apps.apple.com/app/expo-go/id982107779)
    *   [Android (Play Store)](https://play.google.com/store/apps/details?id=host.exp.exponent)

### 2️⃣ Run the App
Open your terminal (Command Prompt or Terminal) in this folder and run these two commands:

```bash
# 1. Install dependencies (only need to do this once)
npm install

# 2. Start the app
npx expo start
```

### 3️⃣ Scan & Play
1.  A QR code will appear in your terminal.
2.  Open **Expo Go** on your phone.
    *   **iPhone**: Open your regular Camera app and scan the QR code.
    *   **Android**: Open the Expo Go app and tap "Scan QR Code".
3.  The app will load on your phone!

---

## 🛠 Features to Test
*   **Create Task**: Set a name and duration.
*   **Focus Mode**: Notice how the UI locks into landscape mode.
*   **Immersive Experience**: The status bars should trigger a "hidden" mode to prevent distractions.
*   **Emergency Time**: If the timer drops below 2 minutes, look for the "ADD 5 MINS" button.

## 🤝 Contributing
Feel free to open issues or submit PRs if you find any bugs!
