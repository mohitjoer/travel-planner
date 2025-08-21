import { NextRequest, NextResponse } from "next/server";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

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
  createdAt?: any;
}

export async function POST(request: NextRequest) {
  try {
    const { uid, destination, tripType, activityName, favorite } = await request.json();

    if (!uid) return NextResponse.json({ message: "Missing UID" }, { status: 400 });

    let itinerariesRef = collection(db, "users", uid, "itineraries");
    let q = query(itinerariesRef);

    const allDocs = await getDocs(itinerariesRef);
    let results: Itinerary[] = allDocs.docs.map(doc => ({ id: doc.id, ...doc.data() } as Itinerary));

    // Filter client-side since Firestore array of maps can't easily query nested fields dynamically
    if (destination) results = results.filter(doc => doc.destination === destination);
    if (tripType) results = results.filter(doc => doc.tripType === tripType);
    if (favorite !== undefined) results = results.filter(doc => doc.favorite === favorite);
    if (activityName) {
      results = results.filter(doc =>
        doc.activities?.some((act: Activity) => act.name.toLowerCase().includes(activityName.toLowerCase()))
      );
    }

    return NextResponse.json({ itineraries: results }, { status: 200 });

  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ message: "Search failed", error }, { status: 500 });
  }
}
