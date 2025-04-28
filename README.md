# 🎵 MusicMood Frontend

This is the frontend client for **MusicMood**, built with React and styled using TailwindCSS.  
It allows users to authenticate via Google, select moods, and listen to generated melodies based on their emotional state.

Check out the walkthrough video here:  
👉 [Watch on YouTube](https://youtu.be/taqc5El3xg0)
---

## 🛠️ Tech Stack
- **Vite** (build tool)
- **React.js** (UI library)
- **Redux Toolkit** (state management)
- **Axios** (API requests)
- **Tailwind CSS** (styling)
- **React Router** (client-side routing)
- **@react-oauth/google** (Google OAuth integration)

---

## 📦 Set up Instructions

### 📥 1. Clone the Repository

```bash
git clone https://github.com/your-username/musicmood-frontend.git
cd musicmood-frontend
```

---

### 📦 2. Install Dependencies

Make sure you have [Node.js](https://nodejs.org/) installed.  
Then install the frontend dependencies:

```bash
npm install
```

---

### ⚙️ 3. Create Environment Variables

Create a `.env` file (or `.env.local`) in the root of the project with the following structure:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_BACKEND_URL=http://localhost:5000
```

> Replace the placeholder values with your actual credentials and backend URL.

---

### 🚀 4. Run the Development Server

Start the development server:

```bash
npm run dev
```

The frontend will run on [http://localhost:5173](http://localhost:5173) by default.

---
