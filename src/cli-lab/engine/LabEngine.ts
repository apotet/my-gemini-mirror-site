import { evaluateGoals } from './GoalEvaluator';
import {
  CommandResult,
  CommandSpec,
  DeviceState,
  GoalPredicate,
  NetworkState,
  VendorProfile,
} from './types';

function cloneState(state: NetworkState): NetworkState {
  return structuredClone(state);
}

function activeDevice(state: NetworkState): DeviceState {
  const d = state.devices[state.activeDeviceId];
  if (!d) throw new Error(`Active device ${state.activeDeviceId} missing`);
  return d;
}

/** Longest-prefix match on command tokens */
function findCommand(specs: CommandSpec[], tokens: string[]): CommandSpec | undefined {
  const lower = tokens.map((t) => t.toLowerCase());
  let best: CommandSpec | undefined;
  let bestLen = 0;
  for (const spec of specs) {
    const m = spec.match;
    if (m.length > lower.length) continue;
    let ok = true;
    for (let i = 0; i < m.length; i++) {
      if (m[i] !== lower[i]) {
        ok = false;
        break;
      }
    }
    if (ok && m.length >= bestLen) {
      best = spec;
      bestLen = m.length;
    }
  }
  return best;
}

export class LabEngine {
  constructor(
    private profile: VendorProfile,
    private commands: CommandSpec[],
    private state: NetworkState
  ) {}

  getState(): NetworkState {
    return this.state;
  }

  setState(state: NetworkState) {
    this.state = state;
  }

  getPrompt(): string {
    return this.profile.prompt(activeDevice(this.state));
  }

  reset(initial: NetworkState) {
    this.state = cloneState(initial);
  }

  execute(line: string): CommandResult {
    const trimmed = line.trim();
    if (!trimmed) return { output: '' };

    const tokens = trimmed.split(/\s+/);
    const device = activeDevice(this.state);
    const spec = findCommand(this.commands, tokens);

    if (!spec) {
      return { output: this.profile.messages.invalid, error: true };
    }

    if (!spec.modes.includes(device.modeCtx.mode)) {
      return {
        output: `${this.profile.messages.invalid}\n(Команда недоступна в режиме ${device.modeCtx.mode})`,
        error: true,
      };
    }

    if (spec.minPrivilege != null && device.privilege < spec.minPrivilege) {
      return { output: this.profile.messages.needEnable, error: true };
    }

    // Handlers receive a clone; if they return state, we commit it
    const working = cloneState(this.state);
    const workingDevice = activeDevice(working);
    const result = spec.handler(tokens, working, workingDevice, this.profile);

    if (result.state) {
      this.state = result.state;
    } else if (result.modeCtx) {
      // mode-only change on current state
      const next = cloneState(this.state);
      next.devices[next.activeDeviceId].modeCtx = result.modeCtx;
      this.state = next;
    } else {
      // handler may have mutated working via returned fields only — prefer explicit state
      // If handler mutated working in place without returning state, commit working when output ok
      // Convention: handlers should return state when mutating.
    }

    // If handler mutated working and returned state undefined but changed mode on workingDevice
    if (!result.state && result.modeCtx == null) {
      // commit working if handler wrote into it (detect by privilege/mode/hostname/if changes is hard)
      // Standard: handlers always return state when changing anything.
    }

    if (result.state) this.state = result.state;

    return {
      output: result.output,
      error: result.error,
      state: this.state,
      modeCtx: this.state.devices[this.state.activeDeviceId].modeCtx,
    };
  }

  checkGoals(goals: GoalPredicate[]) {
    return evaluateGoals(this.state, goals);
  }
}
