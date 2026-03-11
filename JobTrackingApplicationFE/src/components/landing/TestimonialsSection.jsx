import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
const testimonials = [
    {
        name: "Sarah Chen",
        role: "Software Engineer at Meta",
        text: "JobTrackr helped me stay organized during my 3-month job search. I tracked over 50 applications effortlessly and landed my dream role!",
    },
    {
        name: "Marcus Johnson",
        role: "Product Manager at Stripe",
        text: "The resume vault is a game-changer. Having all my tailored resumes in one place with quick access saved me hours every week.",
    },
    {
        name: "Aisha Patel",
        role: "UX Designer at Figma",
        text: "Clean, intuitive, and actually useful. This is exactly what I wished I had during my previous job hunts. 10/10 recommend.",
    },
    {
        name: "David Kim",
        role: "Data Scientist at Google",
        text: "I was using spreadsheets before. JobTrackr replaced all of that and gave me a much better overview of where I stood with each company.",
    },
];
const TestimonialsSection = () => {
    const [current, setCurrent] = useState(0);
    const next = () => setCurrent((p) => (p + 1) % testimonials.length);
    const prev = () => setCurrent((p) => (p - 1 + testimonials.length) % testimonials.length);
    return (<section id="testimonials" className="py-28 lg:py-36">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Testimonials</p>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Hear it from our users
          </h2>
        </motion.div>

        <div className="relative mx-auto mt-16 max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div key={current} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4 }} className="rounded-2xl border border-border bg-card p-10 text-center">
              <Quote className="mx-auto h-8 w-8 text-primary/30"/>
              <p className="mt-6 text-lg leading-relaxed text-foreground/90">
                "{testimonials[current].text}"
              </p>
              <div className="mt-8">
                <p className="font-bold">{testimonials[current].name}</p>
                <p className="text-sm text-muted-foreground">{testimonials[current].role}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button onClick={prev} className="rounded-full border border-border p-2 transition-colors hover:bg-secondary">
              <ChevronLeft className="h-5 w-5"/>
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (<button key={i} onClick={() => setCurrent(i)} className={`h-2 rounded-full transition-all ${i === current ? "w-8 gradient-primary" : "w-2 bg-border"}`}/>))}
            </div>
            <button onClick={next} className="rounded-full border border-border p-2 transition-colors hover:bg-secondary">
              <ChevronRight className="h-5 w-5"/>
            </button>
          </div>
        </div>
      </div>
    </section>);
};
export default TestimonialsSection;
