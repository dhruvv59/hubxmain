/**
 * System Status Module Types
 * Defines types for system health monitoring
 */

export type ModuleStatus = 'connected' | 'not_configured' | 'issue'
export type OverallStatus = 'ready' | 'action_required'

export interface ModuleHealth {
  id: string
  label: string
  status: ModuleStatus
  message: string
}

export interface SystemStatusResponse {
  overall: OverallStatus
  message: string
  modules: ModuleHealth[]
  lastChecked: string
}

// ==========================================
// DEBUG SERVICE TYPES
// ==========================================

export interface FeatureStatus {
  name: string
  status: 'completed' | 'in-progress' | 'planned'
  endpoints: string[]
  implemented: boolean
  productionReady: boolean
  notes?: string[]
}

export interface DatabaseStats {
  status: 'healthy' | 'error'
  message?: string
  collections: {
    users?: number
    papers?: number
    questions?: number
    examAttempts?: number
    payments?: number
    notifications?: number
  }
}

export interface DebugInfo {
  timestamp: string
  nodeEnv: string
  systemHealth: {
    uptime: number
    memory: {
      heapUsed: number
      heapTotal: number
      rss: number
    }
    database: any
    socket: {
      status: string
      message: string
    }
  }
  features: FeatureStatus[]
  database: DatabaseStats
  redis: any
  environment: any
}
