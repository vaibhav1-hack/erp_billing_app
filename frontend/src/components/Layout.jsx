import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const nav = [
    { to: "/", label: "🏠 Dashboard", roles: ["admin", "staff"] },
    { to: "/bills", label: "🧾 Bills", roles: ["admin", "staff"] },
    { to: "/items", label: "📦 Items", roles: ["admin", "staff"] },
    { to: "/customers", label: "👥 Customers", roles: ["admin", "staff"] },
    { to: "/stock", label: "📊 Stock", roles: ["admin", "staff"] },
    { to: "/users", label: "👤 Users", roles: ["admin"] },
  ];

  const filtered = nav.filter(n => n.roles.includes(user?.role));

  return (
    <div className="flex h-screen bg-slate-100">
      <aside className="w-56 bg-gradient-to-b from-blue-700 to-blue-900 flex flex-col shadow-lg">
        <div className="px-5 py-6 border-b border-blue-600">
          <div className="text-white font-bold text-xl tracking-tight">BillingERP</div>
          <div className="text-blue-200 text-xs mt-1">{user?.name} · {user?.role}</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {filtered.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm transition ${
                  isActive
                    ? "bg-white text-blue-700 font-semibold shadow"
                    : "text-blue-100 hover:bg-blue-600 hover:text-white"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-blue-600">
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="w-full text-xs text-blue-200 hover:text-white bg-blue-800 hover:bg-red-500 px-3 py-2 rounded-lg transition"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-slate-100 p-8">
        <Outlet />
      </main>
    </div>
  );
}