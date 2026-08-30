'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import {
  GitHubIcon,
  NeonIcon,
  DaytonaIcon,
  TrueForgeIcon,
  DeepSeekIcon
} from '@/components/icons/IntegrationIcons';

const integrations = [
  {
    id: "github",
    name: "GitHub",
    icon: GitHubIcon,
    description: "Detect pull requests and migration files directly from your repositories.",
    metadata: "acme/backend",
    connected: true,
  },
  {
    id: "neon",
    name: "Neon",
    icon: NeonIcon,
    description: "Create isolated preview database branches for safe migration rehearsals.",
    metadata: "Project: production-db",
    connected: true,
  },
  {
    id: "daytona",
    name: "Daytona",
    icon: DaytonaIcon,
    description: "Run migration rehearsals inside isolated, disposable sandbox environments.",
    metadata: "Region: auto",
    connected: true,
  },
  {
    id: "trueforge",
    name: "TrueForge",
    icon: TrueForgeIcon,
    description: "Orchestrate rehearsal analysis, validation, and AI-assisted migration checks.",
    metadata: "Provider: DeepSeek",
    connected: true,
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    icon: DeepSeekIcon,
    description: "Provides the model inference used by TrueForge during rehearsal analysis.",
    metadata: "Model: V4 Flash",
    connected: true,
  },
];

export function IntegrationsGrid() {
  const [filter, setFilter] = useState<'all' | 'connected' | 'available'>('all');

  const filteredIntegrations = integrations.filter((item) => {
    if (filter === 'connected') return item.connected;
    if (filter === 'available') return !item.connected;
    return true;
  });

  return (
    <div className="w-full bg-[#F9FAFB] text-[#0F0F0F] font-sans rounded-xl border border-gray-200 p-5 md:p-6">
      <div className="max-w-[1180px] mx-auto">
        {/* Header with Inline Filter Pills on the Same Subtitle Line */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-[24px] leading-[1.2] font-semibold tracking-[-0.02em] text-[#0F0F0F]">
              Integrations
            </h1>
            <p className="mt-[6px] text-[14px] leading-[1.5] text-[#6B7280]">
              Connect the services ShutterFrame uses to run and validate migration rehearsals.
            </p>
          </div>

          <div className="flex bg-[#F3F4F6] border border-gray-200 rounded-[8px] p-1 flex-shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-[13px] font-medium rounded-[6px] transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter('connected')}
              className={`px-3 py-1 text-[13px] font-medium rounded-[6px] transition-colors cursor-pointer ${
                filter === 'connected'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Connected
            </button>
            <button
              type="button"
              onClick={() => setFilter('available')}
              className={`px-3 py-1 text-[13px] font-medium rounded-[6px] transition-colors cursor-pointer ${
                filter === 'available'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Available
            </button>
          </div>
        </header>

        {/* Grid shifted directly below header */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[16px]">
          {filteredIntegrations.map((integration) => {
            const Icon = integration.icon;
            return (
              <div
                key={integration.id}
                className="relative min-h-[190px] p-[20px] rounded-[14px] border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 flex flex-col group hover:-translate-y-[1px]"
              >
                {/* Card Top */}
                <div className="flex items-start justify-between">
                  <div className="w-[44px] h-[44px] rounded-[10px] flex items-center justify-center bg-gray-100 border border-gray-200">
                    <Icon />
                  </div>
                  {integration.connected ? (
                    <button type="button" className="h-[34px] px-[14px] rounded-[8px] text-[13px] font-medium transition-colors border border-blue-200 text-blue-700 bg-blue-50 flex items-center gap-1.5 hover:bg-blue-100 cursor-pointer">
                      <Check className="w-3.5 h-3.5" />
                      Connected
                    </button>
                  ) : (
                    <button type="button" className="h-[34px] px-[14px] rounded-[8px] text-[13px] font-medium transition-colors border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 cursor-pointer">
                      Connect
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="mt-[28px]">
                  <h3 className="text-[16px] font-[550] text-[#0F0F0F]">
                    {integration.name}
                  </h3>
                  <p className="mt-[7px] text-[13px] leading-[1.5] text-[#6B7280] line-clamp-2">
                    {integration.description}
                  </p>
                </div>

                {/* Status Row */}
                {integration.connected && integration.metadata && (
                  <div className="mt-auto pt-4">
                    <div className="flex items-center gap-2 text-[12px] text-gray-500">
                      <span className="w-[6px] h-[6px] rounded-full bg-emerald-500" />
                      {integration.metadata}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
