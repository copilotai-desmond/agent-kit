export type AgentStatusWord = 'pending' | 'running' | 'waiting' | 'idle' | 'completed' | 'failed' | 'killed'

export type AgentRow = {
  id: string
  type: string
  description: string
  status: AgentStatusWord
  parentId?: string
  name?: string
  firstSeenAt: number
  endedAt?: number
}

export type AgentMetrics = {
  startedAt?: number
  toolUses: number
  tokens: number
  activity: string[]
  prompt?: string
  model?: string
  effort?: string
}

export type TaskStatus = 'running' | 'completed' | 'failed' | 'killed' | 'exited'

export type ShellTask = {
  id: string
  kind: 'shell' | 'monitor'
  command: string
  shellCommand?: string
  description?: string
  agentId?: string
  startedAt: number
  endedAt?: number
  status: TaskStatus
  exitCode?: number
  outputPath?: string
  lastLine?: string
  lastOutputAt?: number
  outputSize?: number
  shellPid?: number
  pgid?: number
  pids: number[]
  ports: number[]
  cpu: number
  rssKb: number
  peakRssKb?: number
  isNotified?: boolean
}

export type Orphan = {
  pid: number
  args: string
  ports: number[]
  taskId: string
  command: string
}

declare module 'claude-code' {
  interface PluginState {
    'session-activity': {
      agents: AgentRow[]
      metrics: Record<string, AgentMetrics>
      shells: ShellTask[]
      orphans: Orphan[]
      confirm: string
      expanded: string[]
      rootPid: number
    }
  }
}
