'use client';

import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";

type RunStatus = "Pending" | "Ready" | "Warning" | "Blocked";

interface RunRecord {
  id: string;
  description: string;
  triggeredBy: string;
  status: RunStatus;
  duration: string;
  timestamp: string;
  tags: string[];
}

type Filters = {
  status: string[];
  triggeredBy: string[];
};

const SAMPLE_RUNS: RunRecord[] = [
  {
    id: "#1733",
    description: "Add user_preferences table",
    triggeredBy: "Alex Kim",
    status: "Pending",
    duration: "8m 42s",
    timestamp: "2024-11-08T14:32:45Z",
    tags: ["schema", "database"],
  },
  {
    id: "#1732",
    description: "Add notifications table",
    triggeredBy: "Sam Lee",
    status: "Ready",
    duration: "6m 12s",
    timestamp: "2024-11-08T14:20:10Z",
    tags: ["feature", "notifications"],
  },
  {
    id: "#1731",
    description: "Improve order indexes",
    triggeredBy: "Maria Johnson",
    status: "Ready",
    duration: "4m 33s",
    timestamp: "2024-11-08T14:15:00Z",
    tags: ["performance", "database"],
  },
  {
    id: "#1730",
    description: "Fix NULL constraint",
    triggeredBy: "Alex Kim",
    status: "Warning",
    duration: "7m 41s",
    timestamp: "2024-11-08T13:45:22Z",
    tags: ["bugfix", "schema"],
  },
  {
    id: "#1729",
    description: "Audit log retention",
    triggeredBy: "Sam Lee",
    status: "Blocked",
    duration: "2m 09s",
    timestamp: "2024-11-08T13:10:05Z",
    tags: ["compliance", "retention"],
  },
];

const statusStyles: Record<RunStatus, string> = {
  Pending: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Ready: "bg-green-500/10 text-green-600 dark:text-green-400",
  Warning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  Blocked: "bg-red-500/10 text-red-600 dark:text-red-400",
};

function RunRow({
  run,
  expanded,
  onToggle,
}: {
  run: RunRecord;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <motion.button
        onClick={onToggle}
        className="w-full p-4 text-left transition-colors hover:bg-gray-50/80 active:bg-gray-100/80 cursor-pointer"
        whileHover={{ backgroundColor: "rgba(0,0,0,0.015)" }}
      >
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 w-4 flex justify-center"
          >
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </motion.div>

          <span className="w-16 flex-shrink-0 font-mono text-sm font-medium text-gray-900">
            {run.id}
          </span>

          <p className="flex-1 truncate text-sm font-medium text-gray-900">
            {run.description}
          </p>

          <span className="w-32 flex-shrink-0 truncate text-sm text-gray-600">
            {run.triggeredBy}
          </span>

          <div className="w-24 flex-shrink-0 flex justify-center">
            <Badge
              variant="secondary"
              className={`${statusStyles[run.status]}`}
            >
              {run.status}
            </Badge>
          </div>

          <span className="w-16 flex-shrink-0 text-right font-mono text-xs text-gray-500">
            {run.duration}
          </span>
        </div>
      </motion.button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gray-200 bg-gray-50/60"
          >
            <div className="space-y-4 p-4 pl-12">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Triggered By
                  </p>
                  <p className="text-gray-900">{run.triggeredBy}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Timestamp
                  </p>
                  <p className="font-mono text-xs text-gray-900">
                    {run.timestamp}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {run.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs border-gray-300 text-gray-700">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function FilterPanel({
  filters,
  onChange,
  runs,
}: {
  filters: Filters;
  onChange: (filters: Filters) => void;
  runs: RunRecord[];
}) {
  const statuses = Array.from(new Set(runs.map((r) => r.status)));
  const triggerers = Array.from(new Set(runs.map((r) => r.triggeredBy)));

  const toggleFilter = (category: keyof Filters, value: string) => {
    const current = filters[category];
    const updated = current.includes(value)
      ? current.filter((entry) => entry !== value)
      : [...current, value];

    onChange({
      ...filters,
      [category]: updated,
    });
  };

  const clearAll = () => {
    onChange({
      status: [],
      triggeredBy: [],
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (group) => group.length > 0
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay: 0.05 }}
      className="flex h-full flex-col space-y-6 overflow-y-auto bg-white p-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-6 text-xs cursor-pointer text-gray-500 hover:text-gray-900"
          >
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Status
        </p>
        <div className="space-y-2">
          {statuses.map((status) => {
            const selected = filters.status.includes(status);

            return (
              <motion.button
                key={status}
                type="button"
                whileHover={{ x: 2 }}
                onClick={() => toggleFilter("status", status)}
                aria-pressed={selected}
                className={`flex w-full items-center justify-between gap-2 border rounded-md px-3 py-2 text-sm transition-colors cursor-pointer ${
                  selected
                    ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span>{status}</span>
                {selected && <Check className="h-3.5 w-3.5" />}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Triggered By
        </p>
        <div className="space-y-2">
          {triggerers.map((triggerer) => {
            const selected = filters.triggeredBy.includes(triggerer);

            return (
              <motion.button
                key={triggerer}
                type="button"
                whileHover={{ x: 2 }}
                onClick={() => toggleFilter("triggeredBy", triggerer)}
                aria-pressed={selected}
                className={`flex w-full items-center justify-between gap-2 border rounded-md px-3 py-2 text-sm transition-colors cursor-pointer ${
                  selected
                    ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span>{triggerer}</span>
                {selected && <Check className="h-3.5 w-3.5" />}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

export function InteractiveRunsTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    status: [],
    triggeredBy: [],
  });

  const filteredRuns = useMemo(() => {
    return SAMPLE_RUNS.filter((run) => {
      const lowerQuery = searchQuery.toLowerCase();

      const matchSearch =
        run.description.toLowerCase().includes(lowerQuery) ||
        run.id.toLowerCase().includes(lowerQuery) ||
        run.triggeredBy.toLowerCase().includes(lowerQuery);

      const matchStatus =
        filters.status.length === 0 || filters.status.includes(run.status);
      const matchTriggeredBy =
        filters.triggeredBy.length === 0 ||
        filters.triggeredBy.includes(run.triggeredBy);

      return matchSearch && matchStatus && matchTriggeredBy;
    });
  }, [filters, searchQuery]);

  const activeFilters = filters.status.length + filters.triggeredBy.length;

  return (
    <div className="flex flex-col bg-white rounded-xl border border-[#e5e7eb] shadow-xs overflow-hidden min-h-[600px]">
      <div className="border-b border-[#e5e7eb] bg-white p-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Runs</h1>
            <p className="text-sm text-gray-500">
              A complete, reviewable record of every rehearsal and its promotion decision.
            </p>
          </div>

          <div className="flex gap-2">
            <div className="relative w-full max-w-[360px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search runs by description, ID, or trigger..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-9 pl-9 text-sm border-gray-300 focus-visible:ring-blue-500"
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters((current) => !current)}
              className={`relative cursor-pointer border-gray-300 ${
                showFilters ? "bg-gray-900 text-white hover:bg-gray-800" : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Filter className="h-4 w-4" />
              {activeFilters > 0 && (
                <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center p-0 text-xs bg-red-500 text-white border-0">
                  {activeFilters}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence initial={false}>
          {showFilters && (
            <motion.div
              key="filters"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-r border-[#e5e7eb]"
            >
              <FilterPanel
                filters={filters}
                onChange={setFilters}
                runs={SAMPLE_RUNS}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto">
          <div className="divide-y divide-[#e5e7eb]">
            <AnimatePresence mode="popLayout">
              {filteredRuns.length > 0 ? (
                <motion.div key="runs-list" className="w-full">
                  <div className="flex items-center gap-4 p-4 text-xs font-semibold uppercase tracking-wide text-gray-500 bg-gray-50/80 sticky top-0 z-10 backdrop-blur-md border-b border-[#e5e7eb]">
                    <div className="w-4 flex-shrink-0" />
                    <span className="w-16 flex-shrink-0">Run</span>
                    <span className="flex-1">Description</span>
                    <span className="w-32 flex-shrink-0">Triggered by</span>
                    <span className="w-24 flex-shrink-0 text-center">Status</span>
                    <span className="w-16 flex-shrink-0 text-right">Duration</span>
                  </div>
                  {filteredRuns.map((run, index) => (
                    <motion.div
                      key={run.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{
                        duration: 0.2,
                        delay: index * 0.02,
                      }}
                    >
                      <RunRow
                        run={run}
                        expanded={expandedId === run.id}
                        onToggle={() =>
                          setExpandedId((current) =>
                            current === run.id ? null : run.id
                          )
                        }
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-12 text-center"
                >
                  <p className="text-gray-500">
                    No runs match your filters.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
