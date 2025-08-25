"use client";

import { signup } from "@/lib/actions/user";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";

// 폼 제출 버튼 컴포넌트 (로딩 상태 표시)
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
    >
      {pending ? "가입하는 중..." : "회원가입"}
    </button>
  );
}

export default function SignupPage() {
  // useFormState를 사용하여 서버 액션의 상태를 관리
  const [state, formAction] = useFormState(signup, { error: {}, success: undefined });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          회원가입
        </h1>

        <form action={formAction} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              이름
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {state?.error?.fields?.name && (
              <p className="mt-1 text-sm text-red-600">{state.error.fields.name[0]}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              이메일 주소
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
             {state?.error?.fields?.email && (
              <p className="mt-1 text-sm text-red-600">{state.error.fields.email[0]}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
             {state?.error?.fields?.password && (
              <p className="mt-1 text-sm text-red-600">{state.error.fields.password[0]}</p>
            )}
          </div>

          <div>
            <SubmitButton />
          </div>

          {state?.error?.form && (
            <p className="mt-2 text-sm text-center text-red-600">{state.error.form}</p>
          )}
           {state?.success && (
            <p className="mt-2 text-sm text-center text-green-600">{state.success}</p>
          )}
        </form>
        <p className="mt-4 text-sm text-center text-gray-600">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </main>
  );
}
