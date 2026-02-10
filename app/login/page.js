"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);

        // Simple mock authentication
        setTimeout(() => {
            localStorage.setItem("music_auth", "true");
            router.push("/");
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-[#1a0b16] via-[#12050e] to-[#0a0a0a]">
            {/* Animated Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-600/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-900/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

            <div className="w-full max-w-md z-10 transition-all duration-500 scale-100 hover:scale-[1.01]">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl shadow-pink-900/20">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-tr from-pink-500 to-pink-300 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 shadow-lg shadow-pink-500/30">
                            <span className="text-4xl">🌸</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Lyrix</h1>
                        <p className="text-white/40">Log in to find your perfect rhythm</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-2 ml-1">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500/50 transition-colors placeholder:text-white/20"
                                placeholder="yoursong@lyrix.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-2 ml-1">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500/50 transition-colors placeholder:text-white/20"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-pink-600/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Signing in...</span>
                                </div>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-xs text-white/20">
                        By signing in, you agree to our <span className="underline cursor-pointer">Terms of Melody</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
