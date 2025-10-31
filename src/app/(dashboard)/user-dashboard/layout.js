import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "./components/Sidebar";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import jwt from "jsonwebtoken";
import "../../globals.css";
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/User";

export default async function UserDashboardLayout({ children }) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    // ✅ No token → go to login
    if (!token) redirect("/login");

    // ✅ Verify JWT signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Find user and ensure token matches DB (single-device login)
    const user = await User.findById(decoded.id);

    if (!user) redirect("/login");

    if (user.authToken !== token) {
      console.warn("⚠️ Token mismatch: likely logged out or new device login");
      redirect("/login");
    }

    // ✅ If all good → render dashboard
    return (
      <html lang="en">
        <body>
          <Navbar />
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1">{children}</main>
          </div>
          <Footer />
        </body>
      </html>
    );
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    redirect("/login");
  }
}
