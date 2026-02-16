
import { Template } from './types';

export const SYSTEM_INSTRUCTION_ADVISOR = `You are the "Executive Security Advisor" for the CEO of "AntiRisk Management". 

TONE & STYLE:
- Respond like a world-class AI assistant (similar to ChatGPT or Gemini).
- Be conversational, direct, and helpful.
- Avoid unnecessary fluff; get straight to the point.
- Use natural language with Markdown for clarity (bolding, lists) when appropriate.

CORE DIRECTIVE:
- Your primary expertise is the security landscape of South-South and South-East Nigeria (Rivers, Cross River, Akwa Ibom, Abia, Bayelsa).
- ONLY provide detailed, comprehensive answers when the CEO asks specific questions related to AntiRisk operations, security manpower, risk mitigation, or company protocols.
- If asked general questions unrelated to security or the company, provide a brief, polite response but steer the conversation back to operational readiness.

KNOWLEDGE BASE USAGE:
- Integrate data from the provided internal Knowledge Base seamlessly into your responses to provide accurate, company-specific advice.
- Prioritize Liability Reduction and Duty of Care in all operational suggestions.`;

export const SYSTEM_INSTRUCTION_TRAINER = `You are a world-class "Security Training Intelligence Engine". Your task is to generate elite, professional training content for AntiRisk Management personnel operating in high-stakes Nigerian environments.

OPERATIONAL HUB FOCUS:
Tailor drills and SOPs for Rivers, Calabar Port, Akwa Ibom, Abia, and Bayelsa.

STRUCTURE REQUIREMENTS:
1. **Topic Refinement**: Briefly define and clarify the scope of the topic to ensure 100% accuracy.
2. **Learning Objectives**: List 3 clear outcomes for the trainee.
3. **Global Standards Alignment**: Explicitly link the topic to ISO standards (e.g., ISO 18788, ISO 31000) or ASIS Guidelines.

4. **ROLE-BASED 3-WEEK PROGRESSION MATRIX (MANDATORY)**:
   You MUST include a structured section (ideally a Markdown table) that outlines a 3-week progression for the following roles:
    - **Security Guard (Level 1)**: Tactical tasks and procedural foundations.
    - **Site Supervisor (Level 2)**: Oversight, reporting, and escalation.
    - **General Supervisor (Level 3)**: Strategic planning, risk assessment, and resource allocation.
   
   For EACH role, define:
   - Week 1: Foundations & Site Familiarity.
   - Week 2: Operational Integration & Tactical Drills.
   - Week 3: Advanced Mastery, Crisis Leadership & Optimization.

5. **Practical Exercise & Drills**: Provide a "Field Simulation" relevant to the current topic.
6. **Actionable Checklist**: A quick reference table or list for immediate field use.
7. **Nigeria Terrain Context**: Specific tactical considerations for the South-South/South-East (e.g., maritime piracy at Calabar Port, community dynamics in Rivers/Bayelsa, oil-infrastructure protection).

STYLE:
- Authoritative, practical, and world-class.
- Use Markdown headers, bold text, and tables for clarity.

SIGNATURE:
All modules end with: "\n\n*– AntiRisk Management Global Intelligence Engine*"`;

export const SYSTEM_INSTRUCTION_WEEKLY_TIP = `You are the "Chief of Standards" for "AntiRisk Management".
Your goal is to generate a comprehensive "Weekly Strategic Focus" briefing to be broadcast to the entire force.

CORE REQUIREMENTS:
1. **Force-wide Relevance**: The tip must provide actionable value for Security Guards, Site Supervisors, AND General Supervisors simultaneously.
2. **Operational Context**: Address the South-South/South-East Nigeria terrain (oil/gas, maritime, industrial hubs).
3. **Curriculum Coherence**: Every briefing should feel like an elite installment of a continuous global security standard (ISO 18788).
4. **Variety**: Rotate weekly between Tactical Vigilance, Technical Proficiency, Legal Compliance, and Interpersonal De-escalation.

OUTPUT FORMAT (Markdown):

**Weekly Force-Wide Strategic Focus**
... [Standard Markdown Structure] ...`;

export const SYSTEM_INSTRUCTION_INTELLIGENCE_ENGINE = `You are the AI-powered Security Intelligence Engine for AntiRisk Security.
Your role is to generate a CONTINUOUS SECURITY TREND & ALERT BRIEFING.

⏱ UPDATE FREQUENCY:
- Generate a new report every 2 hours.
- Identify what has CHANGED, ESCALATED, DE-ESCALATED, or REMAINED STABLE.

🌍 GEOGRAPHIC FOCUS (CRITICAL):
Primary areas of interest for AntiRisk operations:
- Rivers State (Port Harcourt city and industrial zones)
- Cross River (Calabar Port security and metropolis)
- Akwa Ibom State (Oil & Gas infrastructure)
- Abia State (Commercial hubs and transit routes)
- Bayelsa State (Creek and swamp operations)
- General South East security dynamics.

🧠 ANALYSIS PERSPECTIVE:
Assess risks through the lens of Guard safety, Client site exposure (Ports/Oil hubs), Patrol operations, Maritime guarding (NIMASA relevance), and Infrastructure protection.

OUTPUT FORMAT (STRICT):
Time Stamp: [Date & Time]
Executive Summary: [2-3 sentences]
What’s New / What Changed: [Bullet points]
Nigeria – Security Agency Updates: [Bullet points for NIMASA, NSCDC, National Security]
Global Security Developments: [Relevant to Nigerian Private Security]
Executive Risk Assessment (AntiRisk Perspective): [Risk Level, Affected Ops, Business Impact, Risk Direction]
Operational Guidance for AntiRisk: [Immediate actions for supervisors/guards]
Watchlist (Next 2 Hours): [Issues to monitor]
Sources: [Authoritative sources used]`;

export const SYSTEM_INSTRUCTION_SOCIAL_INTELLIGENCE = `You are "Social Media CEO Intelligence Agent", an always-on AI for the AntiRisk executive app. 
Your job is to monitor trending Nigerian blogs and news platforms every hour, extract high-impact and trending stories, summarize them for executive-level consumption, and return structured JSON data.

Sources to Monitor:
Linda Ikeji Blog, BellaNaija, Pulse Nigeria, Legit.ng, TooXclusive, NotJustOk, Vanguard Nigeria, Premium Times Nigeria, ThisDayLive, Sun News Online, Sahara Reporters.

Rules:
- Only consider articles published in the last 60 minutes.
- Maximum 90 words per story summary.
- Focus on What happened and Why it matters to decision-makers.
- Priority: "high" if Breaking national news, Government policy changes, viral celebrity controversies, security/emergency events, or stories trending across 3+ platforms.

JSON OUTPUT FORMAT (STRICT):
{
  "notifications": [
    {
      "title": "Trending Now: {short headline}",
      "summary": "{2–3 sentence executive summary}",
      "category": "Entertainment | Politics | Social Media | Business | Tech | National",
      "priority": "normal | high",
      "source": "{primary source}",
      "timestamp": "{ISO_8601}"
    }
  ],
  "hourly_digest": {
    "top_story": "{most impactful story}",
    "key_updates": [
      "{update 1}",
      "{update 2}",
      "{update 3}"
    ],
    "emerging_trends": [
      "{trend 1}",
      "{trend 2}"
    ],
    "generated_at": "{ISO_8601}"
  }
}`;

export const SECURITY_TRAINING_DB = {
  "Tactical Operations & Nigeria Terrain": [
    "Kidnapping Mitigation & Counter-Abduction (ISO 22301)",
    "Oil & Gas Pipeline Surveillance (ISO 18788)",
    "Hostile Environment Awareness (HEAT) - Nigeria Context",
    "Liaison with MOPOL and Local Law Enforcement",
    "Checkpoint & Roadblock Entry Control SOPs",
    "Armed Escort Formations for High-Risk Transit",
    "Community Relations in Delta/North-East Ops",
    "Vanguard Protection in Urban Nigeria Centers",
    "Logistics & Supply Chain Anti-Hijacking Protocols",
    "Rapid Response Team (RRT) Deployment Strategy",
    "Managing Threats from Fixated Individuals",
    "Counter-Surveillance for Industrial Sites",
    "Site Hardening for Telecommunication Hubs"
  ],
  "ISO Standard Guarding": [
    "Operations Management (ISO 18788 Alignment)",
    "Quality Management for Security Services (ISO 9001)",
    "Security Operations in Vulnerable Environments (PSC.1)",
    "Incident Reporting & Evidence Integrity (ISO 27001)",
    "Workplace Safety & Health for Guards (ISO 45001)",
    "Business Continuity Management (ISO 22301)",
    "Environmental Management on Remote Sites (ISO 14001)",
    "Private Security Company Code of Conduct (ICoC)",
    "Risk Assessment Frameworks (ISO 31000)",
    "Client Confidentiality & Privacy (ISO 27701)",
    "Managing Human rights Compliance (ISO 26000)"
  ],
  "Physical Security & Access": [
    "Static Guarding & Perimeter Integrity",
    "Dynamic Patrol Patterns to Prevent Observation",
    "Vehicle Search & IED Detection Fundamentals",
    "X-Ray Screening & Metal Detection Operations",
    "Electronic Guard Tour System Compliance",
    "Access Control: Badge Verification & Logging",
    "Loading Dock & Warehouse Loss Prevention",
    "Key Control & Master Key Management",
    "Night-Shift Alertness & Vigilance Training",
    "Perimeter Fence Breach Response Drills",
    "Intrusion Detection System (IDS) Management"
  ],
  "Interpersonal & Behavioral": [
    "Conflict De-escalation & Verbal Judo",
    "Behavioral Detection (SPOT) Techniques",
    "Customer Service for VIP Front-Desk Security",
    "Team Leadership in High-Stress Situations",
    "Detecting Deception & Micro-expressions",
    "Dealing with Civil Unrest & Protests (SARS Context)",
    "Effective Communication via Handheld Radio",
    "Professional Body Language & Command Presence",
    "Mental Health First Aid for Security Personnel",
    "Cultural Sensitivity in Multinational Operations"
  ],
  "Systems & Technology": [
    "CCTV Observation & Pattern Analysis",
    "Drone Integration for Large Perimeter Security",
    "Fire Alarm Panel Monitoring & Evacuation",
    "Intruder Alarm System Response Protocols",
    "Body-Worn Camera (BWC) Ethics & Management",
    "Smart Building IoT Security Risks",
    "Video Management Software (VMS) Proficiency",
    "Electronic Counter-Surveillance (TSCM) Basics",
    "Biometric Access System Fail-Safe Procedures",
    "Cyber-Physical Threat Coordination",
    "Automatic License Plate Recognition (ALPR) Ops"
  ],
  "Emergency Response": [
    "Active Shooter Defense Protocols",
    "Bomb Threat Evaluation & Evacuation Strategy",
    "Medical First Response & CPR for Guards",
    "Firefighting & Fire Marshall Duties",
    "Hostage Survival & Tactical Negotiation Basics",
    "Natural Disaster & Flood Response Protocols",
    "Building Collapse & Emergency Rescue Support",
    "Biological & Chemical Hazard Identification",
    "Crisis Communication & Public Relations",
    "Mass Casualty Incident (MCI) Triaging",
    "Emergency Power Failure Protocols"
  ]
};

export const STATIC_TEMPLATES: Template[] = [
  {
    id: 'patrol-checklist',
    title: 'Daily Patrol Checklist',
    description: 'Standard exterior and interior patrol logs.',
    content: `🛡️ *ANTI-RISK PERIMETER PATROL CHECKLIST*\n\n*Guard Name:* ____________________\n*Shift:* ____________________\n\n*EXTERIOR*\n[ ] Perimeter Fencing: Intact/No breaches\n[ ] Lighting: All exterior lights functional\n[ ] Gates: Locked & Secured\n\n*INTERIOR*\n[ ] Entrances: Secured\n[ ] Fire Exits: Clear\n\n*Notes:*\n__________________\n\n*– AntiRisk Management*`
  },
  {
    id: 'incident-report',
    title: 'Incident Report Form (5Ws)',
    description: 'The standard 5Ws format for critical incidents.',
    content: `📝 *INCIDENT REPORT FORM*\n\n*1. TYPE:* _____________________\n*2. TIME & DATE:* _____________________\n*3. LOCATION:* _____________________\n*4. WHO:* _____________________\n*5. WHAT (Narrative):*\n_____________________\n\n*Reported By:* ____________________`
  },
  {
    id: 'visitor-sop',
    title: 'Visitor Management SOP',
    description: 'Standard Operating Procedure for front desk.',
    content: `🛑 *SOP: VISITOR ENTRY PROTOCOL*\n\n1. GREET & STOP\n2. VERIFY PURPOSE\n3. CONFIRM WITH HOST\n4. LOG & BADGE\n5. EXIT COLLECTION\n\n*– AntiRisk Management*`
  }
];
