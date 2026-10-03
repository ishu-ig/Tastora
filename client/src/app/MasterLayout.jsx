"use client";

import React, { useState, useEffect } from "react";
import { Provider } from "react-redux";
import Store from "../Redux/Store";
import { Navbar } from "../Component/Navbar";
import { Footer } from "../Component/Footer";
import { AuthModal } from "../Component/AuthModal";
import { ArrowUp } from "lucide-react";
import { CartProvider } from "../context/CartContext";
import { AuthProvider, useAuth } from "../context/AuthContext";

// Renders the single global AuthModal — lives inside AuthProvider so it can read context
function GlobalAuthModal() {
  const {
    authModalOpen,
    authModalMode,
    closeAuthModal,
    setUser,
    checkAuth,
    authSuccessCallbackRef,
  } = useAuth() || {};

  return (
    <AuthModal
      isOpen={!!authModalOpen}
      onClose={closeAuthModal}
      initialMode={authModalMode || "login"}
      onAuthSuccess={(userData) => {
        if (userData) {
          if (setUser) setUser(userData);
          if (checkAuth) checkAuth();
        }
        // Run any page-specific callback (e.g. checkout → proceed to payment)
        if (authSuccessCallbackRef?.current) {
          authSuccessCallbackRef.current(userData);
          authSuccessCallbackRef.current = null;
        }
        if (closeAuthModal) closeAuthModal();
      }}
    />
  );
}

export default function MasterLayout({ children }) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", checkScroll);
    return () => window.removeEventListener("scroll", checkScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Provider store={Store}>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col justify-between bg-white text-zinc-900 selection:bg-rose-500 selection:text-white">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />

            {/* Single global AuthModal — any component opens it via useAuth().openAuthModal() */}
            <GlobalAuthModal />

            {/* Floating Scroll-to-Top Button */}
            {showScrollTop && (
              <button
                onClick={scrollToTop}
                className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 text-white shadow-xl shadow-rose-600/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 animate-in fade-in slide-in-from-bottom-4"
                aria-label="Scroll to top"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            )}
          </div>
        </CartProvider>
      </AuthProvider>
    </Provider>
  );
}
