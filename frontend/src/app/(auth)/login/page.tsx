"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Compass, Eye, EyeOff, Sparkles, ArrowRight, Zap, AlertCircle, Loader2, RefreshCw } from "lucide-react";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, setAuth } = useAuthStore();
  const { success, error: toastError } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [wakeUpSeconds, setWakeUpSeconds] = useState(0);
  const [pendingCredentials, setPendingCredentials] = useState<LoginFormValues | null>(null);

  // Proactively ping health endpoint on mount to trigger backend warm-up as early as possible
  useEffect(() => {
    fetch("/api/health", { cache: "no-store" }).catch(() => {
      // Ignore initial warm-up errors
    });
  }, []);

  // Poll /api/health until it responds with 200, then automatically login!
  const pollAndRetryLogin = (credentials: LoginFormValues) => {
    setIsWakingUp(true);
    setIsLoading(true);
    setErrorMessage(null);
    setPendingCredentials(credentials);
    setWakeUpSeconds(0);

    const startTime = Date.now();
    const maxWaitMs = 90000; // 90 seconds max wait

    const interval = setInterval(async () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setWakeUpSeconds(elapsed);

      try {
        const healthRes = await fetch("/api/health", { cache: "no-store" });
        if (healthRes.ok) {
          clearInterval(interval);
          // Backend is awake! Submit login immediately!
          const loginRes = await api.post("/auth/login", credentials);
          if (loginRes.data.success) {
            setIsWakingUp(false);
            setIsLoading(false);
            const authData = loginRes.data.data;
            setAuth(authData.token, {
              id: authData.id,
              email: authData.email,
              firstName: authData.firstName,
              lastName: authData.lastName,
              role: authData.role,
            });
            success("Welcome back!", `Signed in as ${authData.firstName} ${authData.lastName}`);
            router.push("/dashboard");
          }
        }
      } catch {
        // Container still booting up, continue polling
      }

      if (Date.now() - startTime > maxWaitMs) {
        clearInterval(interval);
        setIsLoading(false);
        setIsWakingUp(false);
        setErrorMessage("Cloud server took longer than expected to wake up. Please click below to try again.");
      }
    }, 2500);
  };

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("expired") === "true") {
        setIsExpired(true);
      }
    }
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    setPendingCredentials(data);
    try {
      const response = await api.post("/auth/login", data);
      if (response.data.success) {
        setIsWakingUp(false);
        setPendingCredentials(null);
        const authData = response.data.data;
        setAuth(authData.token, {
          id: authData.id,
          email: authData.email,
          firstName: authData.firstName,
          lastName: authData.lastName,
          role: authData.role,
        });
        success("Welcome back!", `Signed in as ${authData.firstName} ${authData.lastName}`);
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { status?: number; data?: { message?: string } } };
      if (axiosError.response?.status === 502 || axiosError.response?.status === 503) {
        // Automatically start resilient background polling & auto-login!
        pollAndRetryLogin(data);
        return;
      }
      setIsLoading(false);
      setIsWakingUp(false);
      let msg = "Invalid email or password. Please try again.";
      if (axiosError.response?.data?.message) {
        msg = axiosError.response.data.message;
      }
      setErrorMessage(msg);
      toastError("Authentication failed", msg);
    }
  };

  const handleInstantDemoLogin = async () => {
    setValue("email", "demo@roomsketch.com");
    setValue("password", "password123");
    await onSubmit({
      email: "demo@roomsketch.com",
      password: "password123",
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-2.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-500/20">
          <Compass className="h-7 w-7" />
        </div>
        <span className="text-2xl font-black tracking-tight text-slate-900">
          Room<span className="text-brand-600">Sketch</span>
        </span>
      </div>

      <Card className="w-full max-w-md shadow-xl border-slate-200/80">
        <CardHeader className="space-y-1 text-center pb-6">
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>Enter your credentials to access your interior projects</CardDescription>
        </CardHeader>

        <CardContent>
          {isExpired && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">Session Expired</p>
                <p className="mt-0.5 text-amber-700">Your session was refreshed. Click the 1-Click Demo button below to sign straight back in.</p>
              </div>
            </div>
          )}

          {/* Instant 1-Click Demo Login Banner */}
          <div className="mb-5 rounded-xl border border-brand-200 bg-brand-50/70 p-3 text-center">
            <p className="text-xs font-semibold text-brand-900 mb-2">Quick Evaluation / Demo Mode</p>
            <Button
              type="button"
              onClick={handleInstantDemoLogin}
              isLoading={isLoading}
              className="w-full bg-[#1E3A34] hover:bg-[#254A42] text-white font-bold text-xs shadow-sm py-2"
            >
              <Zap className="h-3.5 w-3.5 mr-1.5 text-amber-300" />
              {isWakingUp ? `Waking Up Cloud Server (${wakeUpSeconds}s)...` : "1-Click Instant Demo Login"}
            </Button>
          </div>

          <div className="relative mb-5 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <span className="relative bg-white px-2 text-[11px] font-semibold uppercase text-slate-400">or sign in with email</span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isWakingUp ? (
              <div className="rounded-xl border border-brand-200 bg-brand-50/90 p-4 text-xs text-brand-900 shadow-sm animate-in fade-in space-y-3">
                <div className="flex items-center gap-2 font-bold text-brand-800 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-brand-600 shrink-0" />
                  <span>Waking Up Cloud Server...</span>
                </div>
                <p className="text-brand-700 leading-relaxed">
                  Render puts idle free-tier instances to sleep after 15 min. The Java Spring Boot backend is booting up now ({wakeUpSeconds}s elapsed).
                </p>
                <div className="w-full bg-brand-200/60 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-brand-600 h-1.5 rounded-full animate-pulse w-3/4" />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-semibold text-brand-800 text-[11px]">
                    ✨ You will be signed in automatically the moment it boots!
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (pendingCredentials) pollAndRetryLogin(pendingCredentials);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-brand-200 hover:bg-brand-300 text-brand-900 font-semibold transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" /> Retry Now
                  </button>
                </div>
              </div>
            ) : errorMessage ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700 animate-in fade-in">
                {errorMessage}
              </div>
            ) : null}

            <Input
              id="email"
              type="email"
              label="Email Address"
              placeholder="you@domain.com"
              error={errors.email?.message}
              {...register("email")}
            />

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                label="Password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Button type="submit" className="w-full mt-2 font-semibold shadow-sm" isLoading={isLoading}>
              {isWakingUp ? `Waking Up Server (${wakeUpSeconds}s)...` : "Sign In"} <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 border-t border-slate-100 text-center text-xs text-slate-500 pt-4">
          <p>
            Don&apos;t have an account yet?{" "}
            <Link href="/register" className="font-semibold text-brand-600 hover:underline">
              Create an account
            </Link>
          </p>
          <Link href="/" className="text-slate-400 hover:text-slate-600 hover:underline">
            Back to Home
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
