"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "@/firebase/firebaseConfig";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Activity {
  name: string;
  description: string;
  date: string;
}

const EditItineraryPage = () => {
  const router = useRouter();
  const params = useParams();
  const itineraryId = Array.isArray(params.id) ? params.id[0] : params.id;

  // Early return if no ID is found
  if (!itineraryId) {
    return <div>Invalid itinerary ID</div>;
  }

  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [tripType, setTripType] = useState("Adventure");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchItinerary = async () => {
      if (!auth.currentUser) return;
      const docRef = doc(db, "users", auth.currentUser.uid, "itineraries", itineraryId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTitle(data.title);
        setDestination(data.destination);
        setTripType(data.tripType);
        setActivities(data.activities || []);
        setExistingPhotos(data.photos || []);
      } else {
        console.error("Itinerary not found");
      }
    };
    fetchItinerary();
  }, [itineraryId]);

  // Cleanup preview URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [photoPreviewUrls]);

  const handleAddActivity = () => {
    setActivities([...activities, { name: "", description: "", date: "" }]);
  };

  const handleActivityChange = (index: number, field: string, value: string) => {
    const newActivities = [...activities];
    (newActivities[index] as any)[field] = value;
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
      const docRef = doc(db, "users", auth.currentUser.uid, "itineraries", itineraryId);
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-black p-4">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-2xl space-y-4">
          <h2 className="text-2xl font-bold mb-4">Edit Itinerary</h2>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full p-3 border rounded"
            required
          />
          <select
            value={tripType}
            onChange={(e) => setTripType(e.target.value)}
            className="w-full p-3 border rounded"
          >
            <option>Adventure</option>
            <option>Leisure</option>
            <option>Work</option>
          </select>

          <div className="space-y-2">
            <h3 className="font-semibold">Activities</h3>
            {activities.map((activity, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-2 items-start">
                <div className="flex flex-col md:flex-row gap-2 flex-1">
                  <input
                    type="text"
                    placeholder="Name"
                    value={activity.name}
                    onChange={(e) => handleActivityChange(index, "name", e.target.value)}
                    className="p-2 border rounded w-full"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={activity.description}
                    onChange={(e) => handleActivityChange(index, "description", e.target.value)}
                    className="p-2 border rounded w-full"
                  />
                  <input
                    type="date"
                    value={activity.date}
                    onChange={(e) => handleActivityChange(index, "date", e.target.value)}
                    className="p-2 border rounded w-full"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveActivity(index)}
                  className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm"
                  title="Remove activity"
                >
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={handleAddActivity} className="text-blue-600 mt-2">
              + Add Activity
            </button>
          </div>

          <div>
            <label className="block mb-1">Photos</label>
            <input 
              type="file" 
              multiple 
              onChange={handlePhotoChange} 
              className="mb-3"
              accept="image/*"
            />
            
            {existingPhotos.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Existing Photos:</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {existingPhotos.map((url, i) => (
                    <div key={i} className="relative">
                      <img 
                        src={url} 
                        alt={`Photo ${i + 1}`} 
                        className="w-20 h-20 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingPhoto(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        title="Remove photo"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {photoPreviewUrls.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">New Photos to be Added:</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {photoPreviewUrls.map((url, i) => (
                    <div key={i} className="relative">
                      <img 
                        src={url} 
                        alt={`New photo ${i + 1}`} 
                        className="w-20 h-20 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewPhoto(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        title="Remove new photo"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  {photoFiles.length} new photo(s) will be added when you update.
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
          >
            {loading ? "Updating..." : "Update Itinerary"}
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
};

export default EditItineraryPage;
