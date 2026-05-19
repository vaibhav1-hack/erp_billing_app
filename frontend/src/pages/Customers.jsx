import { useEffect, useState } from "react";
import axios from "axios";

const empty = { name: "", email: "", phone: "", address: "" };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => axios.get("/api/customers/").then(r => setCustomers(r.data));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (editing) await axios.put(`/api/customers/${editing}`, form);
    else await axios.post("/api/customers/", form);
    load(); setShowForm(false); setEditing(null); setForm(empty);
  };

  const startEdit = (c) => {
    setForm({ name: c.name, email: c.email || "", phone: c.phone || "", address: c.address || "" });
    setEditing(c.id); setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
        <button onClick={() => { setForm(empty); setEditing(null); setShowForm(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition shadow">
          + Add Customer
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">{editing ? "Edit Customer" : "New Customer"}</h2>
          <div className="grid grid-cols-2 gap-3">
            {[["Name *", "name", "text"], ["Phone", "phone", "text"], ["Email", "email", "email"], ["Address", "address", "text"]].map(([label, key, type]) => (
              <div key={key}>
                <label className="text-xs text-gray-500 block mb-1">{label}</label>
                <input type={type} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-gray-50"
                  value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition">Save</button>
            <button onClick={() => setShowForm(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm px-4 py-2 rounded-lg transition">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {customers.map(c => (
          <div key={c.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-lg">
                {c.name[0].toUpperCase()}
              </div>
              <div className="font-semibold text-gray-800">{c.name}</div>
            </div>
            {c.phone && <div className="text-sm text-gray-500 mb-1">📞 {c.phone}</div>}
            {c.email && <div className="text-sm text-gray-500 mb-1">✉ {c.email}</div>}
            {c.address && <div className="text-xs text-gray-400 mt-2">{c.address}</div>}
            <button onClick={() => startEdit(c)} className="mt-3 text-xs text-blue-500 hover:underline">Edit</button>
          </div>
        ))}
        {!customers.length && <p className="text-gray-400 col-span-3 text-center py-8">No customers yet</p>}
      </div>
    </div>
  );
}