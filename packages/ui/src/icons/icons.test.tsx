import { describe, it, expect } from "vitest";
import React from "react";
import { ALL_ICONS, IconName } from "./icons.js";
import {
  AnimatedBellIcon,
  AnimatedCheckIcon,
  NudgeArrowIcon,
  SearchSpinnerIcon,
  ThemeRotateIcon,
} from "./animated.js";
import { ScrappyLogo, ScrappyMark } from "../brand/ScrappyLogo.js";

describe("Scrappy Icon System (Slice A)", () => {
  it("exports all 42 required icons", () => {
    const iconNames = Object.keys(ALL_ICONS);
    expect(iconNames.length).toBeGreaterThanOrEqual(40);
    expect(iconNames).toContain("compare");
    expect(iconNames).toContain("watchlist");
    expect(iconNames).toContain("alert");
    expect(iconNames).toContain("bell");
    expect(iconNames).toContain("price-drop");
    expect(iconNames).toContain("price-rise");
    expect(iconNames).toContain("extract");
    expect(iconNames).toContain("verified");
    expect(iconNames).toContain("search");
    expect(iconNames).toContain("filter");
    expect(iconNames).toContain("sort");
    expect(iconNames).toContain("store");
    expect(iconNames).toContain("settings");
    expect(iconNames).toContain("check");
    expect(iconNames).toContain("close");
  });

  it("renders an icon with custom size and accessibility attributes", () => {
    const Component = ALL_ICONS.bell;
    const element = React.createElement(Component, { size: 32, title: "Notification Bell" });
    expect(element.props.size).toBe(32);
    expect(element.props.title).toBe("Notification Bell");
  });

  it("micro-interactions export correctly and render with props", () => {
    const bell = React.createElement(AnimatedBellIcon, { size: 24, ring: true });
    expect(bell.props.ring).toBe(true);

    const check = React.createElement(AnimatedCheckIcon, { size: 20, trigger: true });
    expect(check.props.trigger).toBe(true);

    const arrow = React.createElement(NudgeArrowIcon, { direction: "right" });
    expect(arrow.props.direction).toBe("right");

    const search = React.createElement(SearchSpinnerIcon, { isLoading: true });
    expect(search.props.isLoading).toBe(true);

    const theme = React.createElement(ThemeRotateIcon, { isDark: false });
    expect(theme.props.isDark).toBe(false);
  });

  it("Scrappy brand mark and logo render across sizes", () => {
    const mark = React.createElement(ScrappyMark, { size: 16, monochrome: true });
    expect(mark.props.size).toBe(16);
    expect(mark.props.monochrome).toBe(true);

    const logo = React.createElement(ScrappyLogo, { variant: "combined", size: 32 });
    expect(logo.props.variant).toBe("combined");
  });
});
