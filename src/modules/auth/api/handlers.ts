import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authService } from "../services/authService";

const schema = z.object({
  fullName: z.string().trim().min(1),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6),
});

const loginSchema = schema.pick({ email: true, password: true });

export async function registerHandler(req: NextRequest) {
  try {
    const data = schema.parse(await req.json());
    const user = await authService.register(
      data.fullName,
      data.email,
      data.password,
    );

    return NextResponse.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Please enter a valid name, email, and password." },
        { status: 400 },
      );
    }

    const message = err instanceof Error ? err.message : "Registration failed";
    const status = message === "Email already used" ? 409 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function loginHandler(req: NextRequest) {
  const data = loginSchema.parse(await req.json());

  try {
    const { token, user } = await authService.login(data.email, data.password);

    const res = NextResponse.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Login failed";
    const status = message === "Invalid credentials" ? 401 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function logoutHandler() {
  const res = NextResponse.json({ ok: true });

  res.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return res;
}
