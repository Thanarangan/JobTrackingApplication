import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import apiClient from "@/api/apiClient";
const AuthContext = createContext(null);
const ACCESS_TOKEN_KEY = "access_token";
const USER_ID_KEY = "user_id";
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem(ACCESS_TOKEN_KEY));
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        if (!token) {
            setIsLoading(false);
            return;
        }
        const storedUserId = localStorage.getItem(USER_ID_KEY);
        if (!storedUserId) {
            setIsLoading(false);
            return;
        }
        apiClient
            .get(`/api/users/${storedUserId}`)
            .then((res) => setUser(res.data))
            .catch(() => {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            localStorage.removeItem(USER_ID_KEY);
            setToken(null);
            setUser(null);
        })
            .finally(() => setIsLoading(false));
    }, [token]);
    const login = useCallback(async (username, password) => {
        const res = await apiClient.post("/api/auth/login", { username, password });
        const t = res.data.token || res.data.accessToken;
        const userId = res.data.userId;
        if (!t || !userId) {
            throw new Error("Invalid login response from server");
        }
        localStorage.setItem(ACCESS_TOKEN_KEY, t);
        localStorage.setItem(USER_ID_KEY, String(userId));
        setToken(t);
        const userRes = await apiClient.get(`/api/users/${userId}`);
        setUser(userRes.data);
    }, []);
    const register = useCallback(async (username, name, email, password, age) => {
        const payload = { username, name, email, password };
        if (age !== undefined)
            payload.age = age;
        await apiClient.post("/api/auth/register", payload);
        const loginRes = await apiClient.post("/api/auth/login", { username, password });
        const t = loginRes.data.token || loginRes.data.accessToken;
        const userId = loginRes.data.userId;
        if (!t || !userId) {
            throw new Error("Invalid login response from server");
        }
        localStorage.setItem(ACCESS_TOKEN_KEY, t);
        localStorage.setItem(USER_ID_KEY, String(userId));
        setToken(t);
        const userRes = await apiClient.get(`/api/users/${userId}`);
        setUser(userRes.data);
    }, []);
    const logout = useCallback(() => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(USER_ID_KEY);
        setToken(null);
        setUser(null);
    }, []);
    return (<AuthContext.Provider value={{ user, token, isAuthenticated: !!token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>);
};
