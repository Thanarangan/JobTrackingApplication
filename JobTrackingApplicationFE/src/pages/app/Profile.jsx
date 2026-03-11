import { useAuth } from "@/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import apiClient from "@/api/apiClient";
import { toast } from "sonner";
const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [nameValue, setNameValue] = useState("");
    const [emailValue, setEmailValue] = useState("");
    const [ageValue, setAgeValue] = useState(undefined);
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        if (user) {
            setNameValue(user.name || "");
            setEmailValue(user.email || "");
            setAgeValue(user.age !== undefined ? user.age : undefined);
        }
    }, [user]);
    const handleLogout = () => {
        logout();
        navigate("/");
    };
    const handleSave = async () => {
        if (!user)
            return;
        setSaving(true);
        try {
            const payload = { name: nameValue, email: emailValue };
            if (ageValue !== undefined)
                payload.age = ageValue;
            const res = await apiClient.put(`/api/users/${user.id}`, payload);
            const updated = res.data;
            // update local user object if needed
            // we don't have a setter in context but could use login flow later
            toast.success("Profile updated");
        }
        catch (err) {
            toast.error(err?.response?.data?.message || "Failed to update profile");
        }
        finally {
            setSaving(false);
        }
    };
    return (<div>
      <h1 className="text-3xl font-bold">Profile</h1>
      <p className="mt-1 text-muted-foreground">Manage your account settings.</p>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 max-w-xl space-y-8">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary">
            <User className="h-7 w-7 text-primary-foreground"/>
          </div>
          <div>
            <p className="text-xl font-bold">{user?.name || "User"}</p>
            <p className="text-sm text-muted-foreground">
              {user?.email || "user@example.com"}
            </p>
            {user?.username && (<p className="text-xs text-muted-foreground">@{user.username}</p>)}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 space-y-6">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={nameValue} onChange={(e) => setNameValue(e.target.value)} placeholder="Your name"/>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={emailValue} placeholder="you@example.com"/>
          </div>
          <div className="space-y-2">
            <Label>Age</Label>
            <Input type="number" min={1} max={120} value={ageValue ?? ""} onChange={(e) => setAgeValue(e.target.value ? parseInt(e.target.value) : undefined)}/>
          </div>
          <Button className="gradient-primary text-primary-foreground rounded-full" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8">
          <h3 className="font-bold text-destructive">Danger Zone</h3>
          <p className="mt-1 text-sm text-muted-foreground">Log out of your account.</p>
          <Button variant="outline" onClick={handleLogout} className="mt-4 gap-2 border-destructive text-destructive hover:bg-destructive/10">
            <LogOut className="h-4 w-4"/> Log out
          </Button>
        </div>
      </motion.div>
    </div>);
};
export default Profile;
