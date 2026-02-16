
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { 
  SYSTEM_INSTRUCTION_ADVISOR, 
  SYSTEM_INSTRUCTION_TRAINER, 
  SYSTEM_INSTRUCTION_WEEKLY_TIP, 
  SYSTEM_INSTRUCTION_INTELLIGENCE_ENGINE,
  SYSTEM_INSTRUCTION_SOCIAL_INTELLIGENCE
} from "../constants";
import { ChatMessage, StoredReport, KnowledgeDocument, WeeklyTip, SocialMediaIntel } from "../types";

// Dynamic Topic Suggestion Engine
export const fetchTopicSuggestions = async (query: string): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const prompt = `Act as a security training database index. 
    Based on the input "${query}", provide 5 world-class security training topic suggestions.
    Requirements:
    - Include ISO alignment where possible.
    - Focus on physical security manpower.
    - Return ONLY a JSON array of strings.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const results = JSON.parse(response.text || "[]");
    return results;
  } catch (error) {
    console.error("Topic Suggestion Error:", error);
    return [];
  }
};

/**
 * 1-Hourly Social Media Intelligence Agent
 */
export const fetchSocialMediaIntelligence = async (): Promise<SocialMediaIntel> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const prompt = `COMMAND: Perform real-time crawl of the specified Nigerian blogs and news platforms.
    Identify high-impact stories from the last 60 minutes.
    Focus on Politics, National, Social Media, and Security.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_SOCIAL_INTELLIGENCE,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Social Intel Error:", error);
    throw error;
  }
};

/**
 * 2-Hourly Global & Nigeria Security Intelligence Engine
 */
export const generateSecurityIntelligenceBriefing = async (previousBriefing?: string): Promise<{ text: string; sources: Array<{ title: string; url: string }> }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const prompt = `COMMAND: Generate the 2-Hourly Security Intelligence Briefing.
    
    PRIMARY REGIONS OF INTEREST:
    - Rivers State (Port Harcourt City/Industrial)
    - Cross River (Calabar Port & metropolis)
    - Akwa Ibom State
    - Abia State
    - Bayelsa State
    - South East region hotspots.

    PREVIOUS BRIEFING CONTEXT (Identify what changed since this):
    ${previousBriefing || 'No previous briefing available. This is the initial report for this session.'}
    
    TASKS:
    1. SEARCH: Perform a real-time crawl of global security news and specific updates from NIMASA, NSCDC, DSS, and Nigerian military relevant to the above regions.
    2. ANALYZE: Identify new developments in the last 2 hours (e.g., piracy alerts at Calabar Port, unrest in Rivers, or infrastructure threats in Bayelsa/Akwa Ibom).
    3. COMPARE: Explicitly state what has escalated, de-escalated, or remained stable.
    4. IMPACT: Assess risks specifically for AntiRisk Management personnel and client sites.
    5. FORMAT: Adhere strictly to the requested Executive Briefing format.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_INTELLIGENCE_ENGINE,
        tools: [{ googleSearch: {} }],
      }
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter((chunk: any) => chunk.web?.uri)
      .map((chunk: any) => ({
        title: chunk.web.title,
        url: chunk.web.uri
      })) || [];

    return { 
      text: response.text || "Failed to generate intelligence briefing.",
      sources: sources
    };
  } catch (error) {
    console.error("Intelligence Briefing Error:", error);
    throw error;
  }
};

/**
 * Training Module Generator
 */
export const generateTrainingModule = async (
  topic: string, 
  role: string = 'All Roles', 
  week: string = 'Standalone'
): Promise<{ text: string; sources?: Array<{ title: string; url: string }> }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const prompt = `COMMAND: Generate a mission-critical Training Module.
    TOPIC: "${topic}"
    PRIMARY TARGET ROLE: "${role}"
    CURRICULUM PHASE: "${week}"
    
    CORE REQUIREMENTS:
    1. ROLE TAILORING: Prioritize depth for "${role}" but include a mandatory "3-Week Progression Matrix" for ALL THREE roles: Security Guard, Site Supervisor, and General Supervisor.
    2. 3-WEEK PROGRESSION MATRIX (MANDATORY): For each of the three roles, detail specific learning milestones or tasks for Week 1, Week 2, and Week 3, aligning with the topic's complexity and the role's responsibilities.
    3. RESEARCH & REFINE: Use Google Search to find the latest global security best practices and ISO standards (ISO 18788, ISO 31000) for this topic.
    4. OBJECTIVES: List 3 clear learning outcomes specific to the "${role}" level.
    5. PRACTICAL: Include a "Role-Specific Field Drill" and a "CEO/Manager Oversight Checklist".
    6. NIGERIA TERRAIN: Explicitly contextualize for AntiRisk hubs: Rivers, Calabar Port, and Bayelsa.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_TRAINER,
        tools: [{ googleSearch: {} }],
      }
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter((chunk: any) => chunk.web?.uri)
      .map((chunk: any) => ({
        title: chunk.web.title,
        url: chunk.web.uri
      })) || [];

    return { 
      text: response.text || "Failed to generate training content.",
      sources: sources.length > 0 ? sources : undefined
    };
  } catch (error) {
    console.error("Training Gen Error:", error);
    return { text: "Error generating training content." };
  }
};

// Advisor Chat with History and Knowledge Base
export const generateAdvisorResponse = async (
  history: ChatMessage[], 
  currentMessage: string,
  knowledgeBase: KnowledgeDocument[] = []
): Promise<{ text: string; sources?: Array<{ title: string; url: string }> }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const kbContext = knowledgeBase.length > 0 
      ? `INTERNAL KNOWLEDGE BASE DATA (Use this for company-specific answers):
         ${knowledgeBase.map(doc => `--- DOCUMENT: ${doc.title} ---\n${doc.content}`).join('\n\n')}`
      : "NO INTERNAL KNOWLEDGE BASE AVAILABLE.";

    const conversationContext = history.map(h => `${h.role.toUpperCase()}: ${h.text}`).join('\n');
    
    const fullPrompt = `${kbContext}\n\nPREVIOUS CONVERSATION HISTORY:\n${conversationContext}\n\nCEO's QUESTION:\n${currentMessage}`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: fullPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_ADVISOR,
        thinkingConfig: { thinkingBudget: 0 } // Super fast responses
      }
    });

    return { text: response.text || "I apologize, I'm having trouble processing that query." };
  } catch (error) {
    console.error("Advisor Error:", error);
    return { text: "I am having trouble connecting to my secure intelligence vault right now." };
  }
};

// Best Practices Grounding (Legacy functionality, now largely handled by Intelligence Briefing)
export const fetchBestPractices = async (topic: string): Promise<{ text: string; sources?: any[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Find the latest global security best practices regarding: "${topic}".`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter((chunk: any) => chunk.web?.uri)
      .map((chunk: any) => ({
        title: chunk.web.title,
        url: chunk.web.uri
      })) || [];

    return { text: response.text || "No best practices found.", sources };
  } catch (error) {
    console.error("Best Practices Error:", error);
    return { text: "Unable to fetch online best practices." };
  }
};

// Training Topic Suggestions from Reports
export const getTrainingSuggestions = async (recentReports: StoredReport[]): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const context = recentReports.length > 0 
      ? `RECENT INTERNAL INCIDENTS:\n${recentReports.slice(0, 5).map(r => `- ${r.content.substring(0, 100)}...`).join('\n')}`
      : "NO RECENT INTERNAL INCIDENTS.";

    const prompt = `Based on the following context, suggest 3 specific, high-value training topics for security guards: ${context}`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    const text = response.text || "";
    return text.split('\n').map(t => t.replace(/^\d+\.\s*/, '').trim()).filter(t => t.length > 0);
  } catch (error) {
    console.error("Suggestion Error:", error);
    return ["Access Control", "Emergency Response"];
  }
};

// Weekly Strategic Tip Generator (Force-wide)
export const generateWeeklyTip = async (previousTips: WeeklyTip[], requestedTopic?: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const recentTopics = previousTips.slice(0, 5).map(t => t.topic).join(", ");
    const userPrompt = requestedTopic 
      ? `COMMAND: Generate a force-wide weekly strategic focus briefing specifically about: "${requestedTopic}".`
      : `COMMAND: Identify a mission-critical tactical or procedural focus for this week that is not in [${recentTopics}]. Generate a comprehensive force-wide briefing.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_WEEKLY_TIP,
      }
    });

    return response.text || "Failed to generate strategic briefing.";
  } catch (error) {
    console.error("Weekly Tip Gen Error:", error);
    return "Error generating force-wide strategic briefing.";
  }
};

// Report Analyzer
export const analyzeReport = async (reportText: string, previousReports: StoredReport[] = []): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const prompt = `Analyze the following security incident or daily report for "AntiRisk Management": ${reportText}`;
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text || "Analysis failed.";
  } catch (error) {
    console.error("Analysis Error:", error);
    return "Error analyzing report.";
  }
};

// Patrol Optimization Analyzer
export const analyzePatrolEffectiveness = async (reports: StoredReport[], knowledgeBase: KnowledgeDocument[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const incidentData = reports.map(r => r.content).join('\n');
    const prompt = `As a Security Strategist, evaluate patrol effectiveness based on: ${incidentData}`;
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text || "Optimization analysis failed.";
  } catch (error) {
    console.error("Patrol Optimization Error:", error);
    return "Error generating analysis.";
  }
};
