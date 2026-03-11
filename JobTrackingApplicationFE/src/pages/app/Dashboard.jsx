import { useEffect, useMemo, useState } from "react";
import { Briefcase, FileText, TrendingUp, Clock } from "lucide-react";
import { motion } from "framer-motion";
import apiClient from "@/api/apiClient";
import { useAuth } from "@/auth/AuthProvider";
import { toast } from "sonner";
const toTimestamp = (value) => {
    if (!value)
        return 0;
    const t = new Date(value).getTime();
    return Number.isNaN(t) ? 0 : t;
};
const formatRelative = (ts) => {
    if (!ts)
        return "-";
    const diffMs = Date.now() - ts;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    if (hours < 1)
        return "just now";
    if (hours < 24)
        return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};
const Dashboard = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user?.id) {
                setApplications([]);
                setResumes([]);
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const [appsRes, resumesRes] = await Promise.all([
                    apiClient.get(`/api/applications/user/${user.id}`),
                    apiClient.get(`/api/resumes/user/${user.id}`),
                ]);
                setApplications(appsRes.data || []);
                setResumes(resumesRes.data || []);
            }
            catch (err) {
                toast.error(err?.response?.data?.message || "Failed to load dashboard data");
            }
            finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [user?.id]);
    const interviewCount = useMemo(() => applications.filter((a) => a.status?.toLowerCase() === "interview").length, [applications]);
    const avgResponseDays = useMemo(() => {
        const validDates = applications
            .map((a) => toTimestamp(a.dateApplied))
            .filter((ts) => ts > 0);
        if (validDates.length === 0)
            return "-";
        const totalDays = validDates.reduce((sum, ts) => sum + (Date.now() - ts) / (1000 * 60 * 60 * 24), 0);
        return `${Math.max(0, Math.round(totalDays / validDates.length))}d`;
    }, [applications]);
    const latestResumeDate = useMemo(() => {
        const latest = resumes
            .map((r) => toTimestamp(r.uploadedAt))
            .sort((a, b) => b - a)[0];
        if (!latest)
            return "No uploads yet";
        return `Latest: ${new Date(latest).toLocaleDateString()}`;
    }, [resumes]);
    const recentActivity = useMemo(() => {
        const appActivity = applications.map((a) => ({
            id: `app-${a.id}`,
            title: a.companyName,
            action: `Application is ${a.status}`,
            time: toTimestamp(a.dateApplied),
        }));
        const resumeActivity = resumes.map((r) => ({
            id: `resume-${r.id}`,
            title: r.fileName,
            action: "Resume uploaded",
            time: toTimestamp(r.uploadedAt),
        }));
        return [...appActivity, ...resumeActivity]
            .sort((a, b) => b.time - a.time)
            .slice(0, 5);
    }, [applications, resumes]);
    const stats = [
        { label: "Total Applications", value: String(applications.length), icon: Briefcase, trend: "" },
        { label: "Interviews", value: String(interviewCount), icon: TrendingUp, trend: "" },
        { label: "Resumes Stored", value: String(resumes.length), icon: FileText, trend: latestResumeDate },
    ];
    return (<div>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">Here's an overview of your job search.</p>

      {loading ? (<div className="mt-8 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"/>
        </div>) : (<>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (<motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div className="inline-flex rounded-xl gradient-primary-soft p-2.5">
                <stat.icon className="h-5 w-5 text-primary"/>
              </div>
            </div>
            <p className="mt-4 text-3xl font-extrabold">{stat.value}</p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-xs text-primary font-semibold">{stat.trend}</p>
          </motion.div>))}
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-card p-8">
        <h2 className="text-xl font-bold">Recent Activity</h2>
        <p className="mt-2 text-muted-foreground text-sm">Your latest application updates will appear here.</p>
        <div className="mt-6 space-y-4">
          {recentActivity.length === 0 ? (<p className="text-sm text-muted-foreground">No activity yet.</p>) : (recentActivity.map((item) => (<div key={item.id} className="flex items-center justify-between rounded-xl bg-secondary/50 px-5 py-3">
              <div>
                <p className="font-semibold text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.action}</p>
              </div>
              <span className="text-xs text-muted-foreground">{formatRelative(item.time)}</span>
            </div>)))}
        </div>
      </div>
      </>)}
    </div>);
};
export default Dashboard;
