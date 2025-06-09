# ClickInk - Tattoo Platform Project

This is a React + TypeScript project using Vite, TailwindCSS, and React Router for a tattoo platform that connects clients with artists.

## Project Structure
```
clickink/
├── src/
│   ├── components/
│   │   └── Layout.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   └── Auth.tsx
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
└── other config files...
```

## Dependencies (package.json)
```json
{
  "name": "clickink",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.344.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.22.3"
  },
  "devDependencies": {
    "@eslint/js": "^9.9.1",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.18",
    "eslint": "^9.9.1",
    "eslint-plugin-react-hooks": "^5.1.0-rc.0",
    "eslint-plugin-react-refresh": "^0.4.11",
    "globals": "^15.9.0",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.5.3",
    "typescript-eslint": "^8.3.0",
    "vite": "^5.4.2"
  }
}
```

## Main App Component (src/App.tsx)
```tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Auth from './pages/Auth';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

## Layout Component (src/components/Layout.tsx)
```tsx
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Palette, Users, Calendar, MessageSquare, Home, Info, GalleryVertical as Gallery, PenTool } from 'lucide-react';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center">
                <PenTool className="h-8 w-8 text-purple-600" />
                <span className="ml-2 text-2xl font-bold text-gray-900">ClickInk</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <NavLink to="/" icon={<Home className="h-5 w-5" />} text="Home" />
              <NavLink to="/gallery" icon={<Gallery className="h-5 w-5" />} text="Gallery" />
              <NavLink to="/request-design" icon={<Palette className="h-5 w-5" />} text="Request Design" />
              <NavLink to="/appointments" icon={<Calendar className="h-5 w-5" />} text="Appointments" />
              <NavLink to="/messages" icon={<MessageSquare className="h-5 w-5" />} text="Messages" />
              <NavLink to="/about" icon={<Info className="h-5 w-5" />} text="About" />
              <Link to="/profile" className="flex items-center text-gray-600 hover:text-purple-600">
                <Users className="h-5 w-5" />
                <span className="ml-1">Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
      <footer className="bg-gray-800 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <PenTool className="h-8 w-8 text-purple-400" />
              <span className="ml-2 text-xl font-bold">ClickInk</span>
            </div>
            <div className="flex space-x-6">
              <Link to="/about" className="hover:text-purple-400">About</Link>
              <Link to="/privacy" className="hover:text-purple-400">Privacy</Link>
              <Link to="/terms" className="hover:text-purple-400">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const NavLink: React.FC<{ to: string; icon: React.ReactNode; text: string }> = ({ to, icon, text }) => (
  <Link to={to} className="flex items-center text-gray-600 hover:text-purple-600">
    {icon}
    <span className="ml-1">{text}</span>
  </Link>
);

export default Layout;
```

## Home Page (src/pages/Home.tsx)
```tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Palette, Users, Calendar } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="space-y-16">
      <section className="text-center py-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl text-white">
        <h1 className="text-5xl font-bold mb-6">Transform Your Ideas into Ink</h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Connect with talented tattoo artists, design your perfect tattoo, and book your appointment - all in one place.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/register"
            className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition"
          >
            Get Started
          </Link>
          <Link
            to="/gallery"
            className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-purple-600 transition"
          >
            Browse Designs
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8">
        <FeatureCard
          icon={<Palette className="h-12 w-12 text-purple-600" />}
          title="AI-Powered Design"
          description="Describe your dream tattoo and let our AI help bring it to life with stunning visual concepts."
        />
        <FeatureCard
          icon={<Users className="h-12 w-12 text-purple-600" />}
          title="Expert Artists"
          description="Connect with verified, talented tattoo artists who match your style and vision."
        />
        <FeatureCard
          icon={<Calendar className="h-12 w-12 text-purple-600" />}
          title="Easy Booking"
          description="Schedule appointments, manage your sessions, and keep track of your tattoo journey."
        />
      </section>

      <section className="bg-gray-100 rounded-3xl p-12 text-center">
        <h2 className="text-3xl font-bold mb-8">Coming Soon: Virtual Try-On</h2>
        <div className="max-w-2xl mx-auto">
          <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center mb-6">
            <p className="text-gray-600">Preview your tattoo in real-time using your webcam</p>
          </div>
          <p className="text-gray-600">
            Experience how your chosen tattoo design will look on your body before making it permanent.
          </p>
        </div>
      </section>
    </div>
  );
};

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default Home;
```

## Auth Page (src/pages/Auth.tsx)
```tsx
import React, { useState } from 'react';
import { PenTool } from 'lucide-react';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'client' | 'artist'>('client');

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-8">
      <div className="flex justify-center mb-6">
        <PenTool className="h-12 w-12 text-purple-600" />
      </div>
      <h2 className="text-2xl font-bold text-center mb-6">
        {isLogin ? 'Welcome Back' : 'Join ClickInk'}
      </h2>
      
      {!isLogin && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            I am a:
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              className={`p-4 rounded-lg border ${
                userType === 'client'
                  ? 'border-purple-600 bg-purple-50 text-purple-600'
                  : 'border-gray-200 text-gray-600'
              }`}
              onClick={() => setUserType('client')}
            >
              Client
            </button>
            <button
              className={`p-4 rounded-lg border ${
                userType === 'artist'
                  ? 'border-purple-600 bg-purple-50 text-purple-600'
                  : 'border-gray-200 text-gray-600'
              }`}
              onClick={() => setUserType('artist')}
            >
              Tattoo Artist
            </button>
          </div>
        </div>
      )}

      <form className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter your full name"
            />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter your email"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition"
        >
          {isLogin ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          className="text-purple-600 hover:text-purple-700"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin
            ? "Don't have an account? Sign up"
            : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
};

export default Auth;
```

## Types (src/types/index.ts)
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  type: 'client' | 'artist';
  profileImage?: string;
}

export interface TattooDesign {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  artistId: string;
  tags: string[];
}

export interface Appointment {
  id: string;
  clientId: string;
  artistId: string;
  date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  designId?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
}
```

## Styles (src/index.css)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```