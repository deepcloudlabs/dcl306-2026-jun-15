import { FormEvent, useState } from "react";

type LoginFormProps = {
  isLoading: boolean;
  error: string | null;
  onSubmit: (email: string, password: string) => Promise<void>;
};

export function LoginForm({ isLoading, error, onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(email, password);
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Login</h2>

      <label>
        Email
        <input
          type="email"
          value={email}
          autoComplete="username"
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      <label>
        Password
        <input
          type="password"
          value={password}
          autoComplete="current-password"
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>

      {error && <p className="error">{error}</p>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Login and receive JWT"}
      </button>

      <div className="hint">
        <strong>Demo accounts:</strong>
        <br />
        jack@example.com / admin123
        <br />
        kate@example.com / user123
      </div>
    </form>
  );
}
