"use client";

import { use, useState } from "react";
import { useProject, useUpdateProject } from "@console/hooks/use-migration";
import { PageHeader } from "@console/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@console/components/ui/card";
import { Input } from "@console/components/ui/input";
import { Button } from "@console/components/ui/button";
import { KeyValueList } from "@console/components/data-display/key-value-list";
import { LoadingState, ErrorState } from "@console/components/data-display/states";
import { Save, Loader2 } from "lucide-react";

export default function SettingsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const { data: project, isLoading, error } = useProject(projectId);
  const updateProject = useUpdateProject(projectId);
  const [targetUrl, setTargetUrl] = useState("");
  const [outputDir, setOutputDir] = useState("");
  const [initialized, setInitialized] = useState(false);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;
  if (!project) return null;

  if (!initialized) {
    setTargetUrl(project.settings.targetUrl ?? "");
    setOutputDir(project.settings.outputDirectory ?? "");
    setInitialized(true);
  }

  const handleSave = async () => {
    await updateProject.mutateAsync({
      settings: {
        ...project.settings,
        targetUrl: targetUrl || undefined,
        outputDirectory: outputDir,
      },
    });
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-2xl">
      <PageHeader title="Settings" description="Project configuration" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project Info</CardTitle>
        </CardHeader>
        <CardContent>
          <KeyValueList
            items={[
              { label: "Project ID", value: <code className="text-xs bg-muted px-2 py-0.5 rounded">{project.id}</code> },
              { label: "Created", value: new Date(project.createdAt).toLocaleString() },
              { label: "Last Updated", value: new Date(project.updatedAt).toLocaleString() },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Output Configuration</CardTitle>
          <CardDescription>Configure where artifacts are generated</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="output-dir" className="text-sm font-medium">
              Output Directory
            </label>
            <Input
              id="output-dir"
              value={outputDir}
              onChange={(e) => setOutputDir(e.target.value)}
              placeholder="artifacts"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="target-url" className="text-sm font-medium">
              EmDash Target URL{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Input
              id="target-url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="http://localhost:4321"
            />
            <p className="text-xs text-muted-foreground">
              Used for import plan generation and target validation.
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={updateProject.isPending}
            size="sm"
          >
            {updateProject.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Settings
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Source Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <KeyValueList
            items={[
              { label: "Source Type", value: project.source.kind.toUpperCase() },
              { label: "Location", value: <code className="text-xs bg-muted px-2 py-0.5 rounded">{project.source.location}</code> },
              { label: "Validated", value: project.source.validated ? "Yes" : "No" },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
