import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authService, AuthServiceError } from "../services/authService";
import { withLogging } from "@/shared/withLogging";
import { AUTH_COOKIE_OPTIONS } from "@/shared/cookieOptions";
import { getLogger } from "@/shared/logger";

import { authRegisterSchema, authLoginSchema } from "@/shared/schemas";

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
    const data = authRegisterSchema.parse(body);
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

    if (err instanceof AuthServiceError) {
      getLogger().warn({ err, msg: "Registration failed due to auth service error" });
      const status = err.message === "Email already used" ? 409 : 400;
      return NextResponse.json({ error: err.message }, { status });
    }

    getLogger().error({ err, msg: "Unexpected error during registration" });
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 },
    );
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
  const parseResult = authLoginSchema.safeParse(body);
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
    if (err instanceof AuthServiceError) {
      getLogger().warn({ err, msg: "Login failed due to auth service error" });
      const status = err.message === "Invalid credentials" ? 401 : 400;
      return NextResponse.json({ error: err.message }, { status });
    }

    getLogger().error({ err, msg: "Unexpected error during login" });
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
});

export const logoutHandler = withLogging(async function (req: NextRequest) {
  const res = NextResponse.json({ ok: true });

  res.cookies.set("token", "", { ...AUTH_COOKIE_OPTIONS, maxAge: 0 });

  return res;
});
