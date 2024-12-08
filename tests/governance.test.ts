import { describe, it, expect, beforeEach } from 'vitest';

// Mock for the proposals and votes
let proposals: Map<number, {
  title: string,
  description: string,
  proposer: string,
  status: string,
  votesFor: number,
  votesAgainst: number,
  endBlock: number
}> = new Map();
let votes: Map<string, boolean> = new Map();
let nextProposalId = 0;
let currentBlock = 0;

// Helper function to simulate contract calls
const simulateContractCall = (functionName: string, args: any[], sender: string) => {
  if (functionName === 'create-proposal') {
    const [title, description] = args;
    const proposalId = nextProposalId++;
    proposals.set(proposalId, {
      title,
      description,
      proposer: sender,
      status: 'active',
      votesFor: 0,
      votesAgainst: 0,
      endBlock: currentBlock + 1440
    });
    return { success: true, value: proposalId };
  }
  if (functionName === 'vote') {
    const [proposalId, voteFor] = args;
    const proposal = proposals.get(proposalId);
    if (!proposal || currentBlock >= proposal.endBlock) {
      return { success: false, error: 'Invalid proposal or voting period ended' };
    }
    const voteKey = `${proposalId}-${sender}`;
    if (votes.has(voteKey)) {
      return { success: false, error: 'Already voted' };
    }
    votes.set(voteKey, voteFor);
    if (voteFor) {
      proposal.votesFor++;
    } else {
      proposal.votesAgainst++;
    }
    proposals.set(proposalId, proposal);
    return { success: true };
  }
  if (functionName === 'end-proposal') {
    const [proposalId] = args;
    const proposal = proposals.get(proposalId);
    if (!proposal || currentBlock < proposal.endBlock) {
      return { success: false, error: 'Invalid proposal or voting period not ended' };
    }
    proposal.status = proposal.votesFor > proposal.votesAgainst ? 'passed' : 'rejected';
    proposals.set(proposalId, proposal);
    return { success: true };
  }
  if (functionName === 'get-proposal') {
    const [proposalId] = args;
    return proposals.get(proposalId) || null;
  }
  return { success: false, error: 'Function not found' };
};

describe('Governance Contract', () => {
  const wallet1 = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const wallet2 = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
  
  beforeEach(() => {
    proposals.clear();
    votes.clear();
    nextProposalId = 0;
    currentBlock = 0;
  });
  
  it('should create a proposal', () => {
    const result = simulateContractCall('create-proposal', ['New Research Direction', 'Proposal to focus on dream analysis'], wallet1);
    expect(result.success).toBe(true);
    expect(result.value).toBe(0);
  });
  
  it('should allow voting on a proposal', () => {
    simulateContractCall('create-proposal', ['Funding Allocation', 'Proposal to allocate funds for new tools'], wallet1);
    const result = simulateContractCall('vote', [0, true], wallet2);
    expect(result.success).toBe(true);
    const proposal = simulateContractCall('get-proposal', [0], wallet1);
    expect(proposal.votesFor).toBe(1);
  });
  
  it('should not allow voting after the end block', () => {
    simulateContractCall('create-proposal', ['Ethics Guidelines', 'Proposal for new ethics guidelines'], wallet1);
    currentBlock = 1500; // Set current block to after the voting period
    const result = simulateContractCall('vote', [0, true], wallet2);
    expect(result.success).toBe(false);
  });
  
  it('should not allow ending a proposal before the end block', () => {
    simulateContractCall('create-proposal', ['Community Outreach', 'Proposal for new community outreach programs'], wallet1);
    const result = simulateContractCall('end-proposal', [0], wallet1);
    expect(result.success).toBe(false);
  });
});

