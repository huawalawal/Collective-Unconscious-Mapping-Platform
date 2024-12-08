import { describe, it, expect, beforeEach } from 'vitest';

// Mock for the research projects
let researchProjects: Map<number, {
  title: string,
  description: string,
  collaborators: string[],
  status: string
}> = new Map();
let nextProjectId = 0;

// Helper function to simulate contract calls
const simulateContractCall = (functionName: string, args: any[], sender: string) => {
  if (functionName === 'create-project') {
    const [title, description] = args;
    const projectId = nextProjectId++;
    researchProjects.set(projectId, {
      title,
      description,
      collaborators: [sender],
      status: 'active'
    });
    return { success: true, value: projectId };
  }
  if (functionName === 'add-collaborator') {
    const [projectId, collaborator] = args;
    const project = researchProjects.get(projectId);
    if (project && project.collaborators.includes(sender)) {
      project.collaborators.push(collaborator);
      researchProjects.set(projectId, project);
      return { success: true };
    }
    return { success: false, error: 'Not authorized or project not found' };
  }
  if (functionName === 'update-project-status') {
    const [projectId, newStatus] = args;
    const project = researchProjects.get(projectId);
    if (project && project.collaborators.includes(sender)) {
      project.status = newStatus;
      researchProjects.set(projectId, project);
      return { success: true };
    }
    return { success: false, error: 'Not authorized or project not found' };
  }
  if (functionName === 'get-project') {
    const [projectId] = args;
    return researchProjects.get(projectId) || null;
  }
  return { success: false, error: 'Function not found' };
};

describe('Research Collaboration Contract', () => {
  const wallet1 = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const wallet2 = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
  
  beforeEach(() => {
    researchProjects.clear();
    nextProjectId = 0;
  });
  
  it('should create a project', () => {
    const result = simulateContractCall('create-project', ['Jungian Archetypes', 'Exploring Jungian archetypes across cultures'], wallet1);
    expect(result.success).toBe(true);
    expect(result.value).toBe(0);
  });
  
  it('should add a collaborator', () => {
    simulateContractCall('create-project', ['Collective Dreams', 'Analyzing collective dream patterns'], wallet1);
    const result = simulateContractCall('add-collaborator', [0, wallet2], wallet1);
    expect(result.success).toBe(true);
    const project = simulateContractCall('get-project', [0], wallet1);
    expect(project.collaborators).toContain(wallet2);
  });
  
  it('should update project status', () => {
    simulateContractCall('create-project', ['Mythological Symbols', 'Comparative study of mythological symbols'], wallet1);
    const result = simulateContractCall('update-project-status', [0, 'completed'], wallet1);
    expect(result.success).toBe(true);
    const project = simulateContractCall('get-project', [0], wallet1);
    expect(project.status).toBe('completed');
  });
  
  it('should not allow unauthorized collaborator addition', () => {
    simulateContractCall('create-project', ['Cultural Archetypes', 'Mapping cultural archetypes'], wallet1);
    const result = simulateContractCall('add-collaborator', [0, wallet2], wallet2);
    expect(result.success).toBe(false);
  });
  
  it('should not allow unauthorized status updates', () => {
    simulateContractCall('create-project', ['Unconscious Patterns', 'Identifying unconscious patterns in art'], wallet1);
    const result = simulateContractCall('update-project-status', [0, 'completed'], wallet2);
    expect(result.success).toBe(false);
  });
});

