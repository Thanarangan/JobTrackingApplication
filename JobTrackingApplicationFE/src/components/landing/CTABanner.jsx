import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
const CTABanner = () => {
    return (<section className="py-28 lg:py-36">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative overflow-hidden rounded-3xl gradient-hero px-8 py-20 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(350_80%_50%_/_0.3)_0%,_transparent_60%)]"/>
          <div className="relative z-10">
            <h2 className="text-4xl font-extrabold text-primary-foreground sm:text-5xl lg:text-6xl">
              Job offers,
              <br />
              plus you.
            </h2>
            <p className="mx-auto mt-6 max-w-md text-lg text-primary-foreground/80">
              Join thousands of job seekers who track smarter and land faster.
            </p>
            <Link to="/register">
              <Button size="lg" className="mt-10 rounded-full bg-primary-foreground text-foreground font-bold px-10 text-base shadow-xl hover:bg-primary-foreground/90 transition-all hover:scale-105">
                Start Free
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>);
};
export default CTABanner;
