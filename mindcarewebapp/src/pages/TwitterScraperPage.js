import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, AlertTriangle, X, ExternalLink } from "lucide-react";

export default function TwitterScraperPage() {
  const [target, setTarget] = useState("");
  const [limit, setLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleScrape = async (e) => {
    e.preventDefault();
    if (!target) return;
    
    setIsLoading(true);
    setError(null);
    setResults(null);
    
    try {
      const response = await fetch("http://127.0.0.1:5000/api/scrape/twitter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: target, limit: parseInt(limit) }),
      });
      
      const data = await response.json();
      
      if (data.status === "error") {
        throw new Error(data.error || "Failed to scrape X / Twitter");
      }
      
      setResults(data);
    } catch (err) {
      setError(err.message || "Could not connect to the API. Is the Flask server running?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: 140, paddingBottom: 100 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ maxWidth: 800, margin: "0 auto" }}
      >
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 60, height: 60, borderRadius: 20,
            background: "linear-gradient(135deg, #1DA1F2, #0ea5e9)",
            marginBottom: 20
          }}>
            <X size={30} color="#fff" />
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 800, color: "#F8FAFC", marginBottom: 16 }}>
            X (Twitter) <span className="gradient-text">Analysis</span>
          </h1>
          <p style={{ fontSize: 18, color: "#94A3B8" }}>
            Scrape a Twitter user's recent tweets and run them through the MindCare assessment pipeline. Note: Scraping X can take 15-30 seconds.
          </p>
        </div>

        {/* Input Card */}
        <div className="glass-card" style={{ padding: 30, marginBottom: 40 }}>
          <form onSubmit={handleScrape} style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 300px", position: "relative" }}>
              <div style={{ position: "absolute", left: 16, top: 16, color: "#64748B" }}>
                <Search size={20} />
              </div>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Enter X Handle (e.g. @MehwishQamas)"
                style={{
                  width: "100%", padding: "16px 16px 16px 48px",
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12, color: "#fff", fontSize: 16, outline: "none"
                }}
              />
            </div>
            <div style={{ width: 120 }}>
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                min="1" max="50"
                style={{
                  width: "100%", padding: 16,
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12, color: "#fff", fontSize: 16, outline: "none", textAlign: "center"
                }}
                title="Max Tweets"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                background: "linear-gradient(135deg, #1DA1F2, #0ea5e9)",
                color: "#fff", padding: "0 32px", borderRadius: 12, fontSize: 16, fontWeight: 600,
                border: "none", cursor: isLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 10,
                opacity: isLoading ? 0.7 : 1, transition: "opacity 0.2s"
              }}
            >
              {isLoading ? <><Loader2 size={20} className="spin" /> Scraping...</> : "Analyze Tweets"}
            </button>
          </form>
        </div>

        {/* Error State */}
        {error && (
          <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: 12, padding: 20, display: "flex", alignItems: "center", gap: 16, color: "#FECACA", marginBottom: 40 }}>
            <AlertTriangle size={24} color="#EF4444" />
            <p>{error}</p>
          </div>
        )}

        {/* Results */}
        {results && results.results && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: "#F8FAFC", marginBottom: 24 }}>
              Found {results.count} Tweets for @{results.target}
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {results.results.map((tweet, idx) => (
                <div key={idx} className="glass-card" style={{ padding: 24, borderLeft: `4px solid ${tweet.prediction.color}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: 24 }}>{tweet.prediction.icon}</span>
                        <h4 style={{ fontSize: 18, fontWeight: 700, color: tweet.prediction.color }}>
                          Level {tweet.prediction.level}: {tweet.prediction.level_name}
                        </h4>
                      </div>
                      <p style={{ fontSize: 14, color: "#94A3B8" }}>
                        Confidence: {(tweet.prediction.confidence * 100).toFixed(1)}% • Posted: {tweet.created_utc}
                      </p>
                    </div>
                    <a href={tweet.url} target="_blank" rel="noreferrer" style={{ color: "#38BDF8", display: "flex", alignItems: "center", gap: 6, fontSize: 14, textDecoration: "none" }}>
                      View Profile <ExternalLink size={14} />
                    </a>
                  </div>
                  
                  <div style={{ background: "rgba(0,0,0,0.3)", padding: 16, borderRadius: 8, color: "#E2E8F0", fontSize: 15, lineHeight: 1.6 }}>
                    {tweet.text}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
