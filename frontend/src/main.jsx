import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Setup from "./pages/Setup";
import Profits from "./pages/Profits";
import ViewBill from "./pages/ViewBill";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Bills from "./pages/Bills";
import NewBill from "./pages/NewBill";
import Items from "./pages/Items";
import Customers from "./pages/Customers";
import Stock from "./pages/Stock";
import CustomerDetail from "./pages/CustomerDetail";
import ManageUsers from "./pages/ManageUsers";
import ProtectedRoute from "./components/ProtectedRoute";
import "./index.css";

function Inner() {
  const { token, loading } = useAuth();
  const [setupRequired, setSetupRequired] = useState(null);

  useEffect(() => {
    axios.get("/api/auth/setup-required")
      .then(r => setSetupRequired(r.data.required))
      .catch(() => setSetupRequired(false));
  }, []);

  if (setupRequired === null || loading) return (
    <div className="flex items-center justify-center h-screen text-gray-400">Loading…</div>
  );

  if (setupRequired) return (
    <Routes>
      <Route path="*" element={<Setup />} />
    </Routes>
  );

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/setup" element={<Setup />} />
      <Route path="/" element={token ? <Layout /> : <Navigate to="/login" replace />}>
        <Route index element={<Dashboard />} />
        <Route path="bills" element={<Bills />} />
        <Route path="customers/:id" element={<CustomerDetail />} />
        <Route path="bills/new" element={<NewBill />} />
        <Route path="bills/:id" element={<ViewBill />} />
        <Route path="items" element={<Items />} />
        <Route path="customers" element={<Customers />} />
        <Route path="stock" element={<Stock />} />
        <Route path="profits" element={<Profits />} />
        <Route path="users" element={
          <ProtectedRoute roles={["admin"]}>
            <ManageUsers />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Inner />
      </BrowserRouter>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);