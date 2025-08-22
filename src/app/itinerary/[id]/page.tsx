"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPinIcon,
  CalendarIcon,
  HeartIcon,
  PencilIcon,
  ArrowLeftIcon,
  ClockIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import Link from "next/link";
import Image from "next/image";

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
  createdAt?: Date | { seconds: number; nanoseconds: number };
}

const ItineraryDetails = () => {
  const params = useParams();
  const router = useRouter();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const itineraryId = Array.isArray(params.id) ? params.id[0] : params.id;

  const fetchItinerary = useCallback(async () => {
    if (!auth.currentUser || !itineraryId) return;

    try {
      setLoading(true);
      const docRef = doc(db, "users", auth.currentUser.uid, "itineraries", itineraryId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setItinerary({ id: docSnap.id, ...docSnap.data() } as Itinerary);
      } else {
        setError("Itinerary not found");
      }
    } catch (err) {
      console.error("Error fetching itinerary:", err);
      setError("Failed to load itinerary");
    } finally {
      setLoading(false);
    }
  }, [itineraryId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && itineraryId) {
        fetchItinerary();
      } else if (!user) {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [itineraryId, fetchItinerary]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getTripTypeColor = (tripType: string) => {
    switch (tripType.toLowerCase()) {
      case "adventure":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "leisure":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "work":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-red-950 via-orange-900 to-red-950 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span className="text-white text-lg">Loading itinerary...</span>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-red-950 via-orange-900 to-red-950 flex items-center justify-center">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-md">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold text-white mb-2">Error</h2>
              <p className="text-white/80 mb-4">{error}</p>
              <Button 
                onClick={() => router.push("/dashboard")}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  if (!itinerary) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-red-950 via-orange-900 to-red-950 flex items-center justify-center">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-md">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold text-white mb-2">Not Found</h2>
              <p className="text-white/80 mb-4">The requested itinerary could not be found.</p>
              <Button 
                onClick={() => router.push("/dashboard")}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-red-950 via-orange-900 to-red-950 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <div className="flex items-center gap-2">
              <Link href={`/edit-itinerary/${itinerary.id}`}>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </Link>
            </div>
          </div>

 
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl text-white mb-2">
                        {itinerary.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-white/80">
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{itinerary.destination}</span>
                        </div>
                        {itinerary.createdAt && (
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            <span>
                              {formatDate(
                                itinerary.createdAt instanceof Date 
                                  ? itinerary.createdAt.toISOString()
                                  : typeof itinerary.createdAt === 'object' && 'seconds' in itinerary.createdAt
                                    ? new Date(itinerary.createdAt.seconds * 1000).toISOString()
                                    : ""
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTripTypeColor(itinerary.tripType)}>
                        <UserGroupIcon className="w-3 h-3 mr-1" />
                        {itinerary.tripType}
                      </Badge>
                      {itinerary.favorite ? (
                        <HeartIconSolid className="w-6 h-6 text-red-400" />
                      ) : (
                        <HeartIcon className="w-6 h-6 text-white/60" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    <ClockIcon className="w-5 h-5" />
                    Activities ({itinerary.activities.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {itinerary.activities.length > 0 ? (
                    <div className="space-y-4">
                      {itinerary.activities.map((activity, index) => (
                        <div
                          key={index}
                          className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold text-white">
                              {activity.name}
                            </h3>
                            {activity.date && (
                              <span className="text-sm text-white/70 bg-white/10 px-2 py-1 rounded">
                                {formatDate(activity.date)}
                              </span>
                            )}
                          </div>
                          <p className="text-white/80 leading-relaxed">
                            {activity.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/60 text-center py-8">
                      No activities planned for this trip.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-xl text-white">
                    Photos ({itinerary.photos.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {itinerary.photos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {itinerary.photos.map((photo, index) => (
                        <div
                          key={index}
                          className="relative group cursor-pointer"
                          onClick={() => setSelectedImage(photo)}
                        >
                          <Image
                            src={photo}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-white/20 group-hover:opacity-90 transition-opacity"
                            loading="lazy"
                            width={640}
                            height={360}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all rounded-lg flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                <span className="text-white text-lg">🔍</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/60 text-center py-8">
                      No photos uploaded for this trip.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-full">
              <Image
                src={selectedImage}
                alt="Full size preview"
                className="max-w-full max-h-full object-contain rounded-lg"
                width={640}
                height={360}
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl transition-all"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default ItineraryDetails;