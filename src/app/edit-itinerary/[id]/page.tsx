"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "@/firebase/firebaseConfig";
import ProtectedRoute from "@/components/ProtectedRoute";
import Image from "next/image";
import { PlusCircleIcon, TrashIcon, PhotoIcon, ArrowLeftIcon, XMarkIcon, PencilIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Activity {
  name: string;
  description: string;
  date: string;
}

const EditItineraryPage = () => {
  const router = useRouter();
  const params = useParams();
  const itineraryId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [tripType, setTripType] = useState("Adventure");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!itineraryId) return;
    
    const fetchItinerary = async () => {
      if (!auth.currentUser?.uid) return;
      
      try {
        const docRef = doc(db, "users", auth.currentUser.uid, "itineraries", itineraryId as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title || "");
          setDestination(data.destination || "");
          setTripType(data.tripType || "Adventure");
          setActivities(data.activities || []);
          setExistingPhotos(data.photos || []);
        } else {
          console.error("Itinerary not found");
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching itinerary:", error);
        router.push("/dashboard");
      }
    };
    fetchItinerary();
  }, [itineraryId, router]);

  // Cleanup preview URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [photoPreviewUrls]);

  const handleAddActivity = () => {
    setActivities([...activities, { name: "", description: "", date: "" }]);
  };

  const handleActivityChange = (index: number, field: keyof Activity, value: string) => {
    const newActivities = [...activities];
    newActivities[index][field] = value;
    setActivities(newActivities);
  };

  const handleRemoveActivity = (index: number) => {
    const newActivities = activities.filter((_, i) => i !== index);
    setActivities(newActivities);
  };

  const handleRemoveExistingPhoto = (index: number) => {
    const newPhotos = existingPhotos.filter((_, i) => i !== index);
    setExistingPhotos(newPhotos);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setPhotoFiles(files);
      
      // Create preview URLs
      const previewUrls = files.map(file => URL.createObjectURL(file));
      setPhotoPreviewUrls(previewUrls);
    }
  };

  const handleRemoveNewPhoto = (index: number) => {
    const newFiles = photoFiles.filter((_, i) => i !== index);
    const newPreviews = photoPreviewUrls.filter((_, i) => i !== index);
    
    // Revoke the removed URL to prevent memory leaks
    URL.revokeObjectURL(photoPreviewUrls[index]);
    
    setPhotoFiles(newFiles);
    setPhotoPreviewUrls(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);

    try {
      // Upload new photos to Firebase Storage
      const photoUrls = [...existingPhotos];
      for (const file of photoFiles) {
        const storageRef = ref(storage, `itineraries/${auth.currentUser.uid}/${Date.now()}_${file.name}`);
        const uploadTask = await uploadBytesResumable(storageRef, file);
        const url = await getDownloadURL(uploadTask.ref);
        photoUrls.push(url);
      }

      // Update Firestore
      if (!auth.currentUser?.uid || !itineraryId) {
        throw new Error("Missing required data for update");
      }
      
      const docRef = doc(db, "users", auth.currentUser.uid, "itineraries", itineraryId as string);
      await updateDoc(docRef, {
        title,
        destination,
        tripType,
        activities,
        photos: photoUrls,
      });

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Early return if no ID is found
  if (!itineraryId) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-950 via-orange-900 to-red-950">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-red-400 mb-4">Invalid Itinerary ID</h2>
              <Button 
                onClick={() => router.push("/dashboard")}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
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
      <div className="min-h-screen p-3 sm:p-6 bg-gradient-to-br from-red-950 via-orange-900 to-red-950 text-white">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 bg-clip-text text-transparent">
            Edit Itinerary
          </h1>
          <Link href="/dashboard">
            <Button size="sm" variant="outline" className="bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm">
              <ArrowLeftIcon className="w-4 h-4 mr-1" /> Back
            </Button>
          </Link>
        </div>

        {/* Form Container */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Basic Information */}
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-white border-b border-white/20 pb-2">Basic Info</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="title" className="text-white/90 text-sm">Title</Label>
                      <Input 
                        id="title"
                        type="text" 
                        placeholder="Trip title" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)}
                        className="h-9 bg-white/10 backdrop-blur-md border-white/20 text-white placeholder-white/60 focus:ring-orange-400 focus:border-transparent hover:bg-white/15 text-sm"
                        required 
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="destination" className="text-white/90 text-sm">Destination</Label>
                      <Input 
                        id="destination"
                        type="text" 
                        placeholder="Where to?" 
                        value={destination} 
                        onChange={(e) => setDestination(e.target.value)}
                        className="h-9 bg-white/10 backdrop-blur-md border-white/20 text-white placeholder-white/60 focus:ring-orange-400 focus:border-transparent hover:bg-white/15 text-sm"
                        required 
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="tripType" className="text-white/90 text-sm">Trip Type</Label>
                      <Select value={tripType} onValueChange={setTripType}>
                        <SelectTrigger className="h-9 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 focus:ring-orange-400 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Adventure">Adventure</SelectItem>
                          <SelectItem value="Leisure">Leisure</SelectItem>
                          <SelectItem value="Work">Work</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Activities Section */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-white/20 pb-2">
                    <h2 className="text-lg font-semibold text-white">Activities</h2>
                    <Button 
                      type="button" 
                      size="sm"
                      onClick={handleAddActivity}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg h-8"
                    >
                      <PlusCircleIcon className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>

                  {activities.length === 0 && (
                    <div className="bg-white/5 border border-dashed border-white/20 rounded-lg p-4 text-center">
                      <p className="text-white/70 text-sm italic">No activities yet. Add some!</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {activities.map((activity, index) => (
                      <Card key={index} className="bg-white/5 border-white/10">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-sm text-orange-300 flex items-center gap-2">
                              Activity {index + 1}
                              <Badge variant="secondary" className="bg-orange-500/20 text-orange-200 text-xs px-1.5 py-0">
                                #{index + 1}
                              </Badge>
                            </CardTitle>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveActivity(index)}
                              className="h-6 w-6 p-0 bg-red-500 hover:bg-red-600"
                            >
                              <TrashIcon className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-2 pt-0">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <Input 
                                type="text" 
                                placeholder="Activity name" 
                                value={activity.name}
                                onChange={(e) => handleActivityChange(index, "name", e.target.value)}
                                className="h-8 bg-white/10 border-white/20 text-white placeholder-white/60 focus:ring-orange-400 hover:bg-white/15 text-xs"
                              />
                            </div>
                            
                            <div>
                              <Input 
                                type="date" 
                                value={activity.date}
                                onChange={(e) => handleActivityChange(index, "date", e.target.value)}
                                className="h-8 bg-white/10 border-white/20 text-white focus:ring-orange-400 hover:bg-white/15 text-xs"
                              />
                            </div>
                          </div>
                          
                          <Textarea 
                            placeholder="Description (optional)" 
                            value={activity.description}
                            onChange={(e) => handleActivityChange(index, "description", e.target.value)}
                            className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:ring-orange-400 hover:bg-white/15 min-h-[60px] text-xs resize-none"
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Photos Section */}
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-white border-b border-white/20 pb-2">Photos</h2>
                  
                  <div className="space-y-3">
                    <div className="relative">
                      <Input
                        type="file" 
                        multiple 
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="bg-white/10 border-2 border-dashed border-white/30 text-white file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-orange-500 file:text-white hover:file:bg-orange-600 focus:ring-orange-400 hover:bg-white/15 h-12 cursor-pointer text-sm"
                      />
                      <PhotoIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                    </div>

                    {/* Existing Photos */}
                    {existingPhotos.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-white/90 text-sm">Current Photos</h4>
                          <Badge variant="secondary" className="bg-blue-500/20 text-blue-200 text-xs">
                            {existingPhotos.length} existing
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                          {existingPhotos.map((url, index) => (
                            <div key={index} className="relative group">
                              <Image 
                                src={url} 
                                alt={`Existing photo ${index + 1}`} 
                                className="w-full h-16 sm:h-20 object-cover rounded-lg border border-white/20"
                                width={80}
                                height={80}
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveExistingPhoto(index)}
                                className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                              >
                                <XMarkIcon className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* New Photo Previews */}
                    {photoPreviewUrls.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-white/90 text-sm">New Photos to Add</h4>
                          <Badge variant="secondary" className="bg-green-500/20 text-green-200 text-xs">
                            {photoFiles.length} new
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                          {photoPreviewUrls.map((url, index) => (
                            <div key={index} className="relative group">
                              <Image 
                                src={url} 
                                alt={`New photo ${index + 1}`}
                                className="w-full h-16 sm:h-20 object-cover rounded-lg border border-white/20"
                                width={80}
                                height={80}
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveNewPhoto(index)}
                                className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                              >
                                <XMarkIcon className="w-3 h-3" />
                              </button>
                              <div className="absolute bottom-1 left-1 bg-black/70 text-white px-1 py-0.5 rounded text-xs truncate max-w-[calc(100%-8px)]">
                                {photoFiles[index]?.name?.slice(0, 8)}...
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-white/60">
                          {photoFiles.length} new photo(s) will be added when you update.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className={`w-full h-10 sm:h-12 text-sm sm:text-base font-semibold shadow-lg transition-all duration-300 ${
                    loading 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 hover:shadow-orange-500/25 transform hover:scale-[1.02]'
                  } text-white`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Updating...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <PencilIcon className="w-5 h-5" />
                      Update Itinerary
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default EditItineraryPage;