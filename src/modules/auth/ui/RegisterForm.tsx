"use client";
import { useForm } from "react-hook-form";
import type { RegisterFormValues } from "../models/forms";

export function RegisterForm() {
  const { register, handleSubmit } = useForm<RegisterFormValues>();
  return (
    <form
      onSubmit={handleSubmit(async (v) => {
        await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(v),
        });
        location.href = "/login";
      })}
    >
      <input placeholder="full name" {...register("fullName")} />
      <input placeholder="email" {...register("email")} />
      <input type="password" placeholder="password" {...register("password")} />
      <button>Register</button>
    </form>
  );
}
