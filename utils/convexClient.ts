import { ConvexReactClient } from "convex/react";
import { FunctionReference, FunctionArgs, FunctionReturnType } from "convex/server";

// --------------------------------------------------------------------------
// Client Initialization
// --------------------------------------------------------------------------

/**
 * Gets the Convex URL from the environment.
 * Priority:
 * 1. Vite Environment Variable (VITE_CONVEX_URL) - Standard for 'npx convex dev'
 * 2. Next.js/Process Environment (NEXT_PUBLIC_CONVEX_URL)
 */
const getConvexUrl = () => {
  // Vite / Replit / Cra
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    if ((import.meta as any).env.VITE_CONVEX_URL) {
      return (import.meta as any).env.VITE_CONVEX_URL;
    }
  }
  
  // Node / Next.js
  if (typeof process !== 'undefined' && process.env) {
    return process.env.VITE_CONVEX_URL || 
           process.env.NEXT_PUBLIC_CONVEX_URL || 
           process.env.CONVEX_URL;
  }
  
  return undefined;
};

const convexUrl = getConvexUrl();

if (!convexUrl) {
  console.warn("Warning: VITE_CONVEX_URL is not defined. The app will not connect to the backend.");
}

// Initialize the client
// If URL is missing, it will throw a clearer error in the console rather than crashing immediately with "No address"
export const convex = new ConvexReactClient(convexUrl || "https://placeholder.convex.cloud");

// --------------------------------------------------------------------------
// Types for Safe Responses
// --------------------------------------------------------------------------

type SafeResult<T> = {
  data: T | null;
  error: Error | null;
};

// --------------------------------------------------------------------------
// Generic Wrappers
// --------------------------------------------------------------------------

/**
 * Executes a Convex Query imperatively (outside of a React hook).
 */
export async function safeQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args: FunctionArgs<Query>
): Promise<SafeResult<FunctionReturnType<Query>>> {
  try {
    const data = await convex.query(query, args);
    return { data, error: null };
  } catch (err: any) {
    console.error(`[Convex Query Error]`, err);
    const error = err instanceof Error ? err : new Error(String(err));
    return { data: null, error };
  }
}

/**
 * Executes a Convex Mutation imperatively.
 */
export async function safeMutation<Mutation extends FunctionReference<"mutation">>(
  mutation: Mutation,
  args: FunctionArgs<Mutation>
): Promise<SafeResult<FunctionReturnType<Mutation>>> {
  try {
    const data = await convex.mutation(mutation, args);
    return { data, error: null };
  } catch (err: any) {
    console.error(`[Convex Mutation Error]`, err);
    const error = err instanceof Error ? err : new Error(String(err));
    return { data: null, error };
  }
}

/**
 * Executes a Convex Action imperatively.
 */
export async function safeAction<Action extends FunctionReference<"action">>(
  action: Action,
  args: FunctionArgs<Action>
): Promise<SafeResult<FunctionReturnType<Action>>> {
  try {
    const data = await convex.action(action, args);
    return { data, error: null };
  } catch (err: any) {
    console.error(`[Convex Action Error]`, err);
    const error = err instanceof Error ? err : new Error(String(err));
    return { data: null, error };
  }
}

// --------------------------------------------------------------------------
// Helper Functions
// --------------------------------------------------------------------------

export function formatConvexError(error: Error): string {
  return error.message || "An unexpected network error occurred.";
}

export function isConnected(): boolean {
  return !!convex;
}