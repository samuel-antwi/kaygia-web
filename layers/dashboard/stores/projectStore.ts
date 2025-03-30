import { defineStore } from "pinia";
import type { Project, ProjectStatus, ProjectType } from "../types/project";

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
}

export const useProjectStore = defineStore("project", {
  state: (): ProjectState => ({
    projects: [],
    currentProject: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    // Get projects by status
    getProjectsByStatus: (state) => {
      return (status: ProjectStatus) =>
        state.projects.filter((project: Project) => project.status === status);
    },

    // Get project by ID
    getProjectById: (state) => {
      return (id: string) =>
        state.projects.find((project: Project) => project.id === id) || null;
    },

    // Get counts by status
    pendingProjectsCount: (state) =>
      state.projects.filter((p: Project) => p.status === "PENDING").length,
    inProgressProjectsCount: (state) =>
      state.projects.filter((p: Project) => p.status === "IN_PROGRESS").length,
    completedProjectsCount: (state) =>
      state.projects.filter((p: Project) => p.status === "COMPLETED").length,
  },

  actions: {
    // Fetch all projects for the authenticated user
    async fetchProjects() {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await $fetch<{
          success: boolean;
          projects: Project[];
          error?: string;
        }>("/api/projects");

        if (response.success) {
          this.projects = response.projects;
        } else {
          throw new Error(response.error || "Failed to fetch projects");
        }
      } catch (err: any) {
        this.error = err.message || "An error occurred while fetching projects";
        console.error("Error fetching projects:", err);
      } finally {
        this.isLoading = false;
      }
    },

    // Fetch a specific project by ID
    async fetchProject(id: string) {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await $fetch<{
          success: boolean;
          project: Project;
          error?: string;
        }>(`/api/projects/${id}`);

        if (response.success) {
          this.currentProject = response.project;

          // Update the project in the projects array if it exists
          const index = this.projects.findIndex((p: Project) => p.id === id);
          if (index !== -1) {
            this.projects[index] = response.project;
          } else {
            this.projects.push(response.project);
          }
        } else {
          throw new Error(response.error || "Failed to fetch project");
        }
      } catch (err: any) {
        this.error =
          err.message || "An error occurred while fetching the project";
        console.error("Error fetching project:", err);
      } finally {
        this.isLoading = false;
      }
    },

    // Create a new project
    async createProject(projectData: {
      title: string;
      description?: string;
      type: ProjectType;
      budget?: number;
      requirements?: string;
    }) {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await $fetch<{
          success: boolean;
          project: Project;
          error?: string;
        }>("/api/projects", {
          method: "POST",
          body: projectData,
        });

        if (response.success) {
          this.projects.push(response.project);
          return { success: true, project: response.project };
        } else {
          throw new Error(response.error || "Failed to create project");
        }
      } catch (err: any) {
        this.error =
          err.message || "An error occurred while creating the project";
        console.error("Error creating project:", err);
        return { success: false, error: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    // Update a project
    async updateProject(id: string, data: Partial<Project>) {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await $fetch<{
          success: boolean;
          project: Project;
          error?: string;
        }>(`/api/projects/${id}`, {
          method: "PATCH",
          body: data,
        });

        if (response.success) {
          // Update in the array
          const index = this.projects.findIndex((p: Project) => p.id === id);
          if (index !== -1) {
            this.projects[index] = response.project;
          }

          // Update current project if it's the one being viewed
          if (this.currentProject && this.currentProject.id === id) {
            this.currentProject = response.project;
          }

          return { success: true, project: response.project };
        } else {
          throw new Error(response.error || "Failed to update project");
        }
      } catch (err: any) {
        this.error =
          err.message || "An error occurred while updating the project";
        console.error("Error updating project:", err);
        return { success: false, error: this.error };
      } finally {
        this.isLoading = false;
      }
    },
  },
});
