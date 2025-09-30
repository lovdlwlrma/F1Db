import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import "@fontsource/orbitron";

const RegisterCard: React.FC = () => {
  return (
    <Card className="relative w-full max-w-md rounded-2xl bg-black/80 backdrop-blur-lg border border-red-500/30 shadow-2xl transition-transform hover:-translate-y-1 overflow-hidden">
      <div className="absolute inset-0 rounded-2xl border-4 border-transparent animate-border-glow pointer-events-none"></div>

      <CardHeader className="pt-8">
        <CardTitle className="text-3xl font-extrabold text-center text-white tracking-widest"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          F1 Register
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form className="space-y-5">
          <div>
            <Label htmlFor="username" className="text-gray-300">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Username"
              className="border-gray-600 bg-black text-white placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            />
          </div>

          <div>
            <Label htmlFor="name" className="text-gray-300">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Full Name"
              className="border-gray-600 bg-black text-white placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="border-gray-600 bg-black text-white placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-gray-300">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="border-gray-600 bg-black text-white placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              className="border-gray-600 bg-black text-white placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            />
          </div>

          <Button className="w-full bg-gradient-to-r from-red-600 to-black text-white font-bold hover:brightness-125 shadow-lg transition-all">
            Create Account
          </Button>
        </form>
      </CardContent>

      <CardFooter className="text-center text-sm text-gray-400">
        Already have an account?{" "}
        <a href="/login" className="text-red-500 hover:underline font-medium">
          Sign in
        </a>
      </CardFooter>
    </Card>
  );
};

export default RegisterCard;
