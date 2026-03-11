import { motion } from "framer-motion";
const steps = [
    { num: "01", title: "Create Account", desc: "Sign up in seconds — no credit card needed." },
    { num: "02", title: "Add Application", desc: "Log each job you apply to with company, role, and status." },
    { num: "03", title: "Upload Resume", desc: "Store your tailored resumes in the secure vault." },
    { num: "04", title: "Track Progress", desc: "Update statuses, add notes, and follow up effortlessly." },
    { num: "05", title: "Land the Job", desc: "Stay organized and confident throughout your journey." },
];
const StepperSection = () => {
    return (<section id="steps" className="py-28 lg:py-36 bg-secondary/50">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">How It Works</p>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Simple, fast & organized
          </h2>
        </motion.div>

        <div className="relative mt-20 grid gap-0 md:grid-cols-5">
          {/* Connector line */}
          <div className="absolute top-12 left-[10%] right-[10%] hidden h-px bg-border md:block"/>

          {steps.map((step, i) => (<motion.div key={step.num} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="relative flex flex-col items-center text-center px-4 py-6">
              <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-2xl gradient-primary shadow-lg">
                <span className="text-2xl font-extrabold text-primary-foreground">{step.num}</span>
              </div>
              <h3 className="mt-6 text-base font-bold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-[200px]">{step.desc}</p>
            </motion.div>))}
        </div>
      </div>
    </section>);
};
export default StepperSection;
