/**
 * SuperMemo-2 (SM-2) Spaced Repetition Algorithm
 * 
 * This utility calculates the next review interval and updated ease factor
 * based on the user's performance rating of a specific item.
 * 
 * Rating Scale (Quality):
 * 5 - Perfect response
 * 4 - Correct response after a hesitation
 * 3 - Correct response recalled with serious difficulty
 * 2 - Incorrect response; where the correct one seemed easy to recall
 * 1 - Incorrect response; the correct one remembered
 * 0 - Complete blackout
 */

// --------------------------------------------------------------------------
// Constants
// --------------------------------------------------------------------------

const MIN_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

export interface SRSInput {
  /** The user's grade for the card (0-5) */
  grade: number; 
  /** The current ease factor (default is usually 2.5) */
  previousEaseFactor: number;
  /** The previous interval in days. 0 if new. */
  previousInterval: number;
}

export interface SRSOutput {
  /** Calculated interval in days for the next review */
  interval: number;
  /** Unix timestamp for when the item should be reviewed next */
  nextReview: number;
  /** The updated ease multiplier */
  easeFactor: number;
  /** Suggested status update */
  status: "learning" | "review" | "mastered";
}

// --------------------------------------------------------------------------
// Algorithm
// --------------------------------------------------------------------------

/**
 * Calculates the next state of a review item using the SM-2 algorithm.
 * 
 * @param input - Current state of the item and user grade
 * @returns Updated state (interval, nextReview date, easeFactor)
 */
export const calculateSRS = (input: SRSInput): SRSOutput => {
  const { grade, previousEaseFactor, previousInterval } = input;

  // 1. Calculate new Ease Factor
  // Formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  let newEaseFactor = previousEaseFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));

  // Constraint: EF cannot drop below 1.3
  if (newEaseFactor < MIN_EASE_FACTOR) {
    newEaseFactor = MIN_EASE_FACTOR;
  }

  // 2. Calculate new Interval
  let newInterval: number;

  if (grade < 3) {
    // If the user failed (grade 0-2), reset interval to 1 day
    newInterval = 1;
  } else {
    // If the user succeeded (grade 3-5)
    if (previousInterval === 0) {
      // First successful review
      newInterval = 1;
    } else if (previousInterval === 1) {
      // Second successful review (typical SM-2 jump is 1 -> 6)
      newInterval = 6;
    } else {
      // Subsequent reviews: I(n) = I(n-1) * EF
      newInterval = Math.ceil(previousInterval * newEaseFactor);
    }
  }

  // 3. Calculate Next Review Date (Timestamp)
  const oneDayInMs = 24 * 60 * 60 * 1000;
  const nextReview = Date.now() + (newInterval * oneDayInMs);

  // 4. Determine Status
  // Logic: 
  // - If interval is small (< 21 days), it's still strictly "learning"/"review"
  // - If interval is large (> 180 days approx), could be considered "mastered"
  // - If grade was low, it falls back to "learning"
  
  let status: "learning" | "review" | "mastered" = "review";
  
  if (grade < 3) {
    status = "learning";
  } else if (newInterval > 180) { // Approx 6 months
    status = "mastered";
  }

  return {
    interval: newInterval,
    nextReview: nextReview,
    easeFactor: parseFloat(newEaseFactor.toFixed(2)), // Clean float precision
    status: status
  };
};

// --------------------------------------------------------------------------
// Helper: Get Initial State
// --------------------------------------------------------------------------

/**
 * Returns the default state for a brand new item.
 */
export const getInitialSRSState = () => ({
  nextReview: Date.now(), // Due immediately
  interval: 0,
  easeFactor: DEFAULT_EASE_FACTOR,
  status: "new" as const
});
