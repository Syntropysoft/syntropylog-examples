/**
 * NestJS LoggerService wired to SyntropyLog — the production pattern from
 * echeq-sandbox-nestjs. We deliberately do NOT use `syntropylog/nestjs` here:
 * that subpath bundles its own SyntropyLog singleton, separate from the main
 * `syntropylog` one we initialize, which leads to "Logger Factory not available".
 * Wrapping the main singleton directly keeps ONE instance across the whole app.
 */
import { LoggerService, LogLevel } from '@nestjs/common';
import { syntropyLog } from 'syntropylog';

const SL_LEVELS = new Set(['info', 'warn', 'error', 'debug', 'trace', 'fatal']);

/** `JSON.stringify(new Error())` is `{}` — pull message/stack out explicitly. */
function serializeForLog(value: unknown): unknown {
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  return value;
}

function toMessageString(message: unknown, optionalParams: unknown[]): string {
  if (typeof message === 'string') return message;
  const serialized = serializeForLog(message);
  try {
    return JSON.stringify(serialized);
  } catch {
    return String(message);
  }
}

function pickNestContext(optionalParams: unknown[]): string | undefined {
  for (const p of optionalParams) {
    if (typeof p === 'string' && !p.includes('\n')) return p;
  }
  return undefined;
}

export class SyntropyNestLoggerService implements LoggerService {
  constructor(private readonly defaultContext = 'nest') {}

  private emit(
    level: 'info' | 'warn' | 'error' | 'debug' | 'verbose' | 'fatal',
    message: unknown,
    optionalParams: unknown[]
  ): void {
    const log = syntropyLog.getLogger('nest');
    const nestContext = pickNestContext(optionalParams) ?? this.defaultContext;
    const msg = toMessageString(message, optionalParams);
    const meta = { nestContext };
    const slLevel = level === 'verbose' ? 'trace' : SL_LEVELS.has(level) ? level : 'info';
    const fn = (log as unknown as Record<string, (m: object, s: string) => void>)[slLevel];
    if (typeof fn === 'function') fn.call(log, meta, msg);
    else log.info(meta, msg);
  }

  log(message: unknown, ...optionalParams: unknown[]): void {
    this.emit('info', message, optionalParams);
  }
  error(message: unknown, ...optionalParams: unknown[]): void {
    this.emit('error', message, optionalParams);
  }
  warn(message: unknown, ...optionalParams: unknown[]): void {
    this.emit('warn', message, optionalParams);
  }
  debug(message: unknown, ...optionalParams: unknown[]): void {
    this.emit('debug', message, optionalParams);
  }
  verbose(message: unknown, ...optionalParams: unknown[]): void {
    this.emit('verbose', message, optionalParams);
  }
  fatal(message: unknown, ...optionalParams: unknown[]): void {
    this.emit('fatal', message, optionalParams);
  }
  setLogLevels(_levels: LogLevel[]): void {
    /* SyntropyLog level is set at init; Nest's call is a best-effort no-op */
  }
}
