import Decimal from 'decimal.js';

export interface MLMConfig {
  directCommission: number;
  levelCommissions: number[];
  matchingBonus: number;
  leadershipBonus: number;
  rankRequirements: {
    [key: string]: {
      personalPV: number;
      groupPV: number;
      directReferrals: number;
    };
  };
}

const defaultConfig: MLMConfig = {
  directCommission: 0.20, // 20% direct commission
  levelCommissions: [0.10, 0.07, 0.05, 0.03, 0.02], // Level 1-5 commissions
  matchingBonus: 0.10, // 10% matching bonus
  leadershipBonus: 0.02, // 2% leadership bonus
  rankRequirements: {
    bronze: {
      personalPV: 100,
      groupPV: 1000,
      directReferrals: 2
    },
    silver: {
      personalPV: 200,
      groupPV: 5000,
      directReferrals: 4
    },
    gold: {
      personalPV: 300,
      groupPV: 10000,
      directReferrals: 6
    },
    platinum: {
      personalPV: 500,
      groupPV: 25000,
      directReferrals: 8
    },
    diamond: {
      personalPV: 1000,
      groupPV: 50000,
      directReferrals: 10
    }
  }
};

export class MLMCalculator {
  private config: MLMConfig;

  constructor(config: MLMConfig = defaultConfig) {
    this.config = config;
  }

  calculateDirectCommission(orderAmount: number): number {
    return new Decimal(orderAmount)
      .times(this.config.directCommission)
      .toDecimalPlaces(2)
      .toNumber();
  }

  calculateLevelCommission(orderAmount: number, level: number): number {
    if (level <= 0 || level > this.config.levelCommissions.length) return 0;
    
    return new Decimal(orderAmount)
      .times(this.config.levelCommissions[level - 1])
      .toDecimalPlaces(2)
      .toNumber();
  }

  calculateMatchingBonus(downlineCommission: number): number {
    return new Decimal(downlineCommission)
      .times(this.config.matchingBonus)
      .toDecimalPlaces(2)
      .toNumber();
  }

  calculateLeadershipBonus(groupVolume: number): number {
    return new Decimal(groupVolume)
      .times(this.config.leadershipBonus)
      .toDecimalPlaces(2)
      .toNumber();
  }

  calculateRank(personalPV: number, groupPV: number, directReferrals: number): string {
    const ranks = Object.entries(this.config.rankRequirements);
    
    for (let i = ranks.length - 1; i >= 0; i--) {
      const [rank, requirements] = ranks[i];
      if (
        personalPV >= requirements.personalPV &&
        groupPV >= requirements.groupPV &&
        directReferrals >= requirements.directReferrals
      ) {
        return rank;
      }
    }
    
    return 'starter';
  }

  calculateCompression(levels: any[]): any[] {
    // Implement compression logic to skip inactive levels
    return levels.filter(level => level.isActive || level.hasActiveDownline);
  }

  calculateSpillover(node: any, maxWidth: number): any {
    // Implement spillover logic for binary/matrix plans
    if (node.children.length > maxWidth) {
      const spilloverNodes = node.children.slice(maxWidth);
      // Find next available position in depth-first manner
      return this.findSpilloverPosition(node, spilloverNodes);
    }
    return node;
  }

  private findSpilloverPosition(root: any, nodes: any[]): any {
    // Implement depth-first search to find next available position
    // This is a simplified version - real implementation would be more complex
    const queue = [root];
    while (queue.length > 0 && nodes.length > 0) {
      const current = queue.shift();
      if (current.children.length < 2) { // Assuming binary plan
        current.children.push(nodes.shift());
      }
      queue.push(...current.children);
    }
    return root;
  }
}