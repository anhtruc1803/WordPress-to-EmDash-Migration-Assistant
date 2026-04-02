import { NextResponse } from "next/server";
import { listProjects, createProject as createProjectInStore } from "@console/services/project-store";

export async function GET() {
  try {
    const projects = await listProjects();
    return NextResponse.json(projects);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      name?: string;
      sourceKind?: "wxr" | "api";
      location?: string;
      authToken?: string;
    };

    if (!body.name || !body.sourceKind || !body.location) {
      return NextResponse.json(
        { error: "Missing required fields: name, sourceKind, location" },
        { status: 400 }
      );
    }

    const project = await createProjectInStore({
      name: body.name,
      sourceKind: body.sourceKind,
      location: body.location,
      authToken: body.authToken,
    });

    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
