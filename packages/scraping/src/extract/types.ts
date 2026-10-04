export type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "currency"
  | "url"
  | "image"
  | "array"
  | "object";

export type TransformType =
  | "trim"
  | "lowercase"
  | "uppercase"
  | "parse_number"
  | "parse_currency_paise"
  | "clean_whitespace"
  | "absolute_url"
  | "regex_replace"
  | "date_iso";

export interface FieldTransform {
  type: TransformType;
  param?: string; // e.g. regex pattern or replace replacement
}

export interface SelectorChain {
  primary: string;
  fallback1?: string;
  fallback2?: string;
  textAnchor?: string;
  resilienceScore: number; // 0 - 100
}

export interface ExtractorField {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  defaultValue?: string | number | boolean | null;
  selectors: SelectorChain;
  transforms: FieldTransform[];
  description?: string;
}

export interface PaginationConfig {
  type: "none" | "next_button" | "url_pattern" | "infinite_scroll";
  selector?: string;
  urlPattern?: string; // e.g. https://example.com/items?page={page}
  maxPages: number;
}

export interface ExtractorConfig {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  targetUrl: string;
  itemSelector?: string; // container selector for list items (e.g. '.product-card')
  fields: ExtractorField[];
  pagination: PaginationConfig;
  rateLimitMs: number;
  createdAt: string;
  updatedAt: string;
}

export type RunStatus =
  | "DRAFT"
  | "VALIDATING"
  | "QUEUED"
  | "RUNNING"
  | "RETRYING"
  | "PARTIAL"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELLED";

export interface FieldDiagnostic {
  fieldId: string;
  fieldName: string;
  totalTested: number;
  extractedCount: number;
  fillRatePercent: number;
  selectorUsed: "primary" | "fallback1" | "fallback2" | "textAnchor" | "none";
  validationErrors: string[];
}

export interface ExtractorRunResult {
  runId: string;
  extractorId: string;
  workspaceId: string;
  status: RunStatus;
  startedAt: string;
  completedAt?: string;
  totalRecordsExtracted: number;
  browserMinutesConsumed: number;
  diagnostics: FieldDiagnostic[];
  data: Record<string, unknown>[];
  errorMessage?: string;
}
