import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Navigation } from "./navigation";
import { HeroSection } from "./hero-section";
import { CtaSection } from "./cta-section";
import { PricingSection } from "./pricing-section";
import { getOptimusDevUrl } from "@/lib/navigation";

// Mock des composants Three.js ou animations complexes qui ne s'exécutent pas bien sous jsdom
vi.mock("./animated-sphere", () => ({
  AnimatedSphere: () => <div data-testid="mock-animated-sphere" />
}));

vi.mock("./animated-tetrahedron", () => ({
  AnimatedTetrahedron: () => <div data-testid="mock-animated-tetrahedron" />
}));

// Mock de l'IntersectionObserver pour JSDOM
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe("Navigation Utility", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  it("devrait retourner la variable d'environnement si elle existe", () => {
    process.env.NEXT_PUBLIC_OPTIMUS_DEV_URL = "https://custom-url.optimus.dev";
    expect(getOptimusDevUrl()).toBe("https://custom-url.optimus.dev");
  });

  it("devrait retourner localhost en mode développement", () => {
    delete process.env.NEXT_PUBLIC_OPTIMUS_DEV_URL;
    process.env.NODE_ENV = "development";
    expect(getOptimusDevUrl()).toBe("http://localhost:5173");
  });

  it("devrait retourner localhost si window.location.hostname est localhost", () => {
    delete process.env.NEXT_PUBLIC_OPTIMUS_DEV_URL;
    process.env.NODE_ENV = "production";
    // Sous jsdom, window.location.hostname est 'localhost' par défaut
    expect(getOptimusDevUrl()).toBe("http://localhost:5173");
  });
});

describe("Composant Navigation", () => {
  it("devrait contenir les liens corrects vers la page de login et workspaces (Desktop)", () => {
    render(<Navigation />);

    // Le lien Sign in Desktop (le premier est desktop sous JSDOM)
    const signInLinks = screen.getAllByRole("link", { name: /Sign in/i });
    expect(signInLinks[0]).toHaveAttribute("href", "http://localhost:5173/login");

    // Le lien Start creating Desktop
    const startCreatingLinks = screen.getAllByRole("link", { name: /Start creating/i });
    expect(startCreatingLinks[0]).toHaveAttribute("href", "http://localhost:5173/workspaces");
  });
});

describe("Composant HeroSection", () => {
  it("devrait contenir le lien correct pour Start free trial", () => {
    render(<HeroSection />);
    const trialLink = screen.getByRole("link", { name: /Start free trial/i });
    expect(trialLink).toHaveAttribute("href", "http://localhost:5173/workspaces");
  });
});

describe("Composant CtaSection", () => {
  it("devrait contenir le lien correct pour Start building free", () => {
    render(<CtaSection />);
    const buildLink = screen.getByRole("link", { name: /Start building free/i });
    expect(buildLink).toHaveAttribute("href", "http://localhost:5173/workspaces");
  });
});

describe("Composant PricingSection", () => {
  it("devrait contenir les liens corrects pour Start free et Start trial", () => {
    render(<PricingSection />);

    const startFreeLink = screen.getByRole("link", { name: /Start free/i });
    expect(startFreeLink).toHaveAttribute("href", "http://localhost:5173/workspaces");

    const startTrialLink = screen.getByRole("link", { name: /Start trial/i });
    expect(startTrialLink).toHaveAttribute("href", "http://localhost:5173/workspaces");
  });
});
