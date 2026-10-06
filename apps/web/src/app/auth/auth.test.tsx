import React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import LoginPage from "./login/page";
import SignupPage from "./signup/page";
import OnboardingPage from "../onboarding/page";
import PricingPage from "../pricing/page";
import AdminPage from "../admin/page";
import { ToastProvider } from "@scrappy/ui";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
      {children}
    </a>
  ),
}));

describe("Slice I: Auth, Onboarding, Pricing, and Admin Suite", () => {
  it("renders LoginPage with password and magic link authentication options", () => {
    const html = renderToStaticMarkup(
      <ToastProvider>
        <LoginPage />
      </ToastProvider>
    );

    expect(html).toContain("Sign In to SCRAPPY");
    expect(html).toContain("Password");
    expect(html).toContain("Magic Link");
    expect(html).toContain("EMAIL ADDRESS");
  });

  it("renders SignupPage with workspace creation form", () => {
    const html = renderToStaticMarkup(
      <ToastProvider>
        <SignupPage />
      </ToastProvider>
    );

    expect(html).toContain("Create SCRAPPY Workspace");
    expect(html).toContain("FULL NAME");
    expect(html).toContain("WORK EMAIL");
    expect(html).toContain("PASSWORD (MIN 8 CHARACTERS)");
  });

  it("renders 3-step First-Watch Onboarding Page", () => {
    const html = renderToStaticMarkup(
      <ToastProvider>
        <OnboardingPage />
      </ToastProvider>
    );

    expect(html).toContain("Welcome to SCRAPPY");
    expect(html).toContain("Workspace Focus");
    expect(html).toContain("First Product");
    expect(html).toContain("Alert Trigger");
    expect(html).toContain("Consumer Electronics &amp; Tech");
  });

  it("renders Pricing Page with honest tiers and usage meter", () => {
    const html = renderToStaticMarkup(
      <ToastProvider>
        <PricingPage />
      </ToastProvider>
    );

    expect(html).toContain("Simple, Predictable Plans");
    expect(html).toContain("Community");
    expect(html).toContain("Professional");
    expect(html).toContain("Team &amp; Intelligence");
    expect(html).toContain("Workspace Quota &amp; Usage Meter");
  });

  it("renders Admin Console with real TOTP MFA challenge and OTP cells", () => {
    const html = renderToStaticMarkup(
      <ToastProvider>
        <AdminPage />
      </ToastProvider>
    );

    expect(html).toContain("Two-Factor Authentication");
    expect(html).toContain("Administrative Console");
    expect(html).toContain("Use Backup Code");
    expect(html).toContain("Verify &amp; Enter Console →");
  });
});
