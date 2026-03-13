import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, LayoutGrid, List, Pencil, Trash2, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import apiClient from "@/api/apiClient";
import { useAuth } from "@/auth/AuthProvider";

const statuses = ["Applied", "Interview", "Offer", "Rejected", "Saved"];
const hasSalaryValue = (salary) => typeof salary === "number" && Number.isFinite(salary);

const emptyApp = {
  userId: 0,
  companyName: "",
  position: "",
  status: "Applied",
  salary: undefined,
  location: "",
  url: "",
  dateApplied: new Date().toISOString().split("T")[0],
  notes: "",
};

const Applications = () => {
  const { user } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("card");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [formData, setFormData] = useState(emptyApp);
  const [editingId, setEditingId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchApplications = useCallback(async () => {
    if (!user?.id) {
      setApps([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.get(`/api/applications/user/${user.id}`);
      setApps(res.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filtered = apps.filter((app) => {
    const matchSearch =
      app.companyName.toLowerCase().includes(search.toLowerCase()) ||
      app.position.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || app.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSave = async () => {
    if (!formData.companyName || !formData.position) {
      toast.error("Company and position are required");
      return;
    }
    if (!user?.id) {
      toast.error("User not found");
      return;
    }

    const payload = {
      userId: user.id,
      companyName: formData.companyName,
      position: formData.position,
      status: formData.status,
      salary: formData.salary,
      location: formData.location || null,
      url: formData.url || null,
      dateApplied: formData.dateApplied,
      notes: formData.notes || null,
    };

    setSaving(true);
    try {
      if (editingId !== null) {
        const res = await apiClient.put(`/api/applications/${editingId}`, payload);
        const updated = res.data;
        setApps((prev) => prev.map((app) => (app.id === editingId ? updated : app)));
        toast.success("Application updated");
      } else {
        const res = await apiClient.post("/api/applications", payload);
        const created = res.data;
        setApps((prev) => [created, ...prev]);
        toast.success("Application added");
      }

      setFormData({ ...emptyApp, userId: user.id });
      setEditingId(null);
      setDialogOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save application");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (app) => {
    setFormData({
      userId: app.userId,
      companyName: app.companyName,
      position: app.position,
      status: app.status,
      salary: app.salary ?? undefined,
      location: app.location || "",
      url: app.url || "",
      dateApplied: app.dateApplied,
      notes: app.notes || "",
    });
    setEditingId(app.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/api/applications/${id}`);
      setApps((prev) => prev.filter((app) => app.id !== id));
      toast.success("Application deleted");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete application");
    }
  };

  const openNew = () => {
    setFormData({ ...emptyApp, userId: user?.id || 0 });
    setEditingId(null);
    setDialogOpen(true);
  };

  const statusColor = (status) => {
    const colors = {
      Applied: "bg-blue-100 text-blue-700",
      Interview: "bg-amber-100 text-amber-700",
      Offer: "bg-green-100 text-green-700",
      Rejected: "bg-red-100 text-red-700",
      Saved: "bg-muted text-muted-foreground",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Applications</h1>
          <p className="mt-1 text-muted-foreground">Track and manage all your job applications.</p>
        </div>
        <Button onClick={openNew} className="gradient-primary gap-2 rounded-full font-semibold text-primary-foreground">
          <Plus className="h-4 w-4" /> Add Application
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search company or role..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-1 rounded-lg border border-border p-0.5">
          <button onClick={() => setView("card")} className={`rounded-md p-1.5 transition ${view === "card" ? "bg-secondary" : ""}`}>
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button onClick={() => setView("table")} className={`rounded-md p-1.5 transition ${view === "table" ? "bg-secondary" : ""}`}>
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="mt-20 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-20 flex flex-col items-center text-center">
          <div className="rounded-2xl gradient-primary-soft p-6">
            <Briefcase className="h-12 w-12 text-primary" />
          </div>
          <h3 className="mt-6 text-lg font-bold">No applications yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">Start by adding your first job application.</p>
          <Button onClick={openNew} className="mt-6 rounded-full gradient-primary text-primary-foreground">
            <Plus className="mr-2 h-4 w-4" /> Add Application
          </Button>
        </div>
      ) : view === "card" ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((app, index) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold">{app.companyName}</h3>
                  <p className="text-sm text-muted-foreground">{app.position}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(app.status)}`}>{app.status}</span>
              </div>
              <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                {app.location && <p>Location: {app.location}</p>}
                {hasSalaryValue(app.salary) && <p>Salary: ${app.salary.toLocaleString()}</p>}
                <p>Date: {app.dateApplied}</p>
              </div>
              {app.notes && <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">{app.notes}</p>}
              <div className="mt-4 flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(app)}>
                  <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete application?</AlertDialogTitle>
                      <AlertDialogDescription>This will permanently remove this application.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(app.id)} className="bg-destructive text-destructive-foreground">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 text-left font-semibold">Company</th>
                <th className="px-4 py-3 text-left font-semibold">Position</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Location</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => (
                <tr key={app.id} className="border-b border-border last:border-0 transition-colors hover:bg-secondary/30">
                  <td className="px-4 py-3 font-medium">{app.companyName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{app.position}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor(app.status)}`}>{app.status}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{app.location}</td>
                  <td className="px-4 py-3 text-muted-foreground">{app.dateApplied}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(app)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete application?</AlertDialogTitle>
                          <AlertDialogDescription>This will permanently remove this application.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(app.id)} className="bg-destructive text-destructive-foreground">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Application" : "Add Application"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company</Label>
                <Input value={formData.companyName} onChange={(event) => setFormData({ ...formData, companyName: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Position</Label>
                <Input value={formData.position} onChange={(event) => setFormData({ ...formData, position: event.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Salary</Label>
                <Input
                  type="number"
                  value={formData.salary ?? ""}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      salary: event.target.value ? parseFloat(event.target.value) : undefined,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={formData.location} onChange={(event) => setFormData({ ...formData, location: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Date Applied</Label>
                <Input type="date" value={formData.dateApplied} onChange={(event) => setFormData({ ...formData, dateApplied: event.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input value={formData.url} onChange={(event) => setFormData({ ...formData, url: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={formData.notes} onChange={(event) => setFormData({ ...formData, notes: event.target.value })} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave} className="rounded-full gradient-primary text-primary-foreground">
              {saving ? "Saving..." : editingId !== null ? "Save Changes" : "Add Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Applications;
