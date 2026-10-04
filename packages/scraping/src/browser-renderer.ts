import { SourceId, ExtractionMethod } from "@scrappy/core";
import { validateSafeUrl } from "./ssrf.js";
import { FetchResult } from "./types.js";

export interface BrowserRenderOptions {
  timeoutMs?: number;
  waitForSelector?: string;
  blockImages?: boolean;
}

export interface BrowserRenderer {
  render(url: string, sourceId: SourceId, options?: BrowserRenderOptions): Promise<FetchResult>;
}

/**
 * Local / emulator browser renderer for development and CI environments.
 * Simulates browser page rendering without heavy external headless binary overhead.
 */
export class LocalBrowserRenderer implements BrowserRenderer {
  public async render(
    rawUrl: string,
    sourceId: SourceId,
    _options: BrowserRenderOptions = {},
  ): Promise<FetchResult> {
    const parsed = validateSafeUrl(rawUrl);
    const startTime = Date.now();

    const simulatedHtml = `<!DOCTYPE html>
<html>
  <head>
    <title>Scrappy Rendered Page</title>
  </head>
  <body>
    <div id="product-root" data-rendered-by="local-browser-worker">
      <h1 class="title">Dynamic Loaded Product</h1>
      <span class="price">₹12,499</span>
      <span class="stock">In Stock</span>
    </div>
  </body>
</html>`;

    return {
      url: parsed.toString(),
      source: sourceId,
      statusCode: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "x-rendered-by": "scrappy-browser-worker",
      },
      body: simulatedHtml,
      fetchedAt: new Date().toISOString(),
      extractionMethod: "browser" as ExtractionMethod,
      durationMs: Date.now() - startTime,
      isNotModified: false,
    };
  }
}

export const defaultBrowserRenderer = new LocalBrowserRenderer();
