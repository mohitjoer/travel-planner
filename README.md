# 🌍 Travel Planner

A modern, full-stack travel planning application built with Next.js 15, Firebase, and TypeScript. Plan your trips, organize activities, upload photos, and manage your travel itineraries all in one place.

## ✨ Features

### 🔐 Authentication
- **Secure Login/Signup** with Firebase Authentication
- **Protected Routes** with automatic redirects
- **Persistent Sessions** across browser refreshes
- **User Profile Management** with display names

### 🗺️ Trip Management
- **Create Itineraries** with rich details (destination, budget, duration, type)
- **Activity Planning** with dates and descriptions
- **Photo Uploads** via Cloudinary integration
- **Trip Categories** (Adventure, Relaxation, Business, Cultural, etc.)
- **Budget Tracking** and duration planning

### 📱 User Interface
- **Responsive Design** for all devices
- **Modern UI** with shadcn/ui components
- **Animated Background** with custom FlickeringGrid component
- **Image Galleries** with modal previews
- **Search & Filter** functionality
- **Smooth Animations** with GSAP

### 🔍 Advanced Features
- **Real-time Data Sync** with Firestore
- **Image Optimization** with Next.js Image component
- **Dynamic Routing** for itinerary details and editing
- **TypeScript** for type safety
- **ESLint** for code quality

## 🛠️ Tech Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Modern UI component library
- **[GSAP](https://greensock.com/gsap/)** - Animation library
- **[Lucide React](https://lucide.dev/)** - Icon library

### Backend & Services
- **[Firebase](https://firebase.google.com/)** - Backend-as-a-Service
  - **Authentication** - User management
  - **Firestore** - NoSQL database
  - **Storage** - File uploads (if needed)
- **[Cloudinary](https://cloudinary.com/)** - Image management and optimization

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Turbopack](https://turbo.build/pack)** - Fast bundler (Next.js 15)

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ 
- **npm** or **yarn** or **pnpm**
- **Firebase Project** with Authentication and Firestore enabled
- **Cloudinary Account** for image uploads

### 1. Clone the Repository
```bash
git clone https://github.com/mohitjoer/travel-planner.git
cd travel-planner
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 4. Firebase Setup
1. Create a new [Firebase project](https://console.firebase.google.com/)
2. Enable **Authentication** with Email/Password provider
3. Create a **Firestore database** in production mode
4. Add your domain to authorized domains in Authentication settings
5. Copy your Firebase config to the `.env.local` file

### 5. Cloudinary Setup
1. Create a [Cloudinary account](https://cloudinary.com/)
2. Get your Cloud Name, API Key, and API Secret from the dashboard
3. Add the credentials to your `.env.local` file

### 6. Run the Development Server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
travel-planner/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── itineraries/   # Itinerary CRUD operations
│   │   │   └── search/        # Search functionality
│   │   ├── dashboard/         # Main dashboard page
│   │   ├── create-itinerary/  # Create new trip page
│   │   ├── edit-itinerary/    # Edit existing trip page
│   │   ├── itinerary/         # Trip details page
│   │   ├── login/             # Authentication pages
│   │   ├── signup/
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   ├── components/            # Reusable components
│   │   ├── ui/                # shadcn/ui components
│   │   └── ProtectedRoute.tsx # Route protection
│   ├── firebase/              # Firebase configuration
│   └── lib/                   # Utility functions
├── public/                    # Static assets
├── types.ts                   # TypeScript type definitions
├── next.config.ts             # Next.js configuration
├── tailwind.config.js         # Tailwind CSS configuration
└── package.json
```

## 🔧 Configuration Files

### Next.js Configuration (`next.config.ts`)
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['res.cloudinary.com'], // Allow Cloudinary images
  },
};

export default nextConfig;
```

### Firebase Configuration (`src/firebase/firebaseConfig.ts`)
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

## 📊 Database Structure

### Firestore Collections
```
users/{userId}/itineraries/{itineraryId}
├── title: string
├── destination: string
├── budget: string
├── duration: string
├── travelType: string
├── description: string
├── activities: Activity[]
├── photos: string[]
├── favorite: boolean
└── createdAt: timestamp
```

### Activity Interface
```typescript
interface Activity {
  name: string;
  description: string;
  date: string;
}
```

## 🎨 Key Features Explained

### 1. Authentication Flow
- Users can sign up with email/password
- Protected routes automatically redirect unauthenticated users
- Session persistence across browser refreshes
- User profile management with display names

### 2. Itinerary Management
- **Create**: Rich form with photo uploads via Cloudinary
- **Read**: Beautiful dashboard with search and filtering
- **Update**: Edit existing trips with photo management
- **Delete**: Remove trips with confirmation

### 3. Photo Management
- Upload multiple photos via Cloudinary API
- Automatic image optimization and resizing
- Modal gallery view with navigation
- Lazy loading for performance

### 4. Search & Filter
- Real-time search by destination, title, or activity
- Filter by trip type (Adventure, Relaxation, etc.)
- Toggle favorite trips
- Responsive grid layout

## 🚢 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to [Vercel](https://vercel.com/)
2. Add environment variables in the Vercel dashboard
3. Deploy automatically on every push to main branch

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- **Netlify**
- **Railway**
- **DigitalOcean App Platform**
- **AWS Amplify**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Firebase** for the backend services
- **shadcn/ui** for the beautiful components
- **Cloudinary** for image management
- **Vercel** for hosting and deployment

## 📞 Support

If you have any questions or need help with setup, please:
1. Check the [Issues](https://github.com/mohitjoer/travel-planner/issues) page
2. Create a new issue with detailed information
3. Contact the maintainer: [@mohitjoer](https://github.com/mohitjoer)

---

**Happy Traveling! ✈️🌟**
