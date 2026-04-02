"use client";

import { use, useState, useMemo } from "react";
import { useProject } from "@console/hooks/use-migration";
import { PageHeader } from "@console/components/layout/page-header";
import { SeverityBadge } from "@console/components/data-display/severity-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@console/components/ui/card";
import { Input } from "@console/components/ui/input";
import { Badge } from "@console/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@console/components/ui/tabs";
import { LoadingState, ErrorState, EmptyState } from "@console/components/data-display/states";
import { ArrowRightLeft, Search, AlertTriangle, Code2, FileText } from "lucide-react";
import { mapSeverity } from "@console/lib/types";
import { cn } from "@console/lib/utils";

export default function TransformPreviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const { data: project, isLoading, error } = useProject(projectId);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;
  if (!project) return null;

  const transform = project.latestTransform;
  const bundle = project.latestBundle;

  if (!transform || !bundle) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Transform Preview" />
        <EmptyState
          icon={ArrowRightLeft}
          title="No transform data"
          description="Run an audit to generate transform previews."
        />
      </div>
    );
  }

  const filteredItems = transform.items.filter(
    (item) =>
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.itemId.toLowerCase().includes(search.toLowerCase()) ||
      item.slug.toLowerCase().includes(search.toLowerCase())
  );

  const selectedDoc = selectedItemId
    ? transform.items.find((item) => item.itemId === selectedItemId)
    : filteredItems[0];

  const selectedSourceItem = selectedDoc
    ? bundle.contentItems.find((item) => item.id === selectedDoc.itemId)
    : undefined;

  const relatedWarnings = selectedDoc
    ? transform.warnings.filter((w) => w.itemId === selectedDoc.itemId)
    : [];

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader
        title="Transform Preview"
        description="Inspect how WordPress content is transformed into structured output"
      />

      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-220px)]">
        {/* Item List */}
        <div className="col-span-3 flex flex-col border rounded-lg overflow-hidden">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {filteredItems.map((item) => {
              const hasIssues = item.unsupportedNodeCount > 0 || item.fallbackNodeCount > 0;
              const isSelected = item.itemId === (selectedDoc?.itemId ?? filteredItems[0]?.itemId);
              return (
                <button
                  key={item.itemId}
                  className={cn(
                    "w-full text-left px-3 py-2.5 border-b border-border/50 hover:bg-muted/50 transition-colors",
                    isSelected && "bg-primary/5 border-l-2 border-l-primary"
                  )}
                  onClick={() => setSelectedItemId(item.itemId)}
                >
                  <p className="text-xs font-medium truncate">{item.title || item.slug}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground uppercase">{item.postType}</span>
                    {hasIssues && <AlertTriangle className="h-3 w-3 text-severity-medium" />}
                    {item.unsupportedNodeCount > 0 && (
                      <Badge variant="outline" className="text-[10px] h-4 px-1">
                        {item.unsupportedNodeCount} unsupported
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview Panes */}
        <div className="col-span-9">
          {selectedDoc ? (
            <Tabs defaultValue="structured" className="h-full flex flex-col">
              <TabsList className="shrink-0">
                <TabsTrigger value="source">
                  <FileText className="h-3.5 w-3.5 mr-1.5" />
                  Source
                </TabsTrigger>
                <TabsTrigger value="structured">
                  <Code2 className="h-3.5 w-3.5 mr-1.5" />
                  Structured Output
                </TabsTrigger>
                <TabsTrigger value="warnings">
                  <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                  Warnings ({relatedWarnings.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="source" className="flex-1 overflow-hidden">
                <Card className="h-full overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">WordPress Source Content</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-y-auto h-[calc(100%-60px)] scrollbar-thin">
                    <pre className="text-xs font-mono whitespace-pre-wrap break-words bg-muted/50 p-4 rounded-lg">
                      {selectedSourceItem?.content ?? "Source content not available"}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="structured" className="flex-1 overflow-hidden">
                <Card className="h-full overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Structured Output — {selectedDoc.nodes.length} nodes</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-y-auto h-[calc(100%-60px)] scrollbar-thin">
                    <div className="space-y-2">
                      {selectedDoc.nodes.map((node, idx) => {
                        const isFallback = node.type === "unsupported-block" || node.type === "html-fallback" || node.type === "shortcode-fallback";
                        return (
                          <div
                            key={idx}
                            className={cn(
                              "p-3 rounded-lg border text-xs",
                              isFallback
                                ? "border-severity-medium/30 bg-severity-medium/5"
                                : "border-border/50 bg-muted/30"
                            )}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={isFallback ? "destructive" : "secondary"} className="text-[10px]">
                                {node.type}
                              </Badge>
                              {isFallback && <AlertTriangle className="h-3 w-3 text-severity-medium" />}
                            </div>
                            <pre className="font-mono whitespace-pre-wrap break-words text-[11px] mt-1 text-muted-foreground">
                              {JSON.stringify(node, null, 2)}
                            </pre>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="warnings" className="flex-1 overflow-hidden">
                <Card className="h-full overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Warnings & Fallbacks</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-y-auto h-[calc(100%-60px)] scrollbar-thin">
                    {relatedWarnings.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-8 text-center">
                        No warnings for this item
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {relatedWarnings.map((warning) => (
                          <div key={warning.id} className="p-3 rounded-lg border">
                            <div className="flex items-center gap-2 mb-1">
                              <SeverityBadge severity={mapSeverity(warning.severity)} />
                              <code className="text-[10px] bg-muted px-1 rounded">{warning.sourceType}</code>
                            </div>
                            <p className="text-xs mt-1">{warning.message}</p>
                            {warning.rawValue && (
                              <pre className="text-[10px] font-mono mt-2 p-2 bg-muted/50 rounded overflow-x-auto">
                                {warning.rawValue.slice(0, 500)}
                              </pre>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <EmptyState
              icon={ArrowRightLeft}
              title="Select an item"
              description="Choose a content item from the list to preview its transform."
            />
          )}
        </div>
      </div>
    </div>
  );
}
