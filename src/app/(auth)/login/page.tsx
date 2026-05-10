import { LoginForm } from "@/modules/auth/ui/LoginForm";
import { authPageStyle } from "@/modules/auth/ui/authFormStyles";

export default function Page() {
  return (
    <main style={authPageStyle}>
      <LoginForm />
    </main>
  );
}
