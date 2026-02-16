/**
 * System Status Types
 * Frontend types for system health monitoring
 */

export type ModuleStatus = 'connected' | 'not_configured' | 'issue'
export type OverallStatus = 'ready' | 'action_required'

export interface ModuleHealth {
  id: string
  label: string
  status: ModuleStatus
  message: string
}

export interface SystemStatusData {
  overall: OverallStatus
  message: string
  modules: ModuleHealth[]
  lastChecked: string
}

export interface SystemStatusResponse {
  success: boolean
  message: string
  data: SystemStatusData
}
