export interface EmDashTargetValidation {
  reachable: boolean;
  note: string;
}

export interface EmDashTargetAdapter {
  validate(targetUrl: string): Promise<EmDashTargetValidation>;
}

export class PlanOnlyEmDashAdapter implements EmDashTargetAdapter {
  async validate(targetUrl: string): Promise<EmDashTargetValidation> {
    try {
      const response = await fetch(targetUrl, {
        method: "HEAD"
      });

      return {
        reachable: response.ok,
        note: response.ok
          ? "Target responded to a HEAD request. Live import is still plan-only in this MVP."
          : `Target responded with ${response.status}. Import remains plan-only.`
      };
    } catch {
      return {
        reachable: false,
        note: "Target validation failed. Import remains plan-only because the EmDash API contract is intentionally isolated behind an adapter boundary."
      };
    }
  }
}

