import { Briefcase, FileText, StickyNote, Bell } from "lucide-react";
import { motion } from "framer-motion";
const cards = [
    {
        icon: Briefcase,
        title: "Track Applications",
        desc: "Keep every application organized with status, notes, and deadlines in one place.",
    },
    {
        icon: FileText,
        title: "Store Resumes",
        desc: "Upload, manage, and access your resumes instantly with our secure vault.",
    },
    {
        icon: StickyNote,
        title: "Notes & Status",
        desc: "Add interview notes, follow-ups, and custom statuses to stay on top of things.",
    },
    {
        icon: Bell,
        title: "Reminders",
        desc: "Never miss a deadline with smart reminders for follow-ups and interviews.",
        comingSoon: true,
    },
];
const BentoSection = () => {
    return (<section id="features" className="py-28 lg:py-36">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Features</p>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Unify your job search
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Everything you need to stay organized and land your next role.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, i) => (<motion.div key={card.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="group relative rounded-2xl border border-border bg-card p-7 transition-all hover:shadow-xl hover:-translate-y-1">
              {card.comingSoon && (<span className="absolute top-4 right-4 rounded-full gradient-primary px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground uppercase tracking-wider">
                  Soon
                </span>)}
              <div className="inline-flex rounded-xl gradient-primary-soft p-3">
                <card.icon className="h-6 w-6 text-primary"/>
              </div>
              <h3 className="mt-5 text-lg font-bold">{card.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
            </motion.div>))}
        </div>
      </div>
    </section>);
};
export default BentoSection;
