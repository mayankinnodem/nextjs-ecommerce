"use client";

import Sidebar from "./components/Sidebar";
import "../../globals.css"


export default function AdminDashboardLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex flex-col flex-1">

          {/* Page Content */}
          <main >{children}</main>
        </div>
      </body>
    </html>
  );
}