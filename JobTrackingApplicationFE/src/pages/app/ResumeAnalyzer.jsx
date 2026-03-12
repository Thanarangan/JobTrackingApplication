import { useMemo, useState } from "react";
import { Brain, FileSearch, Sparkles, Target } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/api/apiClient";
import { useAuth } from "@/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const scoreTone = (score) => {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-rose-600";
};

const ResumeAnalyzer = () => {
  const { user } = useAuth();
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const keywordPreview = useMemo(() => analysis?.topKeywords?.slice(0, 10) || [], [analysis]);

  const handleAnalyze = async () => {
    if (!user?.id) {
      toast.error("User not found");
      return;
    }
    if (!jobDescription.trim()) {
      toast.error("Paste a job description first");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post("/api/resumes/analyze", {
        userId: user.id,
        jobDescription,
      });
      setAnalysis(response.data);
      toast.success("Resume analysis completed");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to analyze resumes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Resume Analyzer</h1>
        <p className="mt-1 text-muted-foreground">
          Paste a job description to rank your uploaded resumes and surface the top three matches.
        </p>
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Job Description
          </CardTitle>
          <CardDescription>
            The analyzer checks ATS-style keyword overlap, matching skills, and resume structure.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            placeholder="Paste the JD here..."
            className="min-h-48 resize-y"
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleAnalyze} disabled={loading}>
              {loading ? "Analyzing..." : "Analyze Resumes"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Uses all resumes uploaded to your vault for this account.
            </p>
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Resumes Checked</CardDescription>
                <CardTitle>{analysis.analyzedCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>JD Skills Found</CardDescription>
                <CardTitle>{analysis.jobSkills?.length || 0}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Top Keywords</CardDescription>
                <CardTitle>{analysis.topKeywords?.length || 0}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Job Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium">Detected skills</p>
                <div className="flex flex-wrap gap-2">
                  {(analysis.jobSkills || []).length > 0 ? (
                    analysis.jobSkills.map((skill) => <Badge key={skill} variant="secondary">{skill}</Badge>)
                  ) : (
                    <span className="text-sm text-muted-foreground">No strong skill keywords detected from the JD.</span>
                  )}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Top JD keywords</p>
                <div className="flex flex-wrap gap-2">
                  {keywordPreview.map((keyword) => <Badge key={keyword} variant="outline">{keyword}</Badge>)}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-5 xl:grid-cols-3">
            {(analysis.topMatches || []).map((resume, index) => (
              <Card key={resume.resumeId} className="border-border/70 shadow-sm">
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <Badge>{`Top ${index + 1}`}</Badge>
                    <span className={`text-2xl font-bold ${scoreTone(resume.atsScore)}`}>{resume.atsScore}%</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{resume.fileName}</CardTitle>
                    <CardDescription>{resume.summary}</CardDescription>
                  </div>
                  <Progress value={resume.atsScore} className="h-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="mb-2 flex items-center gap-2 text-sm font-medium">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Matching skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(resume.matchingSkills || []).length > 0 ? (
                        resume.matchingSkills.map((skill) => <Badge key={skill} variant="secondary">{skill}</Badge>)
                      ) : (
                        <span className="text-sm text-muted-foreground">No direct JD skill matches found.</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium">Missing skills</p>
                    <div className="flex flex-wrap gap-2">
                      {(resume.missingSkills || []).length > 0 ? (
                        resume.missingSkills.map((skill) => <Badge key={skill} variant="outline">{skill}</Badge>)
                      ) : (
                        <span className="text-sm text-muted-foreground">No major skill gaps detected.</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 flex items-center gap-2 text-sm font-medium">
                      <FileSearch className="h-4 w-4 text-primary" />
                      Matched keywords
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(resume.matchedKeywords || []).length > 0 ? (
                        resume.matchedKeywords.map((keyword) => <Badge key={keyword}>{keyword}</Badge>)
                      ) : (
                        <span className="text-sm text-muted-foreground">Low exact keyword overlap with the JD.</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium">Suggestions</p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {(resume.suggestions || []).map((suggestion) => (
                        <li key={suggestion} className="rounded-lg bg-muted/50 px-3 py-2">
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
