"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase/firebaseConfig";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Activity {
  name: string;
  description: string;
  date: string;
}

const CreateItinerary = () => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [tripType, setTripType] = useState("Adventure");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAddActivity = () => setActivities([...activities, { name: "", description: "", date: "" }]);

  const handleActivityChange = (index: number, field: string, value: string) => {
    const newActivities = [...activities];
    (newActivities[index] as any)[field] = value;
    setActivities(newActivities);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setPhotoFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("uid", auth.currentUser.uid);
      formData.append("title", title);
      formData.append("destination", destination);
      formData.append("tripType", tripType);
      formData.append("activities", JSON.stringify(activities));
      photoFiles.forEach((file) => formData.append("photos", file));

      const res = await fetch("/api/itineraries", { method: "POST", body: formData });
      
      // Check if response is JSON
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await res.json();
        if (res.ok) {
          router.push("/dashboard");
        } else {
          console.error("API Error:", data.message, "Full response:", data);
        }
      } else {
        // Response is not JSON, log the text
        const text = await res.text();
        console.error("Non-JSON response:", res.status, text);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-2xl space-y-4">
          <h2 className="text-2xl font-bold mb-4">Create New Itinerary</h2>

          <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border rounded" required />

          <input type="text" placeholder="Destination" value={destination} onChange={(e) => setDestination(e.target.value)}
            className="w-full p-3 border rounded" required />

          <select value={tripType} onChange={(e) => setTripType(e.target.value)} className="w-full p-3 border rounded">
            <option>Adventure</option>
            <option>Leisure</option>
            <option>Work</option>
          </select>

          <div className="space-y-2">
            <h3 className="font-semibold">Activities</h3>
            {activities.map((activity, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-2">
                <input type="text" placeholder="Name" value={activity.name}
                  onChange={(e) => handleActivityChange(index, "name", e.target.value)}
                  className="p-2 border rounded w-full" />
                <input type="text" placeholder="Description" value={activity.description}
                  onChange={(e) => handleActivityChange(index, "description", e.target.value)}
                  className="p-2 border rounded w-full" />
                <input type="date" value={activity.date}
                  onChange={(e) => handleActivityChange(index, "date", e.target.value)}
                  className="p-2 border rounded w-full" />
              </div>
            ))}
            <button type="button" onClick={handleAddActivity} className="text-blue-600 mt-2">+ Add Activity</button>
          </div>

          <div>
            <label className="block mb-1">Photos</label>
            <input type="file" multiple onChange={handlePhotoChange} />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700">
            {loading ? "Saving..." : "Create Itinerary"}
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
};

export default CreateItinerary;
