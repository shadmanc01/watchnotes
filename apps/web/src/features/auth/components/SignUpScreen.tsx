import { PageContainer } from "../../../components/layout/PageContainer";
import { AuthForm } from "./AuthForm";

export function SignUpScreen() {
  return (
    <PageContainer>
      <section className="auth-shell">
        <p className="page-kicker">Watchnotes</p>
        <h1 className="page-title">Create your profile.</h1>
        <p className="page-lede">
          Your rankings, watch history, notes, and taste profile will live here.
        </p>
        <AuthForm mode="signup" />
      </section>
    </PageContainer>
  );
}
