export interface NavigationNode {
  id: string;
  title: string;
  description?: string;
  emoji?: string;
  parentId?: string;
  children: NavigationNode[];
  isLeaf: boolean;
  actionType?: 'tool_execution' | 'input_prompt' | 'menu_display';
  toolName?: string;
  promptText?: string;
  metadata?: Record<string, any>;
}

export interface NavigationState {
  currentNodeId: string;
  breadcrumbs: string[];
  sessionData: Record<string, any>;
  userContext: any;
}

export interface NavigationResult {
  node: NavigationNode;
  buttons: NavigationButton[];
  message: string;
  requiresInput?: boolean;
  inputPrompt?: string;
}

export interface NavigationButton {
  text: string;
  callbackData: string;
  emoji?: string;
}