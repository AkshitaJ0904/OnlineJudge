import { execSync, spawnSync } from 'child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';

const TIME_LIMIT_MS  = 5000;
const MAX_OUTPUT     = 500;
const DOCKER_IMAGE   = 'gcc';
const CONTAINER_NAME = 'oj-gcc';

const LANG_CONFIG = {
  C:   { ext: 'c',   compiler: 'gcc',  flags: ['-lm'] },
  CPP: { ext: 'cpp', compiler: 'g++',  flags: ['-lm'] },
};

function outputsMatch(actual, expected) {
  const norm = s => s.trim().split('\n').map(l => l.trimEnd());
  return JSON.stringify(norm(actual)) === JSON.stringify(norm(expected));
}

function dockerAvailable() {
  try {
    const r = spawnSync('docker', ['info'], { timeout: 5000 });
    return r.status === 0;
  } catch { return false; }
}

function ensureContainerRunning() {
  const inspect = spawnSync('docker', ['inspect', '-f', '{{.State.Running}}', CONTAINER_NAME], { encoding: 'utf8' });
  if (inspect.status !== 0 || inspect.stdout.trim() !== 'true') {
    spawnSync('docker', ['rm', '-f', CONTAINER_NAME]);
    const r = spawnSync('docker', ['run', '--name', CONTAINER_NAME, '-d', DOCKER_IMAGE, 'sleep', 'infinity']);
    if (r.status !== 0) throw new Error('Failed to start Docker container');
  }
}

function runTestCases(runFn, testCases) {
  const results = [];
  let verdict = 'AC';

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const { stdout, stderr, timedOut, exitCode, error } = runFn(tc.input);

    if (error) {
      results.push({ index: i + 1, verdict: 'RE', input: tc.input.slice(0, MAX_OUTPUT), expected: tc.output.slice(0, MAX_OUTPUT), actual: String(error).slice(0, MAX_OUTPUT) });
      verdict = 'RE';
      break;
    }
    if (timedOut) {
      results.push({ index: i + 1, verdict: 'TLE', input: tc.input.slice(0, MAX_OUTPUT), expected: tc.output.slice(0, MAX_OUTPUT), actual: '(time limit exceeded)' });
      verdict = 'TLE';
      break;
    }
    if (exitCode !== 0) {
      const out = ((stdout || '') + (stderr || '')).trim().slice(0, MAX_OUTPUT) || '(runtime error)';
      results.push({ index: i + 1, verdict: 'RE', input: tc.input.slice(0, MAX_OUTPUT), expected: tc.output.slice(0, MAX_OUTPUT), actual: out });
      verdict = 'RE';
      break;
    }

    const tcVerdict = outputsMatch(stdout, tc.output) ? 'AC' : 'WA';
    results.push({ index: i + 1, verdict: tcVerdict, input: tc.input.slice(0, MAX_OUTPUT), expected: tc.output.slice(0, MAX_OUTPUT), actual: stdout.trim().slice(0, MAX_OUTPUT) });
    if (tcVerdict === 'WA' && verdict === 'AC') verdict = 'WA';
  }

  return { verdict, results };
}

function spawnRun(cmd, args, input) {
  const r = spawnSync(cmd, args, {
    input,
    encoding: 'utf8',
    timeout: TIME_LIMIT_MS,
    maxBuffer: 1024 * 1024,
  });
  return {
    stdout:   r.stdout || '',
    stderr:   r.stderr || '',
    exitCode: r.status ?? 1,
    timedOut: r.signal === 'SIGTERM' || r.error?.code === 'ETIMEDOUT',
    error:    r.error && r.error.code !== 'ETIMEDOUT' ? r.error.message : null,
  };
}

function evaluateCompiledDocker(source, testCases, language) {
  const cfg = LANG_CONFIG[language];
  ensureContainerRunning();

  const id = randomBytes(4).toString('hex');
  const srcFile = `/tmp/sol_${id}.${cfg.ext}`;
  const binFile = `/tmp/sol_${id}`;

  const tmpDir = mkdtempSync(join(tmpdir(), 'oj-'));
  const localSrc = join(tmpDir, `sol_${id}.${cfg.ext}`);
  try {
    writeFileSync(localSrc, source);
    const cp = spawnSync('docker', ['cp', localSrc, `${CONTAINER_NAME}:${srcFile}`], { encoding: 'utf8' });
    if (cp.status !== 0) return { verdict: 'RE', compilerOutput: cp.stderr, testResults: [] };

    const compile = spawnSync('docker', ['exec', CONTAINER_NAME, cfg.compiler, srcFile, '-o', binFile, ...cfg.flags], { encoding: 'utf8', timeout: 30000 });
    if (compile.status !== 0) return { verdict: 'CE', compilerOutput: compile.stderr.slice(0, 3000), testResults: [] };

    const runFn = input => spawnRun('docker', ['exec', '-i', CONTAINER_NAME, binFile], input);
    const { verdict, results } = runTestCases(runFn, testCases);

    spawnSync('docker', ['exec', CONTAINER_NAME, 'rm', '-f', srcFile, binFile]);
    return { verdict, compilerOutput: '', testResults: results };
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
}

function evaluateCompiledLocal(source, testCases, language) {
  const cfg = LANG_CONFIG[language];
  const compiler = cfg.compiler;

  const tmpDir = mkdtempSync(join(tmpdir(), 'oj-'));
  const id = randomBytes(4).toString('hex');
  const src = join(tmpDir, `sol_${id}.${cfg.ext}`);
  const exe = join(tmpDir, `sol_${id}`);
  try {
    writeFileSync(src, source);
    const compile = spawnSync(compiler, [src, '-o', exe, ...cfg.flags], { encoding: 'utf8', timeout: 30000 });
    if (compile.status !== 0) return { verdict: 'CE', compilerOutput: compile.stderr.slice(0, 3000), testResults: [] };

    const runFn = input => spawnRun(exe, [], input);
    const { verdict, results } = runTestCases(runFn, testCases);
    return { verdict, compilerOutput: '', testResults: results };
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
}

function evaluatePython(source, testCases) {
  const python = (() => { try { execSync('which python3', { stdio: 'ignore' }); return 'python3'; } catch { return 'python'; } })();

  const tmpDir = mkdtempSync(join(tmpdir(), 'oj-'));
  const src = join(tmpDir, 'sol.py');
  try {
    writeFileSync(src, source);
    const syntax = spawnSync(python, ['-m', 'py_compile', src], { encoding: 'utf8' });
    if (syntax.status !== 0) return { verdict: 'CE', compilerOutput: syntax.stderr.slice(0, 3000), testResults: [] };

    const runFn = input => spawnRun(python, [src], input);
    const { verdict, results } = runTestCases(runFn, testCases);
    return { verdict, compilerOutput: '', testResults: results };
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
}

export function evaluate(source, testCases, language) {
  try {
    if (language === 'PYTHON') return evaluatePython(source, testCases);
    if (dockerAvailable()) return evaluateCompiledDocker(source, testCases, language);
    return evaluateCompiledLocal(source, testCases, language);
  } catch (err) {
    return { verdict: 'RE', compilerOutput: err.message, testResults: [] };
  }
}
