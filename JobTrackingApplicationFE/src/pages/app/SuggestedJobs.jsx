import { ArrowUpRight, Briefcase, MapPin, Sparkles, Wand2 } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const buildQuery = (user) => {
  const role = user?.targetRole || "software developer";
  const location = user?.preferredLocation || "remote";
  const skills = (user?.skills || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join(" ");

  return {
    role,
    location,
    search: [role, skills, user?.experienceLevel || "", user?.workMode || ""].filter(Boolean).join(" "),
  };
};

const buildBoards = ({ role, location, search }) => [
  {
    name: "LinkedIn Jobs",
    description: "Broad professional listings with strong filters for experience and work mode.",
    href: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(search)}&location=${encodeURIComponent(location)}`,
  },
  {
    name: "Unstop",
    description: "Good for internships, fresher roles, challenges, and early-career opportunities.",
    href: `https://unstop.com/jobs?search=${encodeURIComponent(search)}`,
  },
  {
    name: "Indeed",
    description: "High-volume listings with straightforward role and location search.",
    href: `https://in.indeed.com/jobs?q=${encodeURIComponent(search)}&l=${encodeURIComponent(location)}`,
  },
  {
    name: "Wellfound",
    description: "Useful for startup roles across product, engineering, and design.",
    href: `https://wellfound.com/jobs?query=${encodeURIComponent(role)}`,
  },
  {
    name: "Foundit",
    description: "Strong coverage for India-focused job searches across multiple experience bands.",
    href: `https://www.foundit.in/srp/results?query=${encodeURIComponent(search)}&locations=${encodeURIComponent(location)}`,
  },
];

const SuggestedJobs = () => {
  const { user } = useAuth();

  const query = useMemo(() => buildQuery(user), [user]);
  const boards = useMemo(() => buildBoards(query), [query]);
  const preferredBoards = useMemo(
    () =>
      (user?.preferredJobBoards || "")
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean),
    [user?.preferredJobBoards]
  );

  const prioritizedBoards = useMemo(() => {
    if (preferredBoards.length === 0) {
      return boards;
    }

    return [...boards].sort((left, right) => {
      const leftScore = preferredBoards.some((item) => left.name.toLowerCase().includes(item)) ? 0 : 1;
      const rightScore = preferredBoards.some((item) => right.name.toLowerCase().includes(item)) ? 0 : 1;
      return leftScore - rightScore;
    });
  }, [boards, preferredBoards]);

  const profileSkills = useMemo(
    () => (user?.skills || "").split(",").map((item) => item.trim()).filter(Boolean).slice(0, 8),
    [user?.skills]
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Suggested Jobs</h1>
          <p className="mt-1 text-muted-foreground">
            These searches are generated from your saved profile and open on external job platforms.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/app/profile">Refine Profile</Link>
        </Button>
      </div>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Search Profile
          </CardTitle>
          <CardDescription>The links below are tailored using your target role, location, skills, and experience level.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
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
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Skills in use</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {profileSkills.length > 0 ? (
                profileSkills.map((skill) => (
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

      <div className="grid gap-5 xl:grid-cols-2">
        {prioritizedBoards.map((board, index) => (
          <Card key={board.name} className="border-border/70">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Briefcase className="h-5 w-5 text-primary" />
                    {board.name}
                  </CardTitle>
                  <CardDescription>{board.description}</CardDescription>
                </div>
                {index < 2 && (
                  <Badge className="rounded-full">
                    <Sparkles className="mr-1 h-3 w-3" />
                    Priority
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl bg-secondary/50 p-4 text-sm text-muted-foreground">
                Search query:
                <span className="ml-2 font-medium text-foreground">{query.search}</span>
              </div>
              <Button asChild className="rounded-full gradient-primary text-primary-foreground">
                <a href={board.href} target="_blank" rel="noreferrer">
                  Search on {board.name}
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SuggestedJobs;
