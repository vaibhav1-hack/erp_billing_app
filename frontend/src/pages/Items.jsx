import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const empty = { name: "", description: "", price: "", stock: "", unit: "pcs" };

export default function Items() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => axios.get("/api/items/").then(r => setItems(r.data));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (editing) {
      await axios.put(`/api/items/${editing}`, form);
    } else {
      await axios.post("/api/items/", form);
    }
    load(); setShowForm(false); setEditing(null); setForm(empty);
  };

  const del = async (id) => {
    if (!confirm("Delete this item?")) return;
    await axios.delete(`/api/items/${id}`);
    load();
  };

  const startEdit = (item) => {
    setForm({ name: item.name, description: item.description || "", price: item.price, stock: item.stock, unit: item.unit });
    setEditing(item.id); setShowForm(true);
  };

  const isAdmin = user?.role === "admin";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Items</h1>
        {isAdmin && (
          <button onClick={() => { setForm(empty); setEditing(null); setShowForm(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition shadow">
            + Add Item
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">{editing ? "Edit Item" : "New Item"}</h2>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 block mb-1">Name *</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-gray-50" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="text-xs text-gray-500 block mb-1">Unit</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-gray-50" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} /></div>
            <div><label className="text-xs text-gray-500 block mb-1">Price (₹) *</label>
              <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-gray-50" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
            {!editing && <div><label className="text-xs text-gray-500 block mb-1">Initial Stock</label>
              <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-gray-50" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} /></div>}
            <div className="col-span-2"><label className="text-xs text-gray-500 block mb-1">Description</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-gray-50" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition">Save</button>
            <button onClick={() => setShowForm(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm px-4 py-2 rounded-lg transition">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-gray-500 text-xs">
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Unit</th>
              <th className="text-right p-4">Price</th>
              <th className="text-right p-4">Stock</th>
              {isAdmin && <th className="text-right p-4">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="p-4">
                  <div className="font-medium text-gray-800">{item.name}</div>
                  {item.description && <div className="text-xs text-gray-400">{item.description}</div>}
                </td>
                <td className="p-4 text-gray-500">{item.unit}</td>
                <td className="p-4 text-right font-medium text-gray-800">₹{parseFloat(item.price).toLocaleString("en-IN")}</td>
                <td className="p-4 text-right">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.stock < 10 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                    {item.stock}
                  </span>
                </td>
                {isAdmin && (
                  <td className="p-4 text-right">
                    <button onClick={() => startEdit(item)} className="text-xs text-blue-500 hover:underline mr-3">Edit</button>
                    <button onClick={() => del(item.id)} className="text-xs text-red-400 hover:underline">Delete</button>
                  </td>
                )}
              </tr>
            ))}
            {!items.length && <tr><td colSpan={5} className="p-8 text-center text-gray-400">No items yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}