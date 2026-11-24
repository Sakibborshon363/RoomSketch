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
import { Compass, Eye, EyeOff, Sparkles, ArrowRight, Zap, AlertCircle } from "lucide-react";

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
    try {
      const response = await api.post("/auth/login", data);
      if (response.data.success) {
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
      const axiosError = err as { response?: { data?: { message?: string } } };
      const msg = axiosError.response?.data?.message || "Invalid email or password. Please try again.";
      setErrorMessage(msg);
      toastError("Authentication failed", msg);
    } finally {
      setIsLoading(false);
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
              <Zap className="h-3.5 w-3.5 mr-1.5 text-amber-300" /> 1-Click Instant Demo Login
            </Button>
          </div>

          <div className="relative mb-5 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <span className="relative bg-white px-2 text-[11px] font-semibold uppercase text-slate-400">or sign in with email</span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errorMessage && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700 animate-in fade-in">
                {errorMessage}
              </div>
            )}

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
              Sign In <ArrowRight className="h-4 w-4 ml-1.5" />
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
