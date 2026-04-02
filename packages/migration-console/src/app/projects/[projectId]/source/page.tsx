"use client";

import { use, useState } from "react";
import { useProject, useUpdateProject } from "@console/hooks/use-migration";
import { PageHeader } from "@console/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@console/components/ui/card";
import { Button } from "@console/components/ui/button";
import { Input } from "@console/components/ui/input";
import { KeyValueList } from "@console/components/data-display/key-value-list";
import { LoadingState, ErrorState } from "@console/components/data-display/states";
import { CheckCircle2, XCircle, RefreshCw, Loader2 } from "lucide-react";

export default function SourceSetupPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const { data: project, isLoading, error } = useProject(projectId);
  const updateProject = useUpdateProject(projectId);
  const [editing, setEditing] = useState(false);
  const [location, setLocation] = useState("");

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;
  if (!project) return null;

  const handleSave = async () => {
    await updateProject.mutateAsync({
      source: { ...project.source, location },
    });
    setEditing(false);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Source Setup"
        description="WordPress source configuration and validation"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connection Details</CardTitle>
          <CardDescription>Configure your WordPress data source</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <KeyValueList
            items={[
              { label: "Source Type", value: project.source.kind.toUpperCase() },
              {
                label: "Location",
                value: editing ? (
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="max-w-md"
                  />
                ) : (
                  <code className="text-xs bg-muted px-2 py-1 rounded">{project.source.location}</code>
                ),
              },
              {
                label: "Status",
                value: project.source.validated ? (
                  <span className="flex items-center gap-1.5 text-severity-low text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4" /> Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-severity-high text-sm font-medium">
                    <XCircle className="h-4 w-4" /> Not validated
                  </span>
                ),
              },
            ]}
          />

          {project.source.validationError && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {project.source.validationError}
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            {editing ? (
              <>
                <Button onClick={handleSave} disabled={updateProject.isPending} size="sm">
                  {updateProject.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLocation(project.source.location);
                    setEditing(true);
                  }}
                >
                  Edit Source
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                  Revalidate
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Site metadata if available */}
      {project.latestBundle?.site && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Site Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <KeyValueList
              items={[
                { label: "Title", value: project.latestBundle.site.title },
                ...(project.latestBundle.site.description
                  ? [{ label: "Description", value: project.latestBundle.site.description }]
                  : []),
                ...(project.latestBundle.site.baseUrl
                  ? [{ label: "Base URL", value: project.latestBundle.site.baseUrl }]
                  : []),
                ...(project.latestBundle.site.language
                  ? [{ label: "Language", value: project.latestBundle.site.language }]
                  : []),
                ...(project.latestBundle.site.generator
                  ? [{ label: "Generator", value: project.latestBundle.site.generator }]
                  : []),
              ]}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
