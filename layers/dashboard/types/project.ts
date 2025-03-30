// Project types for the application
export type ProjectStatus =
  | "PENDING"
  | "APPROVED"
  | "IN_PROGRESS"
  | "REVIEW"
  | "COMPLETED"
  | "CANCELLED";

export type ProjectType =
  | "WEBSITE"
  | "E_COMMERCE"
  | "WEB_APP"
  | "MOBILE_APP"
  | "BRANDING"
  | "MARKETING"
  | "OTHER";

export interface Project {
  id: string;
  title: string;
  description?: string | null;
  status: ProjectStatus;
  clientId: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  startDate?: string | null; // ISO date string
  endDate?: string | null; // ISO date string
  type: ProjectType;
  budget?: number | null;
  requirements?: string | null;
}

export interface CreateProjectPayload {
  title: string;
  description?: string;
  type: ProjectType;
  budget?: number;
  requirements?: string;
}

export interface UpdateProjectPayload {
  title?: string;
  description?: string | null;
  status?: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
  budget?: number | null;
  requirements?: string | null;
}
