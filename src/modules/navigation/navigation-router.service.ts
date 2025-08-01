import { Injectable } from '@nestjs/common';
import { NavigationNode, NavigationState, NavigationResult, NavigationButton } from './navigation-node.interface';
import { NAVIGATION_TREE } from './navigation-tree.data';

@Injectable()
export class NavigationRouter {
  private navigationTree: NavigationNode = NAVIGATION_TREE;

  getNode(nodeId: string): NavigationNode | null {
    return this.findNodeById(this.navigationTree, nodeId);
  }

  private findNodeById(node: NavigationNode, targetId: string): NavigationNode | null {
    if (node.id === targetId) {
      return node;
    }

    for (const child of node.children) {
      const found = this.findNodeById(child, targetId);
      if (found) {
        return found;
      }
    }

    return null;
  }

  navigateToNode(nodeId: string, state: NavigationState): NavigationResult & { success: boolean; currentNode?: NavigationNode } {
    const node = this.getNode(nodeId);
    
    if (!node) {
      return { ...this.getErrorResult('Node not found'), success: false };
    }

    // Update navigation state
    state.currentNodeId = nodeId;
    this.updateBreadcrumbs(state, node);

    // Generate navigation result
    const result = this.generateNavigationResult(node, state);
    return { ...result, success: true, currentNode: node };
  }

  private updateBreadcrumbs(state: NavigationState, node: NavigationNode): void {
    const breadcrumbs: string[] = [];
    let currentNode = node;

    while (currentNode && currentNode.id !== 'root') {
      breadcrumbs.unshift(currentNode.title);
      if (currentNode.parentId) {
        currentNode = this.getNode(currentNode.parentId);
      } else {
        break;
      }
    }

    state.breadcrumbs = breadcrumbs;
  }

  private generateNavigationResult(node: NavigationNode, state: NavigationState): NavigationResult {
    const buttons = this.generateButtons(node, state);
    const message = this.generateMessage(node, state);

    return {
      node,
      buttons,
      message,
      requiresInput: node.actionType === 'input_prompt',
      inputPrompt: node.promptText,
    };
  }

  private generateButtons(node: NavigationNode, state: NavigationState): NavigationButton[] {
    const buttons: NavigationButton[] = [];

    if (node.isLeaf) {
      // Add action button for leaf nodes
      if (node.actionType === 'tool_execution') {
        buttons.push({
          text: `${node.emoji || '🔧'} Execute`,
          callbackData: `execute_${node.id}`,
        });
      } else if (node.actionType === 'input_prompt') {
        buttons.push({
          text: `${node.emoji || '💬'} Start`,
          callbackData: `prompt_${node.id}`,
        });
      }
    } else {
      // Add child navigation buttons
      for (const child of node.children) {
        buttons.push({
          text: `${child.emoji || '📁'} ${child.title}`,
          callbackData: `nav_${child.id}`,
        });
      }
    }

    // Add back button if not at root
    if (node.id !== 'root' && node.parentId) {
      buttons.push({
        text: '⬅️ Back',
        callbackData: `nav_${node.parentId}`,
      });
    }

    // Add home button if not at root
    if (node.id !== 'root') {
      buttons.push({
        text: '🏠 Home',
        callbackData: 'nav_root',
      });
    }

    return buttons;
  }

  private generateMessage(node: NavigationNode, state: NavigationState): string {
    let message = `${node.emoji || '📁'} **${node.title}**\n\n`;
    
    if (node.description) {
      message += `${node.description}\n\n`;
    }

    // Add breadcrumbs if not at root
    if (state.breadcrumbs.length > 0) {
      message += `📍 ${state.breadcrumbs.join(' → ')}\n\n`;
    }

    if (node.isLeaf) {
      if (node.actionType === 'input_prompt') {
        message += `💬 ${node.promptText || 'Please provide your input'}\n\n`;
      } else if (node.actionType === 'tool_execution') {
        message += `🔧 Ready to execute ${node.toolName}\n\n`;
      }
    } else {
      message += '👇 Choose an option below:';
    }

    return message;
  }

  goBack(state: NavigationState): NavigationResult {
    const currentNode = this.getNode(state.currentNodeId);
    
    if (!currentNode || !currentNode.parentId) {
      return this.navigateToNode('root', state);
    }

    return this.navigateToNode(currentNode.parentId, state);
  }

  goHome(state: NavigationState): NavigationResult {
    return this.navigateToNode('root', state);
  }

  inferNodeFromNaturalLanguage(query: string): string | null {
    const queryLower = query.toLowerCase();
    
    // Simple keyword matching - can be enhanced with LLM
    const keywordMap: Record<string, string> = {
      'venue': 'nearby_venues',
      'restaurant': 'restaurant_discovery',
      'food': 'food_dining',
      'event': 'local_events',
      'music': 'concerts_festivals',
      'concert': 'concerts_festivals',
      'coworking': 'coworking_cafes',
      'cafe': 'coworking_cafes',
      'coffee': 'coworking_cafes',
      'brand': 'brand_matching',
      'shopping': 'lifestyle_shopping',
      'creative': 'aesthetic_recommender',
      'art': 'aesthetic_recommender',
      'plan': 'day_night_plans',
      'taste': 'taste_exploration',
      'similar': 'taste_exploration',
      'nomad': 'nomad_remote',
      'remote': 'coworking_cafes',
      'group': 'group_meetups',
      'meetup': 'group_meetups',
      'playlist': 'playlist_generation',
      'photo': 'visual_suggestions',
      'image': 'visual_suggestions',
    };

    for (const [keyword, nodeId] of Object.entries(keywordMap)) {
      if (queryLower.includes(keyword)) {
        return nodeId;
      }
    }

    return null;
  }

  private getErrorResult(message: string): NavigationResult {
    return {
      node: this.navigationTree,
      buttons: [{
        text: '🏠 Home',
        callbackData: 'nav_root',
      }],
      message: `❌ ${message}\n\nLet's go back to the main menu.`,
    };
  }

  createInitialState(): NavigationState {
    return {
      currentNodeId: 'root',
      breadcrumbs: [],
      sessionData: {},
      userContext: {},
    };
  }

  getAllLeafNodes(): NavigationNode[] {
    const leafNodes: NavigationNode[] = [];
    this.collectLeafNodes(this.navigationTree, leafNodes);
    return leafNodes;
  }

  private collectLeafNodes(node: NavigationNode, leafNodes: NavigationNode[]): void {
    if (node.isLeaf) {
      leafNodes.push(node);
    } else {
      for (const child of node.children) {
        this.collectLeafNodes(child, leafNodes);
      }
    }
  }
}