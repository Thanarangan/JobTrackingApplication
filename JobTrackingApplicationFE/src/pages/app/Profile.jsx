import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase,
  BriefcaseBusiness,
  Camera,
  CheckCircle2,
  Edit3,
  Globe2,
  GraduationCap,
  ImagePlus,
  Link2,
  LogOut,
  Mail,
  MapPin,
  Save,
  Sparkles,
  Target,
  UserRound,
  Wand2,
} from "lucide-react";
import apiClient from "@/api/apiClient";
import { useAuth } from "@/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const defaultProfile = {
  name: "",
  email: "",
  age: "",
  headline: "",
  targetRole: "",
  preferredLocation: "",
  workMode: "",
  experienceLevel: "",
  skills: "",
  bio: "",
  avatarUrl: "",
  linkedInUrl: "",
  githubUrl: "",
  portfolioUrl: "",
  preferredJobBoards: "",
};

const MAX_AVATAR_DATA_URL_LENGTH = 1_500_000;

const getInitials = (name) =>
  (name || "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const readImageDimensions = (file) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
        cleanup: () => URL.revokeObjectURL(objectUrl),
      });
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to read image"));
    };
    image.src = objectUrl;
  });

const compressImageToDataUrl = async (file) => {
  const { width, height, cleanup } = await readImageDimensions(file);

  try {
    const canvas = document.createElement("canvas");
    const maxDimension = 512;
    const scale = Math.min(1, maxDimension / Math.max(width, height));
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Image processing is not available");
    }

    await new Promise((resolve, reject) => {
      const image = new Image();
      const objectUrl = URL.createObjectURL(file);
      image.onload = () => {
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(objectUrl);
        resolve();
      };
      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Failed to process image"));
      };
      image.src = objectUrl;
    });

    for (const quality of [0.82, 0.72, 0.6, 0.5]) {
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      if (dataUrl.length <= MAX_AVATAR_DATA_URL_LENGTH) {
        return dataUrl;
      }
    }

    throw new Error("Profile photo is still too large after compression");
  } finally {
    cleanup();
  }
};

const StatPill = ({ label, value, icon: Icon, tone = "orange" }) => {
  const tones = {
    orange: "from-orange-50 to-orange-100/60 border-orange-200/70 text-orange-700",
    teal: "from-teal-50 to-teal-100/60 border-teal-200/70 text-teal-700",
    blue: "from-blue-50 to-blue-100/60 border-blue-200/70 text-blue-700",
    violet: "from-violet-50 to-violet-100/60 border-violet-200/70 text-violet-700",
  };

  return (
    <div className={`rounded-2xl border bg-gradient-to-br px-5 py-4 ${tones[tone]}`}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 opacity-80" />
        <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{label}</p>
      </div>
      <p className="mt-3 text-lg font-bold leading-none">{value}</p>
    </div>
  );
};

const SectionCard = ({ title, description, icon: Icon, children, iconTone = "from-orange-400 to-orange-500" }) => (
  <Card className="overflow-hidden rounded-[1.75rem] border-border/60 bg-card shadow-[0_10px_40px_-18px_rgba(15,23,42,0.18)]">
    <CardHeader className="border-b border-border/40 bg-gradient-to-r from-slate-50/80 to-white px-6 py-5">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${iconTone} shadow-sm`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <CardDescription className="mt-0.5 text-xs">{description}</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent className="p-6">{children}</CardContent>
  </Card>
);

const Field = ({ label, icon: Icon, children, hint }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</Label>
    {Icon ? (
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        {children(true)}
      </div>
    ) : (
      children(false)
    )}
    {hint ? <p className="text-[11px] leading-relaxed text-muted-foreground">{hint}</p> : null}
  </div>
);

const Profile = () => {
  const { user, logout, updateCurrentUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(defaultProfile);
  const [saving, setSaving] = useState(false);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm({
      name: user.name || "",
      email: user.email || "",
      age: user.age ?? "",
      headline: user.headline || "",
      targetRole: user.targetRole || "",
      preferredLocation: user.preferredLocation || "",
      workMode: user.workMode || "",
      experienceLevel: user.experienceLevel || "",
      skills: user.skills || "",
      bio: user.bio || "",
      avatarUrl: user.avatarUrl || "",
      linkedInUrl: user.linkedInUrl || "",
      githubUrl: user.githubUrl || "",
      portfolioUrl: user.portfolioUrl || "",
      preferredJobBoards: user.preferredJobBoards || "LinkedIn, Unstop, Indeed",
    });
  }, [user]);

  const skillList = useMemo(
    () => form.skills.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 10),
    [form.skills]
  );

  const boardList = useMemo(
    () => form.preferredJobBoards.split(",").map((item) => item.trim()).filter(Boolean),
    [form.preferredJobBoards]
  );

  const completionScore = useMemo(() => {
    const trackedFields = [
      form.name,
      form.email,
      form.headline,
      form.targetRole,
      form.preferredLocation,
      form.workMode,
      form.experienceLevel,
      form.skills,
      form.bio,
      form.avatarUrl,
      form.linkedInUrl,
      form.githubUrl,
      form.portfolioUrl,
    ];

    return Math.round(
      (trackedFields.filter((value) => String(value || "").trim()).length / trackedFields.length) * 100
    );
  }, [form]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleAvatarSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Profile photo must be under 5MB");
      return;
    }

    try {
      const compressed = await compressImageToDataUrl(file);
      updateField("avatarUrl", compressed);
      toast.success("Profile photo ready to save");
    } catch (error) {
      toast.error(error?.message || "Failed to process profile photo");
    } finally {
      event.target.value = "";
    }
  };

  const handleSave = async () => {
    if (!user) {
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        headline: form.headline.trim(),
        targetRole: form.targetRole.trim(),
        preferredLocation: form.preferredLocation.trim(),
        workMode: form.workMode.trim(),
        experienceLevel: form.experienceLevel.trim(),
        skills: form.skills.trim(),
        bio: form.bio.trim(),
        linkedInUrl: form.linkedInUrl.trim(),
        githubUrl: form.githubUrl.trim(),
        portfolioUrl: form.portfolioUrl.trim(),
        preferredJobBoards: form.preferredJobBoards.trim(),
        age: form.age === "" ? undefined : Number(form.age),
      };
      const response = await apiClient.put(`/api/users/${user.id}`, payload);
      updateCurrentUser(response.data);
      setForm((prev) => ({ ...prev, ...response.data, age: response.data.age ?? "" }));
      toast.success("Profile updated");
    } catch (error) {
      const details = error?.response?.data?.details;
      const message = Array.isArray(details)
        ? details.join(", ")
        : error?.response?.data?.error || "Failed to update profile";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-[2.25rem] bg-[linear-gradient(180deg,#fffdf8_0%,#ffffff_38%,#f8fafc_100%)] px-4 py-4 sm:px-6 sm:py-6">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(251,146,60,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(20,184,166,0.1),transparent_24%)]" />

        <div className="space-y-6 pb-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="overflow-hidden rounded-[2rem] border-border/60 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)]">
              <div className="relative h-44 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_45%,#14b8a6_100%)] sm:h-52">
                <div className="absolute -left-8 bottom-0 h-40 w-40 rounded-full bg-white/5" />
                <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/5" />
                <div className="absolute right-24 top-10 h-24 w-24 rounded-full bg-white/5" />
                <div className="absolute right-5 top-5 flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-300" />
                  <span className="text-xs font-semibold text-white">{completionScore}% Complete</span>
                </div>
              </div>

              <CardContent className="relative px-6 pb-6 pt-0 sm:px-8">
                <div className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex items-end gap-5">
                    <button
                      type="button"
                      onClick={() => (form.avatarUrl ? setIsPhotoOpen(true) : fileInputRef.current?.click())}
                      className="group relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-[1.5rem] border-4 border-white bg-gradient-to-br from-slate-100 to-slate-200 shadow-xl"
                    >
                      {form.avatarUrl ? (
                        <>
                          <img src={form.avatarUrl} alt={form.name || "Profile"} className="h-full w-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/30">
                            <Edit3 className="h-5 w-5 text-white opacity-0 transition group-hover:opacity-100" />
                          </div>
                        </>
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-3xl font-bold text-slate-600">
                          {getInitials(form.name)}
                        </span>
                      )}
                    </button>

                    <div className="mb-1 space-y-1">
                      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        {form.name || "Your Name"}
                      </h1>
                      <p className="max-w-sm text-sm leading-relaxed text-slate-500">
                        {form.headline || "Add a headline that quickly explains what kind of role you want."}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {form.targetRole ? (
                          <Badge className="rounded-full border-0 bg-gradient-to-r from-orange-500 to-orange-400 px-3 text-xs text-white">
                            {form.targetRole}
                          </Badge>
                        ) : null}
                        {form.preferredLocation ? (
                          <Badge variant="secondary" className="rounded-full px-3 text-xs">
                            <MapPin className="mr-1 h-3 w-3" />
                            {form.preferredLocation}
                          </Badge>
                        ) : null}
                        {form.workMode ? (
                          <Badge variant="outline" className="rounded-full px-3 text-xs">
                            {form.workMode}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:mb-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-9 rounded-full border-slate-200 px-4 text-slate-600 hover:border-orange-300 hover:text-orange-600"
                    >
                      <Camera className="mr-1.5 h-3.5 w-3.5" />
                      Photo
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="h-9 rounded-full border-rose-200 px-4 text-rose-500 hover:bg-rose-50"
                    >
                      <LogOut className="mr-1.5 h-3.5 w-3.5" />
                      Logout
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={saving}
                      className="h-9 rounded-full border-0 bg-gradient-to-r from-orange-500 to-orange-400 px-5 text-white shadow-md shadow-orange-200 hover:from-orange-600 hover:to-orange-500"
                    >
                      <Save className="mr-1.5 h-3.5 w-3.5" />
                      {saving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatPill label="Completion" value={`${completionScore}%`} icon={Sparkles} tone="orange" />
                  <StatPill label="Skills" value={skillList.length ? String(skillList.length) : "0"} icon={Wand2} tone="teal" />
                  <StatPill label="Experience" value={form.experienceLevel || "Add level"} icon={GraduationCap} tone="blue" />
                  <StatPill label="Job Boards" value={boardList.length ? String(boardList.length) : "0"} icon={BriefcaseBusiness} tone="violet" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
            <motion.aside
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="space-y-5 xl:sticky xl:top-4 xl:self-start"
            >
              <Card className="overflow-hidden rounded-[1.75rem] border-border/60 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.12)]">
                <CardHeader className="border-b border-border/40 bg-gradient-to-r from-teal-50/80 to-white px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-500 shadow-sm">
                      <Wand2 className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">Top Skills</CardTitle>
                      <CardDescription className="mt-0.5 text-xs">Skills that shape your recommendations.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  {skillList.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {skillList.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="cursor-default rounded-full border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Add your strongest skills so the analyzer and suggested jobs can rank better results.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="overflow-hidden rounded-[1.75rem] border-border/60 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.12)]">
                <CardHeader className="border-b border-border/40 bg-gradient-to-r from-blue-50/80 to-white px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 shadow-sm">
                      <Link2 className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">Links</CardTitle>
                      <CardDescription className="mt-0.5 text-xs">Your public professional presence.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="divide-y divide-border/40 p-0">
                  {[
                    { label: "LinkedIn", url: form.linkedInUrl, icon: BriefcaseBusiness, activeColor: "text-blue-600" },
                    { label: "GitHub", url: form.githubUrl, icon: Globe2, activeColor: "text-slate-700" },
                    { label: "Portfolio", url: form.portfolioUrl, icon: Sparkles, activeColor: "text-orange-600" },
                  ].map(({ label, url, icon: Icon, activeColor }) => (
                    <div key={label} className="flex items-center gap-3 px-5 py-3.5">
                      <Icon className={`h-4 w-4 flex-shrink-0 ${url ? activeColor : "text-slate-300"}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-500">{label}</p>
                        {url ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block max-w-[200px] truncate text-xs text-blue-600 hover:underline"
                          >
                            {url.replace(/^https?:\/\//, "")}
                          </a>
                        ) : (
                          <p className="text-xs text-slate-300">Not set yet</p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="overflow-hidden rounded-[1.75rem] border-border/60 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.12)]">
                <CardHeader className="border-b border-border/40 bg-gradient-to-r from-violet-50/80 to-white px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-violet-500 shadow-sm">
                      <Briefcase className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">Job Boards</CardTitle>
                      <CardDescription className="mt-0.5 text-xs">Where the app should search first.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  {boardList.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {boardList.map((board) => (
                        <Badge
                          key={board}
                          className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700"
                        >
                          {board}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Add boards like LinkedIn, Unstop, Indeed, or Wellfound to tune job suggestions.
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.aside>

            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="space-y-5"
            >
              <SectionCard title="Identity" description="Core details people see first." icon={UserRound}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full Name" icon={UserRound}>
                    {(withIcon) => (
                      <Input
                        className={`h-11 rounded-xl border-slate-200 ${withIcon ? "pl-10" : ""}`}
                        value={form.name}
                        onChange={(event) => updateField("name", event.target.value)}
                        placeholder="Your full name"
                      />
                    )}
                  </Field>

                  <Field label="Email" icon={Mail}>
                    {(withIcon) => (
                      <Input
                        className={`h-11 rounded-xl border-slate-200 ${withIcon ? "pl-10" : ""}`}
                        value={form.email}
                        onChange={(event) => updateField("email", event.target.value)}
                        placeholder="you@example.com"
                      />
                    )}
                  </Field>

                  <Field label="Age">
                    {() => (
                      <Input
                        type="number"
                        min={1}
                        max={120}
                        className="h-11 rounded-xl border-slate-200"
                        value={form.age}
                        onChange={(event) => updateField("age", event.target.value)}
                        placeholder="Optional"
                      />
                    )}
                  </Field>

                  <Field label="Profile Photo" hint="Images are compressed before upload.">
                    {() => (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 w-full justify-start rounded-xl border-dashed border-slate-300 text-slate-500 hover:border-orange-400 hover:text-orange-600"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImagePlus className="mr-2 h-4 w-4" />
                        Choose from system
                      </Button>
                    )}
                  </Field>

                  <div className="sm:col-span-2">
                    <Field label="Headline" hint="One sentence. Keep it direct and specific.">
                      {() => (
                        <Input
                          className="h-11 rounded-xl border-slate-200"
                          value={form.headline}
                          onChange={(event) => updateField("headline", event.target.value)}
                          placeholder="Frontend developer focused on product quality and thoughtful UI"
                        />
                      )}
                    </Field>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="rounded-2xl border border-orange-100 bg-orange-50/70 px-4 py-4 text-sm text-orange-900">
                      A strong headline and bio make the rest of the profile feel complete. Keep them aligned with
                      the role you want next.
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <Field label="Bio" hint="Use 2-4 concise lines. Say what you do, what you want, and what you are strong at.">
                      {() => (
                        <Textarea
                          className="min-h-28 resize-none rounded-xl border-slate-200 leading-relaxed"
                          value={form.bio}
                          onChange={(event) => updateField("bio", event.target.value)}
                          placeholder="Describe the work you want, the problems you enjoy solving, and the kind of impact you want your profile to signal."
                        />
                      )}
                    </Field>
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Career Preferences"
                description="These fields influence how jobs and resumes are evaluated."
                icon={Target}
                iconTone="from-teal-400 to-teal-500"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Desired Role" icon={Target}>
                    {(withIcon) => (
                      <Input
                        className={`h-11 rounded-xl border-slate-200 ${withIcon ? "pl-10" : ""}`}
                        value={form.targetRole}
                        onChange={(event) => updateField("targetRole", event.target.value)}
                        placeholder="Product Designer, Java Developer, Data Analyst"
                      />
                    )}
                  </Field>

                  <Field label="Preferred Location" icon={MapPin}>
                    {(withIcon) => (
                      <Input
                        className={`h-11 rounded-xl border-slate-200 ${withIcon ? "pl-10" : ""}`}
                        value={form.preferredLocation}
                        onChange={(event) => updateField("preferredLocation", event.target.value)}
                        placeholder="Bengaluru, Remote, Hyderabad"
                      />
                    )}
                  </Field>

                  <Field label="Work Mode">
                    {() => (
                      <Input
                        className="h-11 rounded-xl border-slate-200"
                        value={form.workMode}
                        onChange={(event) => updateField("workMode", event.target.value)}
                        placeholder="Remote, Hybrid, On-site"
                      />
                    )}
                  </Field>

                  <Field label="Experience Level">
                    {() => (
                      <Input
                        className="h-11 rounded-xl border-slate-200"
                        value={form.experienceLevel}
                        onChange={(event) => updateField("experienceLevel", event.target.value)}
                        placeholder="Intern, Fresher, 2-4 years, Senior"
                      />
                    )}
                  </Field>

                  <div className="sm:col-span-2">
                    <Field label="Skills" icon={Wand2} hint="Separate with commas. Put the strongest first.">
                      {(withIcon) => (
                        <Input
                          className={`h-11 rounded-xl border-slate-200 ${withIcon ? "pl-10" : ""}`}
                          value={form.skills}
                          onChange={(event) => updateField("skills", event.target.value)}
                          placeholder="React, Java, Spring Boot, Figma, SQL"
                        />
                      )}
                    </Field>
                  </div>

                  <div className="sm:col-span-2">
                    <Field label="Preferred Job Boards" icon={BriefcaseBusiness}>
                      {(withIcon) => (
                        <Input
                          className={`h-11 rounded-xl border-slate-200 ${withIcon ? "pl-10" : ""}`}
                          value={form.preferredJobBoards}
                          onChange={(event) => updateField("preferredJobBoards", event.target.value)}
                          placeholder="LinkedIn, Unstop, Indeed, Wellfound"
                        />
                      )}
                    </Field>
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Links"
                description="Keep your public profiles easy to verify."
                icon={Globe2}
                iconTone="from-blue-400 to-blue-500"
              >
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="LinkedIn URL" icon={BriefcaseBusiness}>
                    {(withIcon) => (
                      <Input
                        className={`h-11 rounded-xl border-slate-200 ${withIcon ? "pl-10" : ""}`}
                        value={form.linkedInUrl}
                        onChange={(event) => updateField("linkedInUrl", event.target.value)}
                        placeholder="https://linkedin.com/in/..."
                      />
                    )}
                  </Field>

                  <Field label="GitHub URL" icon={Globe2}>
                    {(withIcon) => (
                      <Input
                        className={`h-11 rounded-xl border-slate-200 ${withIcon ? "pl-10" : ""}`}
                        value={form.githubUrl}
                        onChange={(event) => updateField("githubUrl", event.target.value)}
                        placeholder="https://github.com/..."
                      />
                    )}
                  </Field>

                  <Field label="Portfolio URL" icon={Sparkles}>
                    {(withIcon) => (
                      <Input
                        className={`h-11 rounded-xl border-slate-200 ${withIcon ? "pl-10" : ""}`}
                        value={form.portfolioUrl}
                        onChange={(event) => updateField("portfolioUrl", event.target.value)}
                        placeholder="https://yourportfolio.com"
                      />
                    )}
                  </Field>
                </div>
              </SectionCard>

              <div className="flex justify-end gap-3 pt-1">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="rounded-full border-rose-200 px-5 text-rose-500 hover:bg-rose-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-full border-0 bg-gradient-to-r from-orange-500 to-orange-400 px-6 text-white shadow-lg shadow-orange-200/60 hover:from-orange-600 hover:to-orange-500"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Dialog open={isPhotoOpen} onOpenChange={setIsPhotoOpen}>
        <DialogContent className="max-w-lg overflow-hidden rounded-[2rem] border-none bg-slate-950 p-0 text-white">
          <DialogHeader className="absolute left-0 top-0 z-10 p-6">
            <DialogTitle className="text-lg font-semibold">{form.name || "Profile photo"}</DialogTitle>
            <DialogDescription className="text-xs text-white/60">Expanded view</DialogDescription>
          </DialogHeader>
          <div className="relative aspect-square w-full bg-[radial-gradient(circle_at_top,#1e293b,transparent_55%),linear-gradient(180deg,#020617,#111827)]">
            {form.avatarUrl ? (
              <img src={form.avatarUrl} alt={form.name || "Profile"} className="h-full w-full object-contain" />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl font-bold text-white/40">
                {getInitials(form.name)}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarSelect} />
    </>
  );
};

export default Profile;
