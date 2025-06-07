import React, { useEffect, useState } from 'react';
import { useMLMStore } from '../../store/mlmStore';
import { MLMNode } from '../../types';
import { User, UserCheck, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';

interface TreeNodeProps {
  node: MLMNode;
  isRoot?: boolean;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, isRoot = false }) => {
  const [isExpanded, setIsExpanded] = useState(isRoot);
  
  const rankColors = {
    bronze: 'bg-amber-600',
    silver: 'bg-gray-400',
    gold: 'bg-yellow-500',
    platinum: 'bg-blue-400',
    diamond: 'bg-purple-400'
  };
  
  return (
    <div className="flex flex-col items-center">
      <div 
        className={`relative flex items-center p-3 mb-1 rounded-lg shadow-sm border ${
          isRoot ? 'bg-primary/10 border-primary' : 'bg-white border-gray-200'
        }`}
      >
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white mr-3 ${rankColors[node.rank]}`}>
            <User className="h-5 w-5" />
          </div>
          <div>
            <div className="font-medium">{node.username}</div>
            <div className="text-xs text-gray-500 flex items-center">
              <span className="capitalize">{node.rank}</span>
              <span className="mx-1">•</span>
              <span>PV: {node.personalPV}</span>
              <span className="mx-1">•</span>
              <span>Group: {node.groupPV}</span>
            </div>
          </div>
        </div>
        {node.children.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-4 text-gray-400 hover:text-gray-600"
          >
            {isExpanded ? '−' : '+'}
          </button>
        )}
      </div>
      
      {isExpanded && node.children.length > 0 && (
        <div className="ml-8 pl-4 border-l border-dashed border-gray-300">
          <div className="space-y-4 pt-2">
            {node.children.map(childNode => (
              <TreeNode key={childNode.userId} node={childNode} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export function NetworkTree() {
  const { networkStructure, fetchNetworkStructure, isLoading } = useMLMStore();
  
  useEffect(() => {
    fetchNetworkStructure();
  }, [fetchNetworkStructure]);
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>My Network</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>My Network</CardTitle>
        <div className="flex items-center space-x-2 text-sm">
          <div className="flex items-center">
            <UserCheck className="h-4 w-4 mr-1 text-green-500" />
            <span>Active: 5</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1 text-gray-400" />
            <span>Total: 7</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="mb-4">
          <Button variant="secondary" size="sm">
            <Users className="h-4 w-4 mr-2" />
            Invite New Member
          </Button>
        </div>
        
        <div className="overflow-auto max-h-[500px] p-2">
          {networkStructure ? (
            <TreeNode node={networkStructure} isRoot />
          ) : (
            <p>No network data available</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}