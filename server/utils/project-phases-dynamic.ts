import { getProjectTemplate, PROJECT_TEMPLATES } from './project-phase-templates';

// Get phases for a specific project based on its template
export async function getProjectPhases(projectType: string, phaseTemplate?: string | null) {
  // If project has a specific template, use it
  if (phaseTemplate && PROJECT_TEMPLATES[projectType]) {
    const template = PROJECT_TEMPLATES[projectType];
    return template.phases.reduce((acc, phase) => {
      acc[phase.id] = {
        id: phase.id,
        name: phase.name,
        description: phase.description,
        defaultWeight: 100 / template.phases.length, // Equal weight by default
        order: phase.order
      };
      return acc;
    }, {} as Record<string, any>);
  }
  
  // Otherwise try to get template by project type
  const template = getProjectTemplate(projectType);
  if (template) {
    return template.phases.reduce((acc, phase) => {
      acc[phase.id] = {
        id: phase.id,
        name: phase.name,
        description: phase.description,
        defaultWeight: 100 / template.phases.length,
        order: phase.order
      };
      return acc;
    }, {} as Record<string, any>);
  }
  
  // Fallback to generic phases
  return {
    discovery: {
      id: 'discovery',
      name: 'Discovery & Planning',
      description: 'Requirements gathering and planning',
      defaultWeight: 20,
      order: 1
    },
    design: {
      id: 'design',
      name: 'Design',
      description: 'Visual design and user experience',
      defaultWeight: 20,
      order: 2
    },
    development: {
      id: 'development',
      name: 'Development',
      description: 'Building the solution',
      defaultWeight: 40,
      order: 3
    },
    launch: {
      id: 'launch',
      name: 'Testing & Launch',
      description: 'Quality assurance and deployment',
      defaultWeight: 20,
      order: 4
    }
  };
}

// Calculate phase-specific progress
export function calculatePhaseProgress(
  phaseMilestones: Array<{ status: string; weight: number }>
): number {
  if (phaseMilestones.length === 0) return 0;
  
  const totalWeight = phaseMilestones.reduce((sum, m) => sum + m.weight, 0);
  const completedWeight = phaseMilestones
    .filter(m => m.status === 'completed')
    .reduce((sum, m) => sum + m.weight, 0);
  
  return totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
}

// Calculate overall project progress based on phase completion
export function calculateOverallProgressByPhases(
  phases: Record<string, any>,
  phaseProgress: Record<string, number>
): number {
  const phaseIds = Object.keys(phases);
  if (phaseIds.length === 0) return 0;
  
  let totalProgress = 0;
  let totalWeight = 0;
  
  for (const phaseId of phaseIds) {
    const phase = phases[phaseId];
    const progress = phaseProgress[phaseId] || 0;
    const weight = phase.defaultWeight || (100 / phaseIds.length);
    
    totalProgress += progress * weight;
    totalWeight += weight;
  }
  
  return totalWeight > 0 ? Math.round(totalProgress / totalWeight) : 0;
}

// Get current phase based on progress
export function getCurrentPhaseFromProgress(
  phases: Record<string, any>,
  phaseProgress: Record<string, number>
): { id: string; name: string } | null {
  const sortedPhases = Object.values(phases).sort((a: any, b: any) => a.order - b.order);
  
  for (const phase of sortedPhases) {
    const progress = phaseProgress[phase.id] || 0;
    if (progress < 100) {
      return { id: phase.id, name: phase.name };
    }
  }
  
  // All phases complete or no incomplete phase found
  const lastPhase = sortedPhases[sortedPhases.length - 1];
  return lastPhase ? { id: lastPhase.id, name: lastPhase.name } : null;
}