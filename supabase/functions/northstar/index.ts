import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

async function callGPT5({
  messages,
  responseAsJson = false,
  maxTokens = 1200,
  temperature = 0.4,
  timeoutMs = 20000
}: {
  messages: ChatMsg[];
  responseAsJson?: boolean;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);

  // Get environment variables
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  const aimlBase = Deno.env.get('AIML_API_BASE');
  const aimlKey = Deno.env.get('AIML_API_KEY');
  const gpt5Model = Deno.env.get('GPT5_MODEL');
  
  console.log('Environment check - OPENAI_API_KEY:', openaiKey ? 'SET' : 'MISSING');
  console.log('Environment check - AIML_API_BASE:', aimlBase ? 'SET' : 'MISSING');
  console.log('Environment check - AIML_API_KEY:', aimlKey ? 'SET' : 'MISSING');
  console.log('Environment check - GPT5_MODEL:', gpt5Model ? `SET (${gpt5Model})` : 'MISSING');

  try {
    let apiUrl, apiKey, model;
    
    // Prefer AIML API with GPT-5 model if available
    if (aimlBase && aimlKey && gpt5Model) {
      apiUrl = `${aimlBase}/chat/completions`;
      apiKey = aimlKey;
      model = gpt5Model;
      console.log('Using AIML API with model:', model);
    } else if (openaiKey) {
      // Fallback to OpenAI
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      apiKey = openaiKey;
      model = gpt5Model || "gpt-4o";
      console.log('Using OpenAI API with model:', model);
    } else {
      throw new Error('No API keys available - need either OPENAI_API_KEY or both AIML_API_BASE, AIML_API_KEY, and GPT5_MODEL');
    }

    // Check if it's a newer model that uses max_completion_tokens
    const isNewModel = /(gpt-5|o3|o4|gpt-4\.1)/.test(model);
    const payload: Record<string, any> = { model, messages };
    
    if (responseAsJson) {
      payload.response_format = { type: "json_object" };
    }
    
    if (isNewModel) {
      payload.max_completion_tokens = maxTokens;
      // temperature not supported for newer models
    } else {
      payload.max_tokens = maxTokens;
      payload.temperature = temperature;
    }

    console.log('Making API request to:', apiUrl);
    console.log('Request payload model:', model);
    
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      signal: ctrl.signal,
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(`API Error ${res.status}:`, errText);
      throw new Error(`API HTTP ${res.status}: ${errText}`);
    }

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content ?? "";
    console.log('API response received, content length:', content.length);
    return content;
  } finally {
    clearTimeout(t);
  }
}

async function chat(system: string, user: string, opts?: Partial<Parameters<typeof callGPT5>[0]>) {
  return callGPT5({
    messages: [
      { role: "system", content: system },
      { role: "user", content: user }
    ],
    ...(opts ?? {})
  });
}

// Helper function to check if any AI API is available
function hasAnyAIAPI(): boolean {
  const hasOpenAI = Boolean(Deno.env.get('OPENAI_API_KEY'));
  const hasAIML = Boolean(Deno.env.get('AIML_API_BASE') && Deno.env.get('AIML_API_KEY'));
  console.log('API availability check:', { hasOpenAI, hasAIML });
  return hasOpenAI || hasAIML;
}

// Shared schemas
const SCORES_FIELDS = `money, mastery, health, impact, autonomy, optionality`;
const TIMELINE_SCHEMA = `
Return JSON:
{
  "timelines":[
    {
      "id":"string",
      "label":"string",
      "rationale":"string",
      "scores":{ "money":0..1, "mastery":0..1, "health":0..1, "impact":0..1, "autonomy":0..1, "optionality":0..1 },
      "years":[
        {
          "y": number,
          "milestones": [ "string", ... ],
          "incomeL": number?, "saveL": number?, "eqL": number?,
          "skills": [ "string", ... ]?,
          "sleep": 0..1?, "travel": 0..1?, "impactP": number?,
          "flags": [ "string", ... ]?
        }
      ]
    }
  ]
}
`;

// Create mock data that matches the user's profile
function createMockData(input: any) {
  const goals = input?.profile?.goals_ranked ?? ["Money","Impact","Autonomy","Mastery","Health","Optionality"];
  const weightMap: Record<string, number> = {};
  goals.forEach((g: string, idx: number) => { weightMap[g] = (goals.length - idx) / goals.length; });

  const mkScores = (bias: Partial<Record<string, number>>) => {
    const clamp = (x: number) => Math.max(0.4, Math.min(0.95, x));
    const base: any = { money: 0.7, mastery: 0.7, health: 0.7, impact: 0.7, autonomy: 0.7, optionality: 0.7 };
    Object.entries(bias).forEach(([k, v]) => { (base as any)[k] = clamp((base as any)[k] + (v as number)); });
    return base;
  };

  const years = Array.from({ length: input.horizon_years ?? 3 }, (_, i) => ({
    y: i + 1,
    milestones: [
      `Year ${i + 1}: Ship key project in ${input?.profile?.domains?.[0] ?? 'AI/ML'}`,
      `Year ${i + 1}: Expand network and gain visibility`,
      `Year ${i + 1}: Build expertise and influence`,
    ],
    skills: ["Leadership", "Execution", "Strategic Thinking"],
  }));

  // Generate timelines based on mode (3 for Quick, 5 for Deep)
  const numTimelines = input.ui_prefs?.mode === 'Deep' ? 5 : 3;
  const baseTimelines = [
    {
      id: 't1',
      label: 'Hybrid Growth Path',
      rationale: 'Balance stability and growth opportunities while building global network.',
      scores: mkScores({ impact: 0.1, mastery: 0.05, autonomy: 0.05 }),
      years,
    },
    {
      id: 't2', 
      label: 'Local Leadership Track',
      rationale: 'Focus on deep local impact and leadership development.',
      scores: mkScores({ money: 0.1, autonomy: 0.05 }),
      years,
    },
    {
      id: 't3',
      label: 'High-Growth Trajectory',
      rationale: 'Maximize growth potential with calculated risks and global exposure.',
      scores: mkScores({ money: 0.15, optionality: 0.1, impact: 0.05 }),
      years,
    },
  ];

  // Add additional timelines for Deep mode
  if (numTimelines === 5) {
    baseTimelines.push(
      {
        id: 't4',
        label: 'Innovation Pioneer Path',
        rationale: 'Lead cutting-edge innovation with high risk, high reward opportunities.',
        scores: mkScores({ mastery: 0.2, optionality: 0.15, impact: 0.1 }),
        years,
      },
      {
        id: 't5',
        label: 'Sustainable Excellence Track',
        rationale: 'Build lasting value with emphasis on health, relationships, and long-term impact.',
        scores: mkScores({ health: 0.15, impact: 0.1, autonomy: 0.1 }),
        years,
      }
    );
  }

  return baseTimelines;
}

async function simulateTimelines(input: any) {
  console.log('=== simulateTimelines called ===');
  console.log('Input:', JSON.stringify(input, null, 2));

  // Create fallback data based on user profile
  const createFallback = () => {
    console.log('Creating fallback timeline data');
    return { timelines: createMockData(input) };
  };

  // If no AI API is configured, return fallback immediately
  if (!hasAnyAIAPI()) {
    console.log('No AI API available -> using fallback timelines');
    return createFallback();
  }

  console.log('Attempting AI generation...');
  const system = `You are NorthStar. You turn decisions into clear multi-year timelines. 
Always return VALID JSON only. Do not include markdown fences. Keep outputs concise and realistic.`;

  // Calculate number of timelines based on mode
  const numTimelines = input.ui_prefs?.mode === 'Deep' ? 5 : 3;
  console.log(`Analysis mode: ${input.ui_prefs?.mode} -> Generating ${numTimelines} timelines`);

  const user = `
ProjectInput:
${JSON.stringify(input)}

Task:
Generate ${numTimelines} distinct ${input.horizon_years || 3}-year timelines for the provided decisions.
Each timeline must reflect trade-offs across ${SCORES_FIELDS}. Use the user's goals order as weights.
Avoid prose outside JSON. ${TIMELINE_SCHEMA}
`;

  try {
    const raw = await chat(system, user, { responseAsJson: true, maxTokens: 1400, temperature: 0.4 });
    console.log('AI raw response length:', raw.length);
    console.log('AI raw response preview:', raw.substring(0, 200) + '...'); 
    
    const data = JSON.parse(raw);
    // Basic validation
    if (!Array.isArray(data?.timelines) || data.timelines.length === 0) {
      console.log('Invalid AI response structure, using fallback');
      return createFallback();
    }
    
    console.log('AI generation successful');
    return data;
  } catch (e) {
    console.error('AI generation failed:', e.message);
    console.log('Falling back to mock timelines');
    return createFallback();
  }
}

async function computeTradeoffs(timelines: any, goals_ranked: string[], risk_appetite: string) {
  console.log('=== computeTradeoffs called ===');
  console.log('Timelines count:', timelines?.length);
  console.log('Goals:', goals_ranked);
  console.log('Risk appetite:', risk_appetite);

  // Create fallback tradeoffs
  const createFallback = () => {
    console.log('Creating fallback tradeoffs data');
    const keyMap: Record<string, keyof any> = {
      Money: 'money', Mastery: 'mastery', Health: 'health', Impact: 'impact', Autonomy: 'autonomy', Optionality: 'optionality'
    };
    const weights: Record<string, number> = {};
    (goals_ranked || []).forEach((g, i) => { 
      weights[keyMap[g] as string] = ((goals_ranked?.length || 6) - i) / (goals_ranked?.length || 6); 
    });

    const scoreTimeline = (t: any) => {
      let s = 0;
      for (const k in weights) s += (t.scores?.[k] ?? 0.5) * (weights as any)[k];
      const risk = (risk_appetite || 'Balanced').toLowerCase();
      if (risk.includes('high')) s += (t.scores?.optionality ?? 0.5) * 0.05;
      if (risk.includes('low')) s += (t.scores?.health ?? 0.5) * 0.05;
      return s;
    };

    const sorted = [...(timelines || [])].sort((a, b) => scoreTimeline(b) - scoreTimeline(a));
    const chosen = sorted[0] || timelines?.[0] || { id: 't1' };

    const pareto = (timelines || []).map((t: any) => ({
      timeline_id: t.id,
      dominant: Object.entries(t.scores || {}).filter(([_, v]) => (v as number) >= 0.8).map(([k]) => k),
      weak: Object.entries(t.scores || {}).filter(([_, v]) => (v as number) <= 0.6).map(([k]) => k),
    }));

    return {
      tradeoffs: {
        pareto,
        regret_min: 'Choosing based on present goals to minimize future regret while keeping options open.',
        recommendation: { chosen_timeline_id: chosen.id, why: 'Best weighted alignment with goals and risk preference.' }
      }
    };
  };

  // If no AI API is configured, return fallback immediately
  if (!hasAnyAIAPI()) {
    console.log('No AI API available -> using fallback tradeoffs');
    return createFallback();
  }

  console.log('Attempting AI tradeoff analysis...');
  const system = `You analyze candidate timelines and compute Pareto fronts and regret narratives. 
Return JSON only.`;

  const user = `
Timelines: ${JSON.stringify(timelines)}
Goals order: ${JSON.stringify(goals_ranked)}
Risk appetite: ${risk_appetite}

Task:
1) Compute "pareto": for each strong timeline, list dominant vs weak axes among ${SCORES_FIELDS}.
2) Compose "regret_min": a concise 'Future Me @ 70' narrative.
3) Produce "recommendation": chosen_timeline_id + why.

Return JSON:
{
  "tradeoffs":{
    "pareto":[{"timeline_id":"...", "dominant":["..."], "weak":["..."]}],
    "regret_min":"string",
    "recommendation":{"chosen_timeline_id":"...", "why":"string"}
  }
}
`;
  
  try {
    const raw = await chat(system, user, { responseAsJson: true, maxTokens: 800, temperature: 0.3 });
    console.log('AI tradeoffs raw response length:', raw.length);
    
    const result = JSON.parse(raw);
    if (!result.tradeoffs) {
      console.log('Invalid AI tradeoffs response, using fallback');
      return createFallback();
    }
    
    console.log('AI tradeoffs analysis successful');
    return result;
  } catch (e) {
    console.error('AI tradeoffs analysis failed:', e.message);
    console.log('Falling back to computed tradeoffs');
    return createFallback();
  }
}

async function compilePlan(input: any, chosenTimeline: any) {
  console.log('=== compilePlan called ===');
  console.log('Input profile name:', input?.profile?.name);
  console.log('Input profile goals:', input?.profile?.goals_ranked);
  console.log('Input profile domains:', input?.profile?.domains);
  console.log('Input ui_prefs mode:', input?.ui_prefs?.mode);
  console.log('Chosen timeline ID:', chosenTimeline?.id);
  console.log('Chosen timeline label:', chosenTimeline?.label);
  console.log('Chosen timeline milestones:', chosenTimeline?.years?.[0]?.milestones);
  
  // Create fallback plan (should only be used if AI fails)
  const createFallback = () => {
    console.log('WARNING: Using fallback plan data - AI generation failed');
    return {
      okr: [
        {
          o: "Build market presence and credibility",
          kr: [
            "Complete 50 customer interviews",
            "Launch MVP with 3 core features", 
            "Achieve 20% user retention rate",
            "Build network of 100+ industry contacts"
          ]
        },
        {
          o: "Develop core competencies",
          kr: [
            "Master 2 new technical skills",
            "Lead 3 successful project deliveries",
            "Mentor 2 junior team members",
            "Complete advanced certification"
          ]
        }
      ],
      weeks: Array.from({ length: 13 }, (_, i) => ({
        w: i + 1,
        tasks: [
          `Week ${i + 1}: Conduct 4 customer interviews`,
          `Week ${i + 1}: Iterate on core features`,
          `Week ${i + 1}: Network with industry peers`
        ],
        hab: ["Daily user feedback review", "Evening skill practice session"]
      })),
      blocks: [
        {
          t: "Customer Research",
          dur: 120,
          days: ["Mon", "Wed", "Fri"],
          time: "09:00"
        },
        {
          t: "Product Development",
          dur: 180,
          days: ["Tue", "Thu"],
          time: "10:00"
        },
        {
          t: "Networking & Learning",
          dur: 90,
          days: ["Sat"],
          time: "14:00"
        }
      ],
      resources: [
        {
          title: "Customer Interview Template",
          type: "doc",
          url: ""
        },
        {
          title: "Product Development Framework",
          type: "link",
          url: ""
        }
      ]
    };
  };

  // If no AI API is configured, return fallback immediately
  if (!hasAnyAIAPI()) {
    console.log('No AI API available -> using fallback plan');
    return createFallback();
  }

  console.log('Attempting AI plan generation with GPT-5...');
  
  // Create a detailed, contextual prompt
  const system = `You are NorthStar, an expert career strategist and life planner. You create highly personalized 90-day action plans that transform career aspirations into concrete, achievable steps.

CRITICAL: Create a plan that is SPECIFICALLY tailored to this person's profile, goals, and chosen timeline. DO NOT use generic content.

Your plan must be:
- Hyper-personalized to their background, goals, and industry
- Aligned with their chosen timeline and milestones
- Practical and immediately actionable
- Inspiring and motivating

Return ONLY valid JSON that matches this exact schema:
{
  "okr": [{"o":"string","kr":["string","string","string"]}],
  "weeks": [{"w":number,"tasks":["string","string","string"],"hab":["string","string"]}],
  "blocks": [{"t":"string","dur":number,"days":["Day","Day"],"time":"HH:MM"}],
  "resources": [{"title":"string","type":"doc","url":""}]
}`;

  const user = `
USER PROFILE:
Name: ${input.profile?.name || 'Professional'}
Age: ${input.profile?.age || 'N/A'}
Experience: ${input.profile?.experience_years || 'N/A'} years
Domains: ${input.profile?.domains?.join(', ') || 'General'}
Top Goals (in order of priority): ${input.profile?.goals_ranked?.join(', ') || 'Growth'}
Risk Appetite: ${input.profile?.risk_appetite || 'Balanced'}
Constraints: ${input.profile?.constraints?.join(', ') || 'None specified'}

CHOSEN TIMELINE: "${chosenTimeline?.label || 'Professional Growth'}"
Timeline Rationale: ${chosenTimeline?.rationale || 'Focus on balanced growth'}
Key Milestones: ${JSON.stringify(chosenTimeline?.years?.map(y => y.milestones) || [])}

PROJECT HORIZON: ${input.horizon_years || 3} years
ANALYSIS MODE: ${input.ui_prefs?.mode || 'Standard'} (shows user wants ${input.ui_prefs?.mode === 'Deep' ? 'detailed' : 'streamlined'} approach)

CREATE A PERSONALIZED 90-DAY ACTION PLAN:

1) OKRs (2-3 Objectives): Each objective must be specifically tailored to their goals (${input.profile?.goals_ranked?.[0]}, ${input.profile?.goals_ranked?.[1]}, etc.) and chosen path "${chosenTimeline?.label}". Include 3-4 measurable Key Results per objective.

2) Weekly Breakdown (13 weeks): Create specific, actionable tasks that build toward the OKRs. Reference their domain expertise (${input.profile?.domains?.[0]}) and experience level. Include 2-3 daily habits that support their top goals.

3) Time Blocks (4-5 blocks): Design recurring calendar blocks that match their work style and constraints. Consider their ${input.profile?.risk_appetite || 'balanced'} risk approach.

4) Resources (4-6 items): Suggest specific tools, frameworks, or learning materials relevant to their domain (${input.profile?.domains?.join(', ')}) and chosen timeline.

Make every element personal and specific - avoid generic language. Use their name, reference their goals, and align with their chosen "${chosenTimeline?.label}" path.

Return ONLY the JSON object - no other text.`;

  try {
    console.log('Sending plan generation request to GPT-5...');
    const raw = await chat(system, user, { responseAsJson: true, maxTokens: 1500, temperature: 0.3 });
    console.log('AI plan raw response received, length:', raw.length);
    console.log('AI plan response preview:', raw.substring(0, 200) + '...');
    
    const result = JSON.parse(raw);
    
    // Validate the result has expected structure
    if (!result.okr || !result.weeks || !result.blocks) {
      console.log('ERROR: Invalid AI plan structure, using fallback');
      console.log('Missing fields:', {
        okr: !result.okr,
        weeks: !result.weeks, 
        blocks: !result.blocks
      });
      return createFallback();
    }
    
    // Additional validation
    if (!Array.isArray(result.okr) || result.okr.length === 0) {
      console.log('ERROR: Invalid OKR structure');
      return createFallback();
    }
    
    console.log('✅ AI plan generation successful - contextual plan created');
    console.log('Generated OKRs count:', result.okr?.length);
    console.log('Generated weeks count:', result.weeks?.length);
    console.log('Generated blocks count:', result.blocks?.length);
    
    return result;
  } catch (error) {
    console.error('❌ AI plan generation failed:', error.message);
    console.log('Error details:', error);
    console.log('Falling back to template plan');
    return createFallback();
  }
}

async function generateTrailer(input: any, chosenTimeline: any, plan: any) {
  console.log('=== generateTrailer called ===');

  // Create fallback trailer
  const createFallback = () => {
    console.log('Creating fallback trailer data');
    return {
      trailer: [
        { t: 0, title: 'Day 1', subtitle: 'Choose Your NorthStar', caption: 'Clarity, courage, first step.' },
        { t: 8, title: 'Momentum', subtitle: 'Weeks 1–4', caption: 'Habits compound into outcomes.' },
        { t: 18, title: 'Breakthrough', subtitle: 'Weeks 5–8', caption: 'Lead a visible win with your team.' },
        { t: 28, title: 'Impact', subtitle: 'Weeks 9–12', caption: 'Ship, learn, and scale what works.' },
        { t: 38, title: 'Next Horizon', subtitle: 'Quarter 2', caption: 'A clear path with options open.' }
      ]
    };
  };

  // If no AI API is configured, return fallback immediately
  if (!hasAnyAIAPI()) {
    console.log('No AI API available -> using fallback trailer');
    return createFallback();
  }
  
  console.log('Attempting AI trailer generation...');
  const system = `You are a trailer editor. Create a 30–45s scene list for a text-only cinematic trailer.
Return JSON only.`;

  const user = `
Make it inspiring but grounded in the chosen timeline and plan highlights.

Return JSON:
{ "trailer":[ { "t":0, "title":"...", "subtitle":"...", "caption":"..." }, ... ] }

Chosen timeline: ${JSON.stringify(chosenTimeline)}
Plan highlights: ${JSON.stringify(plan?.okr ?? [])}
`;

  try {
    const raw = await chat(system, user, { responseAsJson: true, maxTokens: 600, temperature: 0.6 });
    console.log('AI trailer raw response length:', raw.length);
    
    const result = JSON.parse(raw);
    if (!result.trailer || !Array.isArray(result.trailer)) {
      console.log('Invalid AI trailer response, using fallback');
      return createFallback();
    }
    
    console.log('AI trailer generation successful');
    return result;
  } catch (e) {
    console.error('AI trailer generation failed:', e.message);
    console.log('Falling back to template trailer');
    return createFallback();
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...payload } = await req.json();
    console.log(`=== NorthStar Edge Function called with action: ${action} ===`);

    let result;

    switch (action) {
      case 'simulateTimelines':
        result = await simulateTimelines(payload.input);
        break;
      
      case 'computeTradeoffs':
        result = await computeTradeoffs(
          payload.timelines, 
          payload.goals_ranked, 
          payload.risk_appetite
        );
        break;
      
      case 'compilePlan':
        result = await compilePlan(payload.input, payload.chosenTimeline);
        break;
      
      case 'generateTrailer':
        result = await generateTrailer(
          payload.input, 
          payload.chosenTimeline, 
          payload.plan
        );
        break;
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log(`=== ${action} completed successfully ===`);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`=== Error in NorthStar function ===`);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Unknown error occurred',
      details: 'Check edge function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});