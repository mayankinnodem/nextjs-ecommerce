"use client";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import "../../globals.css"


export default function AdminDashboardLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar />
        {/* Main Content */}
        <div className="flex flex-col flex-1">
          {/* Topbar */}
          <Topbar />
          {/* Page Content */}
          <main className="flex-1 p-6 bg-gray-100">{children}</main>
        </div>
      </body>
    </html>
  );
}