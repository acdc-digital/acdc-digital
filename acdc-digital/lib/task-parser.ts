// Utility for parsing thinking text into structured task data
export interface TaskData {
  title: string;
  items: TaskItem[];
  status: "pending" | "in_progress" | "completed";
  timestamp?: Date;
}

export interface TaskItem {
  type: "text" | "file" | "analysis" | "decision";
  text: string;
  file?: {
    name: string;
    path?: string;
    icon?: string;
  };
  completed?: boolean;
}

// Parse thinking text into structured tasks
export function parseThinkingToTasks(thinkingText: string): TaskData[] {
  if (!thinkingText || thinkingText.trim() === "") {
    return [];
  }

  const tasks: TaskData[] = [];
  const lines = thinkingText.split('\n').map(line => line.trim()).filter(Boolean);
  
  let currentTask: TaskData | null = null;
  
  for (const line of lines) {
    // Detect task headers (lines that seem like task titles)
    if (isTaskHeader(line)) {
      // Save previous task if exists and has items
      if (currentTask && currentTask.items.length > 0) {
        tasks.push(currentTask);
      }
      
      // Start new task
      currentTask = {
        title: cleanTaskTitle(line),
        items: [],
        status: "completed", // Since thinking is complete
        timestamp: new Date(),
      };
    } else if (currentTask) {
      // Add items to current task
      const item = parseTaskItem(line);
      if (item) {
        currentTask.items.push(item);
      }
    } else {
      // No current task, create a generic "Analysis" task
      if (!currentTask) {
        currentTask = {
          title: "Analyzing Request",
          items: [],
          status: "completed",
          timestamp: new Date(),
        };
      }
      
      const item = parseTaskItem(line);
      if (item) {
        currentTask.items.push(item);
      }
    }
  }
  
  // Don't forget the last task if it has items
  if (currentTask && currentTask.items.length > 0) {
    tasks.push(currentTask);
  }
  
  // Filter out tasks with no items and consolidate small tasks
  const filteredTasks = tasks.filter(task => task.items.length > 0);
  
  // If we have many small tasks, consolidate them
  if (filteredTasks.length > 3) {
    const consolidatedTasks: TaskData[] = [];
    let currentConsolidated: TaskData | null = null;
    
    for (const task of filteredTasks) {
      if (task.items.length <= 2 && currentConsolidated) {
        // Add items to consolidated task
        currentConsolidated.items.push(...task.items);
      } else {
        // Save previous consolidated task
        if (currentConsolidated) {
          consolidatedTasks.push(currentConsolidated);
        }
        
        if (task.items.length <= 2) {
          // Start new consolidated task
          currentConsolidated = {
            title: "Planning and Analysis",
            items: [...task.items],
            status: "completed",
            timestamp: new Date(),
          };
        } else {
          // Use task as-is
          consolidatedTasks.push(task);
          currentConsolidated = null;
        }
      }
    }
    
    // Don't forget the last consolidated task
    if (currentConsolidated) {
      consolidatedTasks.push(currentConsolidated);
    }
    
    return consolidatedTasks;
  }
  
  // If no structured tasks were created but we have thinking text, create a generic task
  if (filteredTasks.length === 0 && thinkingText.trim()) {
    return [{
      title: "Reasoning Process",
      items: [{
        type: "analysis",
        text: thinkingText.trim(),
        completed: true,
      }],
      status: "completed",
      timestamp: new Date(),
    }];
  }
  
  return filteredTasks;
}

// Detect if a line looks like a task header
function isTaskHeader(line: string): boolean {
  // Check for patterns that look like task headers
  const headerPatterns = [
    /^(analyzing|reading|processing|scanning|evaluating|determining|checking|reviewing|examining)/i,
    /^(step \d+|phase \d+|\d+\.)/i,
    /^(first|next|then|finally|now)/i,
    /^(understanding|interpreting|assessing)/i,
  ];
  
  return headerPatterns.some(pattern => pattern.test(line)) && line.length < 100;
}

// Clean task title for display
function cleanTaskTitle(line: string): string {
  // Remove common prefixes and clean up
  return line
    .replace(/^(step \d+:?\s*|phase \d+:?\s*|\d+\.\s*)/i, '')
    .replace(/^(first,?\s*|next,?\s*|then,?\s*|finally,?\s*|now,?\s*)/i, '')
    .trim()
    .replace(/^[a-z]/, match => match.toUpperCase()); // Capitalize first letter
}

// Parse individual task items
function parseTaskItem(line: string): TaskItem | null {
  if (!line || line.length < 3) return null;
  
  // Check for file references
  const filePatterns = [
    /([a-zA-Z0-9_-]+\.(ts|tsx|js|jsx|json|md|txt|py|java|css|html|xml|yml|yaml|toml|config))/g,
    /package\.json|tsconfig\.json|README\.md|\.env/g,
  ];
  
  let hasFile = false;
  let fileName = "";
  
  for (const pattern of filePatterns) {
    const match = line.match(pattern);
    if (match) {
      fileName = match[0];
      hasFile = true;
      break;
    }
  }
  
  if (hasFile) {
    return {
      type: "file",
      text: line,
      file: {
        name: fileName,
        icon: getFileIcon(fileName),
      },
      completed: true,
    };
  }
  
  // Determine item type based on content
  if (line.includes('decision') || line.includes('choose') || line.includes('decide')) {
    return {
      type: "decision",
      text: line,
      completed: true,
    };
  }
  
  if (line.includes('analy') || line.includes('evaluat') || line.includes('assess')) {
    return {
      type: "analysis",
      text: line,
      completed: true,
    };
  }
  
  return {
    type: "text",
    text: line,
    completed: true,
  };
}

// Get appropriate icon for file type
function getFileIcon(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'json':
      return 'json';
    case 'md':
      return 'markdown';
    case 'css':
      return 'css';
    case 'html':
      return 'html';
    case 'py':
      return 'python';
    case 'java':
      return 'java';
    default:
      return 'file';
  }
}

// Generate sample task data for testing
export function generateSampleTasks(): TaskData[] {
  return [
    {
      title: "Analyzing user request",
      items: [
        { type: "text", text: "Understanding the user's intent", completed: true },
        { type: "text", text: "Identifying key requirements", completed: true },
        { type: "decision", text: "Determining the best approach", completed: true },
      ],
      status: "completed",
      timestamp: new Date(),
    },
    {
      title: "Examining project structure",
      items: [
        { 
          type: "file", 
          text: "Reading project configuration", 
          file: { name: "package.json", icon: "json" },
          completed: true 
        },
        { 
          type: "file", 
          text: "Checking TypeScript setup", 
          file: { name: "tsconfig.json", icon: "json" },
          completed: true 
        },
        { type: "analysis", text: "Evaluating component architecture", completed: true },
      ],
      status: "completed",
      timestamp: new Date(),
    },
  ];
}