import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
const HeroSection = () => {
    return (<section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-hero opacity-90"/>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(30_95%_70%_/_0.4)_0%,_transparent_60%)]"/>

      {/* Decorative shapes */}
      <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute top-20 right-[15%] w-64 h-64 rounded-full bg-primary-foreground/10 blur-sm"/>
      <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-32 right-[25%] w-48 h-48 rounded-full bg-primary-foreground/10 blur-sm"/>
      <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} className="absolute top-40 right-[30%] w-32 h-32 rounded-full bg-primary-foreground/15 blur-sm"/>

      <div className="container relative z-10 mx-auto px-6 pt-32 pb-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-primary-foreground sm:text-6xl lg:text-7xl">
              One app
              <br />
              for all your
              <br />
              job needs
            </h1>
            <p className="mt-6 max-w-md text-lg text-primary-foreground/80">
              Track applications, store resumes, and land your dream job — all in one beautifully simple platform.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/register">
                <Button size="lg" className="rounded-full bg-primary-foreground text-foreground font-bold px-8 text-base shadow-xl hover:bg-primary-foreground/90 transition-all hover:scale-105">
                  Get Started
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="rounded-full border-primary-foreground/40 bg-transparent text-primary-foreground font-semibold px-8 text-base hover:bg-primary-foreground/15 hover:text-primary-foreground">
                  Log in
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Mock app cards */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="hidden lg:flex flex-col gap-4">
            {[
            { company: "Google", role: "Frontend Engineer", status: "Interview", color: "bg-green-400/20 text-green-100" },
            { company: "Stripe", role: "Full Stack Developer", status: "Applied", color: "bg-blue-400/20 text-blue-100" },
            { company: "Figma", role: "UI Engineer", status: "Offer 🎉", color: "bg-yellow-400/20 text-yellow-100" },
        ].map((app, i) => (<motion.div key={app.company} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.5 + i * 0.15 }} className="rounded-2xl bg-primary-foreground/10 backdrop-blur-lg border border-primary-foreground/20 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-primary-foreground">{app.company}</p>
                    <p className="text-sm text-primary-foreground/70">{app.role}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${app.color}`}>
                    {app.status}
                  </span>
                </div>
              </motion.div>))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-8 left-6 z-10 flex items-center gap-2 text-primary-foreground/60 text-sm">
        <ChevronDown className="h-4 w-4"/>
        Scroll
      </motion.div>
    </section>);
};
export default HeroSection;
