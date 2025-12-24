// src/components/Sidebar.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/admin-dashboard" },
  { name: "Notifications", href: "/admin-dashboard/notifications" },
  { name: "Send Notification", href: "/admin-dashboard/send-notification" },
  {
    name: "Products",
    href: "/admin-dashboard/products",
    children: [
      { name: "All Products", href: "/admin-dashboard/products" },
      { name: "Categories", href: "/admin-dashboard/products/categories" },
      { name: "Brands", href: "/admin-dashboard/products/brands" },
      { name: "Attributes", href: "/admin-dashboard/products/attributes" },
    ],
  },
  { name: "Orders", href: "/admin-dashboard/orders" },
  { name: "Users", href: "/admin-dashboard/users" },
  { name: "Sections", href: "/admin-dashboard/sections" },
  { name: "About Us", href: "/admin-dashboard/about-us" },
  { name: "Contact Form", href: "/admin-dashboard/contact-form" },
  { name: "Contact Us", href: "/admin-dashboard/contact-us" },
  { name: "Reviews", href: "/admin-dashboard/reviews" },
  { name: "FAQ", href: "/admin-dashboard/faq" },
  { name: "Settings", href: "/admin-dashboard/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState(null);

  // ✅ Open correct dropdown on first render
  useEffect(() => {
    const activeParent = navItems.find(
      (item) => item.children && pathname.startsWith(item.href)
    );
    if (activeParent) {
      setOpenDropdown(activeParent.name);
    }
  }, [pathname]);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <aside className="w-64 bg-white text-gray-900 shadow-md hidden md:block">
      <div className="p-4 text-xl font-bold">Admin Menu</div>
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              {!item.children ? (
                // Normal nav link
                <Link
                  href={item.href}
                  className={`block px-4 py-2 rounded-md transition ${
                    pathname === item.href
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {item.name}
                </Link>
              ) : (
                // Dropdown with children
                <div>
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className={`w-full flex items-center justify-between px-4 py-2 rounded-md transition ${
                      pathname.startsWith(item.href)
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {item.name}
                    {openDropdown === item.name ? (
                      <ChevronDown size={18} />
                    ) : (
                      <ChevronRight size={18} />
                    )}
                  </button>
                  {openDropdown === item.name && (
                    <ul className="ml-4 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={`block px-4 py-2 rounded-md text-sm transition ${
                              pathname === child.href
                                ? "bg-blue-500 text-white"
                                : "text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
