// Mini Sprintbox
// Vanilla JS single-page prototype with localStorage persistence.

const STORAGE_KEY = 'mini_sprintbox_state_v01';

const defaultState = {
  sprint: {
    title: 'Customer Onboarding Sprint',
    challenge: 'Reduce first-week drop-off for new users adopting AI workflows.',
    goal: 'Co-design 3 testable improvements for onboarding and support.',
    date: new Date().toISOString().slice(0, 10),
    facilitator: 'Jordan Lee',
    participants: ['Product Lead', 'CS Manager', 'Ops Analyst']
  },
  personas: [
    {
      id: crypto.randomUUID(),
      name: 'Alicia Turner',
      role: 'Operations Manager',
      pains: 'Manual status updates, disconnected tools.',
      goals: 'Clear visibility and fewer repetitive tasks.',
      tools: 'Slack, Excel, HubSpot',
      ai_maturity: 'Emerging',
      quote: 'I need AI to reduce noise, not add another dashboard.',
      expectations: 'Fast wins with low process disruption.'
    },
    {
      id: crypto.randomUUID(),
      name: 'Evan Kim',
      role: 'Customer Success Specialist',
      pains: 'Too much context switching between tickets and docs.',
      goals: 'Resolve issues faster with better context.',
      tools: 'Zendesk, Notion, Loom',
      ai_maturity: 'Moderate',
      quote: 'If suggestions are precise, I will use them daily.',
      expectations: 'Trustworthy recommendations and clear handoff.'
    }
  ],
  interviews: [
    {
      id: crypto.randomUUID(),
      participant: 'Maya (Team Lead)',
      biggest_problem: 'Onboarding checklist is long and fragmented.',
      time_lost: 'Collecting info from three systems before each call.',
      desired_outcome: 'One place with next best actions.',
      blockers: 'No owner for process updates.',
      risks: 'Team ignores a solution that feels top-down.',
      ideas_tried: 'Shared templates and weekly reminder emails.'
    }
  ],
  flow: {
    current_state: ['Many docs, no clear sequence', 'Tribal knowledge for edge cases'],
    pain_points: ['Slow first value realization', 'Unclear AI assistant trust boundaries'],
    opportunities: ['Journey map by persona', 'In-product guidance moments'],
    assumptions: ['Users prefer self-serve first', 'AI tips need explainability'],
    ideas: ['Contextual sprint checklist', 'Role-based AI starter prompts'],
    experiments: ['A/B test onboarding emails', 'Pilot AI recap with 10 users']
  },
  meta: {
    version: '0.1',
    last_updated: ''
  }
};

let state = loadState();
let activeModule = 'setup';
let saveTimer = null;

const modules = {
  setup: document.getElementById('module-setup'),
  personas: document.getElementById('module-personas'),
  interviews: document.getElementById('module-interviews'),
  flow: document.getElementById('module-flow'),
  summary: document.getElementById('module-summary')
};

const toolbarTitle = document.getElementById('toolbar-title');
const saveStatus = document.getElementById('save-status');

init();

function init() {
  bindTopActions();
  bindNavigation();
  renderAll();
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultState);
    const parsed = JSON.parse(raw);
    return mergeState(parsed);
  } catch {
    return structuredClone(defaultState);
  }
}

function mergeState(partial) {
  const merged = structuredClone(defaultState);
  merged.sprint = { ...merged.sprint, ...(partial.sprint || {}) };
  merged.personas = Array.isArray(partial.personas) ? partial.personas : merged.personas;
  merged.interviews = Array.isArray(partial.interviews) ? partial.interviews : merged.interviews;
  merged.flow = { ...merged.flow, ...(partial.flow || {}) };
  merged.meta = { ...merged.meta, ...(partial.meta || {}) };
  merged.sprint.participants = Array.isArray(merged.sprint.participants)
    ? merged.sprint.participants
    : [];
  return merged;
}

function persistState() {
  state.meta.last_updated = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  saveStatus.textContent = `Saved ${new Date(state.meta.last_updated).toLocaleString()}`;
}

function queueSave() {
  saveStatus.textContent = 'Saving...';
  clearTimeout(saveTimer);
  saveTimer = setTimeout(persistState, 180);
}

function renderAll() {
  toolbarTitle.textContent = state.sprint.title || 'Mini Sprintbox';
  saveStatus.textContent = state.meta.last_updated
    ? `Saved ${new Date(state.meta.last_updated).toLocaleString()}`
    : 'Not saved yet';

  renderSetup();
  renderPersonas();
  renderInterviews();
  renderFlow();
  renderSummary();
  setActiveModule(activeModule);
}

function bindTopActions() {
  document.getElementById('export-json-btn').addEventListener('click', exportJson);
  document.getElementById('import-json-input').addEventListener('change', importJson);
  document.getElementById('reset-btn').addEventListener('click', () => {
    const ok = confirm('Reset all sprint data? This cannot be undone.');
    if (!ok) return;
    state = structuredClone(defaultState);
    queueSave();
    renderAll();
  });
}

function bindNavigation() {
  document.getElementById('sidebar-nav').addEventListener('click', (event) => {
    const btn = event.target.closest('.nav-btn');
    if (!btn) return;
    setActiveModule(btn.dataset.module);
  });
}

function setActiveModule(moduleName) {
  activeModule = moduleName;
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.module === moduleName);
  });
  Object.entries(modules).forEach(([key, el]) => {
    el.classList.toggle('active', key === moduleName);
  });
}

function card(html) {
  const el = document.getElementById('card-template').content.firstElementChild.cloneNode(true);
  el.innerHTML = html;
  return el;
}

function formField(label, name, value = '', type = 'text') {
  const isTextArea = type === 'textarea';
  return `
    <div class="field">
      <label for="${name}">${label}</label>
      ${
        isTextArea
          ? `<textarea id="${name}" name="${name}">${escapeHtml(value || '')}</textarea>`
          : `<input id="${name}" name="${name}" type="${type}" value="${escapeHtml(value || '')}" />`
      }
    </div>
  `;
}

function renderSetup() {
  const section = modules.setup;
  section.innerHTML = '';

  const header = card(`
    <div class="section-head">
      <div>
        <h3>Sprint Setup</h3>
        <p>Define the sprint context and participants.</p>
      </div>
    </div>
    <form id="setup-form" class="grid two">
      ${formField('Sprint Title', 'title', state.sprint.title)}
      ${formField('Date', 'date', state.sprint.date, 'date')}
      ${formField('Facilitator', 'facilitator', state.sprint.facilitator)}
      ${formField('Goal', 'goal', state.sprint.goal, 'textarea')}
      ${formField('Challenge', 'challenge', state.sprint.challenge, 'textarea')}
      ${formField(
        'Participants (comma-separated)',
        'participants',
        state.sprint.participants.join(', '),
        'textarea'
      )}
    </form>
  `);

  section.appendChild(header);

  header.querySelector('#setup-form').addEventListener('input', (event) => {
    const values = new FormData(event.currentTarget);
    state.sprint.title = String(values.get('title') || '');
    state.sprint.date = String(values.get('date') || '');
    state.sprint.facilitator = String(values.get('facilitator') || '');
    state.sprint.goal = String(values.get('goal') || '');
    state.sprint.challenge = String(values.get('challenge') || '');
    state.sprint.participants = String(values.get('participants') || '')
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);
    toolbarTitle.textContent = state.sprint.title || 'Mini Sprintbox';
    queueSave();
    renderSummary();
  });
}

function renderPersonas() {
  const section = modules.personas;
  section.innerHTML = '';

  const wrapper = card(`
    <div class="section-head">
      <div>
        <h3>Personas</h3>
        <p>Create editable persona cards for the sprint.</p>
      </div>
      <button id="add-persona-btn">+ New Persona</button>
    </div>
    <div id="persona-list" class="grid two"></div>
  `);

  section.appendChild(wrapper);

  const list = wrapper.querySelector('#persona-list');
  if (!state.personas.length) {
    list.innerHTML = '<p class="muted">No personas yet. Add one to get started.</p>';
  } else {
    state.personas.forEach((persona) => list.appendChild(renderPersonaCard(persona)));
  }

  wrapper.querySelector('#add-persona-btn').addEventListener('click', () => {
    state.personas.unshift({
      id: crypto.randomUUID(),
      name: 'New Persona',
      role: '',
      pains: '',
      goals: '',
      tools: '',
      ai_maturity: '',
      quote: '',
      expectations: ''
    });
    queueSave();
    renderPersonas();
    renderSummary();
  });
}

function renderPersonaCard(persona) {
  const el = document.createElement('article');
  el.className = 'item-card';
  el.innerHTML = `
    <h4 contenteditable="true" data-field="name">${escapeHtml(persona.name || 'Untitled Persona')}</h4>
    ${editable('Role', 'role', persona.role)}
    ${editable('Pains', 'pains', persona.pains, true)}
    ${editable('Goals', 'goals', persona.goals, true)}
    ${editable('Tools Used', 'tools', persona.tools)}
    ${editable('AI Maturity', 'ai_maturity', persona.ai_maturity)}
    ${editable('Quote', 'quote', persona.quote, true)}
    ${editable('Expectations', 'expectations', persona.expectations, true)}
    <div class="item-actions">
      <button data-action="delete">Delete</button>
    </div>
  `;

  el.addEventListener('input', (event) => {
    const target = event.target;
    const field = target.dataset.field;
    if (!field) return;
    persona[field] = target.textContent.trim();
    queueSave();
    renderSummary();
  });

  el.querySelector('[data-action="delete"]').addEventListener('click', () => {
    state.personas = state.personas.filter((x) => x.id !== persona.id);
    queueSave();
    renderPersonas();
    renderSummary();
  });

  return el;
}

function editable(label, field, value, long = false) {
  return `
    <p><strong>${label}:</strong></p>
    <div class="${long ? 'long' : ''}" contenteditable="true" data-field="${field}">${escapeHtml(
    value || ''
  )}</div>
  `;
}

function renderInterviews() {
  const section = modules.interviews;
  section.innerHTML = '';

  const wrapper = card(`
    <div class="section-head">
      <div>
        <h3>Pre-Interview Intake</h3>
        <p>Capture pre-sprint interview insights.</p>
      </div>
      <button id="add-interview-btn">+ New Intake</button>
    </div>
    <div id="interview-list" class="grid two"></div>
  `);
  section.appendChild(wrapper);

  const list = wrapper.querySelector('#interview-list');
  if (!state.interviews.length) {
    list.innerHTML = '<p class="muted">No interview entries yet.</p>';
  } else {
    state.interviews.forEach((entry) => list.appendChild(renderInterviewCard(entry)));
  }

  wrapper.querySelector('#add-interview-btn').addEventListener('click', () => {
    state.interviews.unshift({
      id: crypto.randomUUID(),
      participant: 'New Participant',
      biggest_problem: '',
      time_lost: '',
      desired_outcome: '',
      blockers: '',
      risks: '',
      ideas_tried: ''
    });
    queueSave();
    renderInterviews();
    renderSummary();
  });
}

function renderInterviewCard(entry) {
  const el = document.createElement('article');
  el.className = 'item-card';
  el.innerHTML = `
    <h4 contenteditable="true" data-field="participant">${escapeHtml(entry.participant || 'Interview')}</h4>
    ${editable('Biggest Problem', 'biggest_problem', entry.biggest_problem, true)}
    ${editable('Where Time Is Lost', 'time_lost', entry.time_lost, true)}
    ${editable('Desired Outcome', 'desired_outcome', entry.desired_outcome, true)}
    ${editable('Blockers', 'blockers', entry.blockers, true)}
    ${editable('Risks', 'risks', entry.risks, true)}
    ${editable('Ideas Already Tried', 'ideas_tried', entry.ideas_tried, true)}
    <div class="item-actions">
      <button data-action="delete">Delete</button>
    </div>
  `;

  el.addEventListener('input', (event) => {
    const target = event.target;
    const field = target.dataset.field;
    if (!field) return;
    entry[field] = target.textContent.trim();
    queueSave();
    renderSummary();
  });

  el.querySelector('[data-action="delete"]').addEventListener('click', () => {
    state.interviews = state.interviews.filter((x) => x.id !== entry.id);
    queueSave();
    renderInterviews();
    renderSummary();
  });

  return el;
}

function renderFlow() {
  const section = modules.flow;
  section.innerHTML = '';

  const labels = {
    current_state: 'Current State',
    pain_points: 'Pain Points',
    opportunities: 'Opportunities',
    assumptions: 'Assumptions',
    ideas: 'Ideas',
    experiments: 'Next Experiments'
  };

  const wrapper = card(`
    <div class="section-head">
      <div>
        <h3>Sprint Flow Board</h3>
        <p>Edit board cards by writing one item per line.</p>
      </div>
    </div>
    <div class="flow-columns" id="flow-columns"></div>
  `);
  section.appendChild(wrapper);

  const columns = wrapper.querySelector('#flow-columns');
  Object.entries(labels).forEach(([key, label]) => {
    const col = document.createElement('section');
    col.className = 'flow-col';
    col.innerHTML = `
      <h4>${label}</h4>
      <textarea data-key="${key}">${escapeHtml((state.flow[key] || []).join('\n'))}</textarea>
    `;
    columns.appendChild(col);
  });

  columns.addEventListener('input', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLTextAreaElement)) return;
    const key = target.dataset.key;
    state.flow[key] = target.value
      .split('\n')
      .map((x) => x.trim())
      .filter(Boolean);
    queueSave();
    renderSummary();
  });
}

function renderSummary() {
  const section = modules.summary;
  section.innerHTML = '';

  const participantTokens = state.sprint.participants
    .map((p) => `<span class="token">${escapeHtml(p)}</span>`)
    .join('');

  const tags = collectTags();

  const summary = card(`
    <div class="section-head">
      <div>
        <h3>Facilitator Summary</h3>
        <p>Live overview of sprint data with quick tags and print mode.</p>
      </div>
      <button id="print-summary-btn">Print Summary</button>
    </div>

    <div class="grid two">
      <section>
        <h4>Sprint Snapshot</h4>
        <p><strong>Title:</strong> ${escapeHtml(state.sprint.title)}</p>
        <p><strong>Challenge:</strong> ${escapeHtml(state.sprint.challenge)}</p>
        <p><strong>Goal:</strong> ${escapeHtml(state.sprint.goal)}</p>
        <p><strong>Date:</strong> ${escapeHtml(state.sprint.date)}</p>
        <p><strong>Facilitator:</strong> ${escapeHtml(state.sprint.facilitator)}</p>
        <div><strong>Participants:</strong> ${participantTokens || '<span class="muted">None</span>'}</div>
      </section>

      <section>
        <h4>Content Totals</h4>
        <p><strong>Personas:</strong> ${state.personas.length}</p>
        <p><strong>Interviews:</strong> ${state.interviews.length}</p>
        <p><strong>Flow items:</strong> ${Object.values(state.flow).reduce((sum, arr) => sum + arr.length, 0)}</p>
        <div class="field">
          <label for="summary-tags">Tags / Categories (comma-separated)</label>
          <input id="summary-tags" value="${escapeHtml(tags)}" />
        </div>
        <div class="summary-export">
          <button id="summary-export-btn">Export JSON</button>
        </div>
      </section>
    </div>

    <div class="grid two">
      <section>
        <h4>Persona Highlights</h4>
        ${
          state.personas.length
            ? state.personas
                .map(
                  (p) =>
                    `<p><strong>${escapeHtml(p.name)}</strong> — ${escapeHtml(p.role || 'No role yet')}</p>`
                )
                .join('')
            : '<p class="muted">No personas captured.</p>'
        }
      </section>
      <section>
        <h4>Interview Highlights</h4>
        ${
          state.interviews.length
            ? state.interviews
                .map(
                  (i) =>
                    `<p><strong>${escapeHtml(i.participant)}</strong> — ${escapeHtml(
                      i.biggest_problem || 'No problem noted'
                    )}</p>`
                )
                .join('')
            : '<p class="muted">No interviews captured.</p>'
        }
      </section>
    </div>
  `);

  section.appendChild(summary);

  summary.querySelector('#summary-tags').addEventListener('input', (event) => {
    const value = event.target.value;
    state.meta.tags = value
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);
    queueSave();
  });

  summary.querySelector('#print-summary-btn').addEventListener('click', () => window.print());
  summary.querySelector('#summary-export-btn').addEventListener('click', exportJson);
}

function collectTags() {
  if (!Array.isArray(state.meta.tags)) {
    state.meta.tags = ['onboarding', 'AI adoption'];
  }
  return state.meta.tags.join(', ');
}

function exportJson() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeTitle = (state.sprint.title || 'mini-sprintbox').replace(/\s+/g, '-').toLowerCase();
  a.href = url;
  a.download = `${safeTitle}-snapshot.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importJson(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(String(reader.result));
      state = mergeState(imported);
      queueSave();
      renderAll();
      alert('Import successful.');
    } catch {
      alert('Invalid JSON file.');
    } finally {
      event.target.value = '';
    }
  };
  reader.readAsText(file);
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
