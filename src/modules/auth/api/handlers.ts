import { NextRequest, NextResponse } from "next/server";
import {
  authService,
  EmailInUseError,
  InvalidCredentialsError,
} from "../services/authService";
import { withLogging } from "@/shared/withLogging";
import { AUTH_COOKIE_OPTIONS } from "@/shared/cookieOptions";
import { getLogger } from "@/shared/logger";

import { authRegisterSchema, authLoginSchema } from "@/shared/schemas";

export const registerHandler = withLogging(async function (req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 },
    );
  }

  const parseResult = authRegisterSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Please enter a valid name, email, and password." },
      { status: 400 },
    );
  }
  const data = parseResult.data;

  try {
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
    if (err instanceof EmailInUseError) {
      getLogger().warn({ err, msg: "Registration rejected — email already used" });
      return NextResponse.json({ error: err.message }, { status: 409 });
    }

    getLogger().error({ err, msg: "Unexpected error during registration" });
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
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
    if (err instanceof InvalidCredentialsError) {
      getLogger().warn({ err, msg: "Login rejected — invalid credentials" });
      return NextResponse.json({ error: err.message }, { status: 401 });
    }

    getLogger().error({ err, msg: "Unexpected error during login" });
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
});

export const logoutHandler = withLogging(async function (_req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("token", "", { ...AUTH_COOKIE_OPTIONS, maxAge: 0 });
  return res;
});
