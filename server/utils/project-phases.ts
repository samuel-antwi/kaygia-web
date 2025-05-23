export const PROJECT_PHASES = {
  DISCOVERY: {
    id: 'discovery',
    name: 'Discovery & Planning',
    description: 'Requirements gathering, research, and project planning',
    defaultWeight: 15,
    order: 1
  },
  DESIGN: {
    id: 'design',
    name: 'Design & Prototyping',
    description: 'UI/UX design, wireframing, and visual mockups',
    defaultWeight: 25,
    order: 2
  },
  DEVELOPMENT: {
    id: 'development',
    name: 'Development',
    description: 'Building features and functionality',
    defaultWeight: 40,
    order: 3
  },
  TESTING: {
    id: 'testing',
    name: 'Testing & Review',
    description: 'Quality assurance, bug fixes, and client review',
    defaultWeight: 15,
    order: 4
  },
  DEPLOYMENT: {
    id: 'deployment',
    name: 'Deployment',
    description: 'Launch preparation and go-live',
    defaultWeight: 5,
    order: 5
  }
} as const;

export type ProjectPhase = keyof typeof PROJECT_PHASES;
export type ProjectPhaseId = typeof PROJECT_PHASES[ProjectPhase]['id'];

export const getPhaseById = (id: string) => {
  return Object.values(PROJECT_PHASES).find(phase => phase.id === id);
};

export const getPhaseProgress = (
  phase: ProjectPhaseId,
  milestones: Array<{ phase: string | null; status: string; weight: number }>
): number => {
  const phaseMilestones = milestones.filter(m => m.phase === phase);
  if (phaseMilestones.length === 0) return 0;
  
  const totalWeight = phaseMilestones.reduce((sum, m) => sum + m.weight, 0);
  const completedWeight = phaseMilestones
    .filter(m => m.status === 'completed')
    .reduce((sum, m) => sum + m.weight, 0);
  
  return Math.round((completedWeight / totalWeight) * 100);
};

export const calculateOverallProgress = (
  milestones: Array<{ phase: string | null; status: string; weight: number }>,
  projectStatus?: string
): number => {
  // If no milestones exist, provide minimum progress based on status
  if (milestones.length === 0 && projectStatus) {
    switch (projectStatus) {
      case 'APPROVED':
        return 5; // Project just approved, discovery starting
      case 'IN_PROGRESS':
        return 15; // Assume discovery is complete
      case 'REVIEW':
        return 85;
      case 'COMPLETED':
        return 100;
      default:
        return 0;
    }
  }
  
  // Group milestones by phase
  const phaseProgress: Record<string, number> = {};
  
  Object.values(PROJECT_PHASES).forEach(phase => {
    phaseProgress[phase.id] = getPhaseProgress(phase.id, milestones);
  });
  
  // Calculate weighted average
  let totalProgress = 0;
  let totalWeight = 0;
  
  Object.entries(phaseProgress).forEach(([phaseId, progress]) => {
    const phase = getPhaseById(phaseId);
    if (phase) {
      totalProgress += progress * phase.defaultWeight;
      totalWeight += phase.defaultWeight;
    }
  });
  
  return totalWeight > 0 ? Math.round(totalProgress / totalWeight) : 0;
};

export const getCurrentPhase = (
  milestones: Array<{ phase: string | null; status: string }>
): ProjectPhaseId | null => {
  // Find the earliest phase with incomplete milestones
  for (const phase of Object.values(PROJECT_PHASES).sort((a, b) => a.order - b.order)) {
    const phaseMilestones = milestones.filter(m => m.phase === phase.id);
    const hasIncomplete = phaseMilestones.some(m => m.status !== 'completed');
    
    if (hasIncomplete || phaseMilestones.length === 0) {
      return phase.id as ProjectPhaseId;
    }
  }
  
  // All phases complete
  return 'deployment';
};