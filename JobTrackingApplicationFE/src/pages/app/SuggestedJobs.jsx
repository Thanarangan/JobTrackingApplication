import { ArrowUpRight, Briefcase, Building2, MapPin, SearchCheck, Sparkles, Wand2 } from "lucide-react";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import apiClient from "@/api/apiClient";
import { useAuth } from "@/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const RESUME_ANALYZER_JD_KEY = "resume_analyzer_job_description";

const BOARD_URLS = {
  linkedin: (query, location) =>
    `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`,
  unstop: (query) => `https://unstop.com/jobs?search=${encodeURIComponent(query)}`,
  indeed: (query, location) =>
    `https://in.indeed.com/jobs?q=${encodeURIComponent(query)}&l=${encodeURIComponent(location)}`,
  wellfound: (query) => `https://wellfound.com/jobs?query=${encodeURIComponent(query)}`,
  foundit: (query, location) =>
    `https://www.foundit.in/srp/results?query=${encodeURIComponent(query)}&locations=${encodeURIComponent(location)}`,
};

const COMPANY_PRESETS = [
  "NovaStack",
  "BlueOrbit Labs",
  "PixelMint",
  "ScaleGrid",
  "CrestWave",
  "Northstar Systems",
  "OrbitHive",
  "SignalCraft",
];

const buildQuery = (user) => {
  const role = user?.targetRole || "Software Developer";
  const location = user?.preferredLocation || "Remote";
  const experienceLevel = user?.experienceLevel || "Early Career";
  const workMode = user?.workMode || "Remote";
  const skills = (user?.skills || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);

  return {
    role,
    location,
    experienceLevel,
    workMode,
    skills,
    search: [role, experienceLevel, workMode, ...skills.slice(0, 3)].filter(Boolean).join(" "),
  };
};

const buildSuggestedPosts = ({ role, location, experienceLevel, workMode, skills }) => {
  const primarySkills = skills.length > 0 ? skills : ["Communication", "Problem Solving", "Teamwork"];
  const roleVariants = [
    role,
    `Senior ${role}`,
    `${role} - Product Team`,
    `${role} - Growth`,
    `${role} - Platform`,
    `Associate ${role}`,
  ];
  const boardCycle = ["linkedin", "unstop", "indeed", "wellfound", "foundit"];

  return roleVariants.slice(0, 6).map((title, index) => {
    const boardKey = boardCycle[index % boardCycle.length];
    const company = COMPANY_PRESETS[index % COMPANY_PRESETS.length];
    const matchedSkills = primarySkills.slice(0, Math.min(4, primarySkills.length));
    const salary = index % 2 === 0 ? "6-12 LPA" : "10-18 LPA";

    return {
      id: `${title}-${company}`,
      title,
      company,
      boardLabel: boardKey.charAt(0).toUpperCase() + boardKey.slice(1),
      location: index % 2 === 0 ? location : `${location} / Hybrid`,
      workMode,
      experienceLevel,
      salary,
      matchedSkills,
      summary: `Strong fit for ${title.toLowerCase()} based on your saved role target, preferred location, and overlapping skill signals.`,
      highlights: [
        `Role aligns with your saved preference for ${role}.`,
        `Your profile suggests relevance through ${matchedSkills.slice(0, 2).join(" and ")}.`,
        `Work setup matches ${workMode.toLowerCase()} expectations.`,
      ],
      applyUrl: BOARD_URLS[boardKey](title, location),
    };
  });
};

const buildJobDescription = (post, role) => {
  const skills = post.matchedSkills.length > 0 ? post.matchedSkills.join(", ") : "communication, ownership, execution";

  return [
    `Job Title: ${post.title}`,
    `Company: ${post.company}`,
    `Location: ${post.location}`,
    `Work Mode: ${post.workMode}`,
    `Experience Level: ${post.experienceLevel}`,
    `Compensation: ${post.salary}`,
    "",
    "Role Summary:",
    `We are hiring a ${post.title} to contribute across product delivery, collaboration, and execution for our ${role} hiring plan.`,
    "",
    "Key Responsibilities:",
    `- Deliver high-quality work aligned with ${post.title} expectations.`,
    `- Collaborate with cross-functional teams and communicate progress clearly.`,
    `- Apply practical experience in ${skills}.`,
    `- Support business goals in a ${post.workMode.toLowerCase()} environment.`,
    "",
    "Required Skills:",
    skills,
    "",
    "Preferred Traits:",
    "- Problem solving",
    "- Ownership mindset",
    "- Clear communication",
  ].join("\n");
};

const SuggestedJobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applyingId, setApplyingId] = useState(null);

  const query = useMemo(() => buildQuery(user), [user]);
  const posts = useMemo(() => buildSuggestedPosts(query), [query]);

  const handleFindResume = (post) => {
    const nextJobDescription = buildJobDescription(post, query.role);
    localStorage.setItem(RESUME_ANALYZER_JD_KEY, nextJobDescription);
    navigate("/app/resume-analyzer", {
      state: {
        autoAnalyze: true,
      },
    });
  };

  const handleApply = async (post) => {
    if (!user?.id) {
      toast.error("User not found");
      return;
    }

    const payload = {
      userId: user.id,
      companyName: post.company,
      position: post.title,
      status: "Applied",
      salary: undefined,
      location: post.location,
      url: post.applyUrl,
      dateApplied: new Date().toISOString().split("T")[0],
      notes: `Added from Suggested Jobs. Match skills: ${post.matchedSkills.join(", ") || "Not specified"}.`,
    };

    setApplyingId(post.id);
    try {
      await apiClient.post("/api/applications", payload);
      toast.success("Application added to Applications");
      window.open(post.applyUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add application");
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Suggested Jobs</h1>
          <p className="mt-1 text-muted-foreground">
            Job cards are generated from your saved profile so you can browse recommendations inside the app first.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/app/profile">Refine Profile</Link>
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.3 }}>
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Recommendation Input
            </CardTitle>
            <CardDescription>
              These suggested posts are based on the role, location, experience level, and skills saved in your profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-secondary/50 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Role</p>
              <p className="mt-1 font-semibold">{query.role}</p>
            </div>
            <div className="rounded-2xl bg-secondary/50 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Location</p>
              <p className="mt-1 flex items-center gap-2 font-semibold">
                <MapPin className="h-4 w-4 text-primary" />
                {query.location}
              </p>
            </div>
            <div className="rounded-2xl bg-secondary/50 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Experience</p>
              <p className="mt-1 font-semibold">{query.experienceLevel}</p>
            </div>
            <div className="rounded-2xl bg-secondary/50 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Skills in use</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {query.skills.length > 0 ? (
                  query.skills.slice(0, 4).map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No skills saved yet</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-5 xl:grid-cols-2">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="border-border/70">
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{post.title}</CardTitle>
                      {index < 3 ? (
                        <Badge className="rounded-full">
                          <Sparkles className="mr-1 h-3 w-3" />
                          Top Match
                        </Badge>
                      ) : null}
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {post.company}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="rounded-full">
                    {post.boardLabel}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {post.location}
                  </span>
                  <span className="rounded-full bg-secondary px-3 py-1">{post.workMode}</span>
                  <span className="rounded-full bg-secondary px-3 py-1">{post.experienceLevel}</span>
                  <span className="rounded-full bg-secondary px-3 py-1">{post.salary}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{post.summary}</p>

                <div className="rounded-2xl bg-secondary/50 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Why this matches</p>
                  <div className="mt-3 space-y-2">
                    {post.highlights.map((highlight) => (
                      <div key={highlight} className="flex items-start gap-2 text-sm">
                        <Briefcase className="mt-0.5 h-4 w-4 text-primary" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Matching skills</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {post.matchedSkills.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-full bg-secondary px-4 py-2 text-sm font-medium text-foreground">
                    Profile-based recommendation
                  </div>
                  <Button
                    type="button"
                    onClick={() => handleFindResume(post)}
                    className="rounded-full"
                  >
                    Find Resume
                    <SearchCheck className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    disabled={applyingId === post.id}
                    onClick={() => handleApply(post)}
                  >
                    {applyingId === post.id ? "Applying..." : "Apply"}
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default SuggestedJobs;
