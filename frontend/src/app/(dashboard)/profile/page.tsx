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
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import {
  Compass,
  User as UserIcon,
  Lock,
  ArrowLeft,
  LogOut,
  Calendar,
  Layers,
  CheckCircle,
} from "lucide-react";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser, logout } = useAuthStore();
  const { success, error: toastError } = useToast();

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onUpdateProfile = async (data: ProfileFormValues) => {
    setIsUpdatingProfile(true);
    try {
      const res = await api.put("/users/me", data);
      if (res.data.success) {
        updateUser({ firstName: data.firstName, lastName: data.lastName });
        success("Profile updated", "Your account information has been saved.");
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      toastError("Update failed", axiosError.response?.data?.message || "Could not update profile.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onChangePassword = async (data: PasswordFormValues) => {
    setIsChangingPassword(true);
    try {
      const res = await api.put("/users/me/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      if (res.data.success) {
        success("Password changed", "Your password has been successfully updated.");
        resetPasswordForm();
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      toastError("Password change failed", axiosError.response?.data?.message || "Could not change password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-semibold">Back to Dashboard</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white font-bold text-sm">
              {user?.firstName?.[0] || "U"}
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-rose-600 hover:text-rose-700 hover:bg-rose-50">
              <LogOut className="h-4 w-4 mr-1.5" /> Logout
            </Button>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">User Profile &amp; Settings</h1>
            <p className="mt-1 text-sm text-slate-500">Manage your account information and authentication credentials</p>
          </div>

          {/* Account Overview Card */}
          <div className="mb-8 rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 font-extrabold text-2xl border border-brand-100">
                  {user?.firstName?.[0] || "U"}
                  {user?.lastName?.[0] || ""}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                </div>
              </div>
              <div className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 border border-brand-200/60">
                {user?.role || "ROLE_USER"}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>Active Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "2026"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-slate-400" />
                <span>{user?.projectCount ?? 0} Floor Plan Projects Created</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Edit Profile Info Form */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-brand-600 mb-1">
                  <UserIcon className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Personal Information</span>
                </div>
                <CardTitle className="text-lg">Update Profile</CardTitle>
                <CardDescription>Update your display name across projects</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-4">
                  <Input
                    id="firstName"
                    label="First Name"
                    defaultValue={user?.firstName}
                    error={profileErrors.firstName?.message}
                    {...registerProfile("firstName")}
                  />
                  <Input
                    id="lastName"
                    label="Last Name"
                    defaultValue={user?.lastName}
                    error={profileErrors.lastName?.message}
                    {...registerProfile("lastName")}
                  />
                  <Input
                    id="email"
                    label="Email Address"
                    value={user?.email || ""}
                    disabled
                    className="bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                  <Button type="submit" className="w-full font-semibold shadow-sm" isLoading={isUpdatingProfile}>
                    <CheckCircle className="h-4 w-4 mr-1.5" /> Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Change Password Form */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-brand-600 mb-1">
                  <Lock className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Security</span>
                </div>
                <CardTitle className="text-lg">Change Password</CardTitle>
                <CardDescription>Ensure your account remains safe with a strong password</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-4">
                  <Input
                    id="currentPassword"
                    type="password"
                    label="Current Password"
                    placeholder="••••••••"
                    error={passwordErrors.currentPassword?.message}
                    {...registerPassword("currentPassword")}
                  />
                  <Input
                    id="newPassword"
                    type="password"
                    label="New Password"
                    placeholder="At least 6 characters"
                    error={passwordErrors.newPassword?.message}
                    {...registerPassword("newPassword")}
                  />
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    label="Confirm New Password"
                    placeholder="••••••••"
                    error={passwordErrors.confirmNewPassword?.message}
                    {...registerPassword("confirmNewPassword")}
                  />
                  <Button type="submit" variant="secondary" className="w-full font-semibold" isLoading={isChangingPassword}>
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
