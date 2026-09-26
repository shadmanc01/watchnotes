import { PageContainer } from "../../../components/layout/PageContainer";
import { AuthForm } from "./AuthForm";

export function LoginScreen() {
  return (
    <PageContainer>
      <section className="auth-shell">
        <p className="page-kicker">Watchnotes</p>
        <h1 className="page-title">Welcome back.</h1>
        <p className="page-lede">Pick up where your ranking left off.</p>
        <AuthForm mode="login" />
      </section>
    </PageContainer>
  );
}
