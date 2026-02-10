"use strict";
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content:
        "Hello! I am your Lyrix Bot.  tell me a song and artist, and I'll find the lyrics for you! 🎶",
    },
  ]);
  const [input, setInput] = useState({ song: "", artist: "" });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  // Authentication check
  useEffect(() => {
    const isAuth = localStorage.getItem("music_auth");
    if (!isAuth) {
      router.push("/login");
    }
  }, [router]);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("music_chat_history");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("music_chat_history", JSON.stringify(history));
  }, [history]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchLyrics = async () => {
    if (!input.song || !input.artist) return;

    const userMessage = {
      role: "user",
      content: `${input.song} by ${input.artist}`,
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setInput({ song: "", artist: "" }); // Clear input

    try {
      const res = await fetch(
        `https://api.lyrics.ovh/v1/${input.artist}/${input.song}`
      );
      const data = await res.json();

      let botMessageContent = "";
      if (data.lyrics) {
        botMessageContent = data.lyrics;
        // Add to history
        const newHistoryItem = {
          song: input.song,
          artist: input.artist,
          lyrics: data.lyrics,
          timestamp: Date.now(),
        };
        // Avoid duplicates at the top of the list
        setHistory((prev) => [
          newHistoryItem,
          ...prev.filter(
            (h) =>
              h.song.toLowerCase() !== input.song.toLowerCase() ||
              h.artist.toLowerCase() !== input.artist.toLowerCase()
          ),
        ]);
      } else {
        botMessageContent = "Sorry, I couldn't find lyrics for that song. 😿";
      }

      setMessages((prev) => [
        ...prev,
        { role: "bot", content: botMessageContent },
      ]);
    } catch (error) {
      console.error("Error fetching lyrics:", error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Oops! Something went wrong. Please try again. 💔" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("music_auth");
    router.push("/login");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const userMessage = {
      role: "user",
      content: `📁 Uploaded audio: ${file.name}`,
    };
    setMessages((prev) => [...prev, userMessage]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/extract-lyrics", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        // Add to messages
        setMessages((prev) => [
          ...prev,
          { role: "bot", content: `✨ Identified: **${data.song}** by **${data.artist}**\n\n${data.lyrics}` },
        ]);

        // Add to history
        const newHistoryItem = {
          song: data.song,
          artist: data.artist,
          lyrics: data.lyrics,
          timestamp: Date.now(),
        };
        setHistory((prev) => [
          newHistoryItem,
          ...prev.filter(
            (h) =>
              h.song.toLowerCase() !== data.song.toLowerCase() ||
              h.artist.toLowerCase() !== data.artist.toLowerCase()
          ),
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "bot", content: data.error || "Sorry, I couldn't extract lyrics from this file. 😿" },
        ]);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Oops! Something went wrong during upload. 💔" },
      ]);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
    }
  };

  const loadFromHistory = (item) => {
    setMessages([
      {
        role: "bot",
        content: "Here are the lyrics you looked up before! 🎵",
      },
      { role: "user", content: `${item.song} by ${item.artist}` },
      { role: "bot", content: item.lyrics },
    ]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      fetchLyrics();
    }
  };

  return (
    <div className="flex h-screen w-full bg-[var(--background)] text-[var(--foreground)] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[var(--sidebar)] border-r border-[var(--border)] p-4">
        <h2 className="text-xl font-bold mb-6 text-[var(--primary)] flex items-center gap-2">
          <span></span> History
        </h2>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-[var(--primary)] scrollbar-track-transparent">
          {history.length === 0 && (
            <p className="text-sm text-white/50 italic">No history yet...</p>
          )}
          {history.map((item, idx) => (
            <button
              key={item.timestamp + idx}
              onClick={() => loadFromHistory(item)}
              className="w-full text-left p-3 rounded-lg hover:bg-[var(--sidebar-hover)] transition-colors text-sm truncate flex flex-col gap-1 border border-transparent hover:border-[var(--primary)]/30 group"
            >
              <span className="font-semibold text-white group-hover:text-[var(--primary)] transition-colors truncate">
                {item.song}
              </span>
              <span className="text-xs text-white/60 truncate">
                {item.artist}
              </span>
            </button>
          ))}
        </div>

        {/* Logout Section */}
        <div className="p-4 border-t border-[var(--border)]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-pink-900/10 hover:bg-pink-600/20 text-pink-400 hover:text-pink-300 transition-all text-sm font-medium border border-[var(--border)] group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-thin scrollbar-thumb-[var(--primary)] scrollbar-track-transparent pb-32"
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"
                }`}
            >
              <div
                className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl ${msg.role === "user"
                  ? "bg-[var(--primary)] text-white rounded-br-sm shadow-lg shadow-pink-500/20"
                  : "bg-[var(--input-bg)] text-white/90 rounded-bl-sm border border-[var(--border)]"
                  }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        {uploading && (
          <div className="absolute bottom-32 left-8 z-10">
            <div className="bg-[var(--input-bg)] p-4 rounded-2xl rounded-bl-sm border border-[var(--border)] animate-pulse shadow-lg">
              <span className="text-pink-300">Processing audio file... ✨</span>
            </div>
          </div>
        )}

        {loading && (
          <div className="absolute bottom-32 left-8 z-10">
            <div className="bg-[var(--input-bg)] p-4 rounded-2xl rounded-bl-sm border border-[var(--border)] animate-pulse shadow-lg">
              <span className="text-pink-300">Searching for lyrics... 🎵</span>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[var(--background)] via-[var(--background)] to-transparent p-4 md:p-8 pt-20">
          <div className="max-w-3xl mx-auto bg-[var(--input-bg)] rounded-xl border border-[var(--border)] p-2 shadow-2xl shadow-pink-900/20 flex flex-col md:flex-row gap-2">
            <input
              type="text"
              placeholder="Song Name"
              value={input.song}
              onChange={(e) => setInput({ ...input, song: e.target.value })}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/40 p-3"
            />
            <div className="w-px bg-white/10 hidden md:block"></div>
            <input
              type="text"
              placeholder="Artist Name"
              value={input.artist}
              onChange={(e) => setInput({ ...input, artist: e.target.value })}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/40 p-3"
            />
            <button
              onClick={fetchLyrics}
              disabled={loading || uploading || !input.song || !input.artist}
              className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white p-3 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed group min-w-[50px]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                >
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
              )}
            </button>
            <div className="w-px bg-white/10 hidden md:block"></div>
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || uploading}
              className="bg-[var(--input-bg)] hover:bg-[var(--sidebar-hover)] text-[var(--primary)] p-3 rounded-lg flex items-center justify-center transition-all border border-[var(--border)] disabled:opacity-50 disabled:cursor-not-allowed group min-w-[50px]"
              title="Upload Audio"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 group-hover:scale-110 transition-transform"
              >
                <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
                <path fillRule="evenodd" d="M9.344 3.071a2.25 2.25 0 012.112-1.321h1.088a2.25 2.25 0 012.112 1.321l.442 1.073c.155.376.512.636.915.688l1.171.152a2.25 2.25 0 011.967 2.235l.001 8.878a2.25 2.25 0 01-2.25 2.25H7.078a2.25 2.25 0 01-2.25-2.25l.001-8.878a2.25 2.25 0 011.967-2.235l1.171-.152c.403-.052.76-.312.915-.688l.442-1.073zM12 7.5a5.25 5.25 0 100 10.5 5.25 5.25 0 000-10.5z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="text-center mt-2 text-xs text-white/30">
            Powered by lyrics.ovh • Lyrix Edition 🌸
          </div>
        </div>
      </main >
    </div >
  );
}
