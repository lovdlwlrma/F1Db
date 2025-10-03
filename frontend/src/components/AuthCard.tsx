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

const AuthCard: React.FC = () => {
  return (
    <Card className="relative w-full max-w-md rounded-2xl bg-black/80 backdrop-blur-lg border border-red-500/30 shadow-2xl transition-transform hover:-translate-y-1 overflow-hidden">
      <div className="absolute inset-0 rounded-2xl border-4 border-transparent animate-border-glow pointer-events-none"></div>

      <CardHeader className="pt-8">
        <CardTitle
          className="text-4xl font-extrabold text-center text-white tracking-widest"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          F1 Dashboard
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form className="space-y-6">
          <div>
            <Label htmlFor="username" className="text-gray-300">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              className="border-gray-600 bg-black text-white placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-gray-300">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              className="border-gray-600 bg-black text-white placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            />
          </div>

          <Button
            asChild
            className="w-full bg-gradient-to-r from-red-600 to-black text-white font-bold hover:brightness-125 shadow-lg transition-all"
          >
            <a href="/">Start Racing</a>
          </Button>
        </form>
      </CardContent>

      <CardFooter className="text-center text-sm text-gray-400">
        Don't have an account?{" "}
        <a
          href="/register"
          className="text-red-500 hover:underline font-medium"
        >
          Sign up
        </a>
      </CardFooter>
    </Card>
  );
};

export default AuthCard;
