/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as fetchSentences from "../fetchSentences.js";
import type * as generateAudio from "../generateAudio.js";
import type * as saveToSRS from "../saveToSRS.js";
import type * as sentences from "../sentences.js";
import type * as studySessions from "../studySessions.js";
import type * as submitJournal from "../submitJournal.js";
import type * as types from "../types.js";
import type * as utils_aiClient from "../utils/aiClient.js";
import type * as utils_srsAlgorithm from "../utils/srsAlgorithm.js";
import type * as vocabulary from "../vocabulary.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  fetchSentences: typeof fetchSentences;
  generateAudio: typeof generateAudio;
  saveToSRS: typeof saveToSRS;
  sentences: typeof sentences;
  studySessions: typeof studySessions;
  submitJournal: typeof submitJournal;
  types: typeof types;
  "utils/aiClient": typeof utils_aiClient;
  "utils/srsAlgorithm": typeof utils_srsAlgorithm;
  vocabulary: typeof vocabulary;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
