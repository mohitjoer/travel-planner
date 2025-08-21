"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { auth, db } from "@/firebase/firebaseConfig";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { FlickeringGrid } from "@/components/ui/flickeringgrid";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users } from "lucide-react";
import { gsap } from "gsap";

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
  const heroRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    fetchRecentItineraries();
    

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      

      tl.fromTo(heroRef.current, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      )
      .fromTo(buttonsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "-=0.3"
      )
      .fromTo(pillsRef.current?.children || [],
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power1.out", stagger: 0.1 },
        "-=0.2"
      );
    });
    
    return () => {
      unsubscribe();
      ctx.revert();
    };
  }, []);

  const fetchRecentItineraries = async () => {
    try {
      const q = query(
        collection(db, "users", "PUBLIC_UID", "itineraries"),
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
    <div className="min-h-screen bg-gradient-to-br from-red-950 to-orange-900 overflow-hidden">
      <div className="fixed inset-0 z-0">
        <FlickeringGrid
          squareSize={6}
          gridGap={3}
          flickerChance={0.05}
          color="rgb(249, 115, 22)"
          maxOpacity={0.8}
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-900/20 to-black/40" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          
          <div ref={heroRef} className="space-y-6">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 bg-clip-text text-transparent">
                Travel Smart
              </span>
              <br />
              <span className="text-white">Plan Effortlessly</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Create personalized itineraries, discover new ways, and make every journey easy.
            </p>
          </div>

          <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href={user ? "/dashboard" : "/login"}>
              <Button className="group relative px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl font-semibold text-lg shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-red-500/25">
                <span className="relative z-10 flex items-center gap-2">
                  {user ? "Dashboard" : "Start Planning"}
                  <Calendar className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-400 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity" />
              </Button>
            </Link>
          </div>

          <div ref={pillsRef} className="flex flex-wrap justify-center gap-3 pt-8">
            {[
              { icon: MapPin, text: "Easy to use" },
              { icon: Calendar, text: "Well Planned" },
              { icon: Users, text: "Helps A Lot" }
            ].map((feature, i) => (
              <div 
                key={i}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/60 text-sm hover:bg-white/10 transition-colors cursor-default"
              >
                <feature.icon className="w-4 h-4" />
                {feature.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;