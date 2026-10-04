import { describe, it, expect } from "vitest";
import { createDefaultAdapters, findAdapterForUrl } from "../index.js";

describe("Source Adapters", () => {
  it("registers all required adapters", () => {
    const adapters = createDefaultAdapters();
    expect(adapters.length).toBe(4);
    const ids = adapters.map((a) => a.id);
    expect(ids).toContain("amazon-in");
    expect(ids).toContain("flipkart");
    expect(ids).toContain("croma");
    expect(ids).toContain("reliance-digital");
  });

  it("identifies Amazon India URLs", () => {
    const adapter = findAdapterForUrl("https://www.amazon.in/dp/B0CX21Q8TG");
    expect(adapter).not.toBeNull();
    expect(adapter?.id).toBe("amazon-in");
  });

  it("identifies Flipkart URLs", () => {
    const adapter = findAdapterForUrl("https://www.flipkart.com/apple-iphone-15/p/itm12345");
    expect(adapter).not.toBeNull();
    expect(adapter?.id).toBe("flipkart");
  });

  it("marks Croma and Reliance Digital as unsupported with honest error", async () => {
    const croma = findAdapterForUrl("https://www.croma.com/p/123");
    expect(croma?.id).toBe("croma");
    const health = await croma?.getHealth();
    expect(health?.status).toBe("unsupported");
    await expect(croma?.fetch("https://www.croma.com/p/123")).rejects.toThrow(/unsupported/);
  });
});
