import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TotalBar from "../src/components/TotalBar";

const expenses = [
  { amount: "10.00", category: "Food" },
  { amount: "25.50", category: "Transport" },
  { amount: "5.00", category: "Food" },
];

describe("TotalBar", () => {
  it("displays correct expense count (plural)", () => {
    render(<TotalBar expenses={expenses} />);
    expect(screen.getByText("3 expenses")).toBeInTheDocument();
  });

  it("displays singular label for one expense", () => {
    render(<TotalBar expenses={[{ amount: "10.00", category: "Food" }]} />);
    expect(screen.getByText("1 expense")).toBeInTheDocument();
  });

  it("renders a chip for each distinct category", () => {
    render(<TotalBar expenses={expenses} />);
    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("Transport")).toBeInTheDocument();
  });

  it("shows nothing for an empty list", () => {
    render(<TotalBar expenses={[]} />);
    expect(screen.getByText("0 expenses")).toBeInTheDocument();
    expect(screen.queryByText("Food")).not.toBeInTheDocument();
  });
});
