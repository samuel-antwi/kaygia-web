# Testing Guide

> Last updated: January 2025  
> Status: Testing framework not yet implemented  
> Priority: High - should be implemented soon

## Overview

This document outlines the testing strategy for Kaygia Web, including unit tests, integration tests, and end-to-end testing. Currently, **no testing framework is implemented**, but this guide provides the roadmap for comprehensive test coverage.

## Current Status

### ❌ Not Implemented
- Unit testing framework
- Integration tests
- End-to-end tests
- API testing
- Component testing
- Performance testing

### 🎯 Testing Goals
- 90%+ code coverage for critical business logic
- Automated testing in CI/CD pipeline
- Comprehensive API endpoint testing
- User journey validation
- Performance regression testing

## Recommended Testing Stack

### Frontend Testing
```json
{
  "dependencies": {
    "@nuxt/test-utils": "^3.x.x",
    "@vue/test-utils": "^2.x.x",
    "vitest": "^1.x.x",
    "jsdom": "^23.x.x",
    "playwright": "^1.x.x"
  }
}
```

### Backend Testing
```json
{
  "dependencies": {
    "supertest": "^6.x.x",
    "testcontainers": "^10.x.x"
  }
}
```

### Database Testing
```json
{
  "dependencies": {
    "@testcontainers/postgresql": "^10.x.x"
  }
}
```

## Testing Architecture

### Testing Layers
```
E2E Tests (Playwright)
├── User Journeys
├── Cross-Browser Testing
└── Visual Regression

Integration Tests (Vitest)
├── API Endpoints
├── Database Operations
└── Email Sending

Unit Tests (Vitest)
├── Components
├── Composables
├── Utilities
└── Business Logic
```

### Test Environment Setup
```typescript
// vitest.config.ts
export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    globals: true,
    setupFiles: ['./tests/setup.ts']
  }
})
```

## Unit Testing Strategy

### Components Testing

#### Authentication Components
```typescript
// tests/components/auth/LoginForm.test.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginForm from '~/layers/auth/components/LoginForm.vue'

describe('LoginForm', () => {
  it('should render login form fields', () => {
    const wrapper = mount(LoginForm)
    
    expect(wrapper.find('[data-testid="email-input"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="password-input"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="login-button"]').exists()).toBe(true)
  })

  it('should validate required fields', async () => {
    const wrapper = mount(LoginForm)
    
    await wrapper.find('form').trigger('submit')
    
    expect(wrapper.find('[data-testid="email-error"]').text()).toContain('Email is required')
    expect(wrapper.find('[data-testid="password-error"]').text()).toContain('Password is required')
  })

  it('should call login function with correct data', async () => {
    const mockLogin = vi.fn()
    const wrapper = mount(LoginForm, {
      global: {
        mocks: {
          $login: mockLogin
        }
      }
    })

    await wrapper.find('[data-testid="email-input"]').setValue('test@example.com')
    await wrapper.find('[data-testid="password-input"]').setValue('password123')
    await wrapper.find('form').trigger('submit')

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    })
  })
})
```

#### Dashboard Components
```typescript
// tests/components/dashboard/ProjectCard.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProjectCard from '~/layers/dashboard/components/ProjectCard.vue'

describe('ProjectCard', () => {
  const mockProject = {
    id: '1',
    title: 'Test Project',
    description: 'Test Description',
    status: 'IN_PROGRESS',
    type: 'WEBSITE',
    budget: 5000
  }

  it('should display project information', () => {
    const wrapper = mount(ProjectCard, {
      props: { project: mockProject }
    })

    expect(wrapper.text()).toContain('Test Project')
    expect(wrapper.text()).toContain('Test Description')
    expect(wrapper.text()).toContain('In Progress')
  })

  it('should format budget correctly', () => {
    const wrapper = mount(ProjectCard, {
      props: { project: mockProject }
    })

    expect(wrapper.text()).toContain('£5,000')
  })

  it('should emit click event when clicked', async () => {
    const wrapper = mount(ProjectCard, {
      props: { project: mockProject }
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')?.[0]).toEqual([mockProject])
  })
})
```

### Composables Testing

#### Authentication Composable
```typescript
// tests/composables/useAuth.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuth } from '~/layers/auth/composables/useAuth'

// Mock $fetch
const mockFetch = vi.fn()
vi.mock('#app', () => ({
  $fetch: mockFetch,
  navigateTo: vi.fn()
}))

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should login successfully', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'CLIENT'
    }

    mockFetch.mockResolvedValueOnce({
      success: true,
      user: mockUser
    })

    const { login } = useAuth()

    await login({
      email: 'test@example.com',
      password: 'password123'
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123'
      }
    })
  })

  it('should handle login errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Invalid credentials'))

    const { login } = useAuth()

    await expect(login({
      email: 'test@example.com',
      password: 'wrongpassword'
    })).rejects.toThrow('Invalid credentials')
  })
})
```

#### Project Store Testing
```typescript
// tests/stores/projectStore.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProjectStore } from '~/layers/dashboard/stores/projectStore'

describe('Project Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should fetch projects', async () => {
    const mockProjects = [
      { id: '1', title: 'Project 1', status: 'IN_PROGRESS' },
      { id: '2', title: 'Project 2', status: 'COMPLETED' }
    ]

    global.$fetch = vi.fn().mockResolvedValueOnce({
      projects: mockProjects
    })

    const store = useProjectStore()
    await store.fetchProjects()

    expect(store.projects).toEqual(mockProjects)
    expect(store.loading).toBe(false)
  })

  it('should create new project', async () => {
    const newProject = {
      id: '3',
      title: 'New Project',
      status: 'PENDING'
    }

    global.$fetch = vi.fn().mockResolvedValueOnce({
      project: newProject
    })

    const store = useProjectStore()
    const result = await store.createProject({
      title: 'New Project',
      description: 'Project description',
      type: 'WEBSITE'
    })

    expect(result).toEqual(newProject)
    expect(store.projects[0]).toEqual(newProject)
  })
})
```

### Utility Function Testing

#### Formatting Utilities
```typescript
// tests/utils/formatting.test.ts
import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate } from '~/layers/admin/composables/useFormatting'

describe('Formatting Utilities', () => {
  describe('formatCurrency', () => {
    it('should format currency in GBP', () => {
      expect(formatCurrency(1000)).toBe('£1,000.00')
      expect(formatCurrency(1234.56)).toBe('£1,234.56')
      expect(formatCurrency(0)).toBe('£0.00')
    })
  })

  describe('formatDate', () => {
    it('should format date in GB locale', () => {
      expect(formatDate('2024-01-15')).toBe('15/01/2024')
      expect(formatDate('2024-12-31')).toBe('31/12/2024')
    })
  })
})
```

## Integration Testing Strategy

### API Endpoint Testing

#### Authentication Endpoints
```typescript
// tests/api/auth.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

describe('Authentication API', () => {
  beforeAll(async () => {
    await setup({
      // Test configuration
    })
  })

  describe('POST /api/auth/register', () => {
    it('should create new user account', async () => {
      const response = await $fetch('/api/auth/register', {
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        }
      })

      expect(response.success).toBe(true)
      expect(response.requiresVerification).toBe(true)
    })

    it('should reject duplicate email', async () => {
      // Create user first
      await $fetch('/api/auth/register', {
        method: 'POST',
        body: {
          email: 'duplicate@example.com',
          password: 'password123'
        }
      })

      // Try to create again
      await expect($fetch('/api/auth/register', {
        method: 'POST',
        body: {
          email: 'duplicate@example.com',
          password: 'password123'
        }
      })).rejects.toThrow('Email already exists')
    })
  })

  describe('POST /api/auth/login', () => {
    it('should authenticate valid user', async () => {
      // Setup: Create and verify user
      await createAndVerifyUser('login@example.com', 'password123')

      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        body: {
          email: 'login@example.com',
          password: 'password123'
        }
      })

      expect(response.success).toBe(true)
      expect(response.user.email).toBe('login@example.com')
    })

    it('should reject invalid credentials', async () => {
      await expect($fetch('/api/auth/login', {
        method: 'POST',
        body: {
          email: 'invalid@example.com',
          password: 'wrongpassword'
        }
      })).rejects.toThrow('Invalid credentials')
    })
  })
})
```

#### Project Management Endpoints
```typescript
// tests/api/projects.integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

describe('Projects API', () => {
  let authCookie: string
  let userId: string

  beforeEach(async () => {
    // Setup authenticated user
    const { cookie, user } = await createAuthenticatedUser()
    authCookie = cookie
    userId = user.id
  })

  describe('GET /api/projects', () => {
    it('should return user projects', async () => {
      // Create test project
      await createTestProject(userId)

      const response = await $fetch('/api/projects', {
        headers: { cookie: authCookie }
      })

      expect(response.projects).toHaveLength(1)
      expect(response.projects[0].clientId).toBe(userId)
    })

    it('should require authentication', async () => {
      await expect($fetch('/api/projects')).rejects.toThrow('Unauthorized')
    })
  })

  describe('POST /api/projects', () => {
    it('should create new project', async () => {
      const projectData = {
        title: 'Test Project',
        description: 'Test Description',
        type: 'WEBSITE',
        budget: 5000
      }

      const response = await $fetch('/api/projects', {
        method: 'POST',
        body: projectData,
        headers: { cookie: authCookie }
      })

      expect(response.project.title).toBe('Test Project')
      expect(response.project.clientId).toBe(userId)
      expect(response.project.status).toBe('PENDING')
    })
  })
})
```

### Database Integration Testing

#### Database Operations
```typescript
// tests/database/operations.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PostgreSqlContainer } from '@testcontainers/postgresql'
import { db } from '~/server/db'
import { users, projects } from '~/server/db/schema'

describe('Database Operations', () => {
  let container: PostgreSqlContainer

  beforeAll(async () => {
    // Start test database container
    container = await new PostgreSqlContainer()
      .withDatabase('test_db')
      .withUsername('test_user')
      .withPassword('test_password')
      .start()

    // Run migrations on test database
    process.env.DATABASE_URL = container.getConnectionUri()
    await runMigrations()
  })

  afterAll(async () => {
    await container.stop()
  })

  it('should create user with proper constraints', async () => {
    const userData = {
      id: 'test-user-1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'CLIENT' as const,
      emailVerified: true,
      active: true
    }

    const [user] = await db.insert(users).values(userData).returning()

    expect(user.email).toBe('test@example.com')
    expect(user.role).toBe('CLIENT')
    expect(user.emailVerified).toBe(true)
  })

  it('should enforce unique email constraint', async () => {
    const userData = {
      id: 'test-user-2',
      email: 'duplicate@example.com',
      role: 'CLIENT' as const
    }

    await db.insert(users).values(userData)

    // Try to insert duplicate email
    await expect(
      db.insert(users).values({
        ...userData,
        id: 'test-user-3'
      })
    ).rejects.toThrow('duplicate key value')
  })

  it('should maintain referential integrity', async () => {
    // Create user
    const [user] = await db.insert(users).values({
      id: 'user-with-projects',
      email: 'user@example.com',
      role: 'CLIENT' as const
    }).returning()

    // Create project
    const [project] = await db.insert(projects).values({
      id: 'test-project',
      title: 'Test Project',
      clientId: user.id,
      type: 'WEBSITE' as const
    }).returning()

    expect(project.clientId).toBe(user.id)

    // Delete user should cascade delete projects
    await db.delete(users).where(eq(users.id, user.id))

    const remainingProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.id, project.id))

    expect(remainingProjects).toHaveLength(0)
  })
})
```

## End-to-End Testing Strategy

### User Journey Testing

#### Authentication Flow
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should complete full registration and login flow', async ({ page }) => {
    // Navigate to registration
    await page.goto('/auth/register')

    // Fill registration form
    await page.fill('[data-testid="email-input"]', 'e2e@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.fill('[data-testid="name-input"]', 'E2E Test User')
    await page.click('[data-testid="register-button"]')

    // Should redirect to check email page
    await expect(page).toHaveURL('/auth/check-email')
    await expect(page.locator('h1')).toContainText('Check your email')

    // Simulate email verification (in real test, would check email)
    const verificationToken = await getVerificationToken('e2e@example.com')
    await page.goto(`/verify-email/${verificationToken}`)

    // Should redirect to login with success message
    await expect(page).toHaveURL('/auth/login')
    await expect(page.locator('.success-message')).toContainText('Email verified')

    // Login with new account
    await page.fill('[data-testid="email-input"]', 'e2e@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Welcome back, E2E Test User')
  })

  test('should handle password reset flow', async ({ page }) => {
    // Create user first
    await createTestUser('reset@example.com', 'oldpassword')

    // Request password reset
    await page.goto('/auth/forgot-password')
    await page.fill('[data-testid="email-input"]', 'reset@example.com')
    await page.click('[data-testid="reset-button"]')

    await expect(page.locator('.success-message')).toContainText('Reset email sent')

    // Complete password reset
    const resetToken = await getPasswordResetToken('reset@example.com')
    await page.goto(`/auth/reset-password/${resetToken}`)

    await page.fill('[data-testid="password-input"]', 'newpassword123')
    await page.fill('[data-testid="confirm-password-input"]', 'newpassword123')
    await page.click('[data-testid="update-password-button"]')

    // Should redirect to login
    await expect(page).toHaveURL('/auth/login')

    // Login with new password
    await page.fill('[data-testid="email-input"]', 'reset@example.com')
    await page.fill('[data-testid="password-input"]', 'newpassword123')
    await page.click('[data-testid="login-button"]')

    await expect(page).toHaveURL('/dashboard')
  })
})
```

#### Project Management Flow
```typescript
// tests/e2e/projects.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Project Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as test user
    await loginAsTestUser(page)
  })

  test('should create and manage project', async ({ page }) => {
    // Navigate to projects
    await page.goto('/dashboard/projects')
    await expect(page.locator('h1')).toContainText('Projects')

    // Create new project
    await page.click('[data-testid="new-project-button"]')
    await expect(page).toHaveURL('/dashboard/projects/new')

    // Fill project form
    await page.fill('[data-testid="title-input"]', 'E2E Test Project')
    await page.fill('[data-testid="description-input"]', 'Project created by E2E test')
    await page.selectOption('[data-testid="type-select"]', 'WEBSITE')
    await page.fill('[data-testid="budget-input"]', '5000')
    await page.click('[data-testid="create-project-button"]')

    // Should redirect to project details
    await expect(page.locator('h1')).toContainText('E2E Test Project')
    await expect(page.locator('[data-testid="project-status"]')).toContainText('Pending')

    // Navigate back to projects list
    await page.goto('/dashboard/projects')
    await expect(page.locator('[data-testid="project-card"]')).toContainText('E2E Test Project')
  })

  test('should filter projects by status', async ({ page }) => {
    // Create projects with different statuses
    await createTestProject('Pending Project', 'PENDING')
    await createTestProject('Active Project', 'IN_PROGRESS')

    await page.goto('/dashboard/projects')

    // Filter by status
    await page.selectOption('[data-testid="status-filter"]', 'IN_PROGRESS')
    
    await expect(page.locator('[data-testid="project-card"]')).toHaveCount(1)
    await expect(page.locator('[data-testid="project-card"]')).toContainText('Active Project')
  })
})
```

#### Admin Panel Testing
```typescript
// tests/e2e/admin.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Admin Panel', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('should manage users', async ({ page }) => {
    await page.goto('/admin/users')

    // Create new user
    await page.click('[data-testid="create-user-button"]')
    await page.fill('[data-testid="email-input"]', 'admin-created@example.com')
    await page.fill('[data-testid="name-input"]', 'Admin Created User')
    await page.selectOption('[data-testid="role-select"]', 'CLIENT')
    await page.click('[data-testid="create-user-submit"]')

    // Should appear in users list
    await expect(page.locator('[data-testid="users-table"]')).toContainText('admin-created@example.com')

    // Update user role
    await page.click('[data-testid="user-row"]:has-text("admin-created@example.com")')
    await page.selectOption('[data-testid="role-select"]', 'ADMIN')
    await page.click('[data-testid="update-role-button"]')

    await expect(page.locator('[data-testid="user-role"]')).toContainText('Admin')
  })
})
```

## Performance Testing

### Load Testing
```typescript
// tests/performance/load.test.ts
import { describe, it, expect } from 'vitest'
import { performance } from 'perf_hooks'

describe('Performance Tests', () => {
  it('should handle concurrent user registrations', async () => {
    const concurrentUsers = 10
    const startTime = performance.now()

    const promises = Array.from({ length: concurrentUsers }, (_, i) =>
      $fetch('/api/auth/register', {
        method: 'POST',
        body: {
          email: `load-test-${i}@example.com`,
          password: 'password123'
        }
      })
    )

    await Promise.all(promises)

    const endTime = performance.now()
    const duration = endTime - startTime

    // Should complete within reasonable time
    expect(duration).toBeLessThan(5000) // 5 seconds
  })

  it('should efficiently query large datasets', async () => {
    // Create large dataset
    const projectCount = 1000
    await createManyProjects(projectCount)

    const startTime = performance.now()
    
    const response = await $fetch('/api/projects')
    
    const endTime = performance.now()
    const duration = endTime - startTime

    expect(response.projects).toHaveLength(projectCount)
    expect(duration).toBeLessThan(1000) // 1 second
  })
})
```

## CI/CD Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:coverage

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
      
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Test Configuration

### Package.json Scripts
```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run --coverage",
    "test:integration": "vitest run tests/integration",
    "test:e2e": "playwright test",
    "test:coverage": "vitest run --coverage --reporter=lcov",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui"
  }
}
```

### Test Setup Files
```typescript
// tests/setup.ts
import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Global test setup
beforeEach(() => {
  vi.clearAllMocks()
})

// Vue Test Utils global config
config.global.mocks = {
  $t: (msg: string) => msg, // i18n mock
  $fetch: vi.fn(),
  navigateTo: vi.fn()
}

// Global test utilities
global.createTestUser = async (email: string, password: string) => {
  // Test user creation utility
}

global.loginAsTestUser = async (page: Page) => {
  // E2E login utility
}
```

## Implementation Priority

### Phase 1: Foundation (Immediate)
1. **Setup testing framework** (Vitest + Playwright)
2. **Basic unit tests** for critical utilities
3. **API endpoint integration tests**
4. **Simple E2E tests** for auth flow

### Phase 2: Core Coverage (Next Sprint)
1. **Component testing** for major UI components
2. **Composable testing** for business logic
3. **Database integration testing**
4. **Admin panel E2E tests**

### Phase 3: Advanced Testing (Future)
1. **Performance testing** and benchmarks
2. **Visual regression testing**
3. **Accessibility testing**
4. **Load testing** for production readiness

This comprehensive testing strategy will ensure the reliability, maintainability, and quality of the Kaygia Web platform while supporting confident deployment and feature development.