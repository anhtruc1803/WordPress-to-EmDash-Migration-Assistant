"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateProject } from "@console/hooks/use-migration";
import { PageHeader } from "@console/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@console/components/ui/card";
import { Button } from "@console/components/ui/button";
import { Input } from "@console/components/ui/input";
import { FileUp, Globe, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@console/lib/utils";

type SourceKind = "wxr" | "api";

export default function NewProjectPage() {
  const router = useRouter();
  const createProject = useCreateProject();
  const [step, setStep] = useState<"source" | "details">("source");
  const [sourceKind, setSourceKind] = useState<SourceKind>("wxr");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [authToken, setAuthToken] = useState("");

  const handleCreate = async () => {
    try {
      const project = await createProject.mutateAsync({
        name,
        sourceKind,
        location,
      });
      router.push(`/projects/${project.id}/overview`);
    } catch {
      // error handled by mutation state
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <PageHeader
        title="New Migration Project"
        description="Connect a WordPress source and start auditing."
      />

      {step === "source" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Choose how to connect to your WordPress site:
          </p>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                setSourceKind("wxr");
                setStep("details");
              }}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all hover:border-primary hover:shadow-md text-left",
                sourceKind === "wxr" ? "border-primary bg-primary/5" : "border-border"
              )}
            >
              <div className="rounded-lg bg-primary/10 p-3">
                <FileUp className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm">WXR Export</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a WordPress eXtended RSS export file
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                setSourceKind("api");
                setStep("details");
              }}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all hover:border-primary hover:shadow-md text-left",
                sourceKind === "api" ? "border-primary bg-primary/5" : "border-border"
              )}
            >
              <div className="rounded-lg bg-primary/10 p-3">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm">REST API</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Connect via WordPress REST API endpoint
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {step === "details" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {sourceKind === "wxr" ? "WXR Export" : "REST API"} Configuration
            </CardTitle>
            <CardDescription>
              {sourceKind === "wxr"
                ? "Provide the path to your WXR export file"
                : "Enter the WordPress REST API root URL"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="project-name" className="text-sm font-medium">
                Project Name
              </label>
              <Input
                id="project-name"
                placeholder="My WordPress Migration"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="source-location" className="text-sm font-medium">
                {sourceKind === "wxr" ? "WXR File Path" : "API Root URL"}
              </label>
              <Input
                id="source-location"
                placeholder={
                  sourceKind === "wxr"
                    ? "/path/to/export.xml"
                    : "https://example.com/wp-json"
                }
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {sourceKind === "api" && (
              <div className="space-y-2">
                <label htmlFor="auth-token" className="text-sm font-medium">
                  Auth Token{" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <Input
                  id="auth-token"
                  type="password"
                  placeholder="Bearer token or Application Password"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                />
              </div>
            )}

            {createProject.error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {createProject.error.message}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setStep("source")}
              >
                Back
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!name || !location || createProject.isPending}
              >
                {createProject.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                Create Project
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
