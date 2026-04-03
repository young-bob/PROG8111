# Smart AI Tracker

A next-generation AI-powered personal finance tracking mobile app built with **React Native CLI + TypeScript**, backed by **AWS Bedrock Nova 2 Lite** for intelligent transaction parsing.

## Project Structure

```
FinalProject/
├── SmartAITracker/       # React Native mobile app (Android)
└── infra/                # Terraform — AWS Lambda + API Gateway
```

---

## Prerequisites

Make sure the following tools are installed on your machine before proceeding:

| Tool | Version | Check Command |
|---|---|---|
| Node.js | >= 18 | `node -v` |
| npm | >= 9 | `npm -v` |
| Java JDK | 17 | `java -version` |
| Android Studio | Latest | — |
| Android SDK | API 34+ | via Android Studio SDK Manager |
| Terraform | >= 1.5 | `terraform -v` |
| AWS CLI | v2 | `aws --version` |

> **Android Studio Setup:** Make sure you have an Android emulator configured (e.g. Pixel 7 API 34) or a physical device connected via USB with USB debugging enabled.

---

## 1. Clone the Repository

```bash
git clone https://github.com/young-bob/PROG8111.git
cd PROG8111
```

---

## 2. Configure Firebase (Required First)

Firebase is a **prerequisite** for both the AWS backend (token verification) and the mobile app (authentication + cloud sync).

### 2.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project (or use the existing one).
2. Add an **Android app** with package name `com.smartaitracker`.
3. Download `google-services.json` and place it in:
   ```
   SmartAITracker/android/app/google-services.json
   ```

### 2.2 Enable Firebase Services

1. **Authentication** → Sign-in method → Enable **Email/Password**.
2. **Realtime Database** → Create database → Set the following rules:
   ```json
   {
     "rules": {
       "users": {
         "$uid": {
           ".read": "$uid === auth.uid",
           ".write": "$uid === auth.uid"
         }
       }
     }
   }
   ```

### 2.3 Note Your Firebase Credentials

You will need these for later steps:

| Item | Where to Find |
|---|---|
| **Project ID** | Firebase Console → Project Settings → General → Project ID |
| **Web API Key** | Firebase Console → Project Settings → General → Web API Key |

> ** Shortcut:** The Web API Key is also stored locally in `SmartAITracker/android/app/google-services.json` under `client[0].api_key[0].current_key`. You can grab it with:
> ```bash
> grep "current_key" SmartAITracker/android/app/google-services.json
> ```

### 2.4 Create a Test User (Optional)

In Firebase Console → Authentication → Users → **Add User**, create a test account (e.g. `test@test.com` / `password123`).

---

## 3. Deploy AWS Backend (Lambda + API Gateway)

### 3.1 Configure AWS Credentials

```bash
aws configure
# Enter your AWS Access Key, Secret Key, Region (ca-central-1)
```

### 3.2 Install Lambda Dependencies

```bash
cd infra/lambda
npm install
cd ..
```

### 3.3 Deploy with Terraform

```bash
terraform init
terraform plan
terraform apply -auto-approve
```

On success, Terraform will output the API endpoint:

```
api_endpoint = "https://xxxxxxxx.execute-api.ca-central-1.amazonaws.com/prod/parse"
```

** Copy this URL** — you will need it in the next step.

### 3.4 Test the API (Optional)

The API is secured with **Firebase ID Token** verification. To test manually:

**Step 1 — Get a Firebase ID Token via curl:**

```bash
curl -s -X POST \
  "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=YOUR_FIREBASE_WEB_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123","returnSecureToken":true}'
```

Copy the `idToken` value from the response.

**Step 2 — Call the API with the token:**

```bash
curl -X POST https://YOUR_API_ENDPOINT/prod/parse \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PASTE_ID_TOKEN_HERE" \
  -d '{"inputText": "Spent 15 dollars on coffee"}'
```

Expected response:
```json
{
  "success": true,
  "data": { "title": "Coffee", "amount": 15.0, "category": "Food", "type": "Expense" }
}
```

> **Note:** Requests without a valid token will receive a `401 Unauthorized` response. The token expires after 1 hour and is automatically refreshed by the mobile app.

---

## 4. Set Up Mobile App

### 4.1 Install Dependencies

```bash
cd SmartAITracker
npm install
```

### 4.2 Configure API Endpoint

Edit the `.env` file in the project root:

```bash
# SmartAITracker/.env
API_ENDPOINT=https://YOUR_API_GATEWAY_ID.execute-api.ca-central-1.amazonaws.com/prod/parse
```

Replace with the actual endpoint from Step 3.3.

> **Note:** The `.env` file is read by `react-native-config` at build time. After changing it, you need to rebuild the app (not just hot reload).

### 4.3 Run on Android Emulator

```bash
npx react-native run-android
```

### 4.4 Build Release APK

```bash
cd android
./gradlew assembleRelease
```

The APK will be generated at:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native 0.84 + TypeScript |
| Navigation | React Navigation (Drawer, Tabs, Stack) |
| Local DB | SQLite (`@op-engineering/op-sqlite`) |
| Cloud DB | Firebase Realtime Database |
| Auth | Firebase Authentication |
| AI Backend | AWS Lambda + API Gateway + Bedrock Nova 2 Lite |
| AI Input | Text, Voice (`@dbkable/react-native-speech-to-text`), Image (`react-native-image-picker`) |
| API Security | Firebase ID Token verification (RS256 + Google JWKS) |
| Charts | `react-native-svg` |
| Icons | `lucide-react-native` |

---

## Team Members

- Aum Shaileshkumar Patel
- Bo Yang
