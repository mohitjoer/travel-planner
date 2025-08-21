"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth } from "@/firebase/firebaseConfig";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  HeartIcon,
  PencilIcon,
  TrashIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";


interface Activity {
  name: string;
  description: string;
  date: string;
}

interface Itinerary {
  id: string;
  title: string;
  destination: string;
  tripType: string;
  activities: Activity[];
  photos: string[];
  favorite?: boolean;
}

const Dashboard = () => {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [filteredItineraries, setFilteredItineraries] = useState<Itinerary[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  
  const [searchDestination, setSearchDestination] = useState("");
  const [searchActivity, setSearchActivity] = useState("");
  const [searchTripType, setSearchTripType] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

 
  const fetchItineraries = async () => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, "users", auth.currentUser.uid, "itineraries"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Itinerary[];
    setItineraries(data);
    setFilteredItineraries(data);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchItineraries();
      } else {
        setItineraries([]);
        setFilteredItineraries([]);
      }
    });

    return () => unsubscribe();
  }, []);


  const handleDelete = async (id: string) => {
    if (!auth.currentUser) return;
    await deleteDoc(doc(db, "users", auth.currentUser.uid, "itineraries", id));
    fetchItineraries();
  };


  const toggleFavorite = async (itinerary: Itinerary) => {
    if (!auth.currentUser) return;
    const itineraryRef = doc(db, "users", auth.currentUser.uid, "itineraries", itinerary.id);
    await updateDoc(itineraryRef, { favorite: !itinerary.favorite });
    fetchItineraries();
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSearch = () => {
    let results = [...itineraries];

    if (searchDestination)
      results = results.filter((it) =>
        it.destination.toLowerCase().includes(searchDestination.toLowerCase())
      );

    if (searchTripType)
      results = results.filter((it) => it.tripType === searchTripType);

    if (showFavoritesOnly)
      results = results.filter((it) => it.favorite);

    if (searchActivity)
      results = results.filter((it) =>
        it.activities.some((act) =>
          act.name.toLowerCase().includes(searchActivity.toLowerCase())
        )
      );

    setFilteredItineraries(results);
  };

  const resetSearch = () => {
    setSearchDestination("");
    setSearchActivity("");
    setSearchTripType("");
    setShowFavoritesOnly(false);
    setFilteredItineraries(itineraries);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen p-6 bg-gradient-to-br from-red-950 via-orange-900 to-red-950 text-white">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 bg-clip-text text-transparent">
            Welcome, {auth.currentUser?.displayName}
          </h1>
          <div className="flex gap-2">
            <Link href="/create-itinerary">
              <button className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 hover:shadow-red-500/25">
                <PlusCircleIcon className="w-5 h-5" /> Create Itinerary
              </button>
            </Link>
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6 flex-wrap">
          <input
            type="text"
            placeholder="Search by destination"
            value={searchDestination}
            onChange={(e) => setSearchDestination(e.target.value)}
            className="p-2 border border-red-300/30 rounded-lg w-full md:w-1/4 bg-white/10 backdrop-blur-md text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="text"
            placeholder="Search by activity"
            value={searchActivity}
            onChange={(e) => setSearchActivity(e.target.value)}
            className="p-2 border border-red-300/30 rounded-lg w-full md:w-1/4 bg-white/10 backdrop-blur-md text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <select
            value={searchTripType}
            onChange={(e) => setSearchTripType(e.target.value)}
            className="p-2 border border-red-300/30 rounded-lg w-full md:w-1/4 bg-white/10 backdrop-blur-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="" className="bg-red-900 text-white">All Trip Types</option>
            <option value="Adventure" className="bg-red-900 text-white">Adventure</option>
            <option value="Leisure" className="bg-red-900 text-white">Leisure</option>
            <option value="Work" className="bg-red-900 text-white">Work</option>
          </select>
          <label className="flex items-center gap-2 text-white">
            <input
              type="checkbox"
              checked={showFavoritesOnly}
              onChange={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className="accent-orange-500"
            />
            Favorites Only
          </label>
          <button
            onClick={handleSearch}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300"
          >
            Search
          </button>
          <button
            onClick={resetSearch}
            className="bg-red-700/50 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300"
          >
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItineraries.length === 0 && (
            <p className="text-white/70">No itineraries found. Start by creating one!</p>
          )}

          {filteredItineraries.map((it) => (
            <div key={it.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-xl p-4 flex flex-col hover:bg-white/15 transition-all duration-300">
              {it.photos.length > 0 && (
                <div className="relative mb-4">
                  <img
                    src={it.photos[0]}
                    className="h-40 w-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedImage(it.photos[0])}
                    alt={`${it.title} preview`}
                    loading="lazy"
                  />
                  {it.photos.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                      +{it.photos.length - 1} more
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">{it.title}</h2>
                <button onClick={() => toggleFavorite(it)}>
                  <HeartIcon
                    className={`w-6 h-6 ${it.favorite ? "text-red-400 fill-current" : "text-white/60 hover:text-red-400"} transition-colors`}
                  />
                </button>
              </div>

              <p className="text-orange-300">{it.destination}</p>
              <p className="text-white/70 mb-2">{it.tripType}</p>
              <p className="text-white/80 mb-2">Activities: {it.activities.length}</p>

              <div className="mt-auto flex gap-2">
                <Link href={`/edit-itinerary/${it.id}`}>
                  <button className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white p-2 rounded-lg shadow-lg transition-all duration-300">
                    <PencilIcon className="w-5 h-5" /> Edit
                  </button>
                </Link>
                <button
                  onClick={() => handleDelete(it.id)}
                  className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-2 rounded-lg shadow-lg transition-all duration-300"
                >
                  <TrashIcon className="w-5 h-5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-full">
              <img
                src={selectedImage}
                className="max-w-full max-h-full object-contain rounded-lg"
                alt="Preview"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-red-600/80 hover:bg-red-600 text-white p-2 rounded-full transition-all shadow-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;