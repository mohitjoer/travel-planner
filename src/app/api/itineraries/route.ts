import { NextRequest, NextResponse } from "next/server";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface Activity {
  name: string;
  description: string;
  date: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const uid = formData.get("uid") as string;
    const title = formData.get("title") as string;
    const destination = formData.get("destination") as string;
    const tripType = formData.get("tripType") as string;
    const activitiesString = formData.get("activities") as string;

    if (!uid || !title || !destination) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    let activities: Activity[] = [];
    if (activitiesString && activitiesString !== "undefined") {
      try {
        activities = JSON.parse(activitiesString);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        return NextResponse.json({ message: "Invalid activities format" }, { status: 400 });
      }
    }

    // Handle photo uploads to Cloudinary
    const photoUrls: string[] = [];
    const photoFiles = formData.getAll("photos") as File[];

    for (const file of photoFiles) {
      if (file && file.size > 0) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // Upload to Cloudinary
          const uploadResult: any = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: `itineraries/${uid}` },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            uploadStream.end(buffer);
          });

          photoUrls.push(uploadResult.secure_url);
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError);
        }
      }
    }

    // Save itinerary to Firestore
    const docRef = await addDoc(collection(db, "users", uid, "itineraries"), {
      title,
      destination,
      tripType,
      activities,
      photos: photoUrls,
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ 
      message: "Itinerary created successfully", 
      id: docRef.id 
    }, { status: 200 });

  } catch (error) {
    console.error("Error creating itinerary:", error);
    return NextResponse.json({ 
      message: "Error creating itinerary", 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
