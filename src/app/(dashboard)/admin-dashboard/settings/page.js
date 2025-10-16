"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: "Admin User",
    email: "admin@example.com",
  });

  const [security, setSecurity] = useState({
    password: "",
    twoFA: false,
  });

  const [site, setSite] = useState({
    siteName: "RMK Leathers",
    currency: "INR",
    maintenance: false,
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecurity({
      ...security,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSiteChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSite({
      ...site,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("✅ Settings saved successfully");
    // TODO: API call to update settings
  };

  return (
    <div className="text-gray-900">
      <h2 className="text-3xl font-bold mb-8">⚙️ Settings</h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 max-w-3xl bg-white p-6 shadow rounded-lg"
      >
        {/* Profile Settings */}
        <section>
          <h3 className="text-xl font-semibold mb-4">👤 Profile Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
          </div>
        </section>

        {/* Security Settings */}
        <section>
          <h3 className="text-xl font-semibold mb-4">🔒 Security</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Change Password
            </label>
            <input
              type="password"
              name="password"
              value={security.password}
              onChange={handleSecurityChange}
              className="w-full border rounded-md px-3 py-2"
              placeholder="Enter new password"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="twoFA"
              name="twoFA"
              checked={security.twoFA}
              onChange={handleSecurityChange}
              className="mr-2"
            />
            <label htmlFor="twoFA">Enable Two-Factor Authentication (2FA)</label>
          </div>
        </section>

        {/* Site Settings */}
        <section>
          <h3 className="text-xl font-semibold mb-4">🌐 Site Settings</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Site Name</label>
            <input
              type="text"
              name="siteName"
              value={site.siteName}
              onChange={handleSiteChange}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Currency</label>
            <select
              name="currency"
              value={site.currency}
              onChange={handleSiteChange}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="INR">₹ INR</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="maintenance"
              name="maintenance"
              checked={site.maintenance}
              onChange={handleSiteChange}
              className="mr-2"
            />
            <label htmlFor="maintenance">Enable Maintenance Mode</label>
          </div>
        </section>

        {/* Save Button */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
