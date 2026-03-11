import { Link } from "react-router-dom";
const footerCols = [
    {
        title: "Get Started",
        links: [
            { label: "Sign up", to: "/register" },
            { label: "Log in", to: "/login" },
            { label: "Pricing", to: "#" },
        ],
    },
    {
        title: "Product",
        links: [
            { label: "Features", to: "#features" },
            { label: "Applications", to: "#features" },
            { label: "Resume Vault", to: "#vault" },
        ],
    },
    {
        title: "Company",
        links: [
            { label: "About", to: "#" },
            { label: "Blog", to: "#" },
            { label: "Careers", to: "#" },
        ],
    },
    {
        title: "Legal",
        links: [
            { label: "Privacy", to: "#" },
            { label: "Terms", to: "#" },
            { label: "Cookie Policy", to: "#" },
        ],
    },
];
const LandingFooter = () => {
    return (<footer className="border-t border-border bg-secondary/30 py-16">
      <div className="container mx-auto px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <span className="text-2xl font-display font-extrabold gradient-text">JobTrackr</span>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              The modern way to track your job search and manage your career.
            </p>
          </div>
          {footerCols.map((col) => (<div key={col.title}>
              <h4 className="text-sm font-bold uppercase tracking-wider">{col.title}</h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (<li key={link.label}>
                    <Link to={link.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>))}
              </ul>
            </div>))}
        </div>
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">© 2026 JobTrackr. All rights reserved.</p>
          <div className="flex gap-4">
            {["Twitter", "LinkedIn", "GitHub"].map((s) => (<a key={s} href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {s}
              </a>))}
          </div>
        </div>
      </div>
    </footer>);
};
export default LandingFooter;
