import { useEffect, useState } from "react";
import { getAdminReports, getMe, getPublicMessage, login } from "./api/auth";
import { ApiError } from "./api/http";
import { LoginForm } from "./components/LoginForm";
import { ProtectedPanel } from "./components/ProtectedPanel";
import type { LoginResponse, PublicUser } from "./types/auth";
import "./styles.css";

const TOKEN_STORAGE_KEY = "jwt-demo-access-token";
const USER_STORAGE_KEY = "jwt-demo-user";

function readStoredSession(): LoginResponse | null {
  const accessToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  const rawUser = localStorage.getItem(USER_STORAGE_KEY);

  if (!accessToken || !rawUser) {
    return null;
  }

  try {
    return {
      accessToken,
      user: JSON.parse(rawUser) as PublicUser,
    };
  } catch {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

export default function App() {
  const [session, setSession] = useState<LoginResponse | null>(() => readStoredSession());
  const [publicResponse, setPublicResponse] = useState<unknown>(null);
  const [protectedResponse, setProtectedResponse] = useState<unknown>(null);
  const [adminResponse, setAdminResponse] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    getPublicMessage()
      .then(setPublicResponse)
      .catch((err: unknown) => {
        setPublicResponse({
          error: err instanceof Error ? err.message : "Unknown error",
        });
      });
  }, []);

  async function handleLogin(email: string, password: string) {
    setLoggingIn(true);
    setError(null);

    try {
      const loginResponse = await login(email, password);
      localStorage.setItem(TOKEN_STORAGE_KEY, loginResponse.accessToken);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loginResponse.user));
      setSession(loginResponse);
      setProtectedResponse(null);
      setAdminResponse(null);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Login failed.");
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleGetMe() {
    if (!session) {
      return;
    }

    try {
      setProtectedResponse(await getMe(session.accessToken));
    } catch (err: unknown) {
      setProtectedResponse({
        error: err instanceof Error ? err.message : "Protected request failed.",
      });
    }
  }

  async function handleGetAdminReports() {
    if (!session) {
      return;
    }

    try {
      setAdminResponse(await getAdminReports(session.accessToken));
    } catch (err: unknown) {
      setAdminResponse({
        error: err instanceof Error ? err.message : "Admin request failed.",
      });
    }
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setSession(null);
    setProtectedResponse(null);
    setAdminResponse(null);
    setError(null);
  }

  return (
    <main className="layout">
      <header>
        <p className="eyebrow">React + Express Security Pattern</p>
        <h1>JWT Authentication Demo</h1>
        <p className="subtitle">
          The backend signs and verifies the token. The frontend stores the token and
          sends it in the Authorization header.
        </p>
      </header>

      <section className="card">
        <h2>Public endpoint</h2>
        <p>This request does not include a JWT.</p>
        <pre>{JSON.stringify(publicResponse, null, 2)}</pre>
      </section>

      {!session ? (
        <LoginForm isLoading={isLoggingIn} error={error} onSubmit={handleLogin} />
      ) : (
        <ProtectedPanel
          user={session.user}
          accessToken={session.accessToken}
          protectedResponse={protectedResponse}
          adminResponse={adminResponse}
          onGetMe={handleGetMe}
          onGetAdminReports={handleGetAdminReports}
          onLogout={handleLogout}
        />
      )}

      <section className="card">
        <h2>Security interpretation</h2>
        <p>
          React can hide or show UI based on the user role, but it cannot be trusted
          as the security boundary. The Express backend must verify the token and
          enforce authorization for every protected endpoint.
        </p>
      </section>
    </main>
  );
}
