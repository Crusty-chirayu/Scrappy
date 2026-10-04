import { SourceId, ScrappyError } from "@scrappy/core";
import {
  FetchResult,
  FetchOptions,
  ExtractedOffer,
  DriftAnalysisResult,
  defaultHttpFetcher,
  defaultBrowserRenderer,
  defaultDriftDetector,
  BrowserRenderOptions,
} from "@scrappy/scraping";
import { findAdapterForUrl, createDefaultAdapters } from "@scrappy/adapters";

export interface FetchHttpPayload {
  url: string;
  sourceId: SourceId;
  options?: FetchOptions;
}

export interface FetchBrowserPayload {
  url: string;
  sourceId: SourceId;
  options?: BrowserRenderOptions;
}

export interface ParseListingPayload {
  fetchResult: FetchResult;
}

export async function handleFetchHttp(payload: FetchHttpPayload): Promise<FetchResult> {
  const adapter = findAdapterForUrl(payload.url);
  if (adapter) {
    return await adapter.fetch(payload.url, payload.options);
  }
  return await defaultHttpFetcher.fetch(payload.url, payload.sourceId, payload.options);
}

export async function handleFetchBrowser(payload: FetchBrowserPayload): Promise<FetchResult> {
  return await defaultBrowserRenderer.render(payload.url, payload.sourceId, payload.options);
}

export async function handleParseListing(
  payload: ParseListingPayload,
): Promise<{ offer: ExtractedOffer; drift: DriftAnalysisResult }> {
  const adapters = createDefaultAdapters();
  const adapter = adapters.find((a) => a.id === payload.fetchResult.source);

  if (!adapter) {
    throw new ScrappyError(
      `No adapter registered for source: ${payload.fetchResult.source}`,
      "ADAPTER_ERROR",
      400,
    );
  }

  const offer = await adapter.parse(payload.fetchResult);
  const drift = defaultDriftDetector.analyze(offer);

  return { offer, drift };
}
