"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton({ disabled, loading }: { disabled: boolean; loading: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
    >
      {loading && (
        <div className="absolute left-0 inset-y-0 flex items-center pl-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        </div>
      )}
      {loading ? "Creating account..." : "Sign Up"}
    </button>
  );
}

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    address: "",
    zipcode: ""
  });
  const [errors, setErrors] = useState<any>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [checking, setChecking] = useState<{ name?: boolean; email?: boolean }>({});
  const [duplicate, setDuplicate] = useState<{ name?: boolean; email?: boolean }>({});
  const [postcodeReady, setPostcodeReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // Daum 우편번호 스크립트 동적 로드 (안정성 강화)
  useEffect(() => {
    // window.daum 객체가 이미 존재하면, 스크립트가 로드된 것으로 간주
    if ((window as any).daum) {
      setPostcodeReady(true);
      return;
    }

    // 스크립트 태그가 이미 존재하는지 확인
    if (document.getElementById("daum-postcode-script")) {
        // 로드가 완료되기를 기다리기 위해 onload 콜백을 다시 설정할 수 있지만,
        // 여기서는 단순하게 daum 객체 존재 여부로 판단합니다.
        return;
    }

    const script = document.createElement("script");
    script.id = "daum-postcode-script";
    script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    script.onload = () => {
        // 스크립트 로드 완료 시 상태 업데이트
        setPostcodeReady(true);
    };
    script.onerror = () => {
        // 스크립트 로드 실패 시 사용자에게 알림
        alert("우편번호 검색 스크립트를 불러오지 못했습니다. 인터넷 연결을 확인하거나 잠시 후 다시 시도해주세요.");
    };
    document.body.appendChild(script);
  }, []);

  // 중복 체크 함수
  const checkDuplicate = useCallback(async (type: "name" | "email", value: string) => {
    setChecking((prev) => ({ ...prev, [type]: true }));
    setDuplicate((prev) => ({ ...prev, [type]: false }));
    try {
      const res = await fetch(`/api/check-duplicate?type=${type}&value=${encodeURIComponent(value)}`);
      const data = await res.json();
      setDuplicate((prev) => ({ ...prev, [type]: data.duplicate }));
    } catch {
      setDuplicate((prev) => ({ ...prev, [type]: false }));
    } finally {
      setChecking((prev) => ({ ...prev, [type]: false }));
    }
  }, []);

  // 입력 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev: any) => ({ ...prev, [name]: undefined }));
    if (name === "name" || name === "email") {
      if (value.length > 1) checkDuplicate(name as any, value);
    }
  };

  // 우편번호 찾기 팝업
  const handleFindZip = () => {
    if (postcodeReady && (window as any).daum && (window as any).daum.Postcode) {
      new (window as any).daum.Postcode({
        oncomplete: function(data: any) {
          setForm((prev) => ({
            ...prev,
            zipcode: data.zonecode,
            address: data.roadAddress || data.jibunAddress
          }));
        }
      }).open();
    } else {
      alert("우편번호 서비스가 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.");
      // 스크립트 로드를 다시 시도하거나 상태를 확인하는 로직을 추가할 수 있습니다.
      if (!document.getElementById("daum-postcode-script")) {
          window.location.reload(); // 최후의 수단으로 페이지 새로고침
      }
    }
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess(null);
    setLoading(true);
    
    // 비밀번호 일치 확인
    if (form.password !== form.passwordConfirm) {
      setErrors({ passwordConfirm: "Passwords do not match." });
      setLoading(false);
      return;
    }
    // Duplicate check
    if (duplicate.name) {
      setErrors({ name: "This name is already taken." });
      setLoading(false);
      return;
    }
    if (duplicate.email) {
      setErrors({ email: "This email is already in use." });
      setLoading(false);
      return;
    }
    // 회원가입 요청
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Account created successfully! Please sign in.");
        setForm({ name: "", email: "", password: "", passwordConfirm: "", address: "", zipcode: "" });
      } else {
        setErrors(data.error || { form: "Sign up failed. Please try again." });
      }
    } catch {
      setErrors({ form: "Server error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const isDuplicate = duplicate.name || duplicate.email;
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        <div className="relative">
          {/* 배경 장식 */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-teal-600 shadow-lg transform skew-y-1 sm:skew-y-0 sm:rotate-2 sm:rounded-3xl opacity-10"></div>
          <div className="relative bg-white shadow-xl rounded-2xl border border-gray-100">
            <div className="px-8 py-10">
              {/* 헤더 */}
              <div className="text-center mb-8">
                <div className="mx-auto h-16 w-16 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Join Us! 🎉</h2>
                <p className="text-gray-600">Create your new account</p>
              </div>

              {/* 성공 메시지 */}
              {success && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">{success}</p>
                      <div className="mt-3">
                        <Link 
                          href="/login" 
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 transition-colors duration-200"
                        >
                          Go to Sign In
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 폼 */}
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* 이름 입력 */}
                <div className="space-y-4">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      required
                      autoComplete="name"
                      className={`block w-full pl-10 pr-10 py-4 text-base border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                        errors.name || duplicate.name 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-green-500'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {checking.name && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                      </div>
                    )}
                  </div>
                  {checking.name && <p className="text-xs text-blue-600">Checking availability...</p>}
                  {duplicate.name && <p className="text-xs text-red-600">⚠️ This name is already taken.</p>}
                  {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
                </div>

                {/* 이메일 입력 */}
                <div className="space-y-4">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                      className={`block w-full pl-10 pr-10 py-4 text-base border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                        errors.email || duplicate.email 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-green-500'
                      }`}
                      placeholder="your@email.com"
                    />
                    {checking.email && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                      </div>
                    )}
                  </div>
                  {checking.email && <p className="text-xs text-blue-600">Checking availability...</p>}
                  {duplicate.email && <p className="text-xs text-red-600">⚠️ This email is already in use.</p>}
                  {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                </div>

                {/* 비밀번호 입력 */}
                <div className="space-y-4">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                      className={`block w-full pl-10 pr-10 py-4 text-base border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                        errors.password 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-green-500'
                      }`}
                      placeholder="••••••••"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878a3 3 0 000 4.243m4.242-4.243L12.707 12l-2.829 2.829M16.122 9.878L17.536 8.464m-1.414 1.414a3 3 0 000 4.243" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.065 7-9.543 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
                </div>

                {/* 비밀번호 확인 입력 */}
                <div className="space-y-4">
                  <label htmlFor="passwordConfirm" className="block text-sm font-semibold text-gray-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="passwordConfirm"
                      name="passwordConfirm"
                      type={showPasswordConfirm ? "text" : "password"}
                      value={form.passwordConfirm}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                      className={`block w-full pl-10 pr-10 py-4 text-base border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                        errors.passwordConfirm 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-green-500'
                      }`}
                      placeholder="••••••••"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200"
                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      >
                        {showPasswordConfirm ? (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878a3 3 0 000 4.243m4.242-4.243L12.707 12l-2.829 2.829M16.122 9.878L17.536 8.464m-1.414 1.414a3 3 0 000 4.243" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.065 7-9.543 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  {errors.passwordConfirm && <p className="text-xs text-red-600">{errors.passwordConfirm}</p>}
                </div>

                {/* 주소 입력 */}
                <div className="space-y-4">
                  <label htmlFor="address" className="block text-sm font-semibold text-gray-700">
                    Address (Optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="zipcode"
                      name="zipcode"
                      type="text"
                      value={form.zipcode}
                      readOnly
                      className="w-32 py-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="Postal Code"
                    />
                    <button
                      type="button"
                      onClick={handleFindZip}
                      className="px-4 py-3 text-base font-medium rounded-lg bg-green-100 text-green-700 border border-green-200 hover:bg-green-200 transition-colors duration-200"
                    >
                      Find Address
                    </button>
                  </div>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={form.address}
                    readOnly
                    className="block w-full py-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="Address will be filled automatically"
                  />
                </div>

                {/* 에러 메시지 */}
                {errors.form && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-800">{errors.form}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 제출 버튼 */}
                <div className="pt-4">
                  <SubmitButton disabled={loading || isDuplicate || hasErrors} loading={loading} />
                </div>
              </form>

              {/* 구분선 */}
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>
              </div>

              {/* 로그인 링크 */}
              <div className="mt-6">
                <div className="text-center">
                  <span className="text-gray-600">Already have an account? </span>
                  <Link 
                    href="/login" 
                    className="font-semibold text-green-600 hover:text-green-500 transition-colors duration-200 hover:underline"
                  >
                    Sign In
                  </Link>
                </div>
              </div>

              {/* 홈으로 돌아가기 */}
              <div className="mt-4 text-center">
                <Link 
                  href="/" 
                  className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
