"use client";
import { useForm } from "react-hook-form";
import type { LoginFormValues } from "../models/forms";

export function LoginForm() {
  const { register, handleSubmit } = useForm<LoginFormValues>();
  return (
    <form
      onSubmit={handleSubmit(async (v) => {
        await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(v),
        });
        location.href = "/quotes";
      })}
    >
      <input placeholder="email" {...register("email")} />
      <input type="password" placeholder="password" {...register("password")} />
      <button>Login</button>
    </form>
  );
}
