import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "./auth";

export async function getAuthOrRedirect() {
  const token = cookies().get("token")?.value;
  if (!token) redirect("/login");
  try {
    return await verifyToken(token);
  } catch {
    redirect("/login");
  }
}
