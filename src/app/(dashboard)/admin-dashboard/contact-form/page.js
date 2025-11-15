"use client";

import { useEffect, useState } from "react";

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // ✅ Fetch messages from API
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/contact-form", { cache: "no-store" });
      const data = await res.json();
      if (data.success) setMessages(data.data);
      else setError(data.error || "Failed to load messages");
    } catch (e) {
      setError("Server error while loading messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // ✅ Delete message
  const deleteMessage = async (id) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      const res = await fetch(`/api/admin/contact-form?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => prev.filter((msg) => msg._id !== id));
      } else {
        alert("Failed to delete message");
      }
    } catch (err) {
      alert("Server error");
    }
  };

  // ✅ Search filter
  const filteredMessages = messages.filter((msg) => {
    const q = search.toLowerCase();
    return (
      msg.name.toLowerCase().includes(q) ||
      msg.email.toLowerCase().includes(q) ||
      msg.phone.includes(q) ||
      msg.message.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">📩 Contact Messages</h1>
        <button
          onClick={fetchMessages}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* ✅ Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* ✅ Loading State */}
      {loading && <p className="text-gray-700">Loading messages...</p>}

      {/* ✅ Error */}
      {error && <p className="text-red-500">{error}</p>}

      {/* ✅ Empty */}
      {!loading && !error && filteredMessages.length === 0 && (
        <p className="text-gray-600">No messages found.</p>
      )}

      {/* ✅ Table */}
      {!loading && filteredMessages.length > 0 && (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Phone</th>
                <th className="text-left py-3 px-4">Message</th>
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-center py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredMessages.map((msg) => (
                <tr
                  key={msg._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="py-2 px-4">{msg.name}</td>
                  <td className="py-2 px-4">{msg.email}</td>
                  <td className="py-2 px-4">{msg.phone}</td>
                  <td className="py-2 px-4 text-gray-700">
                    {msg.message.length > 50
                      ? msg.message.slice(0, 50) + "..."
                      : msg.message}
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-500">
                    {new Date(msg.createdAt).toLocaleString()}
                  </td>
                  <td className="py-2 px-4 text-center">
                    <button
                      onClick={() => deleteMessage(msg._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
