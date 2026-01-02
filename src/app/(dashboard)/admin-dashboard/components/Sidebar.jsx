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

  // 🔴 DELETE ACCOUNT REQUESTS
  { name: "Delete Requests", href: "/admin-dashboard/delete-requests" },

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
  const [deleteCount, setDeleteCount] = useState(0);

  // ✅ Auto-open dropdown if child route active
  useEffect(() => {
    const activeParent = navItems.find(
      (item) => item.children && pathname.startsWith(item.href)
    );
    if (activeParent) {
      setOpenDropdown(activeParent.name);
    }
  }, [pathname]);

  // 🔴 Fetch pending delete request count
  useEffect(() => {
    async function fetchDeleteCount() {
      try {
        const res = await fetch(
          "/api/admin/delete-account-requests/count"
        );
        const data = await res.json();
        if (data.success) setDeleteCount(data.count);
      } catch {
        // silent fail
      }
    }

    fetchDeleteCount();
  }, []);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <aside className="w-64 bg-white shadow-md hidden md:block">
      {/* HEADER */}
      <div className="p-4 text-xl font-bold border-b">
        Admin Panel
      </div>

      {/* NAV */}
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              {/* NORMAL LINK */}
              {!item.children ? (
                <Link
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-2 rounded-md transition ${
                    pathname === item.href
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span>{item.name}</span>

                  {/* 🔴 DELETE REQUEST BADGE */}
                  {item.name === "Delete Requests" &&
                    deleteCount > 0 && (
                      <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                        {deleteCount}
                      </span>
                    )}
                </Link>
              ) : (
                /* DROPDOWN */
                <div>
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className={`w-full flex items-center justify-between px-4 py-2 rounded-md transition ${
                      pathname.startsWith(item.href)
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <span>{item.name}</span>
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
