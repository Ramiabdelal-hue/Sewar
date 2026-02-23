"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LoginModal from "@/components/LoginModal";
import CheckoutForm from "@/components/CheckoutForm";
import { useLang } from "@/context/LangContext";

export default function HomePage() {
  const [showLogin, setShowLogin] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const { lang, setLang } = useLang();

  return (
    <>
      <Navbar onOpenLogin={() => setShowLogin(true)} />
      <Hero onSelect={() => setShowCheckout(true)} />
      
      {showLogin && <LoginModal lang={lang} onClose={() => setShowLogin(false)} />}
      {showCheckout && <CheckoutForm selectedData={{}} onBack={() => setShowCheckout(false)} />}
    </>
  );
}
