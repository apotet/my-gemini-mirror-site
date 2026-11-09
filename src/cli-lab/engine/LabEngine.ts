import { contextualHelp } from './ContextualHelp';
import { initializeStartupConfigs } from './ConfigPersistence';
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
  ) {
    this.state = initializeStartupConfigs(state);
  }

  getState(): NetworkState {
    return this.state;
  }

  setState(state: NetworkState) {
    this.state = initializeStartupConfigs(state);
  }

  /** Switch console target without resetting either device's mode/configuration. */
  selectDevice(deviceId: string): boolean {
    if (!this.state.devices[deviceId]) return false;
    this.state = { ...this.state, activeDeviceId: deviceId };
    return true;
  }

  getPrompt(): string {
    return this.profile.prompt(activeDevice(this.state));
  }

  reset(initial: NetworkState) {
    this.state = initializeStartupConfigs(cloneState(initial));
  }

  /**
   * Tab-completion for the current input line.
   * Returns completed line and/or candidate tokens when ambiguous.
   */
  complete(line: string): { completed?: string; candidates: string[] } {
    const device = activeDevice(this.state);
    const mode = device.modeCtx.mode;
    const priv = device.privilege;

    const endsWithSpace = /\s$/.test(line);
    const trimmed = line.trim();
    const parts = trimmed.length === 0 ? [] : trimmed.split(/\s+/);
    const tokens = endsWithSpace ? parts : parts.slice(0, -1);
    const partial = endsWithSpace ? '' : (parts[parts.length - 1] ?? '').toLowerCase();

    // An empty prefix is not a request to invent the next command keyword.
    // In particular, repeated Tab presses must never construct a command.
    if (!partial) return { candidates: [] };

    const available = this.commands.filter((spec) => {
      if (!spec.modes.includes(mode)) return false;
      if (spec.minPrivilege != null && priv < spec.minPrivilege) return false;
      if (tokens.length > spec.match.length) return false;
      for (let i = 0; i < tokens.length; i++) {
        if (spec.match[i] !== tokens[i].toLowerCase()) return false;
      }
      return true;
    });

    // Complete exactly one CLI keyword per Tab press. Command arguments (VLAN ID,
    // IP, interface name) are not part of the static keyword completion.
    const nextTokens = Array.from(new Set(
      available
        .filter((spec) => tokens.length < spec.match.length)
        .map((spec) => spec.match[tokens.length])
        .filter((word) => word.startsWith(partial))
    )).sort();

    const base = tokens.join(' ');
    const prefix = base ? base + ' ' : '';
    if (nextTokens.length === 1) {
      return { completed: prefix + nextTokens[0] + ' ', candidates: nextTokens };
    }

    if (nextTokens.length > 1) {
      let common = nextTokens[0];
      for (const word of nextTokens.slice(1)) {
        let i = 0;
        while (i < common.length && i < word.length && common[i] === word[i]) i++;
        common = common.slice(0, i);
      }
      if (common.length > partial.length) {
        return { completed: prefix + common, candidates: nextTokens };
      }
      return { candidates: nextTokens };
    }

    return { candidates: [] };
  }

  /** Context-sensitive ? help, read-only and available independent of scenario. */
  help(line: string): string {
    return contextualHelp(this.commands, activeDevice(this.state), line.endsWith('?') ? line : line + '?');
  }

  execute(line: string): CommandResult {
    const trimmed = line.trim();
    if (!trimmed) return { output: '' };
    if (trimmed.endsWith('?')) return { output: this.help(line) };

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

    const working = cloneState(this.state);
    const workingDevice = activeDevice(working);
    const result = spec.handler(tokens, working, workingDevice, this.profile);

    if (result.state) {
      this.state = result.state;
    } else if (result.modeCtx) {
      const next = cloneState(this.state);
      next.devices[next.activeDeviceId].modeCtx = result.modeCtx;
      this.state = next;
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
