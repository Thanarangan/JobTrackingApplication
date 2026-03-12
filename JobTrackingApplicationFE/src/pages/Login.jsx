import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            toast.error("Please fill in all fields");
            return;
        }
        setLoading(true);
        try {
            await login(username, password);
            toast.success("Welcome back!");
            navigate("/app/dashboard");
        }
        catch (err) {
            if (err?.code === "ERR_NETWORK") {
                toast.error("Cannot connect to server. Please check if the backend is running.");
            }
            else {
                toast.error(err?.message || "Login failed");
            }
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="flex min-h-screen">
      {/* Left gradient panel */}
      <div className="hidden w-1/2 gradient-hero items-center justify-center lg:flex">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="px-16 text-center">
          <h1 className="text-5xl font-extrabold text-primary-foreground leading-tight">
            Welcome
            <br />
            back
          </h1>
          <p className="mt-4 text-lg text-primary-foreground/70">
            Pick up where you left off.
          </p>
        </motion.div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
          <Link to="/" className="text-2xl font-display font-extrabold gradient-text">
            JobTrackr
          </Link>
          <h2 className="mt-8 text-3xl font-bold">Log in</h2>
          <p className="mt-2 text-muted-foreground">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="your username" value={username} onChange={(e) => setUsername(e.target.value)}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}/>
            </div>
            <Button type="submit" disabled={loading} className="w-full rounded-full gradient-primary text-primary-foreground font-bold">
              {loading ? "Logging in..." : "Log in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>);
};
export default Login;
