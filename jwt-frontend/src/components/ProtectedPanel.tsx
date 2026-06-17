import type { PublicUser } from "../types/auth";

type ProtectedPanelProps = {
  user: PublicUser;
  accessToken: string;
  protectedResponse: unknown;
  adminResponse: unknown;
  onGetMe: () => Promise<void>;
  onGetAdminReports: () => Promise<void>;
  onLogout: () => void;
};

export function ProtectedPanel({
  user,
  accessToken,
  protectedResponse,
  adminResponse,
  onGetMe,
  onGetAdminReports,
  onLogout,
}: ProtectedPanelProps) {
  return (
    <section className="card">
      <div className="panelHeader">
        <div>
          <h2>Authenticated session</h2>
          <p>
            Signed in as <strong>{user.name}</strong> with role{" "}
            <span className="badge">{user.role}</span>
          </p>
        </div>

        <button className="secondary" type="button" onClick={onLogout}>
          Logout
        </button>
      </div>

      <h3>Access token</h3>
      <p className="token">{accessToken}</p>

      <div className="actions">
        <button type="button" onClick={onGetMe}>
          Call protected /api/me
        </button>

        <button type="button" onClick={onGetAdminReports}>
          Call admin-only /api/admin/reports
        </button>
      </div>

      <div className="grid">
        <div>
          <h3>Protected response</h3>
          <pre>{JSON.stringify(protectedResponse, null, 2)}</pre>
        </div>

        <div>
          <h3>Admin response</h3>
          <pre>{JSON.stringify(adminResponse, null, 2)}</pre>
        </div>
      </div>
    </section>
  );
}
