# Push Notification Backend

A lightweight Node.js backend demonstrating how to implement Web Push Notifications using Express, Sequelize (SQLite), and the `web-push` library. This project is designed for educational purposes, providing clear examples of subscription management, VAPID authentication, and payload delivery.

---
## Table of Contents

1. [What Are Push Notifications?](#what-are-push-notifications)
2. [How Push Notifications Work](#how-push-notifications-work)
   - [Service Workers](#service-workers)
   - [Push Subscriptions](#push-subscriptions)
   - [VAPID Authentication](#vapid-authentication)
   - [Payload Encryption](#payload-encryption)
3. [Use Cases](#use-cases)
4. [About This Project](#about-this-project)
   - [Features](#features)
   - [Prerequisites](#prerequisites)
   - [Installation & Setup](#installation--setup)
   - [Configuration](#configuration)
   - [Project Structure](#project-structure)
   - [API Endpoints](#api-endpoints)
5. [Detailed Component Overview](#detailed-component-overview)
   - [Models](#models)
   - [Controllers](#controllers)
   - [Services](#services)
   - [WebPush Configuration](#webpush-configuration)
6. [Future Improvements](#future-improvements)
7. [License](#license)

---

## What Are Push Notifications?

Push Notifications allow servers to send messages to clients (usually browsers or mobile apps) even when the client is not actively using the application. Unlike traditional polling, push notifications are event-driven and can deliver real-time updates efficiently.

Key characteristics:
- **Instant delivery:** Users receive notifications as soon as the server triggers them.
- **Background operation:** Notifications arrive even if the application is closed.
- **Engagement boost:** Ideal for time-sensitive updates, reminders, or alerts.

---

## How Push Notifications Work

### Service Workers

A Service Worker is a script that runs in the background of the user's browser, independent of any web page. It handles push events and displays notifications.

1. **Registration:** The webpage registers the service worker (`sw.js`).
2. **Event Listener:** The service worker listens for `push` events and calls `showNotification()`.

```js
self.addEventListener('push', event => {
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.content,
      icon: '/icon.png'
    })
  );
});
```

### Push Subscriptions

- The client calls `registration.pushManager.subscribe()` with the server's public VAPID key.
- The browser returns a **subscription object** containing:
  - `endpoint`: URL to send push messages to.
  - `keys.p256dh`: Public encryption key.
  - `keys.auth`: Authentication secret.

### VAPID Authentication

VAPID (Voluntary Application Server Identification) provides a way for your server to identify itself to push services. It uses an elliptic-curve key pair:

- **Public Key:** Shared with the client to create subscriptions.
- **Private Key:** Kept secret on the server to sign JWTs.
- **Contact Email/URL:** Included in VAPID details for abuse reporting.

```js
webpush.setVapidDetails(
  'mailto:admin@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);
```

### Payload Encryption

Every notification payload is encrypted end-to-end using the subscription's keys (`p256dh` and `auth`). Push services cannot read the data—only the recipient browser can decrypt it.

---

## Use Cases

- **Chat applications:** Instant message alerts.
- **E-commerce:** Price drops, back-in-stock notices.
- **News & media:** Breaking news alerts.
- **Task management:** Task reminders or deadlines.
- **Social platforms:** Likes, comments, friend requests.

---

## About This Project

A fully functional backend to manage push subscriptions and send notifications. Perfect for learning or integrating into your own application.

### Features

- **Subscribe:** Store push subscriptions in a SQLite database.
- **Unsubscribe:** Remove stale subscriptions.
- **Send Notification:** Broadcast a JSON payload to all subscribers.
- **Auto-cleanup:** Remove invalid subscriptions on send errors (410/404).

### Prerequisites

- Node.js >= v14
- npm or yarn

### Installation & Setup

1. **Clone the repo:**
   ```bash
   git clone <repo-url> && cd push-notification-backend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Generate VAPID keys:**
   ```bash
   npx web-push generate-vapid-keys
   ```
4. **Create `.env` file** at project root:
   ```env
   PORT=3000
   VAPID_PUBLIC_KEY=<YOUR_PUBLIC_KEY>
   VAPID_PRIVATE_KEY=<YOUR_PRIVATE_KEY>
   ```
5. **Run the server:**
   ```bash
   node app.js
   ```

### Configuration

- **Environment Variables:**
  - `PORT`: Server port.
  - `VAPID_PUBLIC_KEY` & `VAPID_PRIVATE_KEY`: Keys for push authentication.

### Project Structure

```
/└── models/
    └── Subscription.model.js    # Sequelize model for subscriptions
/└── controllers/
    └── notification.controller.js  # Express handlers with JSDoc
/└── services/
    ├── notification.service.js  # Business logic for subscribe/unsubscribe/send
    └── webpush.service.js       # web-push configuration (VAPID keys)
/└── routes/
    └── notification.routes.js   # API route definitions
app.js                           # Main entry point, initializes Express & Sequelize
.env                             # Environment variables (not in repo)
README.md                        # This documentation
```

### API Endpoints

| Method | Path                     | Description                      |
|:------:|:-------------------------|:---------------------------------|
| POST   | `/notifications/subscribe`   | Save a new push subscription     |
| POST   | `/notifications/unsubscribe` | Remove an existing subscription  |
| POST   | `/notifications/send`        | Broadcast a test notification    |

---

## Detailed Component Overview

### Models

- **Subscription**: Stores `endpoint`, `p256dh`, and `auth` for each client.

### Controllers

- **subscribe(req, res)**: Validates payload and calls service to store subscription.
- **unsubscribe(req, res)**: Removes subscription by `endpoint`.
- **sendNotification(req, res)**: Triggers broadcast to all subscribers.

### Services

- **notification.service.js**:
  - `subscribe(subscription)`: Inserts into DB.
  - `unsubscribe(endpoint)`: Deletes from DB.
  - `sendNotification(payload)`: Fetches all subscriptions, sends encrypted payload via `web-push`, cleans up invalid ones.

### WebPush Configuration

- **webpush.service.js** sets VAPID credentials once.

---

## Future Improvements

- **Pagination & Filtering:** Send to specific user segments or event types.
- **Migrations:** Use Sequelize CLI for structured DB migrations.
- **Retry Logic:** Exponential backoff for temporary failures.
- **Unit Tests:** Add Jest or Mocha tests for controllers and services.
- **Frontend Integration:** Provide example client and service worker.

---

## License

MIT © Your Name
