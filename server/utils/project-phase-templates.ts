export interface PhaseTemplate {
  id: string
  name: string
  description: string
  order: number
  defaultMilestones?: Array<{
    name: string
    description: string
  }>
}

export interface ProjectTemplate {
  id: string
  name: string
  description: string
  phases: PhaseTemplate[]
}

// Define project type to template mapping
export const PROJECT_TEMPLATES: Record<string, ProjectTemplate> = {
  WEBSITE: {
    id: 'website',
    name: 'Website Development',
    description: 'Standard website development project',
    phases: [
      {
        id: 'discovery',
        name: 'Discovery & Planning',
        description: 'Requirements gathering, sitemap, and project planning',
        order: 1,
        defaultMilestones: [
          { name: 'Requirements Analysis', description: 'Gather and document all project requirements' },
          { name: 'Sitemap & Architecture', description: 'Define site structure and navigation' },
          { name: 'Technical Specification', description: 'Document technical requirements and approach' }
        ]
      },
      {
        id: 'design',
        name: 'Design & Prototyping',
        description: 'Visual design, mockups, and interactive prototypes',
        order: 2,
        defaultMilestones: [
          { name: 'Wireframes', description: 'Create low-fidelity layouts' },
          { name: 'Visual Design', description: 'High-fidelity design mockups' },
          { name: 'Prototype Review', description: 'Interactive prototype and client feedback' }
        ]
      },
      {
        id: 'development',
        name: 'Development',
        description: 'Frontend and backend development',
        order: 3,
        defaultMilestones: [
          { name: 'Frontend Development', description: 'Build responsive user interface' },
          { name: 'Backend Development', description: 'Implement server-side functionality' },
          { name: 'Content Integration', description: 'Add and format all content' }
        ]
      },
      {
        id: 'launch',
        name: 'Testing & Launch',
        description: 'Quality assurance and deployment',
        order: 4,
        defaultMilestones: [
          { name: 'Testing & QA', description: 'Cross-browser and device testing' },
          { name: 'Client Training', description: 'Train client on content management' },
          { name: 'Go Live', description: 'Deploy to production' }
        ]
      }
    ]
  },
  
  ECOMMERCE: {
    id: 'ecommerce',
    name: 'E-commerce Platform',
    description: 'Online store with product catalog and payments',
    phases: [
      {
        id: 'discovery',
        name: 'Discovery & Requirements',
        description: 'Business analysis and e-commerce strategy',
        order: 1,
        defaultMilestones: [
          { name: 'Business Requirements', description: 'Define store goals and features' },
          { name: 'Product Catalog Planning', description: 'Structure categories and attributes' },
          { name: 'Payment & Shipping Strategy', description: 'Define checkout and fulfillment process' }
        ]
      },
      {
        id: 'design',
        name: 'UX/UI Design',
        description: 'E-commerce focused design and user flows',
        order: 2,
        defaultMilestones: [
          { name: 'User Journey Mapping', description: 'Define shopping and checkout flows' },
          { name: 'Store Design', description: 'Product pages, cart, and checkout design' },
          { name: 'Mobile Commerce Design', description: 'Optimize for mobile shopping' }
        ]
      },
      {
        id: 'development',
        name: 'Store Development',
        description: 'Build core e-commerce functionality',
        order: 3,
        defaultMilestones: [
          { name: 'Store Foundation', description: 'Set up e-commerce platform' },
          { name: 'Product Management', description: 'Implement catalog and inventory' },
          { name: 'Shopping Cart', description: 'Build cart and wishlist features' }
        ]
      },
      {
        id: 'products',
        name: 'Product Setup',
        description: 'Product data and content creation',
        order: 4,
        defaultMilestones: [
          { name: 'Product Import', description: 'Add all products to catalog' },
          { name: 'Product Photography', description: 'Process and optimize images' },
          { name: 'SEO Optimization', description: 'Optimize product descriptions' }
        ]
      },
      {
        id: 'payment',
        name: 'Payment & Integration',
        description: 'Payment processing and third-party integrations',
        order: 5,
        defaultMilestones: [
          { name: 'Payment Gateway', description: 'Set up payment processing' },
          { name: 'Shipping Integration', description: 'Connect shipping providers' },
          { name: 'Analytics Setup', description: 'Implement tracking and analytics' }
        ]
      },
      {
        id: 'launch',
        name: 'Testing & Launch',
        description: 'E-commerce testing and go-live',
        order: 6,
        defaultMilestones: [
          { name: 'Order Testing', description: 'Test complete purchase flows' },
          { name: 'Security Audit', description: 'Ensure PCI compliance' },
          { name: 'Soft Launch', description: 'Limited release for final testing' },
          { name: 'Full Launch', description: 'Public store launch' }
        ]
      }
    ]
  },
  
  WEB_APP: {
    id: 'web_app',
    name: 'Web Application',
    description: 'Custom web application development',
    phases: [
      {
        id: 'discovery',
        name: 'Discovery & Analysis',
        description: 'Requirements analysis and technical planning',
        order: 1,
        defaultMilestones: [
          { name: 'User Research', description: 'Understand user needs and workflows' },
          { name: 'Technical Architecture', description: 'Design system architecture' },
          { name: 'API Specification', description: 'Define data models and endpoints' }
        ]
      },
      {
        id: 'design',
        name: 'UX/UI Design',
        description: 'User experience and interface design',
        order: 2,
        defaultMilestones: [
          { name: 'User Flows', description: 'Map out application workflows' },
          { name: 'UI Design System', description: 'Create component library' },
          { name: 'Interactive Prototype', description: 'Clickable prototype for testing' }
        ]
      },
      {
        id: 'development',
        name: 'Core Development',
        description: 'Build application features',
        order: 3,
        defaultMilestones: [
          { name: 'Authentication System', description: 'User registration and login' },
          { name: 'Core Features', description: 'Primary application functionality' },
          { name: 'API Development', description: 'Backend services and data layer' }
        ]
      },
      {
        id: 'integration',
        name: 'Integration & Polish',
        description: 'Third-party integrations and refinement',
        order: 4,
        defaultMilestones: [
          { name: 'External Integrations', description: 'Connect third-party services' },
          { name: 'Performance Optimization', description: 'Speed and efficiency improvements' },
          { name: 'Security Hardening', description: 'Security audit and fixes' }
        ]
      },
      {
        id: 'testing',
        name: 'Testing & Deployment',
        description: 'Comprehensive testing and deployment',
        order: 5,
        defaultMilestones: [
          { name: 'Unit Testing', description: 'Automated test coverage' },
          { name: 'User Acceptance Testing', description: 'Client testing and feedback' },
          { name: 'Deployment Setup', description: 'Configure hosting and CI/CD' },
          { name: 'Production Launch', description: 'Deploy to live environment' }
        ]
      }
    ]
  },
  
  BRANDING: {
    id: 'branding',
    name: 'Branding & Identity',
    description: 'Brand development and design system',
    phases: [
      {
        id: 'research',
        name: 'Research & Strategy',
        description: 'Market research and brand positioning',
        order: 1,
        defaultMilestones: [
          { name: 'Market Analysis', description: 'Competitive landscape research' },
          { name: 'Brand Workshop', description: 'Define brand values and personality' },
          { name: 'Positioning Strategy', description: 'Unique value proposition' }
        ]
      },
      {
        id: 'identity',
        name: 'Visual Identity',
        description: 'Logo and core brand elements',
        order: 2,
        defaultMilestones: [
          { name: 'Logo Concepts', description: 'Initial logo explorations' },
          { name: 'Logo Refinement', description: 'Finalize logo design' },
          { name: 'Color & Typography', description: 'Define brand palette and fonts' }
        ]
      },
      {
        id: 'applications',
        name: 'Brand Applications',
        description: 'Apply brand across touchpoints',
        order: 3,
        defaultMilestones: [
          { name: 'Business Cards', description: 'Stationery design' },
          { name: 'Digital Templates', description: 'Email and presentation templates' },
          { name: 'Social Media Kit', description: 'Profile and post templates' }
        ]
      },
      {
        id: 'guidelines',
        name: 'Brand Guidelines',
        description: 'Documentation and standards',
        order: 4,
        defaultMilestones: [
          { name: 'Style Guide', description: 'Visual standards documentation' },
          { name: 'Usage Guidelines', description: 'Do\'s and don\'ts' },
          { name: 'Asset Delivery', description: 'Final files and formats' }
        ]
      }
    ]
  },
  
  MARKETING: {
    id: 'marketing',
    name: 'Digital Marketing',
    description: 'Marketing strategy and campaign execution',
    phases: [
      {
        id: 'strategy',
        name: 'Strategy Development',
        description: 'Marketing analysis and planning',
        order: 1,
        defaultMilestones: [
          { name: 'Audience Research', description: 'Define target demographics' },
          { name: 'Channel Strategy', description: 'Select marketing channels' },
          { name: 'Campaign Planning', description: 'Develop campaign calendar' }
        ]
      },
      {
        id: 'content',
        name: 'Content Creation',
        description: 'Develop marketing materials',
        order: 2,
        defaultMilestones: [
          { name: 'Content Strategy', description: 'Plan content themes and topics' },
          { name: 'Asset Creation', description: 'Design ads and graphics' },
          { name: 'Copy Development', description: 'Write marketing copy' }
        ]
      },
      {
        id: 'implementation',
        name: 'Campaign Launch',
        description: 'Execute marketing campaigns',
        order: 3,
        defaultMilestones: [
          { name: 'Campaign Setup', description: 'Configure platforms and tools' },
          { name: 'Initial Launch', description: 'Start campaign activities' },
          { name: 'A/B Testing', description: 'Test and optimize performance' }
        ]
      },
      {
        id: 'optimization',
        name: 'Analysis & Optimization',
        description: 'Monitor and improve results',
        order: 4,
        defaultMilestones: [
          { name: 'Performance Analysis', description: 'Review campaign metrics' },
          { name: 'Optimization', description: 'Refine based on data' },
          { name: 'Reporting', description: 'Deliver results and insights' }
        ]
      }
    ]
  }
}

// Helper function to get template by project type
export function getProjectTemplate(projectType: string): ProjectTemplate | null {
  return PROJECT_TEMPLATES[projectType] || null
}

// Helper function to get all available templates
export function getAllTemplates(): ProjectTemplate[] {
  return Object.values(PROJECT_TEMPLATES)
}

// Helper function to calculate phase progress
export function calculatePhaseProgress(
  phaseMilestones: Array<{ status: string }>,
  totalMilestones: number
): number {
  if (totalMilestones === 0) return 0
  const completedCount = phaseMilestones.filter(m => m.status === 'completed').length
  return Math.round((completedCount / totalMilestones) * 100)
}

// Helper function to determine if phase is complete
export function isPhaseComplete(phaseMilestones: Array<{ status: string }>): boolean {
  return phaseMilestones.length > 0 && phaseMilestones.every(m => m.status === 'completed')
}