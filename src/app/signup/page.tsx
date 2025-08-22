"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent, 
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserIcon, LockClosedIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

const Signup = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      let errorMessage = "Account creation failed. Please try again.";
      
      if (err instanceof Error && 'code' in err) {
        const firebaseError = err as { code: string };
        if (firebaseError.code === "auth/email-already-in-use") {
          errorMessage = "An account with this email already exists.";
        } else if (firebaseError.code === "auth/weak-password") {
          errorMessage = "Password should be at least 6 characters long.";
        } else if (firebaseError.code === "auth/invalid-email") {
          errorMessage = "Please enter a valid email address.";
        } else if (firebaseError.code === "auth/operation-not-allowed") {
          errorMessage = "Email/password accounts are not enabled.";
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-950 via-orange-900 to-red-950">
      <div className="relative w-full max-w-md">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-white">Create Account</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <Alert className="bg-red-500/10 border-red-500/30 backdrop-blur-sm">
                  <AlertDescription className="text-red-200 text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/90 flex items-center gap-2">
                  <UserPlusIcon className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/10 backdrop-blur-md border-white/20 text-white placeholder-white/60 focus:ring-orange-400 focus:border-transparent hover:bg-white/15 h-11"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/90 flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 backdrop-blur-md border-white/20 text-white placeholder-white/60 focus:ring-orange-400 focus:border-transparent hover:bg-white/15 h-11"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/90 flex items-center gap-2">
                  <LockClosedIcon className="w-4 h-4" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password (min. 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/10 backdrop-blur-md border-white/20 text-white placeholder-white/60 focus:ring-orange-400 focus:border-transparent hover:bg-white/15 h-11 pr-12"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={loading}
                className={`w-full h-12 text-base font-semibold shadow-lg transition-all duration-300 ${
                  loading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 hover:shadow-orange-500/25 transform hover:scale-[1.02]'
                } text-white`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/10 backdrop-blur-sm text-white/70 rounded-full">
                  Already have an account?
                </span>
              </div>
            </div>
            
            <div className="text-center">
              <Link href="/login">
                <Button
                  variant="outline"
                  className="w-full bg-white/5 hover:bg-white/10 border-white/30 text-white backdrop-blur-sm h-11"
                >
                  Sign In Instead
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;