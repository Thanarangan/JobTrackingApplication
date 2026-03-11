import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
const navItems = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#steps" },
    { label: "Resume Vault", href: "#vault" },
    { label: "Testimonials", href: "#testimonials" },
];
const LandingNavbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);
    return (<nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass shadow-lg" : "bg-transparent"}`}>
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="inline-flex items-center text-2xl font-display font-extrabold tracking-tight transition-transform duration-200 hover:scale-[1.02]"
        >
          <span className={`${scrolled ? "text-primary" : "text-white"} drop-shadow-sm`}>Job</span>
          <span className={`ml-0.5 ${scrolled ? "text-foreground" : "text-white/95"}`}>Trackr</span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (<a key={item.label} href={item.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {item.label}
            </a>))}
          <Link to="/login">
            <Button variant="ghost" size="sm" className="font-semibold">
              Log in
            </Button>
          </Link>
          <Link to="/register">
            <Button size="sm" className="gradient-primary font-semibold text-primary-foreground rounded-full px-6">
              Sign up
            </Button>
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="glass md:hidden border-t border-border">
            <div className="flex flex-col gap-4 px-6 py-6">
              {navItems.map((item) => (<a key={item.label} href={item.href} className="text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>
                  {item.label}
                </a>))}
              <div className="flex gap-3 pt-2">
                <Link to="/login" className="flex-1">
                  <Button variant="outline" className="w-full">Log in</Button>
                </Link>
                <Link to="/register" className="flex-1">
                  <Button className="w-full gradient-primary text-primary-foreground">Sign up</Button>
                </Link>
              </div>
            </div>
          </motion.div>)}
      </AnimatePresence>
    </nav>);
};
export default LandingNavbar;
