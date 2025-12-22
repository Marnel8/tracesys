"use client";

import { Suspense, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InstructorArchiveTable,
  ArchiveColumn,
} from "@/components/instructor-archive-table";
import { ARCHIVE_ENTITY_CONFIG } from "@/lib/instructor-archives/config";
import type {
  ArchiveEntityType,
  ArchiveItem,
} from "@/lib/instructor-archives/types";

function getColumnsForEntityType(
  entityType: ArchiveEntityType
): ArchiveColumn[] {
  switch (entityType) {
    case "requirement":
      return [
        {
          id: "name",
          header: "Requirement Title",
          cell: (item) => item.name,
        },
        {
          id: "student",
          header: "Student",
          cell: (item) => {
            const raw = item.raw as any;
            if (raw?.student) {
              return (
                `${raw.student.firstName || ""} ${
                  raw.student.lastName || ""
                }`.trim() ||
                raw.student.email ||
                "Unknown"
              );
            }
            return item.meta?.studentName || "Unknown";
          },
        },
        {
          id: "status",
          header: "Status",
          cell: (item) => {
            const raw = item.raw as any;
            const status = raw?.status || item.meta?.status || "Unknown";
            return <span className="capitalize">{status}</span>;
          },
        },
        {
          id: "deletedAt",
          header: "Deleted At",
          cell: (item) =>
            new Date(item.deletedAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            }),
        },
        {
          id: "deletedBy",
          header: "Deleted By",
          cell: (item) => item.deletedBy ?? "Unknown",
        },
      ];
    default:
      return [
        {
          id: "name",
          header: "Name",
          cell: (item) => item.name,
        },
        {
          id: "deletedAt",
          header: "Deleted At",
          cell: (item) =>
            new Date(item.deletedAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            }),
        },
        {
          id: "deletedBy",
          header: "Deleted By",
          cell: (item) => item.deletedBy ?? "Unknown",
        },
      ];
  }
}

export default function InstructorArchivesPage() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Archives</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            View and manage items that have been temporarily deleted from the
            instructor dashboard. You can restore items or delete them
            permanently from here.
          </p>
        </CardContent>
      </Card>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
            Loading archived items...
          </div>
        }
      >
        <Tabs defaultValue="students" className="w-full">
          <TabsList className="flex w-full justify-between gap-1">
            {ARCHIVE_ENTITY_CONFIG.map((config) => (
              <TabsTrigger
                key={config.tabValue}
                value={config.tabValue}
                className="flex-1 text-xs sm:text-sm py-2 text-center whitespace-nowrap"
              >
                {config.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {ARCHIVE_ENTITY_CONFIG.map((config) => (
            <TabsContent key={config.tabValue} value={config.tabValue}>
              <InstructorArchiveTable
                entityType={config.type}
                columns={getColumnsForEntityType(config.type)}
              />
            </TabsContent>
          ))}
        </Tabs>
      </Suspense>
    </div>
  );
}
