// src/components/Topbar.jsx
"use client";

import { Bell, User } from "lucide-react";

export default function Topbar() {
  return (
    <header className="bg-white text-gray-900 shadow-md h-14 flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold">Admin Dashboard</h1>
      <div className="flex items-center space-x-4">
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <User className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
