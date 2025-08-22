import { supabase } from "@/integrations/supabase/client";
import { ProjectInput, ProjectResult, Tradeoffs, Plan, TrailerScene } from "@/types";

export async function simulateTimelines(input: ProjectInput): Promise<ProjectResult> {
  console.log("=== simulateTimelines API call started ===");
  console.log("Input:", JSON.stringify(input, null, 2));
  
  try {
    console.log("Calling Supabase edge function 'northstar'...");
    const { data, error } = await supabase.functions.invoke('northstar', {
      body: { action: 'simulateTimelines', input }
    });

    console.log("Supabase response:", { data, error });

    if (error) {
      console.error("Supabase function error:", error);
      throw new Error(`Edge function error: ${error.message || JSON.stringify(error)}`);
    }
    
    if (!data) {
      console.error("No data returned from edge function");
      throw new Error("No data returned from server");
    }
    
    if (!data.timelines) {
      console.error("No timelines in response:", data);
      throw new Error("Invalid response: missing timelines");
    }
    
    const result = {
      project_id: input.id,  
      timelines: data.timelines
    };
    
    console.log("=== Success! Returning result ===");
    console.log("Result:", JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('=== simulateTimelines FAILED ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    throw new Error(`Failed to generate timelines: ${error.message}`);
  }
}

export async function computeTradeoffs(
  timelines: any[], 
  goals_ranked: string[], 
  risk_appetite: string = "Balanced"
): Promise<Tradeoffs> {
  console.log("=== computeTradeoffs API call started ===");
  console.log("Timelines count:", timelines.length);
  console.log("Goals ranked:", goals_ranked);
  console.log("Risk appetite:", risk_appetite);
  
  try {
    console.log("Calling Supabase edge function 'northstar' with action 'computeTradeoffs'...");
    const { data, error } = await supabase.functions.invoke('northstar', {
      body: { 
        action: 'computeTradeoffs', 
        timelines, 
        goals_ranked, 
        risk_appetite 
      }
    });

    console.log("Supabase response:", { data, error });

    if (error) {
      console.error("Supabase function error:", error);
      throw new Error(`Edge function error: ${error.message || JSON.stringify(error)}`);
    }
    
    if (!data) {
      console.error("No data returned from edge function");
      throw new Error("No data returned from server");
    }
    
    console.log("=== Tradeoffs computation successful ===");
    console.log("Returned tradeoffs structure:", Object.keys(data));
    return data.tradeoffs;
  } catch (error) {
    console.error('=== computeTradeoffs FAILED ===');
    console.error('Error details:', error);
    throw new Error(`Failed to analyze tradeoffs: ${error.message}`);
  }
}

export async function compilePlan(input: ProjectInput, chosenTimeline: any): Promise<Plan> {
  console.log("=== compilePlan API call started ===");
  console.log("Input profile:", input.profile.name);
  console.log("Chosen timeline:", chosenTimeline.id);
  
  try {
    console.log("Calling Supabase edge function 'northstar' with action 'compilePlan'...");
    const { data, error } = await supabase.functions.invoke('northstar', {
      body: { 
        action: 'compilePlan', 
        input, 
        chosenTimeline 
      }
    });

    console.log("Supabase response:", { data, error });

    if (error) {
      console.error("Supabase function error:", error);
      throw new Error(`Edge function error: ${error.message || JSON.stringify(error)}`);
    }
    
    if (!data) {
      console.error("No data returned from edge function");
      throw new Error("No data returned from server");
    }
    
    console.log("=== Plan generation successful ===");
    console.log("Returned plan structure:", Object.keys(data));
    return data;
  } catch (error) {
    console.error('=== compilePlan FAILED ===');
    console.error('Error details:', error);
    throw new Error(`Failed to generate plan: ${error.message}`);
  }
}

export async function generateTrailer(
  input: ProjectInput, 
  chosenTimeline: any, 
  plan: any
): Promise<TrailerScene[]> {
  console.log("=== generateTrailer API call started ===");
  console.log("Chosen timeline:", chosenTimeline?.id);
  
  try {
    console.log("Calling Supabase edge function 'northstar' with action 'generateTrailer'...");
    const { data, error } = await supabase.functions.invoke('northstar', {
      body: { 
        action: 'generateTrailer', 
        input, 
        chosenTimeline, 
        plan 
      }
    });

    console.log("Supabase response:", { data, error });

    if (error) {
      console.error("Supabase function error:", error);
      throw new Error(`Edge function error: ${error.message || JSON.stringify(error)}`);
    }
    
    if (!data) {
      console.error("No data returned from edge function");
      throw new Error("No data returned from server");
    }
    
    console.log("=== Trailer generation successful ===");
    console.log("Returned trailer structure:", Object.keys(data));
    return data.trailer;
  } catch (error) {
    console.error('=== generateTrailer FAILED ===');
    console.error('Error details:', error);
    throw new Error(`Failed to generate trailer: ${error.message}`);
  }
}