import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FilterSort from "../src/components/FilterSort";

const categories = ["Food", "Transport", "Health"];
const filters = { category: "", sort: "date_desc" };

describe("FilterSort — rendering", () => {
  it('renders "All categories" as the first category option', () => {
    render(
      <FilterSort
        categories={categories}
        filters={filters}
        onChange={() => {}}
      />,
    );
    expect(
      screen.getByRole("option", { name: "All categories" }),
    ).toBeInTheDocument();
  });

  it("renders an option for each category passed in", () => {
    render(
      <FilterSort
        categories={categories}
        filters={filters}
        onChange={() => {}}
      />,
    );
    for (const cat of categories) {
      expect(screen.getByRole("option", { name: cat })).toBeInTheDocument();
    }
  });

  it("renders both sort options", () => {
    render(
      <FilterSort
        categories={categories}
        filters={filters}
        onChange={() => {}}
      />,
    );
    expect(
      screen.getByRole("option", { name: "Newest first" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Default" })).toBeInTheDocument();
  });
});

describe("FilterSort — interactions", () => {
  it("calls onChange with updated category when category select changes", () => {
    const onChange = vi.fn();
    render(
      <FilterSort
        categories={categories}
        filters={filters}
        onChange={onChange}
      />,
    );
    const [categorySelect] = screen.getAllByRole("combobox");
    fireEvent.change(categorySelect, { target: { value: "Food" } });
    expect(onChange).toHaveBeenCalledWith({ ...filters, category: "Food" });
  });

  it("calls onChange with updated sort when sort select changes", () => {
    const onChange = vi.fn();
    render(
      <FilterSort
        categories={categories}
        filters={filters}
        onChange={onChange}
      />,
    );
    const [, sortSelect] = screen.getAllByRole("combobox");
    fireEvent.change(sortSelect, { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith({ ...filters, sort: "" });
  });
});
