import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StatCard } from "../stat-card";
import { FileText } from "lucide-react";
import userEvent from "@testing-library/user-event";

describe("StatCard component", () => {
  it("renders label and value correctly", () => {
    render(<StatCard label="Total Items" value={42} />);
    expect(screen.getByText("Total Items")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders description and trend safely", () => {
    render(
      <StatCard
        label="Warnings"
        value={15}
        description="Requires review"
        trend={{ value: 5, label: "from last audit" }}
      />
    );
    expect(screen.getByText("Requires review")).toBeInTheDocument();
    expect(screen.getByText("+5 from last audit")).toBeInTheDocument();
  });

  it("fires onClick handler when clicked", async () => {
    const handleClick = vi.fn();
    render(<StatCard label="Clickable" value={1} onClick={handleClick} />);
    
    // In shadcn/ui Card with onClick, it passes down to div
    const cardElement = screen.getByText("Clickable").closest("div.cursor-pointer");
    expect(cardElement).toBeInTheDocument();
    
    if (cardElement) {
      await userEvent.click(cardElement);
      expect(handleClick).toHaveBeenCalledTimes(1);
    }
  });
});
