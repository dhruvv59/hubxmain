"use client";

import React, { useEffect, useState } from "react";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Code2,
  Database,
  Server,
  Zap,
  Shield,
} from "lucide-react";

interface DebugData {
  timestamp: string;
  nodeEnv: string;
  systemHealth: any;
  features: any[];
  database: any;
  redis: any;
  environment: any;
}

export default function DebugPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<DebugData | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["systemHealth", "database"])
  );

  useEffect(() => {
    loadDebugInfo();
  }, []);

  const loadDebugInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/system/debug");

      if (!response.ok) {
        throw new Error(`Failed to load debug info: ${response.status}`);
      }

      const data = await response.json();
      setDebug(data.data || data);
    } catch (err: any) {
      setError(err.message || "Unable to load debug information");
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
      case "healthy":
      case "completed":
        return "text-green-600";
      case "not_configured":
      case "warning":
      case "in-progress":
        return "text-yellow-600";
      case "issue":
      case "error":
      case "disconnected":
      case "planned":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "connected":
      case "healthy":
      case "completed":
        return "bg-green-50 border-green-200";
      case "not_configured":
      case "warning":
      case "in-progress":
        return "bg-yellow-50 border-yellow-200";
      case "issue":
      case "error":
      case "disconnected":
      case "planned":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading debug information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-red-900">
                Unable to Load Debug Information
              </h2>
              <p className="text-red-700 mt-2">{error}</p>
              <button
                onClick={loadDebugInfo}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!debug) return null;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <Code2 className="h-10 w-10 text-indigo-600" />
            Developer Debug Console
          </h1>
          <p className="mt-2 text-gray-600">
            System status, feature checklist, and performance metrics
          </p>
        </div>
        <button
          onClick={loadDebugInfo}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 font-medium"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Environment & Timestamp */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Environment</p>
          <p className="text-2xl font-bold text-gray-900 mt-1 uppercase">
            {debug.nodeEnv}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Last Updated</p>
          <p className="text-sm font-mono text-gray-900 mt-1">
            {new Date(debug.timestamp).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Status</p>
          <p className="text-2xl font-bold text-green-600 mt-1">✓ Active</p>
        </div>
      </div>

      {/* System Health */}
      <CollapsibleSection
        title="System Health"
        icon={<Server className="h-5 w-5" />}
        isExpanded={expandedSections.has("systemHealth")}
        onToggle={() => toggleSection("systemHealth")}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Uptime</h4>
              <p className="text-sm text-gray-600">
                {Math.floor(debug.systemHealth.uptime / 60)} minutes
              </p>
            </div>
            <div className="bg-gray-50 rounded p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Memory</h4>
              <p className="text-sm text-gray-600">
                {debug.systemHealth.memory.heapUsed}MB / {debug.systemHealth.memory.heapTotal}MB
              </p>
            </div>
          </div>

          {/* Database Health */}
          <div className={`rounded-lg border p-4 ${getStatusBg(debug.systemHealth.database.status)}`}>
            <div className="flex items-center gap-3">
              <Database className={`h-5 w-5 ${getStatusColor(debug.systemHealth.database.status)}`} />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Database</h4>
                <p className="text-sm text-gray-600">{debug.systemHealth.database.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Latency: {debug.systemHealth.database.latency}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Database Statistics */}
      <CollapsibleSection
        title="Database Statistics"
        icon={<Database className="h-5 w-5" />}
        isExpanded={expandedSections.has("database")}
        onToggle={() => toggleSection("database")}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(debug.database.collections).map(([key, value]) => (
            <div key={key} className="bg-gray-50 rounded p-3 border border-gray-200">
              <p className="text-xs text-gray-600 uppercase font-semibold">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">{value}</p>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Redis Status */}
      <CollapsibleSection
        title="Redis Cache"
        icon={<Zap className="h-5 w-5" />}
        isExpanded={expandedSections.has("redis")}
        onToggle={() => toggleSection("redis")}
      >
        <div className={`rounded-lg border p-4 ${getStatusBg(debug.redis.status)}`}>
          <div className="flex items-center gap-3 mb-3">
            <Zap className={`h-5 w-5 ${getStatusColor(debug.redis.status)}`} />
            <div>
              <h4 className="font-semibold text-gray-900">
                Status: {debug.redis.status?.toUpperCase()}
              </h4>
              <p className="text-sm text-gray-600">{debug.redis.message}</p>
            </div>
          </div>
          {debug.redis.usedMemory && (
            <p className="text-sm text-gray-600 ml-8">
              Memory: {debug.redis.usedMemory}
            </p>
          )}
        </div>
      </CollapsibleSection>

      {/* Features Checklist */}
      <CollapsibleSection
        title={`Features (${debug.features.filter((f: any) => f.implemented).length}/${debug.features.length} Implemented)`}
        icon={<CheckCircle className="h-5 w-5" />}
        isExpanded={expandedSections.has("features")}
        onToggle={() => toggleSection("features")}
      >
        <div className="space-y-2">
          {debug.features.map((feature: any, idx: number) => (
            <div
              key={idx}
              className={`rounded-lg border p-4 ${getStatusBg(feature.status)}`}
            >
              <div className="flex items-start gap-3">
                {feature.status === "completed" && (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                )}
                {feature.status === "in-progress" && (
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                )}
                {feature.status === "planned" && (
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{feature.name}</h4>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-600">
                      <span className="font-mono">Status:</span> {feature.status}
                    </p>
                    {feature.endpoints.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">Endpoints:</p>
                        <ul className="ml-4 mt-1 space-y-0.5">
                          {feature.endpoints.map((ep: string, i: number) => (
                            <li key={i} className="text-xs font-mono text-gray-600">
                              • {ep}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {feature.notes && feature.notes.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 font-semibold">Notes:</p>
                        <ul className="ml-4 mt-1 space-y-0.5">
                          {feature.notes.map((note: string, i: number) => (
                            <li key={i} className="text-xs text-gray-600">
                              {note}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Environment Variables */}
      <CollapsibleSection
        title="Environment Configuration"
        icon={<Shield className="h-5 w-5" />}
        isExpanded={expandedSections.has("environment")}
        onToggle={() => toggleSection("environment")}
      >
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Required Variables</h4>
            <div className="space-y-2">
              {debug.environment.required.map((env: any, idx: number) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 p-2 rounded ${
                    env.configured
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  {env.configured ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="font-mono text-sm">{env.name}</span>
                  <span className="text-xs text-gray-600 ml-auto">
                    {env.configured ? "✓ Configured" : "✗ Missing"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Optional Variables</h4>
            <div className="space-y-2">
              {debug.environment.optional.map((env: any, idx: number) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 p-2 rounded ${
                    env.configured
                      ? "bg-blue-50 border border-blue-200"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  {env.configured ? (
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="font-mono text-sm">{env.name}</span>
                  <span className="text-xs text-gray-600 ml-auto">
                    {env.configured ? "✓ Set" : "Not set"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Footer */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
        <p className="text-sm text-indigo-900">
          💡 This debug page is for developers only. For production, ensure authentication is required.
        </p>
      </div>
    </div>
  );
}

// Helper Component
interface SectionProps {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
}: SectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-indigo-600">{icon}</span>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
        <RefreshCw
          className={`h-5 w-5 text-gray-400 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>
      {isExpanded && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {children}
        </div>
      )}
    </div>
  );
}
