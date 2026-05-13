import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authService } from "../services/authService";
import { withLogging } from "@/shared/withLogging";
import { AUTH_COOKIE_OPTIONS } from "@/shared/cookieOptions";

const schema = z.object({
  fullName: z.string().trim().min(1),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6),
});

const loginSchema = schema.pick({ email: true, password: true });

export const registerHandler = withLogging(async function (req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 },
      );
    }
    const data = schema.parse(body);
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
});

export const loginHandler = withLogging(async function (req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 },
    );
  }
  const parseResult = loginSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Please enter a valid email and password." },
      { status: 400 },
    );
  }
  const data = parseResult.data;

  try {
    const { token, user } = await authService.login(data.email, data.password);

    const res = NextResponse.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });

    res.cookies.set("token", token, AUTH_COOKIE_OPTIONS);

    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Login failed";
    const status = message === "Invalid credentials" ? 401 : 500;

    return NextResponse.json({ error: message }, { status });
  }
});

export const logoutHandler = withLogging(async function (req: NextRequest) {
  const res = NextResponse.json({ ok: true });

  res.cookies.set("token", "", { ...AUTH_COOKIE_OPTIONS, maxAge: 0 });

  return res;
});
