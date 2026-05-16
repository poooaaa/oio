import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // custom logo endpoints
  app.get("/api/logo", async (req, res) => {
    try {
      const fs = await import("fs/promises");
      const data = await fs.readFile(path.join(process.cwd(), "logo.json"), "utf-8");
      res.json(JSON.parse(data));
    } catch (e) {
      res.json({ logo: "https://cdn-icons-png.flaticon.com/512/145/145808.png" });
    }
  });

  app.post("/api/logo", async (req, res) => {
    try {
      const fs = await import("fs/promises");
      const { logo } = req.body;
      if (!logo) return res.status(400).json({ error: "Missing logo data" });
      await fs.writeFile(path.join(process.cwd(), "logo.json"), JSON.stringify({ logo }), "utf-8");
      res.json({ success: true });
    } catch (e) {
      console.error("Error saving logo:", e);
      res.status(500).json({ error: "Failed to save logo" });
    }
  });

  // Add API route
  app.get("/api/search/pinterest", async (req, res) => {
    try {
      const query = req.query.query as string;
      const apikey = req.query.apikey as string;
      
      if (!query || !apikey) {
        return res.status(400).json({ error: "Missing query or apikey" });
      }

      const response = await fetch(`https://exsalapi.my.id/api/search/pinterest?query=${encodeURIComponent(query)}&apikey=${apikey}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Pinterest API error:", error);
      res.status(500).json({ error: "Failed to fetch from Pinterest API" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
