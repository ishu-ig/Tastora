import React, { useEffect, useCallback } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import Sidebar from "./Components/Sidebar";

// Auth Pages
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import { getAuthUser } from "./util/cookie";

// Main Pages
import Home from "./pages/Home";
import ProfilePage from "./pages/ProfilePage";
import UpdateProfilePage from "./pages/UpdateProfilePage";
import ForgetPasswordPage from "./pages/ForgetPassword";

import AdminMaincategory from "./pages/maincategory/AdminMaincategory";
import AdminCreateMaincategory from "./pages/maincategory/AdminCreateMaincategory";
import AdminUpdateMaincategory from "./pages/maincategory/AdminUpdateMaincategory";

import AdminSubcategory from "./pages/subcategory/AdminSubcategory";
import AdminCreateSubcategory from "./pages/subcategory/AdminCreateSubcategory";
import AdminUpdateSubcategory from "./pages/subcategory/AdminUpdateSubcategory";

import AdminCreateProduct from "./pages/product/AdminCreateProduct";
import AdminUpdateProduct from "./pages/product/AdminUpdateProduct";
import AdminProduct from "./pages/product/AdminProduct";

import AdminTestimonial from "./pages/testimonial/AdminTestiminial";
import AdminCreateTestimonial from "./pages/testimonial/AdminCreateTestimonial";
import AdminUpdateTestimonial from "./pages/testimonial/AdminUpdateTestimonial";

import AdminNewsletter from "./pages/newsletter/AdminNewsletter";

import AdminCheckout from "./pages/checkout/AdminCheckout";
import AdminCheckoutShow from "./pages/checkout/AdminShowCheckout";
import ViewProductPage from "./pages/checkout/ViewProductPage";

import AdminUser from "./pages/user/AdminUser";
import AdminCreateUser from "./pages/user/AdminCreateUser";
import AdminUpdateUser from "./pages/user/AdminUpdateUser";

// contactus
import AdminContactUs from "./pages/contactus/AdminContactUs";
import AdminShowQuery from "./pages/contactus/AdminShowQuery";
import AdminBanner from "./pages/banner/AdminBanner";
import AdminCreateBanner from "./pages/banner/AdminCreateBanner";
import AdminUpdateBanner from "./pages/banner/AdminUpdateBanner";
import AdminBookings from "./pages/booking/AdminBooking";
import AdminBookingShow from "./pages/booking/AdminShowBooking";

import AssignedOrder from "./pages/deliveryBoyData/AssignedOrder";
import OrderHistory from "./pages/deliveryBoyData/OrderHistory";
import DeliveryDashboard from "./pages/deliveryBoyData/DeliveryBoyDasboard";
import DeliveryLiveMap from "./pages/deliveryBoyData/DeliveryLiveMap";
import AdminDeliveryBoy from "./pages/deliveryBoy/AdminDeliveryBoy";
import AdminCreateDeliveryBoy from "./pages/deliveryBoy/AdminCreateDeliveryBoy";
import AdminUpdateDeliveryBoy from "./pages/deliveryBoy/AdminUpdateDeliveryBoy";

import AdminCoupon from "./pages/coupon/AdminCoupon";
import AdminCreateCoupon from "./pages/coupon/AdminCreateCoupon";
import AdminUpdateCoupon from "./pages/coupon/AdminUpdateCoupon";
import AdminCombo from "./pages/combo/AdminCombo";
import AdminUpdateCombo from "./pages/combo/AdminUpdateCombo";
import AdminCreateCombo from "./pages/combo/AdminCreateCombo";
import AdminThali from "./pages/thali/AdminThali";
import AdminCreateThali from "./pages/thali/AdminCreateThali";
import AdminUpdateThali from "./pages/thali/AdminUpdateThali";
import AdminMembershipPlan from "./pages/membership/AdminMembershipPlan";
import AdminCreateMembershipPlans from "./pages/membership/AdminCreateMembershipPlans";
import AdminUpdateMembershipPlans from "./pages/membership/AdminUpdateMembershipPlans";
import AdminMembership from "./pages/membership/AdminMembership";


// FIX: All public routes listed here must match route paths exactly
const publicRoutes = ["/login", "/register", "/forgot-password"];

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}

function Shell() {
  const location = useLocation();
  const isPublic = publicRoutes.includes(location.pathname);
  const isLoggedIn = getAuthUser().isLogin;

  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 992px)").matches;
    const savedMini = localStorage.getItem("adminHMD.sidebarMini") === "true";
    if (isDesktop && savedMini && !isPublic) {
      document.body.classList.add("sidebar-mini");
    }
    return () => {
      if (isPublic)
        document.body.classList.remove("sidebar-mini", "sidebar-open");
    };
  }, [isPublic]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 992px)");
    function handleBreakpoint(e) {
      if (e.matches) {
        document.body.classList.remove("sidebar-open");
        const savedMini =
          localStorage.getItem("adminHMD.sidebarMini") === "true";
        document.body.classList.toggle("sidebar-mini", savedMini);
      } else {
        document.body.classList.remove("sidebar-mini");
      }
    }
    if (mq.addEventListener) {
      mq.addEventListener("change", handleBreakpoint);
    } else {
      mq.addListener(handleBreakpoint);
    }
    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener("change", handleBreakpoint);
      } else {
        mq.removeListener(handleBreakpoint);
      }
    };
  }, []);

  // FIX: Moved toggleSidebar & closeMobileSidebar outside render using useCallback
  const toggleSidebar = useCallback(() => {
    const isDesktop = window.matchMedia("(min-width: 992px)").matches;
    if (isDesktop) {
      document.body.classList.toggle("sidebar-mini");
      localStorage.setItem(
        "adminHMD.sidebarMini",
        String(document.body.classList.contains("sidebar-mini")),
      );
    } else {
      document.body.classList.toggle("sidebar-open");
    }
  }, []);

  const closeMobileSidebar = useCallback(() => {
    document.body.classList.remove("sidebar-open");
  }, []);

  // Redirect unauthenticated users away from protected pages
  if (!isLoggedIn && !isPublic) {
    return <Navigate to="/login" replace />;
  }

  // ── Public pages ──────────────────────────────────────────────────────────
  if (isPublic) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* FIX: Added missing SignupPage import and route */}
        <Route path="/register" element={<SignupPage />} />
        {/* FIX: Multi-step forgot password routes instead of undefined <ForgetPasswordPage /> */}
        <Route path="/forgot-password" element={<ForgetPasswordPage />} />
      </Routes>
    );
  }

  // ── Protected pages ───────────────────────────────────────────────────────
  return (
    <div className="admin-shell">
      <div className="sidebar-backdrop" onClick={closeMobileSidebar} />
      <Sidebar onLinkClick={closeMobileSidebar} />

      <div className="admin-main">
        <Navbar toggleSidebar={toggleSidebar} />

        <Routes>
          {/* Dashboard */}
          {/* FIX: Removed duplicate "/" route — kept only one */}
          <Route path="/" element={<Home />} />
          <Route path="/:role/:_id/profile" element={<ProfilePage />} />
          <Route path="/:role/:_id/update-profile" element={<UpdateProfilePage />} />

          <Route path="/maincategory" element={<AdminMaincategory />} />
          <Route
            path="/maincategory/create"
            element={<AdminCreateMaincategory />}
          />
          <Route
            path="/maincategory/update/:_id"
            element={<AdminUpdateMaincategory />}
          />

          {/* Subcategory Routes */}
          <Route path="/subcategory" element={<AdminSubcategory />} />
          <Route
            path="/subcategory/create"
            element={<AdminCreateSubcategory />}
          />
          <Route
            path="/subcategory/update/:_id"
            element={<AdminUpdateSubcategory />}
          />
          {/* Brand Routes */}
          <Route path="/banner" element={<AdminBanner />} />
          <Route path="/banner/create" element={<AdminCreateBanner />} />
          <Route path="/banner/update/:_id" element={<AdminUpdateBanner />} />

          <Route path="/combo" element={<AdminCombo />} />
          <Route path="/combo/create" element={<AdminCreateCombo />} />
          <Route path="/combo/update/:_id" element={<AdminUpdateCombo />} />


          {/* Product Routes */}
          <Route path="/product" element={<AdminProduct />} />
          <Route path="/product/create" element={<AdminCreateProduct />} />
          <Route path="/product/update/:_id" element={<AdminUpdateProduct />} />


          <Route path="/membershipplan" element={<AdminMembershipPlan />} />
          <Route path="/membershipplan/create" element={<AdminCreateMembershipPlans />} />
          <Route path="/membershipplan/update/:_id" element={<AdminUpdateMembershipPlans />} />
          <Route path="/membership" element={<AdminMembership />} />

          {/* Testimonial Routes */}
          <Route path="/testimonial" element={<AdminTestimonial />} />
          <Route
            path="/testimonial/create"
            element={<AdminCreateTestimonial />}
          />
          <Route
            path="/testimonial/update/:_id"
            element={<AdminUpdateTestimonial />}
          />

          {/* Newsletter Route */}
          <Route path="/newsletter" element={<AdminNewsletter />} />

          {/* Checkout Routes */}
          <Route path="/checkout" element={<AdminCheckout />} />
          <Route path="/checkout/view/:_id" element={<AdminCheckoutShow />} />
          <Route path="/checkout/product/:_id" element={<ViewProductPage />} />

          {/* Booking Routes */}
          <Route path="/booking" element={<AdminBookings />} />
          <Route path="/booking/view/:_id" element={<AdminBookingShow />} />

          {/* User Routes */}
          <Route path="/user" element={<AdminUser />} />
          <Route path="/user/create" element={<AdminCreateUser />} />
          <Route path="/user/update/:_id" element={<AdminUpdateUser />} />

          <Route path="/thali" element={<AdminThali />} />
          <Route path="/thali/create" element={<AdminCreateThali />} />
          <Route path="/thali/update/:_id" element={<AdminUpdateThali />} />

          {/* Delivery Boy Routes */}
          <Route path="/deliveryBoy" element={<AdminDeliveryBoy />} />
          <Route path="/deliveryBoy/create" element={<AdminCreateDeliveryBoy />} />
          <Route path="/deliveryBoy/update/:_id" element={<AdminUpdateDeliveryBoy />} />


          <Route path="/:role/:_id/orders" element={<AssignedOrder />} />
          <Route path="/:role/:_id/history" element={<OrderHistory />} />
          <Route path="/:role/:_id/live-map" element={<DeliveryLiveMap />} />
          <Route path="/:role/:_id/live-map/:orderId" element={<DeliveryLiveMap />} />
          <Route path="/deliveryBoy/:_id/dashboard" element={<DeliveryDashboard />} />

          {/* ContactUS Routes */}
          <Route path="/contactus" element={<AdminContactUs />} />
          <Route path="/contactus/view/:_id" element={<AdminShowQuery />} />

          {/* Coupon Routes */}
          <Route path="/coupon" element={<AdminCoupon />} />
          <Route path="/coupon/create" element={<AdminCreateCoupon />} />
          <Route path="/coupon/update/:_id" element={<AdminUpdateCoupon />} />
        </Routes>

        <Footer />
      </div>
    </div>
  );
}