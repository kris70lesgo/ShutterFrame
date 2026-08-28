'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { X, Search, Blocks, ShieldCheck, Trash2, AlertTriangle } from 'lucide-react';
import { IntegrationsContent } from './IntegrationsContent';
import { RehearsalPolicyContent } from './RehearsalPolicyContent';
import { CleanupContent } from './CleanupContent';
import { DangerZoneContent } from './DangerZoneContent';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'integrations' | 'policy' | 'cleanup' | 'danger';

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('integrations');

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const tabs = [
    { id: 'integrations', label: 'Integrations', icon: Blocks, subtitle: 'Manage the services ShutterFrame uses during migration rehearsals.' },
    { id: 'policy', label: 'Rehearsal Policy', icon: ShieldCheck, subtitle: 'Define the checks that must pass before a migration can be approved.' },
    { id: 'cleanup', label: 'Cleanup', icon: Trash2, subtitle: 'Control how temporary rehearsal infrastructure is removed.' },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, subtitle: 'Actions in this section may permanently remove project data or integrations.' },
  ] as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4 md:p-8">
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="w-full max-w-[760px] h-[90vh] md:h-auto md:max-h-[600px] aspect-auto md:aspect-[760/600] flex flex-col md:flex-row rounded-[14px] bg-[#212121] border border-white/5 shadow-[0_18px_50px_rgba(0,0,0,0.42),0_0_0_1px_rgba(255,255,255,0.025)] overflow-hidden pointer-events-auto"
              style={{
                width: 'min(760px, calc(100vw - 64px))',
                height: 'min(600px, calc(100vh - 64px))',
                colorScheme: 'dark'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sidebar */}
              <div className="w-full md:w-[200px] bg-[#171717] flex-shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-white/5">
                <div className="px-[12px] pt-[16px] pb-2 flex items-center justify-between">
                  <div className="relative flex-1 mr-2">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#858585]" />
                    <input
                      type="text"
                      placeholder="Search settings"
                      className="w-full h-[38px] bg-[#2A2A2A] border border-transparent focus:border-[#444] rounded-[8px] pl-8 pr-3 text-[14px] text-[#F2F2F2] placeholder-[#858585] focus:outline-none transition-colors"
                    />
                  </div>
                  <button
                    onClick={onClose}
                    className="md:hidden p-1.5 text-[#858585] hover:text-[#F2F2F2] hover:bg-white/5 rounded-md transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="settings-nav-scroll flex-1 overflow-y-auto px-[12px] pb-[16px] space-y-0.5">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as Tab)}
                        className={`w-full flex items-center gap-3 px-2.5 h-[38px] rounded-[9px] text-[14px] transition-colors ${
                          isActive
                            ? 'bg-[#353535] text-[#F2F2F2] font-medium'
                            : 'text-[#A6A6A6] hover:bg-white/5 hover:text-[#F2F2F2]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Content Area */}
              <div className="flex-1 flex flex-col bg-[#212121] relative overflow-hidden min-w-0">
                <div className="flex-shrink-0 pt-[24px] px-[28px] pb-[16px] flex justify-between items-start">
                  <div>
                    <h2 className="text-[20px] font-semibold text-[#F2F2F2]">{tabs.find(t => t.id === activeTab)?.label}</h2>
                    <p className="text-[14px] text-[#A6A6A6] mt-[5px]">{tabs.find(t => t.id === activeTab)?.subtitle}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="hidden md:block p-1.5 text-[#858585] hover:text-[#F2F2F2] hover:bg-white/5 rounded-md transition-colors -mt-1 -mr-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="settings-scroll-area flex-1 overflow-y-auto overflow-x-hidden px-[28px] pb-[24px] pt-[12px]">
                  {activeTab === 'integrations' && <IntegrationsContent />}
                  {activeTab === 'policy' && <RehearsalPolicyContent />}
                  {activeTab === 'cleanup' && <CleanupContent />}
                  {activeTab === 'danger' && <DangerZoneContent />}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
