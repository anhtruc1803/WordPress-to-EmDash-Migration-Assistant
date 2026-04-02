import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SeverityBadge } from "../severity-badge";
import { mapSeverity } from "@console/lib/types";

describe("SeverityBadge component", () => {
  it("renders with correct text based on string severity", () => {
    render(<SeverityBadge severity="info" />);
    expect(screen.getByText("Info")).toBeInTheDocument();
  });

  it("handles high severity mapping", () => {
    const mapped = mapSeverity("error");
    render(<SeverityBadge severity={mapped} />);
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("does not show icon when showIcon is false", () => {
    // Relying on accessible label or lack of svg element
    const { container } = render(<SeverityBadge severity="low" showIcon={false} />);
    expect(container.querySelector("svg")).not.toBeInTheDocument();
    expect(screen.getByText("Low")).toBeInTheDocument();
  });
});
