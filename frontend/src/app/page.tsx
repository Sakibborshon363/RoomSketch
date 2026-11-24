"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import {
  Compass,
  Layers,
  LayoutGrid,
  ShieldCheck,
  FileDown,
  Ruler,
  ArrowRight,
  Sparkles,
  Maximize2,
  CheckCircle,
  Zap,
} from "lucide-react";
import { ArchitecturalHeroPreview } from "@/components/home/ArchitecturalHeroPreview";

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, initAuth } = useAuthStore();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleInstantDemoLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await api.post("/auth/login", {
        email: "demo@roomsketch.com",
        password: "password123",
      });
      if (res.data.success) {
        const authData = res.data.data;
        useAuthStore.getState().setAuth(authData.token, {
          id: authData.id,
          email: authData.email,
          firstName: authData.firstName,
          lastName: authData.lastName,
          role: authData.role,
        });
        router.push("/dashboard");
      }
    } catch {
      router.push("/login");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 selection:bg-brand-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-500/20">
              <Compass className="h-6 w-6" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              Room<span className="text-brand-600">Sketch</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button onClick={() => router.push("/dashboard")} className="shadow-sm">
                Open Dashboard <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleInstantDemoLogin}
                  size="sm"
                  variant="outline"
                  isLoading={isLoggingIn}
                  className="hidden sm:inline-flex border-brand-300 text-brand-700 hover:bg-brand-50 font-semibold"
                >
                  <Zap className="h-3.5 w-3.5 mr-1 text-brand-600" /> Demo Login
                </Button>
                <Link href="/login">
                  <Button variant="ghost" className="text-sm font-semibold">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="shadow-sm text-sm font-semibold">
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/80 px-3.5 py-1 text-xs font-semibold text-brand-700 shadow-sm mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              University Capstone Project: Professional 2D CAD Planning
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-6xl sm:leading-[1.15]">
              Design Real Floor Plans with Interactive Precision
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-600 sm:text-xl">
              A comprehensive browser-based 2D interior design platform. Draw custom rooms, arrange architectural furniture, customize materials, detect layout collisions, and export to PNG &amp; PDF.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={handleInstantDemoLogin}
                isLoading={isLoggingIn}
                className="shadow-md shadow-brand-500/20 font-bold px-8 bg-brand-600 hover:bg-brand-700 text-white text-base"
              >
                <Zap className="h-5 w-5 mr-2 text-amber-300" /> Enter Dashboard (1-Click Demo)
              </Button>
              <Link href="/login">
                <Button size="lg" variant="outline" className="font-semibold px-8 text-base">
                  Sign In with Credentials
                </Button>
              </Link>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Demo Credentials: <span className="font-mono text-slate-600">demo@roomsketch.com</span> / <span className="font-mono text-slate-600">password123</span>
            </p>
          </div>

          {/* Interactive Hero Graphic Showcase */}
          <ArchitecturalHeroPreview
            onOpenEditor={handleInstantDemoLogin}
            isLoading={isLoggingIn}
          />
        </div>
      </section>

      {/* Feature Architecture Cards */}
      <section className="border-t border-slate-200/80 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Engineered for Architectural Fidelity
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Built using a clean modular monolith: Spring Boot 3 + PostgreSQL backend with Next.js &amp; Konva.js frontend.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/70 p-7 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">Interactive 2D Canvas</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Smooth infinite workspace navigation with zoom, pan, grid snapping, and precise room dimension handles.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 p-7 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">Multi-Floor Management</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Design multi-story residential and commercial spaces. Switch, duplicate, and manage layouts across independent floors.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 p-7 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <LayoutGrid className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">Vector Furniture Library</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Curated architectural 2D vector shapes for living rooms, bedrooms, kitchens, bathrooms, and offices.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 p-7 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Ruler className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">Collision &amp; Boundary Detection</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Rotated rectangle SAT collision algorithms detect overlapping furniture and objects extending beyond room perimeters.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 p-7 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FileDown className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">PNG &amp; PDF Export</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Export crisp high-resolution floor plan images and structured architectural PDF documents with areas and dimensions.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 p-7 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">Security &amp; Tokenized Sharing</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Stateless JWT authentication with BCrypt hashing, project ownership verification, and read-only shareable links.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-100/60 py-10 text-center text-sm text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-brand-600" />
            <span className="font-bold text-slate-900">RoomSketch</span>
            <span className="text-slate-400">| Final Year Software Engineering Capstone</span>
          </div>
          <p>© {new Date().getFullYear()} RoomSketch. Traditional Software Engineering Architecture.</p>
        </div>
      </footer>
    </div>
  );
}
