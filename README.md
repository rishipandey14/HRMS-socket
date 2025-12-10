# 💬 Real-Time Chat App – Backend

This is a **full-featured backend** for a scalable real-time chat application under development, currently supporting:

- ✅ 1-to-1 and group chats
- 📩 Real-time messaging using Socket.IO
- ✏️ Edit/Delete messages
- ✅ Delivered/Seen indicators
- 🔔 Typing indicators, archiving, muting
- 🔐 JWT authentication
- 📁 MongoDB database with Mongoose
- 📦 Postman collections for API testing  

---

## 🚀 Tech Stack

- **Node.js + Express**
- **MongoDB + Mongoose**
- **Socket.IO**
- **JWT for Auth**
- **Postman for API Testing**

---

## 🛠️ Local Setup

### 1. 📥 Clone the Repository

```bash
git clone https://github.com/your-username/chat-backend.git
cd chat-backend
```

### 2. 📦 Install Dependencies

```bash
npm install
```

### 3. 🔐 Configure Environment

Create a `.env` file in the root directory:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
EMAIL_USER=xxx
EMAIL_PASS=xxx
```
> You can also connect to MongoDB Atlas if you prefer a cloud database.

### 4. ▶️ Start the Server

For development

```bash
npm run dev
```

The backend should be running at:

```arduino
http://localhost:5001
```

---

## 🧪 API Testing with Postman

### 📂 Collection Overview

| Collection Name              | Description                                      |
|-----------------------------|--------------------------------------------------|
| `postman-collection_.json` | User registration and login endpoints           |
| `postman-collection_Chats.json`          | Create, fetch, update, mute, archive, and delete chats |
| `postman-collection_Message.json`        | Send, edit, delete, and mark messages as seen   |

---

### 📁 Step 1: Import All Collections

> Instead of importing files one by one, you can import the **entire `postman/` folder**:

1. In Postman, go to `File > Import`
2. Drag & drop the **`postman/` folder**
3. Postman will auto-import all 4 files:
   - `postman-collection_Authentication.json`
   - `postman-collection_Chats.json`
   - `postman-collection_Message.json`
   - `postman_environment.json`

---

### 🌍 Step 2: Activate Environment

1. Postman auto-imports `postman_environment.json`
2. Set it as the **active environment**
3. Edit and add your actual values if needed:

```json
{
  "base_url": "http://localhost:5001/api",
  "token": "your_token_here",
  "user_id": "your_user_id_here",
  "user_id_2": "another_user_id",
  "user_id_3": "third_user_id",
  "user_id_4": "fourth_user_id",
  "chat_id": "your_chat_or_group_id_here",
  "message_id": "your_message_id_here"
}
```

---

### ✅ Step 3: Run Your APIs

1. Register/Login using the `Authentication` collection
2. Use the token received in register/login to populate `{{token}}`
3. Continue with:
   - `Chats` (create, update, mute, archive, delete, leave)
   - `Messages` (send, edit, delete, mark seen)
> Each request is pre-filled with placeholders like `{{base_url}}`, `{{token}}`, `{{chat_id}}`, etc.

---

🛡️ Security Notes

1. All IDs and tokens in Postman collections are replaced with environment variables.
2. Never expose real credentials or tokens in public repositories.
3. Use `.env` for managing secrets in code.