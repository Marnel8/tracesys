import type { ArchiveEntityType } from "./types";

export interface ArchiveEntityConfig {
  type: ArchiveEntityType;
  label: string;
  tabValue: string;
}

export const ARCHIVE_ENTITY_CONFIG: ArchiveEntityConfig[] = [
  {
    type: "student",
    label: "Students",
    tabValue: "students",
  },
  {
    type: "agency",
    label: "Agencies",
    tabValue: "agencies",
  },
  {
    type: "course",
    label: "Courses",
    tabValue: "courses",
  },
  {
    type: "section",
    label: "Sections",
    tabValue: "sections",
  },
  {
    type: "announcement",
    label: "Announcements",
    tabValue: "announcements",
  },
  {
    type: "requirement",
    label: "Requirements",
    tabValue: "requirements",
  },
  {
    type: "requirementTemplate",
    label: "Requirement Templates",
    tabValue: "requirement-templates",
  },
];
