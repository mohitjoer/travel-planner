"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, db } from "@/firebase/firebaseConfig";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { FlickeringGrid } from "@/components/ui/flickeringgrid";

interface Itinerary {
  id: string;
  title: string;
  destination: string;
  tripType: string;
  photos: string[];
}

const HomePage = () => {
  const [user, setUser] = useState(auth.currentUser);
  const [recentItineraries, setRecentItineraries] = useState<Itinerary[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    fetchRecentItineraries();
    return () => unsubscribe();
  }, []);

  const fetchRecentItineraries = async () => {
    try {
      // Fetch last 3 itineraries across all users (or public itineraries)
      const q = query(
        collection(db, "users", "PUBLIC_UID", "itineraries"), // replace PUBLIC_UID if you have public itineraries
        orderBy("createdAt", "desc"),
        limit(3)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Itinerary[];
      setRecentItineraries(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white">
      {/* Flickering Grid Background */}
      <div className="absolute inset-0 ">
        <FlickeringGrid
          squareSize={3}
          gridGap={5}
          flickerChance={0.6}
          color="rgb(255, 87, 51)"
          maxOpacity={0.8}
          className="w-full h-full"
        />
      </div>
      {/* Hero Section */}
      <section className="text-center py-20 px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Plan Your Perfect Trip
        </h1>
        <p className="text-lg md:text-xl mb-6 text-gray-700">
          Create, organize, and explore travel itineraries with ease. Adventure, leisure, or work trips — all in one place.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          {user ? (
            <Link href="/dashboard">
              <button className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                Go to Dashboard
              </button>
            </Link>
          ) : (
            <>
              <Link href="/auth/login">
                <button className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                  Login
                </button>
              </Link>
              <Link href="/auth/signup">
                <button className="px-6 py-3 border border-blue-600 text-blue-600 rounded hover:bg-blue-100 transition">
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <h2 className="text-3xl font-bold text-center mb-10">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-6 bg-blue-50 rounded shadow text-center">
            <h3 className="text-xl font-semibold mb-2">Plan Itineraries</h3>
            <p>Create trips with destinations, activities, dates, and photos.</p>
          </div>
          <div className="p-6 bg-green-50 rounded shadow text-center">
            <h3 className="text-xl font-semibold mb-2">Favorites & Filters</h3>
            <p>Save favorite trips and filter itineraries by type, destination, or activity.</p>
          </div>
          <div className="p-6 bg-yellow-50 rounded shadow text-center">
            <h3 className="text-xl font-semibold mb-2">Explore & Share</h3>
            <p>Discover itineraries from other travelers and get inspired.</p>
          </div>
        </div>
      </section>

      {/* Recent Itineraries */}
      <section className="py-20 px-4 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-10">Recent Itineraries</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {recentItineraries.length === 0 ? (
            <p className="text-center col-span-full">No recent itineraries available.</p>
          ) : (
            recentItineraries.map((it) => (
              <div key={it.id} className="bg-white rounded shadow p-4 flex flex-col">
                {it.photos.length > 0 && (
                  <img
                    src={it.photos[0]}
                    alt={it.title}
                    className="h-40 w-full object-cover rounded mb-4"
                    loading="lazy"
                  />
                )}
                <h3 className="text-xl font-semibold mb-1">{it.title}</h3>
                <p className="text-gray-600">{it.destination}</p>
                <p className="text-gray-500">{it.tripType}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
