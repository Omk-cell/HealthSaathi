import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini API client
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Healthcare triage API endpoint
  app.post("/api/check-symptoms", async (req, res) => {
    try {
      const { symptomDescription } = req.body;
      if (!symptomDescription || typeof symptomDescription !== "string") {
        return res.status(400).json({ error: "Symptom description is required" });
      }

      // Check key existence
      if (!apiKey) {
        // Return a fully-featured clinical mock response with appropriate indicators when API key is missing
        return res.json({
          fallback: true,
          modelResponse: {
            reply: `You entered: "${symptomDescription}". Our medical analysis engine is currently running in trial/sandbox mode because the Google Gemini API key has not been configured in Secrets. Here is educational guidance for you:`,
            possibleConditions: [
              {
                name: "Mild Acute Infection or Common Coryza",
                probability: "High",
                explanation: "Symptom presentations of minor body aches or upper respiratory features align with standard viral replication cycles."
              },
              {
                name: "Tension Headaches or Stress Somatization",
                probability: "Medium",
                explanation: "Psychological overload or ergonomic strain manifests clinically as vascular muscle spasms in cranial regions."
              }
            ],
            urgencyLevel: "Low",
            recommendedSpecialist: "General Practitioner / Family Physician",
            suggestedActions: [
              "Maintain plentiful hydration with water and warm fluids.",
              "Track your temperature and blood pressure logs twice daily.",
              "Seek professional physical evaluation if discomfort intensifies or persists over 72 hours."
            ]
          }
        });
      }

      const systemInstruction = `You are HealthSaathi Clinical AI, an expert medical triaging computer assistant.
Evaluate patient symptom inputs thoroughly, categorize them clinically, and return a JSON object.
Never diagnostic, but rather triage advisory.

Strictly return results adhering to this exact JSON structure and nothing else.
All fields must be filled. Do not wrap output in markdown blocks like \`\`\`json. Return bare raw JSON.

JSON Structure:
{
  "reply": "A brief, supportive, professional summary of their described symptoms (under 3 sentences), reminding them that physical evaluations are vital.",
  "possibleConditions": [
    {
      "name": "Condition Name",
      "probability": "High" | "Medium" | "Low",
      "explanation": "A very brief clinical explanation of 1 sentence relating the candidate pathology to their input symptoms."
    },
    {
      "name": "Alternative Condition Name",
      "probability": "High" | "Medium" | "Low",
      "explanation": "A very brief explanation of 1 sentence."
    }
  ],
  "urgencyLevel": "Low" | "Moderate" | "Urgent" | "Emergency",
  "recommendedSpecialist": "The specific field specialist (e.g. Cardiologist, Neurologist, General Practitioner, Allergist, Gastroenterologist)",
  "suggestedActions": [
    "A supportive supportive action (e.g., rest, hydration, monitoring parameter)",
    "A critical indicator to watch for when a clinic visit is necessary",
    "A firm warning in case urgent attention is needed"
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Patient reports: "${symptomDescription}"`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.1,
        }
      });

      const responseText = response.text || "";
      let parsedData;
      try {
        parsedData = JSON.parse(responseText.trim());
      } catch (err) {
        console.warn("Raw JSON parsing failed, attempting markdown cleanup:", err);
        const cleanJSON = responseText.replace(/```json/gi, "").replace(/```/gi, "").trim();
        parsedData = JSON.parse(cleanJSON);
      }

      return res.json({ modelResponse: parsedData });
    } catch (error: any) {
      console.error("Clinical assessment error:", error);
      return res.status(500).json({ error: error?.message || "Internal server error during assessment." });
    }
  });

  // Serve static assets or mount Vite dev middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server loaded and running on http://localhost:${PORT}`);
  });
}

startServer();
