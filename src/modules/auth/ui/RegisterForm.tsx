"use client";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { RegisterFormValues } from "../models/forms";
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

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ mode: "onTouched" });
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      noValidate
      style={formStyle}
      onSubmit={handleSubmit(async (v) => {
        setError(null);

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(v),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setError(data?.error ?? "Registration failed");
          return;
        }

        window.location.assign("/login");
      })}
    >
      <div style={headerStyle}>
        <h1 style={titleStyle}>Create account</h1>
        <p style={subtitleStyle}>Start creating solar quote pre-qualifications.</p>
      </div>

      <label style={fieldStyle}>
        <span style={labelStyle}>Full name</span>
        <input
          autoComplete="name"
          placeholder="Jane Smith"
          style={inputStyle}
          {...register("fullName", {
            required: "Full name is required.",
            minLength: {
              value: 2,
              message: "Enter at least 2 characters.",
            },
          })}
        />
        {errors.fullName && (
          <p style={errorStyle}>{errors.fullName.message}</p>
        )}
      </label>

      <label style={fieldStyle}>
        <span style={labelStyle}>Email</span>
        <input
          autoComplete="email"
          inputMode="email"
          placeholder="jane@example.com"
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
          autoComplete="new-password"
          type="password"
          placeholder="At least 6 characters"
          style={inputStyle}
          {...register("password", {
            required: "Password is required.",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters.",
            },
          })}
        />
        {errors.password && (
          <p style={errorStyle}>{errors.password.message}</p>
        )}
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
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>

      <p style={footerTextStyle}>
        Already have an account?{" "}
        <Link href="/login" style={linkStyle}>
          Log in
        </Link>
      </p>
    </form>
  );
}
