import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily/safely
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// 1. Health Check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    appName: "New Hire Intelligence",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// 2. Understand Daily Signal (Speech or Text from New Hire)
app.post("/api/signals/understand-daily", async (req, res) => {
  try {
    const { text, newHireName = "Rahul", dayNumber = 3 } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing 'text' in request body." });
    }

    const ai = getGenAI();

    // Deterministic fallback analyzer
    const lower = text.toLowerCase();
    let issue = "General Feedback";
    let confidence = "Medium";
    let impact = "Normal ramp-up";
    let category = "General";

    if (lower.includes("confused") || lower.includes("where") || lower.includes("find") || lower.includes("location") || lower.includes("aisle") || lower.includes("shelf") || lower.includes("product")) {
      issue = "Location navigation";
      confidence = "Low";
      impact = "Slow picking";
      category = "Environment";
    } else if (lower.includes("scan") || lower.includes("device") || lower.includes("battery") || lower.includes("app") || lower.includes("barcode") || lower.includes("machine")) {
      issue = "Tool / Scanner operation";
      confidence = "Medium";
      impact = "Scan delays or retries";
      category = "Tool";
    } else if (lower.includes("speed") || lower.includes("fast") || lower.includes("slow") || lower.includes("target") || lower.includes("rate")) {
      issue = "Pacing & speed pressure";
      confidence = "Medium";
      impact = "Picking rate below target";
      category = "Process";
    } else if (lower.includes("tired") || lower.includes("heavy") || lower.includes("feet") || lower.includes("pain") || lower.includes("break")) {
      issue = "Physical stamina / Shift adjustment";
      confidence = "Medium";
      impact = "Fatigue during later hours";
      category = "Physical";
    } else if (lower.includes("great") || lower.includes("good") || lower.includes("easy") || lower.includes("smooth") || lower.includes("confident")) {
      issue = "None / Positive progress";
      confidence = "High";
      impact = "Steady ramp-up";
      category = "General";
    }

    let result = {
      rawText: text,
      issue,
      confidence,
      possibleImpact: impact,
      category,
      summary: `Day ${dayNumber}: Employee reported: "${text.slice(0, 100)}${text.length > 100 ? "..." : ""}"`,
      companionResponse: "Thanks for sharing honestly. It takes a few shifts to memorize dark store rack codes. Your manager and buddy are here to back you up!",
    };

    if (ai) {
      try {
        const prompt = `You are the intelligence engine for "New Hire Intelligence", an intelligent coordination system for blue-collar dark store pickers during their 14-day ramp-up.
Analyze what this new hire (${newHireName}, Day ${dayNumber}) just said:
"${text}"

Convert this into structured signals for the coordination system.
Respond ONLY with valid JSON in this exact structure:
{
  "issue": "A concise issue title (e.g., 'Location navigation', 'Scanner barcode read', 'Batch picking rule confusion', 'Steady settling in')",
  "confidence": "Low" | "Medium" | "High",
  "possibleImpact": "Short practical consequence (e.g. 'Slow picking', 'Mis-picks', 'Increased manager callouts', 'Normal ramp')",
  "category": "Environment" | "Process" | "Tool" | "Confidence" | "Physical" | "General",
  "summary": "1 concise sentence summarizing what is happening",
  "companionResponse": "A very friendly, encouraging, 1-2 sentence direct response to the worker in simple spoken language. Reassure them that learning the store takes time, don't use corporate jargon."
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          result = {
            rawText: text,
            issue: parsed.issue || issue,
            confidence: parsed.confidence || confidence,
            possibleImpact: parsed.possibleImpact || impact,
            category: parsed.category || category,
            summary: parsed.summary || result.summary,
            companionResponse: parsed.companionResponse || result.companionResponse,
          };
        }
      } catch (aiErr) {
        console.warn("AI generation failed, using deterministic structured signal:", aiErr);
      }
    }

    res.json(result);
  } catch (err: any) {
    console.error("Error in understand-daily:", err);
    res.status(500).json({ error: err.message || "Failed to analyze signal" });
  }
});

// 3. Work Companion Quick Help (Ask the system)
app.post("/api/companion/ask", async (req, res) => {
  try {
    const { question, dayNumber = 3, role = "Dark Store Picker" } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Missing 'question' parameter." });
    }

    const ai = getGenAI();

    // Default pragmatic store guidance
    let answer = "Check the aisle marker first. Aisles 1-3 are Dry Groceries & Snacks, Aisles 4-5 are Beverages, Aisles 6-7 are Home Care, and Aisle 8 is Cold Storage. If an item isn't on the shelf, tap 'Item Missing' on your scanner so replenishment is notified.";

    const qLower = question.toLowerCase();
    if (qLower.includes("dairy") || qLower.includes("milk") || qLower.includes("cold") || qLower.includes("ice cream")) {
      answer = "Cold Storage & Dairy are in Chiller Zone A (Aisle 8). Pick chilled and frozen items LAST so they don't melt or warm up while you complete the rest of the cart.";
    } else if (qLower.includes("barcode") || qLower.includes("scan") || qLower.includes("won't scan") || qLower.includes("damaged")) {
      answer = "If a barcode won't scan after 2 tries: 1. Wipe the camera/scanner glass. 2. If wrinkled, smooth it with your thumb. 3. If torn, enter the last 4 digits of the SKU manually on screen.";
    } else if (qLower.includes("break") || qLower.includes("lunch") || qLower.includes("rest")) {
      answer = "Shift breaks are 30 mins for lunch and two 15-min tea breaks. Inform your shift supervisor (Suresh K.) before clocking out so orders are reassigned.";
    } else if (qLower.includes("missing") || qLower.includes("out of stock") || qLower.includes("not on rack")) {
      answer = "Don't spend more than 30 seconds searching one bin. Tap 'Item Not Found' -> 'Check Backstock'. If empty, skip to next item to protect your 10-minute order dispatch timer.";
    }

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: `You are a helpful, respectful, friendly peer work companion for a blue-collar ${role} in a high-speed quick-commerce dark store (Day ${dayNumber} on the job).
The worker asked: "${question}"
Answer in 2-3 simple, very practical sentences.
Rules:
- NO corporate buzzwords, NO course or LMS references.
- Concrete store instructions (e.g. rack numbers, scanner taps, buddy help).
- Warm, plain English or clear language.`,
        });

        if (response.text) {
          answer = response.text.trim();
        }
      } catch (e) {
        console.warn("Companion ask fallback used:", e);
      }
    }

    res.json({ answer });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to process question" });
  }
});

// 4. Pattern Detection and Action Recommendation
app.post("/api/signals/detect-pattern", async (req, res) => {
  try {
    const {
      newHire = { name: "Rahul", dayNumber: 3 },
      dailySignals = [],
      managerSignals = [],
      workSignals = [],
      currentPickRate = 35,
      targetPickRate = 50,
      accuracy = 98,
    } = req.body;

    const ai = getGenAI();

    // Deterministic rules engine:
    // Case 1: Pick rate gap with high accuracy + worker reports location/confusion + manager notes support
    const hasLocationConfusion = dailySignals.some(
      (s: any) =>
        s.issue?.toLowerCase().includes("location") ||
        s.rawText?.toLowerCase().includes("confused") ||
        s.rawText?.toLowerCase().includes("where") ||
        s.rawText?.toLowerCase().includes("aisle")
    );
    const managerNeedsSupport = managerSignals.some(
      (m: any) => m.state === "Needs support" || m.state === "Struggling"
    );
    const speedGap = targetPickRate - currentPickRate;

    let pattern = "Normal Ramp Adaptation";
    let patternConfidence = "Medium";
    let diagnosis = "Employee is progressively developing physical store muscle memory.";
    let action = {
      type: "no_action",
      title: "Continue Regular Shift Progression",
      description: "Monitor standard pick speed ramp. No special intervention required at this stage.",
      targetActor: "Supervisor",
      urgency: "Monitor",
      smallestPracticalStep: "Check daily pick rate at end of shift.",
      checkAfterDays: 1,
    };

    if (hasLocationConfusion && speedGap > 10 && accuracy >= 95) {
      pattern = "Environmental/process familiarity issue";
      patternConfidence = "High";
      diagnosis = `New hire reports confusion finding product racks + Manager noted need for frequent support + Pick rate (${currentPickRate}/hr) lags target (${targetPickRate}/hr) while accuracy is strong (${accuracy}%). This confirms the blocker is dark store spatial layout navigation, not effort or carelessness.`;
      action = {
        type: "buddy_walkthrough",
        title: "Buddy Walkthrough of Location Navigation & Aisle 4-8 Re-demonstration",
        description: "Pair with Senior Picker (Vikram) for a 15-minute guided run through high-frequency snack/beverage aisles and rack shelf code conventions. Check again during next shift.",
        targetActor: "Buddy (Vikram - Senior Picker)",
        urgency: "Next Shift",
        smallestPracticalStep: "Spend 15 mins walking Aisles 4-8 together before peak order rush.",
        checkAfterDays: 1,
      };
    } else if (managerNeedsSupport && accuracy < 92) {
      pattern = "Process verification / Item verification friction";
      patternConfidence = "High";
      diagnosis = `Accuracy is lower than 95% threshold (${accuracy}%) with manager flagging process support. Worker may be guessing or scanning wrong variant (e.g. 200g vs 500g pack).`;
      action = {
        type: "demonstrate_task",
        title: "SKU Variant & Barcode Double-Check Demonstration",
        description: "Manager demonstrates the 3-point check (Brand, Grammage, Barcode) on 5 tricky product categories.",
        targetActor: "Manager (Suresh K.)",
        urgency: "Immediate",
        smallestPracticalStep: "10-minute floor demo on variant checking.",
        checkAfterDays: 1,
      };
    }

    if (ai) {
      try {
        const prompt = `You are the pattern detection engine of "New Hire Intelligence".
A new hire (${newHire.name}, Day ${newHire.dayNumber} as Dark Store Picker) has the following signals:
Daily Employee Signal: ${JSON.stringify(dailySignals)}
Manager Input: ${JSON.stringify(managerSignals)}
Work Performance: Target pick rate: ${targetPickRate}, Current pick rate: ${currentPickRate}, Accuracy: ${accuracy}%

Analyze the connection between what the worker felt, what the manager observed, and the work metrics.
CRITICAL PRINCIPLE: Do NOT assume every problem requires learning or courses.
Identify:
1. What is happening?
2. Why might it be happening?
3. Who needs to act? (Smallest practical action: buddy support, manager observation, explain process, provide SOP, demonstrate task, let employee try again, practice, clarify expectations, escalate issue, or no action).
4. Did the situation improve criteria.

Respond ONLY in JSON format:
{
  "pattern": "Concise pattern name (e.g. 'Environmental/process familiarity issue')",
  "patternConfidence": "High" | "Medium" | "Low",
  "diagnosis": "2-3 sentences explaining the connected root cause",
  "action": {
    "type": "buddy_walkthrough" | "manager_observation" | "demonstrate_task" | "explain_process" | "provide_sop" | "let_try_again" | "practice" | "clarify_expectations" | "escalate_issue" | "no_action",
    "title": "Action title",
    "description": "Practical 1-2 sentence action description",
    "targetActor": "Buddy (Senior Picker)" | "Manager (Supervisor)" | "Employee" | "Operations",
    "urgency": "Immediate" | "Next Shift" | "Monitor",
    "smallestPracticalStep": "The absolute smallest practical step to take",
    "checkAfterDays": 1
  }
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          if (parsed.pattern && parsed.action) {
            pattern = parsed.pattern;
            patternConfidence = parsed.patternConfidence || patternConfidence;
            diagnosis = parsed.diagnosis || diagnosis;
            action = parsed.action;
          }
        }
      } catch (aiErr) {
        console.warn("AI pattern detection failed, using rule-based pattern:", aiErr);
      }
    }

    res.json({
      pattern,
      patternConfidence,
      diagnosis,
      action,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to detect pattern" });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`New Hire Intelligence server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
