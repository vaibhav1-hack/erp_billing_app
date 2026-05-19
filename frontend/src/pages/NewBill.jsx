import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function NewBill() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState([{ item_id: "", name: "", price: "", quantity: 1 }]);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get("/api/items/").then(r => setItems(r.data));
    axios.get("/api/customers/").then(r => setCustomers(r.data));
  }, []);

  const setLine = (i, key, val) => setLines(lines.map((l, idx) => idx === i ? { ...l, [key]: val } : l));

  const selectItem = (i, itemId) => {
    const item = items.find(it => String(it.id) === String(itemId));
    if (item) setLines(lines.map((l, idx) => idx === i ? { ...l, item_id: item.id, name: item.name, price: item.price } : l));
  };

  const total = lines.reduce((s, l) => s + (parseFloat(l.price) || 0) * (parseInt(l.quantity) || 0), 0);

  const submit = async () => {
    setError("");
    try {
      await axios.post("/api/bills/", {
        customer_id: customerId || null,
        notes,
        items: lines.filter(l => l.name && l.price && l.quantity).map(l => ({
          item_id: l.item_id || null,
          name: l.name,
          price: parseFloat(l.price),
          quantity: parseInt(l.quantity),
        })),
      });
      navigate("/bills");
    } catch (err) {
      setError(err.response?.data?.detail || "Error creating bill");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-8">New Bill</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Customer</label>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-gray-50"
            value={customerId} onChange={e => setCustomerId(e.target.value)}>
            <option value="">Walk-in</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Notes</label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-gray-50"
            value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional note…" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-4">
        <div className="font-semibold text-gray-700 mb-4">Line Items</div>
        <div className="space-y-3">
          {lines.map((line, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-4">
                <select className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-blue-400 bg-gray-50"
                  value={line.item_id} onChange={e => selectItem(i, e.target.value)}>
                  <option value="">— pick item —</option>
                  {items.map(it => <option key={it.id} value={it.id}>{it.name} (stock: {it.stock})</option>)}
                </select>
              </div>
              <div className="col-span-3">
                <input className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-blue-400 bg-gray-50"
                  placeholder="Name" value={line.name} onChange={e => setLine(i, "name", e.target.value)} />
              </div>
              <div className="col-span-2">
                <input type="number" className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-blue-400 bg-gray-50"
                  placeholder="Price" value={line.price} onChange={e => setLine(i, "price", e.target.value)} />
              </div>
              <div className="col-span-2">
                <input type="number" min="1" className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-blue-400 bg-gray-50"
                  placeholder="Qty" value={line.quantity} onChange={e => setLine(i, "quantity", e.target.value)} />
              </div>
              <div className="col-span-1 text-right">
                <button onClick={() => setLines(lines.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 text-xs">✕</button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => setLines([...lines, { item_id: "", name: "", price: "", quantity: 1 }])}
          className="mt-4 text-xs text-blue-500 hover:underline">+ Add Line</button>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-gray-600">
          Total: <span className="text-xl font-bold text-gray-800 ml-2">₹{total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex gap-3 items-center">
          {error && <span className="text-red-500 text-sm">{error}</span>}
          <button onClick={() => navigate("/bills")} className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm px-4 py-2 rounded-lg transition">Cancel</button>
          <button onClick={submit} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition shadow">Create Bill</button>
        </div>
      </div>
    </div>
  );
}