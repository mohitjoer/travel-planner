"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

    if (searchTripType && searchTripType !== "")
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

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-white/90">Destination</label>
              <Input
                type="text"
                placeholder="Search by destination"
                value={searchDestination}
                onChange={(e) => setSearchDestination(e.target.value)}
                className="w-full p-3 border border-white/20 rounded-lg bg-white/10 backdrop-blur-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 hover:bg-white/15"
              />
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-white/90">Activity</label>
              <Input
                type="text"
                placeholder="Search by activity"
                value={searchActivity}
                onChange={(e) => setSearchActivity(e.target.value)}
                className="w-full p-3 border border-white/20 rounded-lg bg-white/10 backdrop-blur-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 hover:bg-white/15"
              />
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-white/90">Trip Type</label>
              <div className="flex gap-2">
                <Select
                  value={searchTripType}
                  onValueChange={setSearchTripType}
                >
                  <SelectTrigger className="w-full p-3 border border-white/20 rounded-lg bg-white/10 backdrop-blur-md text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 hover:bg-white/15 cursor-pointer">
                    <SelectValue placeholder="Select trip type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Adventure">Adventure</SelectItem>
                    <SelectItem value="Leisure">Leisure</SelectItem>
                    <SelectItem value="Work">Work</SelectItem>
                  </SelectContent>
                </Select>
                {searchTripType && (
                  <button
                    onClick={() => setSearchTripType("")}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white/90 rounded-lg transition-all duration-200 text-sm"
                    title="Clear selection"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-white/90">Filter</label>
              <label className="flex items-center gap-3 p-3 border border-white/20 rounded-lg bg-white/10 backdrop-blur-md hover:bg-white/15 transition-all duration-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showFavoritesOnly}
                  onChange={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className="w-4 h-4 accent-orange-500 rounded focus:ring-2 focus:ring-orange-400"
                />
                <span className="text-white/90 text-sm font-medium">Favorites Only</span>
              </label>
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-white/90 opacity-0">Actions</label>
              <div className="flex gap-2">
                <button
                  onClick={handleSearch}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-3 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg font-medium text-sm"
                >
                  Search
                </button>
                <button
                  onClick={resetSearch}
                  className="flex-1 bg-white/10 hover:bg-white/20 border border-white/30 text-white/90 px-4 py-3 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg font-medium text-sm backdrop-blur-sm"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItineraries.length === 0 && (
            <p className="text-white/70">No itineraries found. Start by creating one!</p>
          )}

          {filteredItineraries.map((it) => (
            <div key={it.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-xl p-4 flex flex-col hover:bg-white/15 transition-all duration-300">
              {it.photos.length > 0 && (
                <div className="relative mb-4">
                  <Image
                    src={it.photos[0]}
                    className="h-40 w-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedImage(it.photos[0])}
                    alt={`${it.title} preview`}
                    loading="lazy"
                    width={640}
                    height={360}
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
                <Link href={`/itinerary/${it.id}`}>
                  <button className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-2 rounded-lg shadow-lg transition-all duration-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View
                  </button>
                </Link>
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
              <Image
                src={selectedImage}
                className="max-w-full max-h-full object-contain rounded-lg"
                alt="Preview"
                width={640}
                height={360}
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