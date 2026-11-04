import React, { useState } from 'react';
import { CampusEvent, ConcurrencySimulationResult } from '../types.ts';
import {
  ShieldAlert,
  Zap,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Clock,
  Layers,
  Flame,
  Award,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { getAvatarForName } from '../utils/avatar.ts';

interface Props {
  events: CampusEvent[];
  onRefreshEvents: () => void;
}

export const ConcurrencyTestLab: React.FC<Props> = ({
  events,
  onRefreshEvents,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(
    events.find((e) => e.remaining_tickets === 1)?.event_id ||
      events[0]?.event_id ||
      'evt_race_condition'
  );
  const [concurrentUsers, setConcurrentUsers] = useState<number>(10);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<ConcurrencySimulationResult | null>(
    null
  );

  // Automated 10-test scenario runner state
  const [isRunningAllTests, setIsRunningAllTests] = useState<boolean>(false);
  const [testSuiteResults, setTestSuiteResults] = useState<{
    allPassed: boolean;
    totalTests: number;
    passedTests: number;
    results: {
      scenarioId: number;
      title: string;
      description: string;
      passed: boolean;
      details: string;
    }[];
  } | null>(null);

  const selectedEvent = events.find((e) => e.event_id === selectedEventId);

  const handleRunRaceSimulation = async () => {
    if (!selectedEventId) return;

    setIsSimulating(true);
    setSimResult(null);

    try {
      const res = await fetch('/api/simulate/race-condition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEventId,
          concurrentUsers,
        }),
      });

      const data = await res.json();
      setSimResult(data);
      onRefreshEvents();
    } catch (err) {
      console.error('Race simulation error', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleRunAll10Tests = async () => {
    setIsRunningAllTests(true);
    setTestSuiteResults(null);

    try {
      const res = await fetch('/api/simulate/run-all-tests', {
        method: 'POST',
      });
      const data = await res.json();
      setTestSuiteResults(data);
      onRefreshEvents();
    } catch (err) {
      console.error('Failed to run test suite', err);
    } finally {
      setIsRunningAllTests(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/30">
            <Zap className="w-3.5 h-3.5 fill-amber-400" />
            Critical Concurrency & Dynamic Pricing Test Lab
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Last-Ticket Race Condition & Concurrency Engine
          </h1>
          <p className="text-xs text-indigo-200/90 leading-relaxed">
            Verify transactional mutex isolation, row-level inventory locks, and dynamic surge pricing. Experience what happens when multiple students fire simultaneous checkout calls for the final ticket.
          </p>
        </div>
      </div>

      {/* SECTION 1: 10 AUTOMATED TEST SCENARIOS */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
              <Award className="w-4 h-4" />
              Automated Compliance Suite
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Specification Verification (All 10 Testing Scenarios)
            </h2>
            <p className="text-xs text-slate-500">
              Automates the 10 mandated requirements from the technical specification
            </p>
          </div>

          <button
            onClick={handleRunAll10Tests}
            disabled={isRunningAllTests}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {isRunningAllTests ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Running Test Assertions...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Run Full 10-Scenario Suite</span>
              </>
            )}
          </button>
        </div>

        {/* Results Display */}
        {testSuiteResults && (
          <div className="space-y-4 pt-2">
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between ${
                testSuiteResults.allPassed
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}
            >
              <div className="flex items-center gap-3">
                {testSuiteResults.allPassed ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-7 h-7 text-rose-600 shrink-0" />
                )}
                <div>
                  <h4 className="font-bold text-sm">
                    {testSuiteResults.allPassed
                      ? 'All 10 Scenarios Passed Successfully (100% Passed)!'
                      : 'Some Scenarios Failed'}
                  </h4>
                  <p className="text-xs opacity-90">
                    Passed {testSuiteResults.passedTests} of {testSuiteResults.totalTests} requirements verified by backend assertions.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-white shadow-xs">
                {testSuiteResults.passedTests}/{testSuiteResults.totalTests} Passed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {testSuiteResults.results.map((t) => (
                <div
                  key={t.scenarioId}
                  className={`p-4 rounded-2xl border text-xs space-y-1.5 transition-all ${
                    t.passed
                      ? 'bg-emerald-50/40 border-emerald-200 text-slate-800'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-500 text-[10px]">
                      Scenario #{t.scenarioId}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 font-bold text-[10px] uppercase px-2 py-0.5 rounded-md ${
                        t.passed
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {t.passed ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> PASSED
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" /> FAILED
                        </>
                      )}
                    </span>
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm">{t.title}</h5>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {t.description}
                  </p>
                  <div className="font-mono text-[11px] text-indigo-700 bg-white/80 p-2 rounded-lg border border-slate-200/80">
                    {t.details}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: INTERACTIVE RACE CONDITION SIMULATOR */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2 text-purple-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Flame className="w-4 h-4 text-purple-600" />
            Live Concurrency Simulator
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Simulate Last-Ticket Race Condition
          </h2>
          <p className="text-xs text-slate-500">
            Fires N asynchronous parallel requests hitting the exact same millisecond against an event with 1 ticket left.
          </p>
        </div>

        {/* Configuration Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Select Target Event
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {events.map((e) => (
                <option key={e.event_id} value={e.event_id}>
                  {e.event_name} ({e.remaining_tickets} ticket(s) left)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Simultaneous Concurrent Students
            </label>
            <div className="flex items-center gap-2">
              {[5, 10, 15, 20].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setConcurrentUsers(num)}
                  className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                    concurrentUsers === num
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {num} Users
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRunRaceSimulation}
              disabled={isSimulating}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Firing Concurrency Wave...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Fire Concurrent Bookings Now</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Target Event State Preview */}
        {selectedEvent && (
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Selected Event:</span>
              <span className="font-bold text-slate-900 ml-2">{selectedEvent.event_name}</span>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <span className="text-slate-500">Total Capacity:</span>
                <span className="font-bold text-slate-900 ml-1">
                  {selectedEvent.maximum_capacity}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Remaining Tickets:</span>
                <span
                  className={`font-mono font-bold px-2 py-0.5 rounded ml-1 ${
                    selectedEvent.remaining_tickets <= 1
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {selectedEvent.remaining_tickets}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Authoritative Price:</span>
                <span className="font-bold text-indigo-700 ml-1">
                  ₹{selectedEvent.current_price}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Live Simulation Audit Logs */}
        {simResult && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Successful Winners
                </span>
                <div className="text-2xl font-black text-emerald-900 mt-1">
                  {simResult.successful_bookings}
                </div>
                <span className="text-[10px] text-emerald-700 font-medium">
                  Acquired mutex lock
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
                  Cleanly Rejected
                </span>
                <div className="text-2xl font-black text-rose-900 mt-1">
                  {simResult.failed_bookings}
                </div>
                <span className="text-[10px] text-rose-700 font-medium">
                  Received 409 Sold Out
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                  Oversold Anomaly?
                </span>
                <div className="text-2xl font-black text-indigo-900 mt-1">
                  {simResult.oversold ? '⚠️ YES' : '🛡️ ZERO (0%)'}
                </div>
                <span className="text-[10px] text-indigo-700 font-medium">
                  Verified invariant holds
                </span>
              </div>
            </div>

            {/* Millisecond Execution Log Stream */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  Millisecond Audit Trail ({simResult.logs.length} parallel requests)
                </span>
                <span>Total execution: {simResult.duration_ms}ms</span>
              </div>

              <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl font-mono text-xs max-h-80 overflow-y-auto space-y-2 border border-slate-800">
                {simResult.logs.map((log) => (
                  <div
                    key={log.request_number}
                    className={`p-2 rounded-lg flex items-center justify-between ${
                      log.status === 'success'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                        : 'bg-slate-800/60 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] text-slate-400 font-mono">
                        #{log.request_number}
                      </span>
                      <img
                        src={getAvatarForName(log.user_name)}
                        alt=""
                        className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-600 shrink-0"
                      />
                      <span className="font-semibold text-white">{log.user_name}</span>
                      <span className="text-[11px] opacity-80">{log.message}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {log.ticket_id && (
                        <span className="text-[10px] bg-emerald-800 text-white px-2 py-0.5 rounded font-bold">
                          {log.ticket_id}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-slate-400">
                        +{log.timestamp_offset_ms}ms
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
