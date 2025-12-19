"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
// import "./globals.css";
import "../../globals.css";

export default function AdminDashboardLayout({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      router.replace("/admin-login");
      return;
    }

    // OPTIONAL: Verify token from backend
    setAuthorized(true);
  }, []);

  if (!authorized) {
    return <p className="p-6">Checking authentication...</p>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />
      {/* Main */}
      <div className="flex flex-col flex-1">
        <Topbar />
        <main className="flex-1 p-6 bg-gray-100">{children}</main>
      </div>
    </div>
  );
}
