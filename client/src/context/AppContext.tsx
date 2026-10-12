/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
// import { dummyUser } from "../assets/assets.js";
import toast from "react-hot-toast";
import api from "../lib/api.js";

interface UserType {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: "user" | "admin" | "owner";
}

interface AppContextType {
    user: UserType | null;
    token: string | null;
    loading: boolean;
    isAuthenticated: boolean;
    isAuthModalOpen: boolean;
    setAuthModalOpen: (open: boolean) => void;
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, password: string, phone?: string, role?: string) => Promise<boolean>;
    logout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

interface Props {
    children: React.ReactNode;
}

export const AppContextProvider = ({ children }: Props) => {
    const [user, setUser] = useState<UserType | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
    const [loading, setLoading] = useState<boolean>(true);
    const [isAuthModalOpen, setAuthModalOpen] = useState<boolean>(false);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            setLoading(true);
            const res= await api.post("/auth/login",{email,password})
            const {token:UserToken,...userData}=res.data;

            localStorage.setItem("token",UserToken);
            setToken(UserToken)
            setUser(userData)
            toast.success(`welcome back, ${userData.name}`)
            return true;
        } catch (error:any) {
            toast.error(error?.response?.data?.message || error?.message)
            return false
        }finally{
            setLoading(false)
        }

        // console.log(email, password);
        // setToken(dummyUser.token);
        // setUser(dummyUser as any);
        // setToken(dummyUser.token);
        // localStorage.setItem("token", dummyUser.token);
        // return true;
    };

    const register = async (name: string, email: string, password: string, phone?: string, role?: string): Promise<boolean> => {

        try {
            setLoading(true);
            const res= await api.post("/auth/register",{name,email,password,phone,role})
            const {token:UserToken,...userData}=res.data;

            localStorage.setItem("token",UserToken);
            setToken(UserToken)
            setUser(userData)
            toast.success(`welcome to QuickDine club!`)
            return true;
        } catch (error:any) {
            toast.error(error?.response?.data?.message || error?.message)
            return false
        }finally{
            setLoading(false)
        }
        // console.log(name, email, password, phone, role);
        // setToken(dummyUser.token);
        // setUser(dummyUser as any);
        // setToken(dummyUser.token);
        // localStorage.setItem("token", dummyUser.token);
        // return true;
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        window.location.href = "/";
    };

    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                // setUser(dummyUser as any);
                try {
                    const res=await api.get('/auth/me');
                    setUser(res.data)
                } catch (error:any) {
                    toast.error(error?.response?.data?.message || error?.message)
                    logout()
                }
            }
            setLoading(false);
        };
        loadUser();
    }, [token]);

    const value: AppContextType = {
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAuthModalOpen,
        setAuthModalOpen,
        login,
        register,
        logout,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within AppContextProvider");
    }
    return context;
};
