"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    address: "",
    postalCode: ""
  });
  const [errors, setErrors] = useState<any>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [postcodeReady, setPostcodeReady] = useState(false);

  // Check authentication
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Dynamically load Daum postcode script
  useEffect(() => {
    if ((window as any).daum) {
      setPostcodeReady(true);
      return;
    }

    if (document.getElementById("daum-postcode-script")) {
      return;
    }

    const script = document.createElement("script");
    script.id = "daum-postcode-script";
    script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    script.onload = () => {
      setPostcodeReady(true);
    };
    script.onerror = () => {
      alert("Failed to load postcode search script. Please check your internet connection or try again later.");
    };
    document.body.appendChild(script);
  }, []);

  // Load user data
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchUserData();
    }
  }, [status, session]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/profile/${session?.user?.id}`);
      if (response.ok) {
        const userData = await response.json();
        if (userData) {
          setForm({
            name: userData.name || "",
            email: userData.email || "",
            password: "",
            passwordConfirm: "",
            address: userData.address || "",
            postalCode: userData.postalCode || ""
          });
        }
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Input handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev: any) => ({ ...prev, [name]: undefined }));
  };

  // Find postal code popup
  const handleFindZip = () => {
    if (postcodeReady && (window as any).daum && (window as any).daum.Postcode) {
      new (window as any).daum.Postcode({
        oncomplete: function(data: any) {
          setForm((prev) => ({
            ...prev,
            postalCode: data.zonecode,
            address: data.roadAddress || data.jibunAddress
          }));
        }
      }).open();
    } else {
      alert("Postal code service is not ready yet. Please try again later.");
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess(null);

    // Check password match if password is entered
    if (form.password && form.password !== form.passwordConfirm) {
      setErrors({ passwordConfirm: "Passwords do not match." });
      return;
    }

    try {
      const response = await fetch(`/api/profile/${session?.user?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password || undefined,
          address: form.address,
          postalCode: form.postalCode,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess("Profile updated successfully.");
        setForm(prev => ({ ...prev, password: "", passwordConfirm: "" }));
      } else {
        setErrors(data.error || { form: "Failed to update profile." });
      }
    } catch {
      setErrors({ form: "Server error occurred." });
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
        <div>Loading...</div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Edit Profile</h1>
          <Link href="/">
            <Button variant="outline" size="sm">Home</Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
            {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
            {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
          </div>

          <div>
            <Label htmlFor="password">New Password (Enter only to change)</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errors.password && <span className="text-xs text-red-500">{errors.password}</span>}
          </div>

          <div>
            <Label htmlFor="passwordConfirm">Confirm New Password</Label>
            <Input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              value={form.passwordConfirm}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errors.passwordConfirm && <span className="text-xs text-red-500">{errors.passwordConfirm}</span>}
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <div className="flex gap-2">
              <Input
                id="postalCode"
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
                placeholder="Postal Code"
                className="w-1/3"
                readOnly
              />
              <Button type="button" onClick={handleFindZip} variant="outline">
                Find Postal Code
              </Button>
            </div>
            <Input
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Detailed Address"
              className="mt-2"
            />
          </div>

          <Button type="submit" className="w-full">Update</Button>

          {errors.form && <div className="text-center text-red-500 text-sm">{errors.form}</div>}
          {success && <div className="text-center text-green-600 text-sm">{success}</div>}
        </form>
      </div>
    </main>
  );
}
