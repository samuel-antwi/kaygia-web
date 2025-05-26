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
  | "LANDING_PAGE";

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
  progress?: number | null; // 0-100
  
  // Timeline & Scope
  timelinePreference?: string | null;
  preferredLaunchDate?: string | null;
  maintenanceRequired?: boolean | null;
  
  // Technical Requirements
  hostingPreference?: string | null;
  domainStatus?: string | null;
  integrationsNeeded?: string[] | null;
  performanceRequirements?: string | null;
  seoRequirements?: string | null;
  
  // Content & Assets
  contentReadiness?: string | null;
  brandAssetsStatus?: string | null;
  competitorReferences?: string | null;
  cmsRequired?: boolean | null;
  
  // Business Context
  targetAudience?: string | null;
  businessGoals?: string | null;
  successMetrics?: string | null;
  complianceRequirements?: string[] | null;
  
  // Communication
  communicationPreference?: string | null;
  timezone?: string | null;
  keyStakeholders?: string | null;
  approvalProcess?: string | null;
}

export interface CreateProjectPayload {
  title: string;
  description?: string;
  type: ProjectType;
  budget?: number;
  requirements?: string;
  
  // Timeline & Scope
  timelinePreference?: string;
  preferredLaunchDate?: string;
  maintenanceRequired?: boolean;
  
  // Technical Requirements
  hostingPreference?: string;
  domainStatus?: string;
  integrationsNeeded?: string[];
  performanceRequirements?: string;
  seoRequirements?: string;
  
  // Content & Assets
  contentReadiness?: string;
  brandAssetsStatus?: string;
  competitorReferences?: string;
  cmsRequired?: boolean;
  
  // Business Context
  targetAudience?: string;
  businessGoals?: string;
  successMetrics?: string;
  complianceRequirements?: string[];
  
  // Communication
  communicationPreference?: string;
  timezone?: string;
  keyStakeholders?: string;
  approvalProcess?: string;
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
