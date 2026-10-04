import { SourceAdapter } from "@scrappy/scraping";
import { AmazonInAdapter } from "./amazon-in/index.js";
import { FlipkartAdapter } from "./flipkart/index.js";
import { CromaAdapter } from "./croma/index.js";
import { RelianceDigitalAdapter } from "./reliance-digital/index.js";

export * from "./amazon-in/index.js";
export * from "./flipkart/index.js";
export * from "./croma/index.js";
export * from "./reliance-digital/index.js";

export function createDefaultAdapters(): SourceAdapter[] {
  return [
    new AmazonInAdapter(),
    new FlipkartAdapter(),
    new CromaAdapter(),
    new RelianceDigitalAdapter(),
  ];
}

export function findAdapterForUrl(
  url: string,
  adapters: SourceAdapter[] = createDefaultAdapters(),
): SourceAdapter | null {
  for (const adapter of adapters) {
    if (adapter.canHandle(url)) {
      return adapter;
    }
  }
  return null;
}
