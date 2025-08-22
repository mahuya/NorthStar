import { ProjectInput, ProjectResult, Tradeoffs, Plan, TrailerScene, GoalsKey } from '@/types';

function delay(ms: number) { 
  return new Promise(r => setTimeout(r, ms)); 
}

export async function simulateTimelines(input: ProjectInput): Promise<ProjectResult> {
  await delay(900);
  return {
    project_id: input.id,
    timelines: [
      {
        id: "bold",
        label: "Bold",
        rationale: "Aggressive growth via AI services and entrepreneurship.",
        scores: { money: 0.82, mastery: 0.91, health: 0.65, impact: 0.88, autonomy: 0.94, optionality: 0.78 },
        years: [
          { 
            y: 1, 
            milestones: ["Launch AI agency", "First ₹10L revenue"], 
            incomeL: 45, 
            saveL: 18, 
            skills: ["Agentic workflows"], 
            sleep: 0.65, 
            impactP: 5000, 
            flags: ["Revenue concentration"] 
          },
          { 
            y: 2, 
            milestones: ["APAC expansion", "Team of 5"], 
            incomeL: 60, 
            saveL: 28, 
            skills: ["Enterprise sales"], 
            sleep: 0.66, 
            impactP: 12000 
          },
          {
            y: 3,
            milestones: ["IPO track record", "Category leader"],
            incomeL: 85,
            saveL: 45,
            skills: ["Strategic vision"],
            sleep: 0.68,
            impactP: 25000
          }
        ]
      },
      {
        id: "balanced",
        label: "Balanced",
        rationale: "Steady corporate growth with manageable risk.",
        scores: { money: 0.75, mastery: 0.80, health: 0.70, impact: 0.82, autonomy: 0.70, optionality: 0.80 },
        years: [
          { 
            y: 1, 
            milestones: ["Join MNC", "Stable comp"], 
            incomeL: 36, 
            saveL: 16, 
            skills: ["Leadership"], 
            sleep: 0.72, 
            impactP: 3000 
          },
          { 
            y: 2, 
            milestones: ["Lead product team", "Regional growth"], 
            incomeL: 44, 
            saveL: 22, 
            skills: ["Org design"], 
            sleep: 0.71, 
            impactP: 7000 
          },
          {
            y: 3,
            milestones: ["VP promotion", "Cross-functional lead"],
            incomeL: 65,
            saveL: 35,
            skills: ["Executive presence"],
            sleep: 0.73,
            impactP: 15000
          }
        ]
      },
      {
        id: "safetynet",
        label: "Safety Net",
        rationale: "Focus on well-being and sustainable growth.",
        scores: { money: 0.62, mastery: 0.72, health: 0.82, impact: 0.70, autonomy: 0.60, optionality: 0.84 },
        years: [
          { 
            y: 1, 
            milestones: ["Sabbatical planning", "Write book outline"], 
            skills: ["Writing"], 
            sleep: 0.80, 
            impactP: 1500 
          },
          { 
            y: 2, 
            milestones: ["Publish 1st course", "Consulting 2 clients"], 
            incomeL: 24, 
            saveL: 10, 
            sleep: 0.83, 
            impactP: 4000 
          },
          {
            y: 3,
            milestones: ["Thought leadership", "Multiple income streams"],
            incomeL: 38,
            saveL: 20,
            sleep: 0.85,
            impactP: 8000
          }
        ]
      }
    ]
  };
}

export async function computeTradeoffs(result: ProjectResult, goals: GoalsKey[]): Promise<Tradeoffs> {
  await delay(600);
  return {
    pareto: [
      { timeline_id: "bold", dominant: ["Impact", "Autonomy", "Mastery"], weak: ["Health"] },
      { timeline_id: "balanced", dominant: ["Health", "Money"], weak: ["Autonomy"] },
      { timeline_id: "safetynet", dominant: ["Health", "Optionality"], weak: ["Money", "Impact"] }
    ],
    regret_min: "At 70, you'll be proud you chose higher impact with acceptable health trade-offs.",
    recommendation: { chosen_timeline_id: "bold", why: "Strong alignment with top goals: Impact, Autonomy, Mastery." }
  };
}

export async function compilePlan(input: ProjectInput, chosenId: string): Promise<Plan> {
  await delay(800);
  
  const plansByTimeline = {
    bold: {
      okr: [
        { o: "Reach ₹5L MRR in 90 days", kr: ["10 enterprise demos", "3 paid pilots", "2 case studies"] },
        { o: "Build AI service foundation", kr: ["Deploy 5 AI workflows", "Train 2 junior developers", "Establish QA process"] }
      ],
      weeks: [
        { w: 1, tasks: ["Publish case study #1", "Prospect 50 accounts"], hab: ["Deep work 2h/day"] },
        { w: 2, tasks: ["Demo to 3 prospects", "Refine service offering"], hab: ["Exercise 30min", "Deep work 2h/day"] }
      ],
      blocks: [
        { t: "Prospecting", dur: 120, days: ["Mon", "Wed", "Fri"], time: "09:00" },
        { t: "Development", dur: 180, days: ["Tue", "Thu"], time: "10:00" }
      ]
    },
    balanced: {
      okr: [
        { o: "Secure senior role in 90 days", kr: ["Apply to 20 positions", "Complete 5 final rounds", "Negotiate 2 offers"] }
      ],
      weeks: [
        { w: 1, tasks: ["Update LinkedIn", "Apply to 5 roles"], hab: ["Morning run", "Skill practice 1h"] }
      ],
      blocks: [
        { t: "Job applications", dur: 60, days: ["Mon", "Wed", "Fri"], time: "19:00" }
      ]
    },
    safetynet: {
      okr: [
        { o: "Complete book draft in 90 days", kr: ["Write 3 chapters", "Get 5 beta readers", "Find editor"] }
      ],
      weeks: [
        { w: 1, tasks: ["Write 2000 words", "Research publishing"], hab: ["Meditation 20min", "Reading 1h"] }
      ],
      blocks: [
        { t: "Writing", dur: 120, days: ["Mon", "Wed", "Fri"], time: "06:00" }
      ]
    }
  };

  return plansByTimeline[chosenId as keyof typeof plansByTimeline] || plansByTimeline.bold;
}

export async function generateTrailer(input: ProjectInput, chosenId: string, plan: Plan): Promise<TrailerScene[]> {
  await delay(400);
  return [
    { t: 0, title: "NorthStar", subtitle: "Where Decisions Become Directions" },
    { t: 2, title: "Year 1", caption: "First major milestone achieved" },
    { t: 6, title: "Year 3", caption: "Expanded influence and impact" },
    { t: 10, title: "Year 5", caption: "Legacy established, dreams realized" }
  ];
}