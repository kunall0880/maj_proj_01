import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold tracking-wide text-slate-900">
              WorkBridge
            </span>
            <span className="text-xs text-slate-500">Client–Freelancer Console</span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            {user?.role === "client" && (
              <Link className="text-slate-700 hover:text-slate-900" to="/client">
                Client dashboard
              </Link>
            )}
            {user?.role === "freelancer" && (
              <Link className="text-slate-700 hover:text-slate-900" to="/freelancer">
                Freelancer dashboard
              </Link>
            )}
            {!user && (
              <>
                <Link className="text-slate-700 hover:text-slate-900" to="/login">
                  Login
                </Link>
                <Link className="text-slate-700 hover:text-slate-900" to="/signup">
                  Signup
                </Link>
              </>
            )}
            {user && (
              <>
                <span className="text-xs text-slate-500">
                  {user.name} &middot; {user.role}
                </span>
                <button className="btn-secondary px-3 py-1 text-xs" onClick={logout}>
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-6">{children}</div>
      </main>
    </div>
  );
};


