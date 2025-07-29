# YouTube Clone – MERN Stack Capstone Project

A full-stack YouTube clone built with **MongoDB, Express, React, and Node.js** (MERN). This project allows users to upload, search, and interact with videos, manage channels, and experience a feature-rich interface inspired by the real YouTube platform.

---

## Features

### Frontend

- **Home Page**
  - Responsive YouTube-style header and sidebar (with toggle on mobile)
  - Video grid with thumbnails, titles, channel names, and view counts
  - Filter buttons and powerful search bar (search by title, filter by category)
- **Video Player Page**
  - In-browser video player with title, description, channel info
  - Like/Dislike support
  - Fully functional comment system (add, edit, delete)
- **Channel Page**
  - Authenticated users can create their own channel
  - List of all videos for the channel with manage and edit capabilities
  - Channel info: name, description, banner, subscribers count, etc.
  - Update channel info (name, username, description, banner)
  - Delete uploaded videos with confirmation
- **Authentication**
  - Register & login using username, email, and password
  - JSON Web Token (JWT) based secure authentication
  - Google Form links for login/register screen
  - Protected routes for user and channel features
- **Optimized UI**
  - Lazy loading for all feature pages
  - Sidebar auto-closes on mobile for better UX
  - Modern responsive layout (desktop, tablet, and mobile support)
- **Accessibility**
  - Semantic HTML
- **Robust Error Handling**
  - In-app error displays and loading states across routes
  - Notification and alert dialogs for actions (e.g., delete video confirmation)

### Backend

- **RESTful API**
  - User registration, login, profile fetching/updating
  - Channel management (create, fetch, update)
  - Video management: upload, fetch, update, delete
  - Comment API: CRUD operations
- **Database**
  - MongoDB Atlas or local MongoDB instance
  - Stores users, channels, videos, and comments collections
  - Stores video and image URLs as metadata for S3/local serving
- **Security**
  - All protected routes require a valid JWT token
  - Input validation and error responses
  - CORS and environment variable protection

---

## Getting Started

### 1. Clone the Repository

```
git clone https://github.com/Rawat107/YoutubeClone.git
```

### 2. Install Dependencies

Install for both the client and the server directories:

```
cd backend
npm install
cd ../frontend
npm install
```

### 3. Environment Variables

You will need two `.env` files: one for the frontend (`frontend/.env`) and one for the backend (`backend/.env`). Examples:

#### backend/.env

```
PORT=3000
MONGO_URI="mongodb://localhost:27017/YoutubeClone"
JWT_SECRET=Capstone

```

#### frontend/.env

```
VITE_API_URL=http://localhost:3000
```

**Note:**

- You can use your own mongoURI as well.
- Use your own credentials for Cloudinary if you intend to use image hosting; otherwise, remove related logic.

### 4. Run the Project

#### Start the backend server

```
cd backend
npm run dev
```

#### Start the frontend

Open a new terminal:

```
cd frontend
npm run dev
```

#### The app should now be accessible at [http://localhost:5173](http://localhost:5173) (or your Vite port).

---

## Base Folder Structure

```
/frontend         # React frontend (src/, components/, pages/)
  /src
    /components
    /pages
    App.jsx
    main.jsx
  .env

/backend         # Node/Express backend (routes/, controllers/, models/)
  /routes
  /controllers
  /models
  server.js
  .env
```

---

## Usage

- **Register:**  
  Create an account or login via the header. Auth functions are powered by JWT.
- **Create a Channel:**  
  Once logged in, create your own channel, add a banner, and set name/description.
- **Upload:**  
  Upload videos (with auto-generated or custom thumbnail). Manage your channel and delete or update content as needed.
- **Search & Filter:**  
  Use the search/filters on the home page to explore content by title or category.
- **Responsive:**  
  Try the experience on mobile, tablet, and desktop – the UI adapts beautifully!
- **Code Quality:**  
  Well-organized using best-practice folder structure and clear separation of concerns.

---

## Acknowledgements

Built as a MERN Capstone Project for educational purposes.

---

## 📄 License

[MIT](LICENSE)
