# Islami Zindagi (Flare Hub)

Islami Zindagi is a premium, full-stack Islamic knowledge sharing platform designed to provide a comprehensive ecosystem for spiritual learning and growth. It combines modern web technologies with a focus on accessibility and a "WOW" user experience.

![Islami Zindagi Preview](public/placeholder.svg)

## ✨ Key Features

-   **📖 Dars (Lessons):** Browse and study comprehensive Islamic teachings through interactive articles and video lessons (YouTube & uploaded).
-   **💬 Q&A Section:** Integrated platform for users to ask questions and receive answers from knowledgeable teachers.
-   **📅 Events:** Stay updated with upcoming Islamic events, featuring robust filtering, sorting, and category management.
-   **👤 User Profiles:** Personalized dashboards for users to manage their activity and settings.
-   **🎙️ Voice Search:** Native speech-to-text integration for effortless browsing of lessons and events.
-   **📱 PWA Ready:** Progressive Web App support for a native-app-like experience on mobile and desktop.
-   **🛠️ Admin Panel:** Dedicated management interface for content creators to manage dars, questions, and events.
-   **🎨 Premium UI:** Modern design system featuring glassmorphism, dynamic animations, and responsive layouts.

## 🚀 Tech Stack

-   **Frontend:** [React 18](https://reactjs.org/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components:** [Radix UI](https://www.radix-ui.com/), [Shadcn UI](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/)
-   **Backend:** [Express.js](https://expressjs.com/), [Node.js](https://nodejs.org/)
-   **Serverless:** [Netlify Functions](https://www.netlify.com/products/functions/)
-   **Database & Auth:** [Appwrite Cloud](https://appwrite.io/)
-   **State Management:** [TanStack Query (React Query)](https://tanstack.com/query/latest)
-   **Animations:** [Framer Motion](https://www.framer.com/motion/)

## 🛠️ Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   npm or pnpm
-   An [Appwrite Cloud](https://cloud.appwrite.io) account

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/islami-zindagi.git
    cd islami-zindagi
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    # or
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory based on the following template:

    ```env
    # Appwrite Configuration
    VITE_APPWRITE_PROJECT_ID=your_project_id
    VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
    
    # Server-side API Key
    APPWRITE_API_KEY=your_secret_api_key
    ```

4.  **Start Development Server:**
    ```bash
    pnpm dev
    # or
    npm run dev
    ```
    The client will be available at `http://localhost:8080`.

## 📦 Build & Deployment

### Production Build
To generate a production-ready build:
```bash
npm run build
```
The output will be located in the `dist/` directory.

### Deployment (Netlify)
The project is pre-configured for deployment on Netlify using Netlify Functions.
1.  Connect your repository to [Netlify](https://app.netlify.com/).
2.  Add your environment variables in the Netlify dashboard.
3.  Deploy!

## 📁 Project Structure

-   `client/` - Frontend React source code.
-   `server/` - Backend Express server source code.
-   `shared/` - Shared types and utilities.
-   `netlify/` - Configuration for Netlify serverless functions.
-   `scripts/` - Maintenance and setup scripts.
-   `public/` - Static assets and PWA icons.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
