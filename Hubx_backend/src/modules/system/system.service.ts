/**
 * System Status Service
 * Provides health checks for all critical system modules
 */

import prisma from "@config/database"
import type { SystemStatusResponse, ModuleHealth, ModuleStatus, OverallStatus } from "./types"

export class SystemService {
  /**
   * Get comprehensive system status
   * Checks: API, Database, Auth, Payment, Email
   */
  async getSystemStatus(): Promise<SystemStatusResponse> {
    const modules: ModuleHealth[] = []

    // 1. API Check - if we're executing this code, API is connected
    modules.push({
      id: 'api',
      label: 'API Connection',
      status: 'connected' as ModuleStatus,
      message: 'API server is running and accepting requests'
    })

    // 2. Database Check
    modules.push(await this.checkDatabase())

    // 3. Auth Check
    modules.push(this.checkAuth())

    // 4. Payment Check
    modules.push(this.checkPayment())

    // 5. Email Check
    modules.push(this.checkEmail())

    // Calculate overall status
    const hasIssues = modules.some(m => m.status === 'issue')
    const hasNotConfigured = modules.some(m => m.status === 'not_configured')

    let overall: OverallStatus
    let message: string

    if (hasIssues) {
      overall = 'action_required'
      message = 'Some modules have issues that require immediate attention'
    } else if (hasNotConfigured) {
      overall = 'action_required'
      message = 'Some modules are not fully configured'
    } else {
      overall = 'ready'
      message = 'All systems operational'
    }

    return {
      overall,
      message,
      modules,
      lastChecked: new Date().toISOString()
    }
  }

  /**
   * Check database connectivity
   */
  private async checkDatabase(): Promise<ModuleHealth> {
    try {
      const startTime = Date.now()
      await prisma.$queryRaw`SELECT 1`
      const latency = Date.now() - startTime

      return {
        id: 'database',
        label: 'Database',
        status: 'connected' as ModuleStatus,
        message: `Database connection healthy (${latency}ms)`
      }
    } catch (error: any) {
      console.error('[System Status] Database check failed:', error)
      return {
        id: 'database',
        label: 'Database',
        status: 'issue' as ModuleStatus,
        message: `Database connection failed: ${error.message}`
      }
    }
  }

  /**
   * Check authentication configuration
   */
  private checkAuth(): ModuleHealth {
    const requiredVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET']
    const missing: string[] = []

    if (!process.env.JWT_SECRET) {
      missing.push('JWT_SECRET')
    }
    if (!process.env.JWT_REFRESH_SECRET) {
      missing.push('JWT_REFRESH_SECRET')
    }

    if (missing.length > 0) {
      return {
        id: 'auth',
        label: 'Authentication',
        status: 'not_configured' as ModuleStatus,
        message: `Missing environment variables: ${missing.join(', ')}`
      }
    }

    return {
      id: 'auth',
      label: 'Authentication',
      status: 'connected' as ModuleStatus,
      message: 'Authentication system properly configured'
    }
  }

  /**
   * Check payment gateway configuration
   */
  private checkPayment(): ModuleHealth {
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      const missing = []
      if (!keyId) missing.push('RAZORPAY_KEY_ID')
      if (!keySecret) missing.push('RAZORPAY_KEY_SECRET')

      return {
        id: 'payment',
        label: 'Payment & External Services',
        status: 'not_configured' as ModuleStatus,
        message: `Missing credentials: ${missing.join(', ')}`
      }
    }

    return {
      id: 'payment',
      label: 'Payment & External Services',
      status: 'connected' as ModuleStatus,
      message: 'Payment gateway configured (Razorpay)'
    }
  }

  /**
   * Check email service configuration
   */
  private checkEmail(): ModuleHealth {
    const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS']
    const missing = requiredVars.filter(varName => !process.env[varName])

    if (missing.length > 0) {
      return {
        id: 'email',
        label: 'Email & Notifications',
        status: 'not_configured' as ModuleStatus,
        message: `Missing SMTP configuration: ${missing.join(', ')}`
      }
    }

    return {
      id: 'email',
      label: 'Email & Notifications',
      status: 'connected' as ModuleStatus,
      message: 'Email service configured (SMTP)'
    }
  }
}

export const systemService = new SystemService()
