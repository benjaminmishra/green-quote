"use client";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { LoginFormValues } from "../models/forms";
import {
  alertStyle,
  buttonStyle,
  errorStyle,
  fieldStyle,
  footerTextStyle,
  formStyle,
  headerStyle,
  inputStyle,
  labelStyle,
  linkStyle,
  subtitleStyle,
  titleStyle,
} from "./authFormStyles";

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ mode: "onTouched" });
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      noValidate
      style={formStyle}
      onSubmit={handleSubmit(async (v) => {
        setError(null);

        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(v),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setError(data?.error ?? "Login failed");
          return;
        }

        const data = await res.json().catch(() => null);
        if (data?.role === "ADMIN") {
          window.location.assign("/admin/quotes");
        } else {
          window.location.assign("/quotes");
        }
      })}
    >
      <div style={headerStyle}>
        <h1 style={titleStyle}>Log in</h1>
        <p style={subtitleStyle}>Access your GreenQuote dashboard.</p>
      </div>

      <label style={fieldStyle}>
        <span style={labelStyle}>Email</span>
        <input
          autoComplete="email"
          inputMode="email"
          placeholder="admin@test.com"
          style={inputStyle}
          {...register("email", {
            required: "Email is required.",
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: "Enter a valid email address.",
            },
          })}
        />
        {errors.email && <p style={errorStyle}>{errors.email.message}</p>}
      </label>

      <label style={fieldStyle}>
        <span style={labelStyle}>Password</span>
        <input
          autoComplete="current-password"
          type="password"
          placeholder="Enter your password"
          style={inputStyle}
          {...register("password", {
            required: "Password is required.",
          })}
        />
        {errors.password && <p style={errorStyle}>{errors.password.message}</p>}
      </label>

      {error && (
        <p role="alert" style={alertStyle}>
          {error}
        </p>
      )}

      <button
        disabled={isSubmitting}
        style={{
          ...buttonStyle,
          opacity: isSubmitting ? 0.7 : 1,
          cursor: isSubmitting ? "not-allowed" : "pointer",
        }}
      >
        {isSubmitting ? "Logging in..." : "Log in"}
      </button>

      <p style={footerTextStyle}>
        New to GreenQuote?{" "}
        <Link href="/register" style={linkStyle}>
          Create an account
        </Link>
      </p>
    </form>
  );
}
