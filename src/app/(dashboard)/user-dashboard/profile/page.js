"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  FaEdit,
  FaUserCircle,
  FaSave,
  FaPhoneAlt,
  FaVenusMars,
  FaBriefcase,
  FaMapMarkerAlt,
  FaEnvelope,
  FaGlobeAsia,
} from "react-icons/fa";

export default function ProfilePage() {
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    _id: "",
    name: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    maritalStatus: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    occupation: "",
    company: "",
    profilePic: "",
  });

  // ✅ Load profile on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return showError("No logged-in user found. Please login again.");

    const userData = JSON.parse(storedUser);
    if (!userData._id) return showError("Invalid user data. Please login again.");

    fetchProfile(userData._id);
  }, []);

  // ✅ Fetch profile from backend
  const fetchProfile = async (userId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/user/get-profile?id=${encodeURIComponent(userId)}`);
      const data = await res.json();

      if (data.success && data.user) setProfile(data.user);
      else showError(data.message || "User not found.");
    } catch {
      showError("Error fetching profile");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle image upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024)
      return showError("File size exceeds 3MB. Please choose a smaller image.");

    const reader = new FileReader();
    reader.onload = (event) =>
      setProfile((prev) => ({ ...prev, profilePic: event.target.result }));
    reader.readAsDataURL(file);
  };

  // ✅ Save changes
  const handleSave = async () => {
    try {
      setLoading(true);
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser?._id) return showError("User not found. Please login again.");

      const res = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const data = await res.json();
      if (!data.success) return showError(data.message || "Failed to update profile");

      setProfile(data.user);
      setEditMode(false);
      showSuccess("Profile updated successfully!");

      // Update localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          _id: data.user._id,
          phone: data.user.phone,
          name: data.user.name || "",
          profilePic: data.user.profilePic || "",
          email: data.user.email || "",
        })
      );
    } catch {
      showError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Helpers
  const showError = (msg) => {
    setMessage(msg);
    setMessageType("error");
  };

  const showSuccess = (msg) => {
    setMessage(msg);
    setMessageType("success");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 flex flex-col items-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-4xl relative"
      >
        {/* Profile Picture */}
        <div className="absolute -top-14 left-1/2 transform -translate-x-1/2">
          <div
            className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg cursor-pointer"
            onClick={() => editMode && fileInputRef.current.click()}
          >
            {profile.profilePic ? (
              <img src={profile.profilePic} className="object-cover w-full h-full" />
            ) : (
              <FaUserCircle className="text-purple-400 w-full h-full" />
            )}
            {editMode && (
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white text-sm">
                <FaEdit /> Edit
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Header */}
        <div className="mt-16 text-center">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-1">
            {profile.name || "No Name"}
          </h1>
          <p className="text-gray-500">{profile.email || "No email provided"}</p>

          <button
            onClick={() => setEditMode(!editMode)}
            disabled={loading}
            className="mt-4 inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-full font-medium transition disabled:opacity-70"
          >
            <FaEdit /> {editMode ? "Cancel Edit" : "Edit Profile"}
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex justify-center gap-4 border-b pb-3">
          {["profile", "address", "professional"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`capitalize px-4 py-2 font-semibold ${
                activeTab === tab
                  ? "text-purple-600 border-b-2 border-purple-500"
                  : "text-gray-500 hover:text-purple-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tabs Content */}
        <div className="mt-6 space-y-4">
          {activeTab === "profile" && (
            <ProfileTab profile={profile} handleChange={handleChange} editMode={editMode} />
          )}
          {activeTab === "address" && (
            <AddressTab profile={profile} handleChange={handleChange} editMode={editMode} />
          )}
          {activeTab === "professional" && (
            <ProfessionalTab profile={profile} handleChange={handleChange} editMode={editMode} />
          )}
        </div>

        {/* Save Button */}
        {editMode && (
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 mt-6 rounded-xl font-semibold transition disabled:opacity-70"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <FaSave /> Save Changes
              </>
            )}
          </button>
        )}

        {/* Status Message */}
        {message && (
          <p
            className={`mt-4 text-center ${
              messageType === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </motion.div>
    </div>
  );
}

/* ───────────── Helper Components ───────────── */

function ProfileTab({ profile, handleChange, editMode }) {
  return (
    <>
      <Input label="Full Name" name="name" value={profile.name} onChange={handleChange} disabled={!editMode} />
      <Input label="Email" name="email" value={profile.email} icon={<FaEnvelope />} onChange={handleChange} disabled={!editMode} />
      <Input label="Phone" name="phone" value={profile.phone} icon={<FaPhoneAlt />} onChange={handleChange} disabled={!editMode} />
      <Input label="Gender" name="gender" value={profile.gender} icon={<FaVenusMars />} onChange={handleChange} disabled={!editMode} />
      <Input label="Date of Birth" name="dob" type="date" value={profile.dob} onChange={handleChange} disabled={!editMode} />
      <Input label="Marital Status" name="maritalStatus" value={profile.maritalStatus} onChange={handleChange} disabled={!editMode} />
    </>
  );
}

function AddressTab({ profile, handleChange, editMode }) {
  return (
    <>
      <Input label="Address" name="address" value={profile.address} icon={<FaMapMarkerAlt />} onChange={handleChange} disabled={!editMode} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="City" name="city" value={profile.city} onChange={handleChange} disabled={!editMode} />
        <Input label="State" name="state" value={profile.state} onChange={handleChange} disabled={!editMode} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Pincode" name="pincode" value={profile.pincode} onChange={handleChange} disabled={!editMode} />
        <Input label="Country" name="country" value={profile.country} icon={<FaGlobeAsia />} onChange={handleChange} disabled={!editMode} />
      </div>
    </>
  );
}

function ProfessionalTab({ profile, handleChange, editMode }) {
  return (
    <>
      <Input label="Occupation" name="occupation" value={profile.occupation} icon={<FaBriefcase />} onChange={handleChange} disabled={!editMode} />
      <Input label="Company" name="company" value={profile.company} onChange={handleChange} disabled={!editMode} />
    </>
  );
}

function Input({ label, icon, disabled, ...props }) {
  return (
    <div>
      <label className="block text-gray-700 font-semibold mb-1">{label}</label>
      <div
        className={`flex items-center border rounded-xl px-3 py-2 ${
          disabled ? "bg-gray-100" : "focus-within:ring-2 focus-within:ring-purple-400"
        }`}
      >
        {icon && <span className="text-gray-400 mr-2">{icon}</span>}
        <input {...props} disabled={disabled} className="w-full outline-none bg-transparent" placeholder={label} />
      </div>
    </div>
  );
}
