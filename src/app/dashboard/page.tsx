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
import { onAuthStateChanged } from "firebase/auth";
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

  // Search/Filter states
  const [searchDestination, setSearchDestination] = useState("");
  const [searchActivity, setSearchActivity] = useState("");
  const [searchTripType, setSearchTripType] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Fetch itineraries from Firestore
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

  // Delete itinerary
  const handleDelete = async (id: string) => {
    if (!auth.currentUser) return;
    await deleteDoc(doc(db, "users", auth.currentUser.uid, "itineraries", id));
    fetchItineraries();
  };

  // Toggle favorite
  const toggleFavorite = async (itinerary: Itinerary) => {
    if (!auth.currentUser) return;
    const itineraryRef = doc(db, "users", auth.currentUser.uid, "itineraries", itinerary.id);
    await updateDoc(itineraryRef, { favorite: !itinerary.favorite });
    fetchItineraries();
  };

  // Search & filter
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
      <div className="min-h-screen p-6 bg-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
          <h1 className="text-3xl font-bold">Welcome, {auth.currentUser?.displayName}</h1>
          <Link href="/create-itinerary">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              <PlusCircleIcon className="w-5 h-5" /> Create Itinerary
            </button>
          </Link>
        </div>

        {/* Search / Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 flex-wrap">
          <input
            type="text"
            placeholder="Search by destination"
            value={searchDestination}
            onChange={(e) => setSearchDestination(e.target.value)}
            className="p-2 border rounded w-full md:w-1/4"
          />
          <input
            type="text"
            placeholder="Search by activity"
            value={searchActivity}
            onChange={(e) => setSearchActivity(e.target.value)}
            className="p-2 border rounded w-full md:w-1/4"
          />
          <select
            value={searchTripType}
            onChange={(e) => setSearchTripType(e.target.value)}
            className="p-2 border rounded w-full md:w-1/4"
          >
            <option value="">All Trip Types</option>
            <option value="Adventure">Adventure</option>
            <option value="Leisure">Leisure</option>
            <option value="Work">Work</option>
          </select>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showFavoritesOnly}
              onChange={() => setShowFavoritesOnly(!showFavoritesOnly)}
            />
            Favorites Only
          </label>
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Search
          </button>
          <button
            onClick={resetSearch}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Reset
          </button>
        </div>

        {/* Itineraries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItineraries.length === 0 && (
            <p>No itineraries found. Start by creating one!</p>
          )}

          {filteredItineraries.map((it) => (
            <div key={it.id} className="bg-white rounded shadow p-4 flex flex-col">
              {/* Photos */}
              {it.photos.length > 0 && (
                <div className="relative mb-4">
                  <img
                    src={it.photos[0]}
                    className="h-40 w-full object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedImage(it.photos[0])}
                    alt={`${it.title} preview`}
                    loading="lazy"
                  />
                  {it.photos.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                      +{it.photos.length - 1} more
                    </div>
                  )}
                </div>
              )}

              {/* Title & Favorite */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{it.title}</h2>
                <button onClick={() => toggleFavorite(it)}>
                  <HeartIcon
                    className={`w-6 h-6 ${it.favorite ? "text-red-500" : "text-gray-400"}`}
                  />
                </button>
              </div>

              {/* Destination / Trip Type / Activity Count */}
              <p className="text-gray-600">{it.destination}</p>
              <p className="text-gray-500 mb-2">{it.tripType}</p>
              <p className="text-gray-700 mb-2">Activities: {it.activities.length}</p>

              {/* Actions */}
              <div className="mt-auto flex gap-2">
                <Link href={`/edit-itinerary/${it.id}`}>
                  <button className="flex-1 flex items-center justify-center gap-1 bg-yellow-400 text-white p-2 rounded hover:bg-yellow-500">
                    <PencilIcon className="w-5 h-5" /> Edit
                  </button>
                </Link>
                <button
                  onClick={() => handleDelete(it.id)}
                  className="flex-1 flex items-center justify-center gap-1 bg-red-500 text-white p-2 rounded hover:bg-red-600"
                >
                  <TrashIcon className="w-5 h-5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Image Preview Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
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
                className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
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
