"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Home, Sparkles, DollarSign, Download } from "lucide-react";

export function MobileTabBar() {
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);
  
  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0 z-50
        md:hidden
        glass-card-responsive border-t
        safe-area-bottom
        transform transition-transform duration-300
        ${visible ? "translate-y-0" : "translate-y-full"}
      `}
    >
      <div className="flex items-center justify-around h-16">
        <TabItem href="#hero" icon={Home} label="Home" />
        <TabItem href="#features" icon={Sparkles} label="Features" />
        <TabItem href="#pricing" icon={DollarSign} label="Pricing" />
        <TabItem href="#download" icon={Download} label="Download" />
      </div>
    </nav>
  );
}

interface TabItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

function TabItem({ href, icon: Icon, label }: TabItemProps) {
  return (
    <Link
      href={href}
      className="
        flex flex-col items-center justify-center gap-1
        touch-target w-full h-full
        text-muted-foreground hover:text-foreground
        transition-colors duration-200
        active:scale-95
      "
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}
