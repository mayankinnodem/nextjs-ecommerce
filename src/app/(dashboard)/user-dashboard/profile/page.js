"use client";

import { useState, useRef } from "react";
import {
  FaEdit,
  FaUserCircle,
  FaSave,
  FaPhoneAlt,
  FaVenusMars,
  FaBriefcase,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaEnvelope,
  FaIdCard,
  FaGlobeAsia,
} from "react-icons/fa";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const fileInputRef = useRef(null);

  // Default profile data (in future from API)
  const [profile, setProfile] = useState({
    profilePic: "",
    name: "John Doe",
    email: "johndoe@example.com",
    phone: "+91 9876543210",
    altPhone: "",
    whatsapp: "",
    gender: "Male",
    dob: "1998-07-12",
    maritalStatus: "Single",
    bloodGroup: "O+",
    occupation: "Software Engineer",
    company: "TechNova Ltd",
    annualIncome: "₹10,00,000",
    aadhaar: "",
    pan: "",
    passport: "",
    address: "221B Baker Street",
    city: "London",
    state: "Maharashtra",
    pincode: "400001",
    country: "India",
    emergencyContact: "+91 9999988888",
    joinedOn: "2024-05-12",
    accountType: "Regular",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) =>
      setProfile((prev) => ({ ...prev, profilePic: event.target.result }));
    reader.readAsDataURL(file);
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
              <img src={profile.profilePic} alt="Profile" className="object-cover w-full h-full" />
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
          <h1 className="text-3xl font-extrabold text-gray-800 mb-1">{profile.name}</h1>
          <p className="text-gray-500">{profile.email}</p>

          <button
            onClick={() => setEditMode(!editMode)}
            className="mt-4 inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-full font-medium transition"
          >
            <FaEdit /> {editMode ? "Cancel Edit" : "Edit Profile"}
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex justify-center gap-4 border-b pb-3">
          {["profile", "address", "identity", "professional", "other"].map((tab) => (
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

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-4">
            <Input label="Full Name" name="name" value={profile.name} onChange={handleChange} />
            <Input label="Email" name="email" value={profile.email} icon={<FaEnvelope />} onChange={handleChange} />
            <Input label="Phone" name="phone" value={profile.phone} icon={<FaPhoneAlt />} onChange={handleChange} />
            <Input label="Alternate Phone" name="altPhone" value={profile.altPhone} onChange={handleChange} />
            <Input label="WhatsApp Number" name="whatsapp" value={profile.whatsapp} onChange={handleChange} />
            <Input label="Gender" name="gender" value={profile.gender} icon={<FaVenusMars />} onChange={handleChange} />
            <Input label="Date of Birth" name="dob" type="date" value={profile.dob} onChange={handleChange} />
            <Input label="Marital Status" name="maritalStatus" value={profile.maritalStatus} onChange={handleChange} />
            <Input label="Blood Group" name="bloodGroup" value={profile.bloodGroup} onChange={handleChange} />
            <button className="w-full flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-xl font-semibold transition">
              <FaSave /> Save Changes
            </button>
          </motion.div>
        )}

        {/* ADDRESS TAB */}
        {activeTab === "address" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-4">
            <Input label="Address" name="address" value={profile.address} icon={<FaMapMarkerAlt />} onChange={handleChange} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="City" name="city" value={profile.city} onChange={handleChange} />
              <Input label="State" name="state" value={profile.state} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Pincode" name="pincode" value={profile.pincode} onChange={handleChange} />
              <Input label="Country" name="country" value={profile.country} icon={<FaGlobeAsia />} onChange={handleChange} />
            </div>
          </motion.div>
        )}

        {/* IDENTITY TAB */}
        {activeTab === "identity" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-4">
            <Input label="Aadhaar Number" name="aadhaar" value={profile.aadhaar} icon={<FaIdCard />} onChange={handleChange} />
            <Input label="PAN Number" name="pan" value={profile.pan} onChange={handleChange} />
            <Input label="Passport Number" name="passport" value={profile.passport} onChange={handleChange} />
          </motion.div>
        )}

        {/* PROFESSIONAL TAB */}
        {activeTab === "professional" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-4">
            <Input label="Occupation" name="occupation" value={profile.occupation} icon={<FaBriefcase />} onChange={handleChange} />
            <Input label="Company" name="company" value={profile.company} onChange={handleChange} />
            <Input label="Annual Income" name="annualIncome" value={profile.annualIncome} onChange={handleChange} />
          </motion.div>
        )}

        {/* OTHER TAB */}
        {activeTab === "other" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-4">
            <Input label="Emergency Contact" name="emergencyContact" value={profile.emergencyContact} onChange={handleChange} />
            <Input label="Joined On" name="joinedOn" type="date" value={profile.joinedOn} onChange={handleChange} />
            <Input label="Account Type" name="accountType" value={profile.accountType} onChange={handleChange} />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

function Input({ label, icon, ...props }) {
  return (
    <div>
      <label className="block text-gray-700 font-semibold mb-1">{label}</label>
      <div className="flex items-center border rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-purple-400">
        {icon && <span className="text-gray-400 mr-2">{icon}</span>}
        <input {...props} className="w-full outline-none bg-transparent" placeholder={label} />
      </div>
    </div>
  );
}
