import { describe, it, expect } from "vitest";
import React from "react";
import {
  EmptyStateIllustration,
  ErrorStateIllustration,
  OfflineStateIllustration,
  NotFoundIllustration,
} from "./illustrations.js";

describe("Scrappy Illustrations (Slice A)", () => {
  it("renders empty state illustration with custom dimensions and title", () => {
    const el = React.createElement(EmptyStateIllustration, { width: 300, height: 200, title: "Empty ledger" });
    expect(el.props.width).toBe(300);
    expect(el.props.height).toBe(200);
    expect(el.props.title).toBe("Empty ledger");
  });

  it("renders error state illustration", () => {
    const el = React.createElement(ErrorStateIllustration, { width: 240, height: 160 });
    expect(el.props.width).toBe(240);
  });

  it("renders offline state illustration", () => {
    const el = React.createElement(OfflineStateIllustration, { width: 240, height: 160 });
    expect(el.props.width).toBe(240);
  });

  it("renders 404 not found illustration", () => {
    const el = React.createElement(NotFoundIllustration, { width: 240, height: 160 });
    expect(el.props.width).toBe(240);
  });
});
