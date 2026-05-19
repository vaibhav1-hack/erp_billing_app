import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Setup() {
  const navigate = useNavigate();
  const [secret, setSecret] = useState("");
  const [verified, setVerified] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const verifySecret = (e) => {
    e.preventDefault();
    if (secret === "itsbillingpage") {
      setVerified(true);
      setError("");
    } else {
      setError("Wrong secret key");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await axios.post("/api/auth/setup", form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Error creating admin");
    }
  };

  if (!verified) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-full max-w-sm bg-white rounded-xl p-8 shadow-md border border-gray-200">
          <div className="text-blue-600 font-bold text-2xl mb-1">BillingERP</div>
          <p className="text-gray-400 text-sm mb-6">Enter secret key to access setup</p>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <form onSubmit={verifySecret} className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Secret Key</label>
              <input type="password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-gray-50"
                value={secret} onChange={e => setSecret(e.target.value)} required />
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-sm bg-white rounded-xl p-8 shadow-md border border-gray-200">
        <div className="text-blue-600 font-bold text-2xl mb-1">BillingERP</div>
        <p className="text-gray-400 text-sm mb-6">Create admin account</p>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Name *</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-gray-50"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
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
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg transition">
            Create Admin
          </button>
        </form>
      </div>
    </div>
  );
}