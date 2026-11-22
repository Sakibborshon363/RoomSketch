"use client";

import React, { useState } from "react";
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
import { Compass, Eye, EyeOff, ArrowRight } from "lucide-react";

const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { success, error: toastError } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password");

  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let strength = 0;
    if (pass.length >= 6) strength += 1;
    if (pass.length >= 8) strength += 1;
    if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1;
    return strength;
  };

  const strength = getPasswordStrength(passwordValue || "");

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.post("/auth/register", {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      if (response.data.success) {
        const authData = response.data.data;
        setAuth(authData.token, {
          id: authData.id,
          email: authData.email,
          firstName: authData.firstName,
          lastName: authData.lastName,
          role: authData.role,
        });
        success("Account created successfully!", `Welcome to RoomSketch, ${authData.firstName}!`);
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const msg = axiosError.response?.data?.message || "Registration failed. Please try again.";
      setErrorMessage(msg);
      toastError("Registration failed", msg);
    } finally {
      setIsLoading(false);
    }
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
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>Start designing architectural 2D floor plans today</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errorMessage && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700 animate-in fade-in">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Input
                id="firstName"
                label="First Name"
                placeholder="Sarah"
                error={errors.firstName?.message}
                {...register("firstName")}
              />
              <Input
                id="lastName"
                label="Last Name"
                placeholder="Connor"
                error={errors.lastName?.message}
                {...register("lastName")}
              />
            </div>

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

            {/* Password strength bar */}
            {passwordValue && (
              <div className="space-y-1">
                <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`transition-all duration-300 ${
                      strength <= 1
                        ? "w-1/4 bg-rose-500"
                        : strength === 2
                        ? "w-2/4 bg-amber-500"
                        : strength === 3
                        ? "w-3/4 bg-blue-500"
                        : "w-full bg-emerald-500"
                    }`}
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  {strength <= 1 && "Weak password"}
                  {strength === 2 && "Fair password"}
                  {strength === 3 && "Good password"}
                  {strength >= 4 && "Strong password"}
                </p>
              </div>
            )}

            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              label="Confirm Password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <Button type="submit" className="w-full mt-2 font-semibold shadow-sm" isLoading={isLoading}>
              Register Account <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 border-t border-slate-100 text-center text-xs text-slate-500 pt-4">
          <p>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-brand-600 hover:underline">
              Sign in
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
