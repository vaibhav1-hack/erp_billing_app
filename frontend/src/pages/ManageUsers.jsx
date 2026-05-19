import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function ManageUsers() {
  const { user } = useAuth();
  const [verified, setVerified] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [form, setForm] = useState({ name: "", email: "", password: "", role: "staff" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);

  if (user?.role !== "admin") {
    return <div className="text-red-500 font-medium">Access denied. Admins only.</div>;
  }

  const verifyAdmin = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      await axios.post("/api/auth/login", { email: user.email, password: adminPassword });
      setVerified(true);
      loadUsers();
    } catch {
      setAuthError("Wrong password");
    }
  };

  const loadUsers = () => {
    axios.get("/api/auth/users").then(r => setUsers(r.data));
  };

  const createUser = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      await axios.post("/api/auth/register", form);
      setSuccess(`User ${form.name} created successfully`);
      setForm({ name: "", email: "", password: "", role: "staff" });
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.detail || "Error creating user");
    }
  };

  if (!verified) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Manage Users</h1>
        <div className="max-w-sm bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-semibold text-gray-700 mb-1">Confirm Identity</h2>
          <p className="text-xs text-gray-400 mb-4">Enter your admin password to continue</p>
          {authError && <p className="text-red-500 text-sm mb-3">{authError}</p>}
          <form onSubmit={verifyAdmin} className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Admin Password</label>
              <input type="password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-gray-50"
                value={adminPassword} onChange={e => setAdminPassword(e.target.value)} required />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg transition">
              Verify
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Manage Users</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6 max-w-lg">
        <h2 className="font-semibold text-gray-700 mb-4">Add New User</h2>
        {success && <p className="text-emerald-500 text-sm mb-3">{success}</p>}
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <form onSubmit={createUser} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Name *</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-gray-50"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Role</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-gray-50"
                value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Email *</label>
              <input type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-gray-50"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Password *</label>
              <input type="password" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-gray-50"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition">
            Create User
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-gray-500 text-xs">
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Role</th>
              <th className="text-left p-4">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-800">{u.name}</td>
                <td className="p-4 text-gray-500">{u.email}</td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === "admin" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4 text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}   