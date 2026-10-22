import { expect, mock, test } from 'claude-code/testing'
import type { AgentStatus, On } from 'claude-code'
import type { Engine } from 'claude-code/testing'

const PANE = {
  component: 'Pane',
  requestId: 'session-activity',
  props: {
    title: 'Session activity',
    isFocused: false,
    bodyColumns: 120,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 30 },
    view: {},
  },
} as const

test('a backgrounded command shows as a running row; stop takes two presses and calls TaskStop', async ($, on) => {
  mock.clock(on, { now: 1_000_000 })
  const stopped: string[] = []
  on('tool.call', { tool: 'Bash' }, () => ({
    result: { stdout: '', stderr: '', interrupted: false, backgroundTaskId: 'b1' },
    text: 'Command running in background with ID: b1. Output is being written to: /t/tasks/b1.output',
  }))
  on('tool.call', { tool: 'TaskStop' }, (_$, e) => {
    stopped.push(e.task_id ?? '')
    return { result: { message: 'stopped', task_id: 'b1', task_type: 'local_bash' }, text: 'stopped' }
  })
  on('ui.panes', () => ({ value: [] }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.toast', () => ({ value: undefined }))

  await $.tool.call({ tool: 'Bash', command: 'pnpm dev', description: 'Start the dev server', run_in_background: true })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'session-activity', surface, ...PANE })
    expect(await ui.find({ type: 'Button', text: /Start the dev server/ })).toBeDefined()
    expect(await ui.find({ key: 'shell:b1:stop', text: 'stop' })).toBeDefined()
    await ui.unmount()
  }

  const ui = await $.ui.mount({ plugin: 'session-activity', surface: 'terminal', ...PANE })
  await ui.press({ key: 'shell:b1:stop' })
  expect(await ui.find({ key: 'shell:b1:stop', text: 'confirm stop?' })).toBeDefined()
  expect(stopped).toEqual([])

  await ui.press({ key: 'shell:b1:stop' })
  expect(stopped).toEqual(['b1'])
  expect(await ui.find({ key: 'shell:b1:stop' })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: /^\s*stopped · ran/ })).toBeDefined()
})

test('a task notification marks the row failed with its exit code', async ($, on) => {
  mock.clock(on, { now: 1_000_000 })
  on('tool.call', { tool: 'Bash' }, () => ({
    result: { stdout: '', stderr: '', interrupted: false, backgroundTaskId: 'b2' },
    text: 'Command running in background with ID: b2. Output is being written to: /t/tasks/b2.output',
  }))
  on('ui.panes', () => ({ value: [] }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.status', () => ({ value: undefined }))
  on('prompt.submit', () => ({ text: '' }))

  await $.tool.call({ tool: 'Bash', command: 'pnpm build', run_in_background: true })
  await $.prompt.submit({
    text: '<task-notification>\n<task-id>b2</task-id>\n<status>failed</status>\n<summary>Background command "pnpm build" failed (exit code 2)</summary>\n</task-notification>',
    wait: false,
    origin: { kind: 'task-notification' },
  })

  const ui = await $.ui.mount({ plugin: 'session-activity', surface: 'terminal', ...PANE })
  expect(await ui.find({ type: 'Text', text: /exit 2/ })).toBeDefined()
  expect(await ui.find({ key: 'shell:b2:stop' })).toBeUndefined()
})

test('an agent row shows its model and effort, not its type', async ($, on) => {
  mock.clock(on, { now: 1_000_000 })
  on('agent.list', () => ({ value: [{ id: 'a1', type: 'general-purpose', description: 'Check RLS policies', status: 'running' }] }))
  on('ui.panes', () => ({ value: [] }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.status', () => ({ value: undefined }))
  on('turn.step', async function* (_$, e) {
    const usage = { input_tokens: 1000, output_tokens: 200, cache_read_input_tokens: 0, cache_creation_input_tokens: 0, model: e.model }
    yield { kind: 'stop', stopReason: 'end_turn', usage } as const
    return { turnId: e.turnId, index: e.index, answer: '', toolUses: [], stopReason: 'end_turn', usage } as const
  })

  for await (const _chunk of $.turn.step({ turnId: 't1', index: 0, model: 'claude-sonnet-5-5', effort: 'high', messageCount: 1, agentId: 'a1' })) {
  }
  await $.command.run({ command: 'activity', args: '', origin: { kind: 'composer' }, presentation: { isFullscreen: true, columns: 160 } })

  const ui = await $.ui.mount({ plugin: 'session-activity', surface: 'terminal', ...PANE })
  expect((await ui.find({ key: 'agent:a1:toggle' }))?.text).toMatch(/Check RLS policies/)
  const meta = await ui.find({ type: 'Text', text: /Sonnet 5\.5 · high/ })
  expect(meta?.text).toMatch(/1\.2k tok/)
  expect(meta?.text).not.toMatch(/general-purpose/)
})

test('a completed script leaves the pane two minutes after it ends', async ($, on) => {
  const clock = mock.clock(on, { now: 1_000_000 })
  on('tool.call', { tool: 'Bash' }, () => ({
    result: { stdout: '', stderr: '', interrupted: false, backgroundTaskId: 'b3' },
    text: 'Command running in background with ID: b3. Output is being written to: /t/tasks/b3.output',
  }))
  on('ui.panes', () => ({ value: [] }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.status', () => ({ value: undefined }))
  on('agent.list', () => ({ value: [] }))
  on('prompt.submit', () => ({ text: '' }))
  on('process.run', () => ({ value: { exitCode: 0, stdout: '', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }))
  const open = () => $.command.run({ command: 'activity', args: '', origin: { kind: 'composer' }, presentation: { isFullscreen: true, columns: 160 } })

  await $.tool.call({ tool: 'Bash', command: 'pnpm lint', run_in_background: true })
  await $.prompt.submit({
    text: '<task-notification>\n<task-id>b3</task-id>\n<status>completed</status>\n<summary>Background command "pnpm lint" completed (exit code 0)</summary>\n</task-notification>',
    wait: false,
    origin: { kind: 'task-notification' },
  })
  await open()
  let ui = await $.ui.mount({ plugin: 'session-activity', surface: 'terminal', ...PANE })
  expect(await ui.find({ type: 'Button', text: /pnpm lint/ })).toBeDefined()
  await ui.unmount()

  await clock.advance(121_000)
  await open()
  ui = await $.ui.mount({ plugin: 'session-activity', surface: 'terminal', ...PANE })
  expect(await ui.find({ type: 'Button', text: /pnpm lint/ })).toBeUndefined()
})

test('a script whose output ends in its exit line shows failed and clears with "clear finished"', async ($, on) => {
  mock.clock(on, { now: 1_000_000 })
  on('tool.call', { tool: 'Bash' }, () => ({
    result: { stdout: '', stderr: '', interrupted: false, backgroundTaskId: 'b8' },
    text: 'Command running in background with ID: b8. Output is being written to: /t/tasks/b8.output',
  }))
  on('ui.panes', () => ({ value: [] }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.status', () => ({ value: undefined }))
  on('ui.notify', () => ({ value: { isSent: true, channel: 'terminal_bell' } }))
  on('agent.list', () => ({ value: [] }))
  on('fs.stat', () => ({ value: { kind: 'file', size: 120, mtimeMs: 0, isLink: false } }))
  on('process.run', (_$, e) => ({
    value: {
      exitCode: 0,
      stdout: e.argv[0] === 'tail' ? 'pnpm typecheck\nerror TS2345: nope\n\n[exited with code 8]\n' : '',
      stderr: '',
      isStdoutTruncated: false,
      isStderrTruncated: false,
    },
  }))

  await $.tool.call({ tool: 'Bash', command: 'pnpm typecheck', run_in_background: true })
  await $.command.run({ command: 'activity', args: '', origin: { kind: 'composer' }, presentation: { isFullscreen: true, columns: 160 } })

  const ui = await $.ui.mount({ plugin: 'session-activity', surface: 'terminal', ...PANE })
  expect(await ui.find({ type: 'Text', text: /exit 8/ })).toBeDefined()
  expect(await ui.find({ key: 'shell:b8:stop' })).toBeUndefined()

  await ui.press({ key: 'clear-finished' })
  expect(await ui.find({ type: 'Button', text: /pnpm typecheck/ })).toBeUndefined()
})

test('a running script shows its current CPU and memory', async ($, on) => {
  const clock = mock.clock(on, { now: 1_000_000 })
  on('tool.call', { tool: 'Bash' }, () => ({
    result: { stdout: '', stderr: '', interrupted: false, backgroundTaskId: 'b9' },
    text: 'Command running in background with ID: b9. Output is being written to: /t/tasks/b9.output',
  }))
  on('ui.panes', () => ({ value: [] }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.status', () => ({ value: undefined }))
  on('agent.list', () => ({ value: [] }))
  on('fs.stat', () => ({ value: { kind: 'file', size: 10, mtimeMs: 0, isLink: false } }))
  const PS = [
    '  100     1   100  0.0 90000 claude',
    `  200   100   200  0.0  4096 /bin/bash -c source /s.sh && eval 'pnpm dev' < /dev/null`,
    '  201   200   201 80.0 1044480 next-server (v16)',
  ].join('\n')
  on('process.run', (_$, e) => {
    const [cmd, ...args] = e.argv
    const stdout =
      cmd === 'sh' ? `self 50\n   50   100    50  0.0  100 sh -c ps\n${PS}` :
      cmd === 'ps' ? PS :
      cmd === 'cat' ? args.map(f => `${f.split('/')[2]} (x) S 1 1 1 0 -1 0 0 0 0 0 ${f.includes('201') ? Math.floor(clock.now() / 10) : 0} 0 0 0`).join('\n') :
      cmd === 'tail' ? 'ready\n' : ''
    return { value: { exitCode: 0, stdout, stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }
  })
  const open = () => $.command.run({ command: 'activity', args: '', origin: { kind: 'composer' }, presentation: { isFullscreen: true, columns: 160 } })

  await $.tool.call({ tool: 'Bash', command: 'pnpm dev', run_in_background: true })
  await open()
  await clock.advance(1000)
  await open()

  const ui = await $.ui.mount({ plugin: 'session-activity', surface: 'terminal', ...PANE })
  expect(await ui.find({ type: 'Text', text: /^\s*\d+s · 100% CPU · 1\.0GB$/ })).toBeDefined()
})

test('a command a PreToolUse hook rewrote is found by the command that ran', async ($, on) => {
  const clock = mock.clock(on, { now: 1_000_000 })
  on('classic.PreToolUse', { tool: 'Bash' }, (_$, e) => ({ allow: true, updatedInput: { ...e, command: `rtk ${e.command}` } }))
  on('tool.call', { tool: 'Bash' }, () => ({
    result: { stdout: '', stderr: '', interrupted: false, backgroundTaskId: 'r1' },
    text: 'Command running in background with ID: r1. Output is being written to: /t/tasks/r1.output',
  }))
  on('ui.panes', () => ({ value: [] }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.status', () => ({ value: undefined }))
  on('agent.list', () => ({ value: [] }))
  on('fs.stat', () => ({ value: { kind: 'file', size: 10, mtimeMs: 0, isLink: false } }))
  const PS = [
    '  100     1   100  0.0 90000 claude',
    `  200   100   200  0.0  4096 /bin/bash -c source /s.sh && eval 'rtk git log' < /dev/null`,
  ].join('\n')
  on('process.run', (_$, e) => {
    const stdout = e.argv[0] === 'sh' ? `self 50\n   50   100    50  0.0  100 sh -c ps\n${PS}` : e.argv[0] === 'ps' ? PS : ''
    return { value: { exitCode: 0, stdout, stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }
  })
  const open = () => $.command.run({ command: 'activity', args: '', origin: { kind: 'composer' }, presentation: { isFullscreen: true, columns: 160 } })

  await $.tool.call({ tool: 'Bash', command: 'git log', run_in_background: true })
  await open()
  await clock.advance(11_000)
  await open()

  const ui = await $.ui.mount({ plugin: 'session-activity', surface: 'terminal', ...PANE })
  expect(await ui.find({ type: 'Text', text: /process not found/ })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: /% CPU/ })).toBeDefined()
  expect((await ui.find({ key: 'shell:r1:toggle' }))?.text).toMatch(/^(?!.*rtk).*git log/)
})


test('under 46 columns a script is one line: title, CPU or outcome, and a ■ stop', async ($, on) => {
  mock.clock(on, { now: 1_000_000 })
  on('tool.call', { tool: 'Bash' }, () => ({
    result: { stdout: '', stderr: '', interrupted: false, backgroundTaskId: 'n1' },
    text: 'Command running in background with ID: n1. Output is being written to: /t/tasks/n1.output',
  }))
  on('ui.panes', () => ({ value: [] }))
  on('ui.open', () => ({ value: { isPlaced: true } }))

  await $.tool.call({ tool: 'Bash', command: 'pnpm test:e2e:chromium', description: 'Run editor e2e specs for #487', run_in_background: true })

  const ui = await $.ui.mount({ plugin: 'session-activity', surface: 'terminal', ...PANE, props: { ...PANE.props, bodyColumns: 40 } })
  expect((await ui.find({ key: 'shell:n1:toggle' }))?.text).toMatch(/Run editor e2e specs for #487/)
  expect(await ui.find({ key: 'shell:n1:stop', text: '■' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /^0s$/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /^\s+0s/ })).toBeUndefined()
  expect(await ui.find({ type: 'Button', text: 'stop all' })).toBeDefined()

  await ui.press({ key: 'shell:n1:stop' })
  expect(await ui.find({ key: 'shell:n1:stop', text: 'stop?' })).toBeDefined()
})

test('stopped monitors collapse into one row that expands on show', async ($, on) => {
  mock.clock(on, { now: 1_000_000 })
  let n = 0
  on('tool.call', { tool: 'Monitor' }, () => ({ result: { taskId: `m${++n}`, timeoutMs: 300000 }, text: 'Monitor started' }))
  on('tool.call', { tool: 'TaskStop' }, () => ({ result: { message: 'stopped', task_id: 'x', task_type: 'monitor' }, text: 'stopped' }))
  on('ui.panes', () => ({ value: [] }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.toast', () => ({ value: undefined }))

  for (let i = 0; i < 3; i++) {
    await $.tool.call({ tool: 'Monitor', description: 'Wait for e2e-443b results', timeout_ms: 300000, command: "until grep -q '^DONE' /t/e2e-443b.log; do sleep 5; done" })
  }
  const ui = await $.ui.mount({ plugin: 'session-activity', surface: 'terminal', ...PANE })
  for (const id of ['m1', 'm2', 'm3']) {
    await ui.press({ key: `shell:${id}:stop` })
    await ui.press({ key: `shell:${id}:stop` })
  }

  expect((await ui.find({ key: 'group:stopped-monitors:toggle' }))?.text).toMatch(/3 stopped monitors/)
  expect(await ui.find({ key: 'shell:m1:toggle' })).toBeUndefined()
  await ui.press({ key: 'group:stopped-monitors:show' })
  expect(await ui.find({ key: 'shell:m1:toggle' })).toBeDefined()
})

const STEPS = [
  { content: 'Map the subsystem', status: 'completed' },
  { content: 'Build in small units', status: 'in_progress' },
  { content: 'Open the PR', status: 'pending' },
  { content: 'Measure routing', status: 'skipped', note: 'not asked' },
] as const

type Effort = 'low' | 'medium' | 'high'

const writeTodos = ($: Engine, input: Record<string, unknown>) =>
  $.tool.call({ tool: 'mcp__session-activity__todos', ...input } as unknown as Parameters<Engine['tool']['call']>[0])

const spawn = ($: Engine, description: string, subagentType: string, extra: { model?: string; resume?: { agentId: string } } = {}) =>
  $.agent.spawn({
    tool_use_id: `u-${description}-${Math.random()}`,
    prompt: 'brief',
    description,
    subagentType,
    provider: { plugin: 'engine', tier: 'core' },
    parentModel: 'claude-opus-5-5',
    background: true,
    fork: false,
    ...extra,
  } as unknown as Parameters<Engine['agent']['spawn']>[0])

const openPane = ($: Engine) =>
  $.command.run({ command: 'activity', args: '', origin: { kind: 'composer' }, presentation: { isFullscreen: true, columns: 160 } })

function quietHost(on: On, files: Record<string, string> = {}, status: string[] = ['']) {
  on('ui.panes', () => ({ value: [] }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.status', () => ({ value: undefined }))
  on('session.cwd', () => ({ value: '/repo' }))
  on('env.get', () => ({ value: '/home/me' }))
  on('fs.read', (_$, e) => {
    const text = files[e.path]
    if (text === undefined) throw new Error('ENOENT')
    return { value: text }
  })
  on('process.run', (_$, e) => {
    const stdout = e.argv[0] === 'git' ? (status.length > 1 ? status.shift()! : status[0]!) : e.argv[0] === 'sh' ? 'feat/x\norigin/main\n2\n1\n' : ''
    return { value: { exitCode: e.argv[0] === 'gh' ? 1 : 0, stdout, stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }
  })
  on('turn.step', async function* (_$, e) {
    const usage = { input_tokens: 1000, output_tokens: 0, cache_read_input_tokens: 0, cache_creation_input_tokens: 0, model: e.model }
    yield { kind: 'stop', stopReason: 'end_turn', usage } as const
    return { turnId: e.turnId, index: e.index, answer: '', toolUses: [], stopReason: 'end_turn', usage } as const
  })
  on('turn.complete', (_$, e) => ({ text: e.answer }))
}

async function runTurn($: Engine, agentId: string, model: string, effort: Effort, answer = '') {
  for await (const _chunk of $.turn.step({ turnId: `t-${agentId}`, index: 0, model, effort, messageCount: 1, agentId })) {
  }
  const usage = { input_tokens: 400, output_tokens: 100, cache_read_input_tokens: 0, cache_creation_input_tokens: 0, model }
  await $.turn.complete({ turnId: `t-${agentId}`, agentId, answer, durationMs: 1, isAborted: false, reason: 'answer', usage })
}

test('the todos tool draws the list with its title, progress, branch and skipped reason', async ($, on) => {
  mock.clock(on, { now: 1_000_000 })
  quietHost(on)
  on('agent.list', () => ({ value: [] }))

  const saved = await writeTodos($, { title: 'feature', link: 'https://github.com/o/r/issues/512', items: STEPS })
  expect(saved.result).toMatch(/Saved 4 items, 2 done/)

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'session-activity', surface, ...PANE })
    expect(await ui.find({ type: 'Text', text: /FEATURE · 2 of 4 done/ })).toBeDefined()
    expect(await ui.find({ type: 'Link', text: '#512' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: 'feat/x · 2 behind main · 1 changed · no PR' })).toBeDefined()
    expect(await ui.find({ key: 'todo:Build in small units:toggle' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: 'skip: not asked' })).toBeDefined()
    await ui.unmount()
  }
})

test('the todos tool refuses a bad status, and a subagent, and keeps the list it had', async ($, on) => {
  mock.clock(on, { now: 1_000_000 })
  quietHost(on)
  on('agent.list', () => ({ value: [] }))
  await writeTodos($, { items: STEPS })
  expect((await writeTodos($, { items: [{ content: 'x', status: 'done' }] })).result).toMatch(/Not saved: .*status/)
  expect((await writeTodos($, { items: [{ content: 'mine', status: 'pending' }], agentId: 'd1' })).result).toMatch(/Not saved: only the main conversation/)
  const ui = await $.ui.mount({ plugin: 'session-activity', surface: 'terminal', ...PANE })
  expect(await ui.find({ type: 'Text', text: /TODOS · 2 of 4 done/ })).toBeDefined()
})

test('an agent sits under the step in progress when it was spawned, with its verdict; a finished step folds it', async ($, on) => {
  mock.clock(on, { now: 1_000_000 })
  quietHost(on, { '/home/me/.claude/agents/conductor-editor.md': '---\nmodel: haiku\neffort: low\ndisallowedTools: Agent\n---\n' })
  let status: AgentStatus = 'running'
  on('agent.list', () => ({ value: [{ id: 'a1', type: 'conductor-editor', description: 'Rename atoms', status }] }))
  on('agent.spawn', () => ({ model: 'haiku', agentId: 'a1' }))

  await writeTodos($, { items: STEPS })
  await spawn($, 'Rename atoms', 'conductor-editor')
  await runTurn($, 'a1', 'claude-haiku-5-5', 'low', 'STATUS     PASS\nDID  lib.ts')
  await openPane($)

  let ui = await $.ui.mount({ plugin: 'session-activity', surface: 'terminal', ...PANE })
  expect((await ui.find({ key: 'agent:a1:toggle' }))?.text).toMatch(/editor {2}Rename atoms/)
  expect(await ui.find({ type: 'Text', text: 'PASS' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /Haiku 5\.5 · low ✓/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /OTHER AGENTS/ })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: /SPEND · Haiku 5\.5 500/ })).toBeDefined()
  await ui.unmount()

  status = 'completed'
  await writeTodos($, { items: STEPS.map(s => (s.content === 'Build in small units' ? { ...s, status: 'completed' } : s)) })
  ui = await $.ui.mount({ plugin: 'session-activity', surface: 'terminal', ...PANE })
  expect(await ui.find({ type: 'Text', text: '1 agent ✓' })).toBeDefined()
  expect(await ui.find({ key: 'agent:a1:toggle' })).toBeUndefined()
  await ui.press({ key: 'todo:Build in small units:toggle' })
  expect(await ui.find({ key: 'agent:a1:toggle' })).toBeDefined()
})

test('a resumed agent keeps its step and verdict and is no escalation', async ($, on) => {
  mock.clock(on, { now: 1_000_000 })
  quietHost(on)
  on('agent.list', () => ({ value: [{ id: 'a1', type: 'general-purpose', description: 'Review', status: 'completed' }] }))
  on('agent.spawn', () => ({ model: 'opus', agentId: 'a1' }))

  await writeTodos($, { items: STEPS })
  await spawn($, 'Review', 'general-purpose')
  await runTurn($, 'a1', 'claude-opus-5-5', 'high', 'STATUS PASS')
  await writeTodos($, { items: [...STEPS.slice(0, 2).map(s => ({ ...s, status: 'completed' })), { content: 'Open the PR', status: 'in_progress' }] })
  await spawn($, 'Review', 'general-purpose', { resume: { agentId: 'a1' } })
  await runTurn($, 'a1', 'claude-opus-5-5', 'high', 'Thanks, noted.')
  await openPane($)

  const ui = await $.ui.mount({ plugin: 'session-activity', surface: 'terminal', ...PANE })
  expect(await ui.find({ type: 'Text', text: '1 agent ✓' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /escalated/ })).toBeUndefined()
  await ui.press({ key: 'todo:Build in small units:toggle' })
  expect(await ui.find({ type: 'Text', text: 'PASS' })).toBeDefined()
})

test('a delegate on another model than its definition asks for is flagged, and so is a read-only one that changed the tree', async ($, on) => {
  mock.clock(on, { now: 1_000_000 })
  quietHost(
    on,
    { '/repo/.claude/agents/conductor-reviewer.md': '---\nmodel: opus\neffort: high\ndisallowedTools: Agent, Edit, Write\n---\n' },
    [' M a.ts\n', ' M a.ts\n?? b.ts\n', ' M a.ts\n?? b.ts\n'],
  )
  on('agent.list', () => ({ value: [{ id: 'r1', type: 'conductor-reviewer', description: 'Review unit 1', status: 'completed' }] }))
  on('agent.spawn', () => ({ model: 'sonnet', agentId: 'r1' }))

  await spawn($, 'Review unit 1', 'conductor-reviewer')
  await runTurn($, 'r1', 'claude-sonnet-5-5', 'medium', 'STATUS PASS')
  await spawn($, 'Review unit 1', 'conductor-reviewer', { resume: { agentId: 'r1' } })
  await runTurn($, 'r1', 'claude-sonnet-5-5', 'medium', 'Noted.')
  await openPane($)

  const ui = await $.ui.mount({ plugin: 'session-activity', surface: 'terminal', ...PANE })
  expect(await ui.find({ type: 'Text', text: /AGENTS · 0 running/ })).toBeDefined()
  expect((await ui.find({ key: 'agent:r1:toggle' }))?.text).toMatch(/^⚠/)
  expect(await ui.find({ type: 'Text', text: /⚠ ran Sonnet 5\.5 medium; its definition asks for opus high/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /⚠ 1 file changed in the tree while this read-only agent ran/ })).toBeDefined()
})

test('the same brief spawned again on another model is an escalation; on the same model it is not', async ($, on) => {
  mock.clock(on, { now: 1_000_000 })
  quietHost(on)
  const agents: { id: string; type: string; description: string; status: AgentStatus }[] = []
  on('agent.list', () => ({ value: agents }))
  let next = ''
  on('agent.spawn', () => ({ model: 'x', agentId: next }))

  const run = async (id: string, description: string, model: string, effort: Effort, answer: string, spawnModel?: string) => {
    next = id
    await spawn($, description, 'general-purpose', spawnModel ? { model: spawnModel } : {})
    agents.push({ id, type: 'general-purpose', description, status: 'completed' })
    await runTurn($, id, model, effort, answer)
    await openPane($)
    await openPane($)
  }
  await run('e1', 'Fix tsc', 'claude-haiku-5-5', 'low', 'STATUS BLOCKED')
  await run('e2', 'Fix tsc', 'claude-sonnet-5-5', 'medium', 'STATUS PASS', 'sonnet')
  await run('v1', 'Review branch', 'claude-opus-5-5', 'high', 'STATUS ISSUES', 'opus')
  await run('v2', 'Review branch', 'claude-opus-5-5', 'high', 'STATUS PASS', 'opus')

  const ui = await $.ui.mount({ plugin: 'session-activity', surface: 'terminal', ...PANE })
  expect(await ui.findAll({ type: 'Text', text: /↑ escalated/ })).toHaveLength(1)
  expect(await ui.find({ type: 'Text', text: /↑ escalated from Haiku 5\.5 \(BLOCKED\)/ })).toBeDefined()
})

test('under 46 columns the list folds to the current step and the next one', async ($, on) => {
  mock.clock(on, { now: 1_000_000 })
  quietHost(on)
  on('agent.list', () => ({ value: [] }))
  await writeTodos($, { items: STEPS })
  const ui = await $.ui.mount({ plugin: 'session-activity', surface: 'terminal', ...PANE, props: { ...PANE.props, bodyColumns: 40 } })
  expect(await ui.find({ key: 'todo:Build in small units:toggle' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /next: Open the PR/ })).toBeDefined()
  expect(await ui.find({ key: 'todo:Map the subsystem:toggle' })).toBeUndefined()
  await ui.press({ key: 'todos:toggle' })
  expect(await ui.find({ key: 'todo:Map the subsystem:toggle' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'skip' })).toBeDefined()
})
