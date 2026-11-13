import { CorrectionCandidate, Rule } from './types';
import { segmentSentences } from './segmenter';
import { IRREGULAR_VERBS } from '../data/irregularVerbs';

// Lookup maps built from IRREGULAR_VERBS for exact morphology conversion
const V1_TO_V2 = new Map<string, string>();
const V1_TO_V3 = new Map<string, string>();
const V3_TO_V1 = new Map<string, string>();
const ING_TO_V1 = new Map<string, string>();
const V1_TO_ING = new Map<string, string>();
const IRREGULAR_V3_SET = new Set<string>();

for (const v of IRREGULAR_VERBS) {
  const v1 = v.v1.toLowerCase();
  const v2 = v.v2.toLowerCase();
  const v3 = v.v3.toLowerCase();
  const ing = v.ingForm.toLowerCase();
  V1_TO_V2.set(v1, v2);
  V1_TO_V3.set(v1, v3);
  V3_TO_V1.set(v3, v1);
  ING_TO_V1.set(ing, v1);
  V1_TO_ING.set(v1, ing);
  IRREGULAR_V3_SET.add(v3);
}

// Additional common irregular forms not in or differing by variant
const EXTRA_IRREGULAR_PAST: Record<string, { v2: string; v3: string; ing: string }> = {
  analyze: { v2: 'analyzed', v3: 'analyzed', ing: 'analyzing' },
  analyse: { v2: 'analysed', v3: 'analysed', ing: 'analysing' },
  study: { v2: 'studied', v3: 'studied', ing: 'studying' },
  apply: { v2: 'applied', v3: 'applied', ing: 'applying' },
  verify: { v2: 'verified', v3: 'verified', ing: 'verifying' },
  modify: { v2: 'modified', v3: 'modified', ing: 'modifying' },
  identify: { v2: 'identified', v3: 'identified', ing: 'identifying' },
  quantify: { v2: 'quantified', v3: 'quantified', ing: 'quantifying' },
  classify: { v2: 'classified', v3: 'classified', ing: 'classifying' },
  submit: { v2: 'submitted', v3: 'submitted', ing: 'submitting' },
  omit: { v2: 'omitted', v3: 'omitted', ing: 'omitting' },
  refer: { v2: 'referred', v3: 'referred', ing: 'referring' },
  transfer: { v2: 'transferred', v3: 'transferred', ing: 'transferring' },
  drop: { v2: 'dropped', v3: 'dropped', ing: 'dropping' },
  stop: { v2: 'stopped', v3: 'stopped', ing: 'stopping' },
  plan: { v2: 'planned', v3: 'planned', ing: 'planning' },
  map: { v2: 'mapped', v3: 'mapped', ing: 'mapping' },
  log: { v2: 'logged', v3: 'logged', ing: 'logging' },
  scan: { v2: 'scanned', v3: 'scanned', ing: 'scanning' },
  control: { v2: 'controlled', v3: 'controlled', ing: 'controlling' },
  model: { v2: 'modeled', v3: 'modeled', ing: 'modeling' },
  label: { v2: 'labeled', v3: 'labeled', ing: 'labeling' },
  cancel: { v2: 'canceled', v3: 'canceled', ing: 'canceling' },
  travel: { v2: 'traveled', v3: 'traveled', ing: 'traveling' },
  step: { v2: 'stepped', v3: 'stepped', ing: 'stepping' },
  slip: { v2: 'slipped', v3: 'slipped', ing: 'slipping' },
  trip: { v2: 'tripped', v3: 'tripped', ing: 'tripping' },
  grab: { v2: 'grabbed', v3: 'grabbed', ing: 'grabbing' },
  nod: { v2: 'nodded', v3: 'nodded', ing: 'nodding' },
  wrap: { v2: 'wrapped', v3: 'wrapped', ing: 'wrapping' },
  die: { v2: 'died', v3: 'died', ing: 'dying' },
  lie: { v2: 'lied', v3: 'lied', ing: 'lying' },
  tie: { v2: 'tied', v3: 'tied', ing: 'tying' },
};

const EXTRA_ING_TO_V1 = new Map<string, string>();
const EXTRA_V3_TO_V1 = new Map<string, string>();
for (const [base, forms] of Object.entries(EXTRA_IRREGULAR_PAST)) {
  EXTRA_ING_TO_V1.set(forms.ing, base);
  EXTRA_V3_TO_V1.set(forms.v3, base);
}

// Known -e verbs whose stem ends in a consonant + e before -ing drop
const SILENT_E_STEMS = new Set([
  'analyz', 'analys', 'evaluat', 'examin', 'observ', 'measur', 'compar', 'improv',
  'optimiz', 'optimis', 'reduc', 'increas', 'decreas', 'solv', 'configur', 'determin',
  'produc', 'explor', 'investigat', 'complet', 'calculat', 'estimat', 'generat',
  'validat', 'integrat', 'simulat', 'formul', 'formulat', 'describ', 'defin',
  'prepar', 'provid', 'creat', 'updat', 'delet', 'remov', 'replac', 'us', 'mak',
  'tak', 'giv', 'writ', 'clos', 'mov', 'liv', 'sav', 'serv', 'notic', 'chang',
  'arrang', 'manag', 'acknowledg', 'organiz', 'organis', 'summariz', 'summaris',
  'categoriz', 'categoris', 'prioritiz', 'standardiz', 'visualiz', 'recogniz',
  'utiliz', 'comput', 'execut', 'operat', 'activat', 'allocat', 'annotat',
  'calibrat', 'correlat', 'demonstrat', 'indicat', 'illustrat', 'isolat',
  'mitigat', 'moderat', 'navigat', 'participat', 'regulat', 'replicat', 'separat',
  'speculat', 'terminat', 'translat', 'triangulat', 'aggregat', 'approximat',
  'incorporat', 'eliminat', 'accelerat', 'decelerat', 'enhanc', 'enabl', 'disabl',
  'handl', 'sampl', 'assembl', 'reconcil', 'compil', 'profil', 'stor', 'explor',
  'ignor', 'restor', 'ensur', 'measur', 'structur', 'captur', 'featur', 'configur',
  'decid', 'divid', 'includ', 'exclud', 'conclud', 'introduc', 'induc', 'deduc',
  'achiev', 'believ', 'receiv', 'perceiv', 'conceiv', 'retriev', 'resolv', 'involv',
  'evolv', 'dissolv', 'preserv', 'observ', 'deserv', 'conserv', 'reserv',
  'argu', 'continu', 'issu', 'pursu', 'valu', 'rescu',
  'revise', 'revis', 'supervis', 'exercis', 'compromis', 'analyz', 'synthesiz',
  'hypothesiz', 'diagnos', 'pars', 'releas', 'increas', 'purchas', 'practis',
  'shap', 'escap', 'cop', 'hop', 'shar', 'car', 'declar', 'inspir', 'requir',
  'acquir', 'inquir', 'desir', 'admir', 'retir', 'hir', 'fir', 'wir', 'secur',
  'endur', 'cur', 'scor', 'ador', 'guid', 'slid', 'prid', 'provid', 'decid',
  'rais', 'prais', 'caus', 'paus', 'choos', 'abus', 'refus', 'confus', 'accus',
  'excus', 'reus', 'misus', 'compos', 'impos', 'oppos', 'propos', 'suppos',
  'dispos', 'expos', 'forc', 'enforc', 'reinforc', 'advanc', 'balanc', 'glanc',
  'financ', 'sourc', 'practic', 'servic', 'voiced', 'voic', 'driv', 'arriv',
  'surviv', 'deriv', 'depriv', 'reviv', 'thriv', 'striv', 'forgiv', 'engag',
  'leverag', 'damag', 'encourag', 'discourag', 'merg', 'emerg', 'converg',
  'diverg', 'charg', 'enlarg', 'urg', 'judg', 'bridg', 'lodg', 'nam', 'fram',
  'blam', 'tim', 'consum', 'assum', 'resum', 'presum', 'fac', 'pac', 'plac',
  'trac', 'spac', 'rac', 'grac', 'emigr', 'migr', 'navig', 'mitig', 'revok',
  'invok', 'provok', 'evok', 'smok', 'pok', 'chok', 'jok', 'wak', 'shak',
  'bak', 'lik', 'hik', 'bik', 'spik', 'strik', 'stat', 'rat', 'dat', 'hat',
]);

export function baseToPastTense(base: string): string {
  const lower = base.toLowerCase();
  if (V1_TO_V2.has(lower)) return V1_TO_V2.get(lower)!;
  if (EXTRA_IRREGULAR_PAST[lower]) return EXTRA_IRREGULAR_PAST[lower].v2;
  if (lower.endsWith('e')) return lower + 'd';
  if (/[bcdfghjklmnpqrstvwxyz]y$/.test(lower)) return lower.slice(0, -1) + 'ied';
  return lower + 'ed';
}

export function baseToPastParticiple(base: string): string {
  const lower = base.toLowerCase();
  if (V1_TO_V3.has(lower)) return V1_TO_V3.get(lower)!;
  if (EXTRA_IRREGULAR_PAST[lower]) return EXTRA_IRREGULAR_PAST[lower].v3;
  if (lower.endsWith('e')) return lower + 'd';
  if (/[bcdfghjklmnpqrstvwxyz]y$/.test(lower)) return lower.slice(0, -1) + 'ied';
  return lower + 'ed';
}

export function baseToGerund(base: string): string {
  const lower = base.toLowerCase();
  if (V1_TO_ING.has(lower)) return V1_TO_ING.get(lower)!;
  if (EXTRA_IRREGULAR_PAST[lower]) return EXTRA_IRREGULAR_PAST[lower].ing;
  if (lower.endsWith('ie')) return lower.slice(0, -2) + 'ying';
  if (lower.endsWith('ee') || lower.endsWith('ye') || lower.endsWith('oe') || lower === 'be') {
    return lower + 'ing';
  }
  if (lower.endsWith('e')) return lower.slice(0, -1) + 'ing';
  if (/^(?:stop|plan|run|sit|set|get|put|cut|shut|hit|fit|split|quit|skip|slip|trip|drop|wrap|map|log|tag|dig|win|beg|rub|rob|hug|nod|grab|chat|shop|ship|swim|spin|step|bet|ban|scan|blur|stir|admit|commit|emit|omit|permit|submit|prefer|refer|transfer|occur|infer|confer|deter|regret|forget|begin|control|patrol|cancel|travel|label|model)$/.test(lower)) {
    return lower + lower.charAt(lower.length - 1) + 'ing';
  }
  return lower + 'ing';
}

export function gerundToBase(ingForm: string): string {
  const lower = ingForm.toLowerCase();
  if (ING_TO_V1.has(lower)) return ING_TO_V1.get(lower)!;
  if (EXTRA_ING_TO_V1.has(lower)) return EXTRA_ING_TO_V1.get(lower)!;
  if (!lower.endsWith('ing') || lower.length <= 4) return lower;

  const stem = lower.slice(0, -3);
  if (SILENT_E_STEMS.has(stem)) return stem + 'e';
  // General English orthography: verb stems never end in single -c, -v, -dg, or -rg without silent -e
  if (/(?:(?<!c)c|(?<!v)v|dg|rg)$/.test(stem)) {
    return stem + 'e';
  }
  // Heuristic: C + (at|iz|is|ys|ut|ur|id|ud|ov|iv|ev|av|as|os|uc|ac|ul|pl|bl|gl|cl|fl|sl) -> + 'e'
  if (/(?:at|iz|is|ys|ut|ur|id|ud|ov|iv|ev|av|as|os|uc|ac|ul|pl|bl|gl|cl|fl|sl)$/.test(stem) && !/(?:wait|eat|beat|hear|appear|clear|near|wear|bear|fear|void|avoid|visit|edit|exit|limit|orbit|credit|profit|permit|submit|admit|omit|commit|emit|read|lead|feed|need|heed|seed|bleed|speed|breed|steed|weed|load|road|goad|toad|broad|aid|paid|said|laid|raid|braid|staid|wait|bait|gait|trait)$/.test(stem)) {
    return stem + 'e';
  }
  // Doubled final consonant (e.g. running -> run, stopping -> stop, planning -> plan)
  if (/([bcdfghjklmnpqrstvwxz])\1$/.test(stem)) {
    const single = stem.slice(0, -1);
    if (!/(?:ss|ll|ff|zz)$/.test(stem)) return single;
  }
  return stem;
}

export function gerundToPastParticiple(ingForm: string): string {
  return baseToPastParticiple(gerundToBase(ingForm));
}

export function gerundToPastTense(ingForm: string): string {
  return baseToPastTense(gerundToBase(ingForm));
}

export function v3ToBase(v3Form: string): string {
  const lower = v3Form.toLowerCase();
  if (V3_TO_V1.has(lower)) return V3_TO_V1.get(lower)!;
  if (EXTRA_V3_TO_V1.has(lower)) return EXTRA_V3_TO_V1.get(lower)!;
  if (lower.endsWith('ied')) return lower.slice(0, -3) + 'y';
  if (lower.endsWith('ed')) {
    const stem = lower.slice(0, -2);
    if (SILENT_E_STEMS.has(stem) || /(?:at|iz|is|ut|ur|id|ud|ov|iv|ev|av|as|os|uc|ac)$/.test(stem)) {
      return stem + 'e';
    }
    if (/([bcdfghjklmnpqrstvwxz])\1$/.test(stem) && !/(?:ss|ll|ff|zz)$/.test(stem)) {
      return stem.slice(0, -1);
    }
    return stem;
  }
  return lower;
}

export function v3ToPastTense(v3Form: string): string {
  const lower = v3Form.toLowerCase();
  const base = v3ToBase(lower);
  if (base !== lower || V1_TO_V2.has(lower)) {
    return baseToPastTense(base);
  }
  return lower;
}

function isPastParticipleToken(word: string): boolean {
  const lower = word.toLowerCase();
  if (IRREGULAR_V3_SET.has(lower) || EXTRA_V3_TO_V1.has(lower)) return true;
  if (lower.length >= 4 && lower.endsWith('ed')) return true;
  if (lower.length >= 5 && /(?:en|wn|ne)$/.test(lower) && !/^(?:when|then|even|often|open|green|screen|between|teen|queen|seven|eleven|kitchen|chicken|garden|burden|sudden|wooden|golden|hidden|linen|dozen|citizen|oxygen|hydrogen|nitrogen|carbon|woman|women|human|person|reason|season|lesson|prison|poison|common|cotton|button|nation|action|station|portion|option|question|section|mention|attention|condition|position|decision|vision|version|mission|passion|session|discussion|opinion|union|million|billion|region|religion|solution|pollution|institution|constitution|evolution|revolution|population|education|information|organization|communication|investigation|observation|evaluation|examination|consideration|interpretation|recommendation|implementation|administration|demonstration|illustration|classification|identification|modification|clarification|verification|qualification|justification|notification|specification|amplification|simplification|magnification|certification|quantification|experimentation|documentation|instrumentation|fragmentation|segmentation|representation|presentation|interpretation|phenomenon|criterion|domain|certain|remain|obtain|contain|maintain|explain|complain|sustain|retain|attain|detain|entertain|mountain|fountain|curtain|captain|bargain)$/.test(lower)) {
    return true;
  }
  return false;
}

// Non-dangling impersonal/prepositional participles that do not require an agentive subject
const IMPERSONAL_PARTICIPLES = new Set([
  'assuming',
  'considering',
  'concerning',
  'regarding',
  'following',
  'including',
  'excluding',
  'pending',
  'given',
  'provided',
  'providing',
  'supposing',
  'granting',
  'seeing',
  'barring',
  'judging',
  'speaking',
  'talking',
  'roughly',
  'strictly',
  'generally',
  'broadly',
  'frankly',
  'honestly',
  'according',
  'owing',
  'pertaining',
  'relating',
  'depending',
  'starting',
  'beginning',
]);

// Intransitive verbs that do not take a direct object NP for passivization
const INTRANSITIVE_VERBS = new Set([
  'arrive', 'arrived', 'arriving',
  'walk', 'walked', 'walking',
  'run', 'ran', 'running',
  'work', 'worked', 'working',
  'wait', 'waited', 'waiting',
  'sit', 'sat', 'sitting',
  'stand', 'stood', 'standing',
  'sleep', 'slept', 'sleeping',
  'wake', 'woke', 'woken', 'waking',
  'live', 'lived', 'living',
  'stay', 'stayed', 'staying',
  'go', 'went', 'gone', 'going',
  'come', 'came', 'coming',
  'return', 'returned', 'returning',
  'depart', 'departed', 'departing',
  'travel', 'traveled', 'traveling',
  'look', 'looked', 'looking',
  'listen', 'listened', 'listening',
  'speak', 'spoke', 'spoken', 'speaking',
  'talk', 'talked', 'talking',
  'think', 'thought', 'thinking',
  'pause', 'paused', 'pausing',
  'hesitate', 'hesitated', 'hesitating',
  'finish', 'finished', 'finishing',
  'fail', 'failed', 'failing',
  'succeed', 'succeeded', 'succeeding',
  'fly', 'flew', 'flown', 'flying',
  'swim', 'swam', 'swum', 'swimming',
  'climb', 'climbed', 'climbing',
  'jog', 'jogged', 'jogging',
  'commute', 'commuted', 'commuting',
  'graduate', 'graduated', 'graduating',
]);

// Human / Animate / Institutional Agentive Nouns (valid subjects for active participial clauses)
const AGENTIVE_NOUNS = new Set([
  'i', 'we', 'you', 'he', 'she', 'they', 'who', 'one', 'someone', 'somebody',
  'anyone', 'anybody', 'everyone', 'everybody', 'no one', 'nobody',
  'person', 'people', 'human', 'humans', 'individual', 'individuals',
  'researcher', 'researchers', 'scientist', 'scientists', 'scholar', 'scholars',
  'author', 'authors', 'writer', 'writers', 'editor', 'editors', 'reviewer', 'reviewers',
  'analyst', 'analysts', 'investigator', 'investigators', 'experimenter', 'experimenters',
  'engineer', 'engineers', 'developer', 'developers', 'programmer', 'programmers',
  'architect', 'architects', 'designer', 'designers', 'technician', 'technicians',
  'doctor', 'doctors', 'physician', 'physicians', 'clinician', 'clinicians',
  'nurse', 'nurses', 'surgeon', 'surgeons', 'therapist', 'therapists', 'patient', 'patients',
  'participant', 'participants', 'subject', 'subjects', 'volunteer', 'volunteers',
  'student', 'students', 'teacher', 'teachers', 'professor', 'professors', 'educator', 'educators',
  'lecturer', 'lecturers', 'instructor', 'instructors', 'dean', 'principal',
  'manager', 'managers', 'director', 'directors', 'executive', 'executives', 'leader', 'leaders',
  'ceo', 'founder', 'founders', 'administrator', 'administrators', 'official', 'officials',
  'worker', 'workers', 'employee', 'employees', 'staff', 'member', 'members',
  'team', 'teams', 'crew', 'crews', 'committee', 'committees', 'board', 'boards',
  'panel', 'panels', 'commission', 'council', 'faculty', 'department', 'group', 'groups',
  'organization', 'organizations', 'institution', 'institutions', 'university', 'universities',
  'company', 'companies', 'firm', 'firms', 'corporation', 'corporations', 'agency', 'agencies',
  'government', 'governments', 'ministry', 'parliament', 'congress', 'senate', 'court', 'courts',
  'judge', 'judges', 'jury', 'lawyer', 'lawyers', 'attorney', 'attorneys', 'police', 'officer', 'officers',
  'driver', 'drivers', 'pilot', 'pilots', 'passenger', 'passengers', 'pedestrian', 'pedestrians',
  'visitor', 'visitors', 'guest', 'guests', 'tourist', 'tourists', 'traveler', 'travelers',
  'customer', 'customers', 'client', 'clients', 'consumer', 'consumers', 'user', 'users',
  'reader', 'readers', 'listener', 'listeners', 'viewer', 'viewers', 'observer', 'observers',
  'speaker', 'speakers', 'presenter', 'presenters', 'reporter', 'reporters', 'journalist', 'journalists',
  'citizen', 'citizens', 'resident', 'residents', 'voter', 'voters', 'public',
  'man', 'men', 'woman', 'women', 'child', 'children', 'boy', 'boys', 'girl', 'girls',
  'adult', 'adults', 'parent', 'parents', 'mother', 'father', 'brother', 'sister', 'family', 'families',
  'friend', 'friends', 'colleague', 'colleagues', 'partner', 'partners', 'assistant', 'assistants',
  'chemist', 'chemists', 'biologist', 'biologists', 'physicist', 'physicists', 'economist', 'economists',
  'historian', 'historians', 'linguist', 'linguists', 'psychologist', 'psychologists', 'sociologist', 'sociologists',
  'archivist', 'archivists', 'librarian', 'librarians', 'curator', 'curators', 'chef', 'cook', 'baker',
  'artist', 'artists', 'musician', 'musicians', 'actor', 'actors', 'player', 'players', 'coach',
]);

// Explicitly Inanimate / Abstract / Epistemic Nouns (cannot perform cognitive/physical human actions)
const INANIMATE_NOUNS = new Set([
  'result', 'results', 'finding', 'findings', 'data', 'dataset', 'datasets',
  'study', 'studies', 'report', 'reports', 'paper', 'papers', 'article', 'articles',
  'analysis', 'analyses', 'evidence', 'telemetry', 'output', 'outputs',
  'experiment', 'experiments', 'trial', 'trials', 'test', 'tests', 'testing',
  'model', 'models', 'algorithm', 'algorithms', 'system', 'systems',
  'method', 'methods', 'methodology', 'methodologies', 'approach', 'approaches',
  'graph', 'graphs', 'chart', 'charts', 'table', 'tables', 'figure', 'figures', 'diagram', 'diagrams',
  'equation', 'equations', 'formula', 'formulas', 'summary', 'summaries',
  'conclusion', 'conclusions', 'hypothesis', 'hypotheses', 'theory', 'theories',
  'outcome', 'outcomes', 'trend', 'trends', 'pattern', 'patterns',
  'rate', 'rates', 'level', 'levels', 'score', 'scores', 'value', 'values',
  'number', 'numbers', 'metric', 'metrics', 'measure', 'measures', 'measurement', 'measurements',
  'symptom', 'symptoms', 'disease', 'diseases', 'condition', 'conditions', 'treatment', 'treatments',
  'drug', 'drugs', 'medication', 'medications', 'vaccine', 'vaccines',
  'policy', 'policies', 'law', 'laws', 'rule', 'rules', 'regulation', 'regulations',
  'project', 'projects', 'proposal', 'proposals', 'plan', 'plans',
  'document', 'documents', 'manuscript', 'manuscripts', 'draft', 'drafts',
  'essay', 'essays', 'book', 'books', 'letter', 'letters', 'email', 'emails', 'message', 'messages',
  'building', 'buildings', 'tree', 'trees', 'street', 'streets', 'road', 'roads',
  'car', 'cars', 'bus', 'train', 'trains', 'plane', 'planes', 'ship', 'ships', 'vehicle', 'vehicles',
  'room', 'rooms', 'door', 'doors', 'window', 'windows', 'house', 'houses', 'bridge', 'bridges',
  'light', 'lights', 'lamp', 'lamps', 'lantern', 'lanterns', 'chandelier', 'chandeliers',
  'hall', 'halls', 'hallway', 'hallways', 'corridor', 'corridors', 'lobby', 'foyer',
  'ceiling', 'ceilings', 'floor', 'floors', 'wall', 'walls', 'roof', 'roofs',
  'desk', 'desks', 'chair', 'chairs', 'table', 'tables', 'bench', 'benches',
  'boardroom', 'boardrooms', 'office', 'offices', 'auditorium', 'elevator', 'elevators',
  'stairs', 'staircase', 'staircases', 'shadow', 'shadows', 'curtain', 'curtains', 'blinds',
  'carpet', 'carpets', 'rug', 'rugs', 'mirror', 'mirrors', 'sign', 'signs', 'billboard', 'billboards',
  'air', 'atmosphere', 'silence', 'darkness', 'brightness', 'glare', 'shade', 'heat', 'cold',
  'breeze', 'fog', 'smoke', 'dust', 'paint', 'clock', 'clocks', 'alarm', 'alarms',
  'calendar', 'schedule', 'schedules', 'agenda', 'agendas', 'petition', 'petitions',
  'clause', 'clauses', 'list', 'lists', 'decision', 'decisions', 'recommendation', 'recommendations',
  'merger', 'mergers', 'announcement', 'announcements', 'reply', 'replies', 'contract', 'contracts',
  'memorandum', 'memo', 'memos', 'minutes', 'vote', 'votes', 'ballot', 'ballots',
  'bell', 'bells', 'siren', 'sirens', 'monitor', 'monitors', 'projector', 'projectors',
  'sky', 'sun', 'moon', 'star', 'stars', 'rain', 'wind', 'weather', 'temperature', 'climate',
  'sound', 'sounds', 'noise', 'noises', 'voice', 'voices',
  'problem', 'problems', 'issue', 'issues', 'error', 'errors', 'mistake', 'mistakes', 'bug', 'bugs',
  'deadline', 'deadlines', 'budget', 'budgets', 'cost', 'costs', 'price', 'prices',
  'profit', 'profits', 'revenue', 'revenues', 'sales', 'income', 'expense', 'expenses',
  'pollution', 'energy', 'technology', 'software', 'code', 'hardware', 'network', 'networks',
  'device', 'devices', 'sensor', 'sensors', 'instrument', 'instruments', 'machine', 'machines',
  'computer', 'computers', 'screen', 'screens', 'phone', 'phones', 'database', 'databases',
  'server', 'servers', 'file', 'files', 'folder', 'folders', 'program', 'programs',
  'food', 'coffee', 'tea', 'meal', 'meals', 'cake', 'dish', 'dishes', 'dinner', 'lunch', 'breakfast',
  'city', 'cities', 'town', 'mountain', 'mountains', 'river', 'rivers', 'ocean', 'oceans',
  'sea', 'lake', 'forest', 'park', 'garden', 'view', 'views', 'scenery', 'landscape',
  'time', 'day', 'week', 'month', 'year', 'hour', 'minute', 'moment',
  'work', 'task', 'tasks', 'job', 'activity', 'activities', 'process', 'processes',
  'event', 'events', 'incident', 'incidents', 'accident', 'accidents', 'change', 'changes',
  'effect', 'effects', 'impact', 'impacts', 'cause', 'causes', 'reason', 'reasons',
  'factor', 'factors', 'variable', 'variables', 'parameter', 'parameters', 'feature', 'features',
  'decline', 'growth', 'increase', 'decrease', 'drop', 'rise', 'improvement', 'improvements',
  'performance', 'accuracy', 'latency', 'efficiency', 'effectiveness', 'quality', 'reliability',
  'response', 'responses', 'feedback', 'sample', 'samples', 'specimen', 'specimens',
  'anomaly', 'anomalies', 'difference', 'differences', 'similarity', 'similarities',
  'relationship', 'relationships', 'correlation', 'correlations', 'association', 'associations',
  'it', 'this', 'that', 'these', 'those', 'there', 'everything', 'nothing', 'something', 'what', 'which',
]);

const PLURAL_HEAD_EXCEPTIONS = new Set([
  'analysis', 'hypothesis', 'basis', 'crisis', 'thesis', 'diagnosis', 'synthesis',
  'emphasis', 'axis', 'series', 'species', 'news', 'mathematics', 'physics',
  'economics', 'statistics', 'telemetry', 'ethics', 'politics', 'linguistics',
  'progress', 'success', 'process', 'access', 'address', 'status', 'focus',
  'corpus', 'consensus', 'bias', 'class', 'glass', 'mass', 'loss', 'cross',
  'bus', 'plus', 'gas', 'canvas', 'atlas', 'chaos', 'lens', 'apparatus',
]);

export const DANGLING_MODIFIER_RULES: Rule[] = [
  {
    id: 'SYN-DANG-PERF-001',
    category: 'SYN',
    tier: 'tier2-syntax',
    priority: 95,
    description:
      'Resolve dangling perfect participial modifier ("Having [V3] [Object], [Non-Agentive Subject]...") by inferring the passive temporal clause or contextual human agent.',
    match: {
      type: 'dependency_pattern',
      relation: 'dangling_perfect_participle',
    },
    replacement: 'After [Object] was/were [V3] | After [Agent] [V_past] [Object]',
    confidence: 0.985,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer', 'agency_tracking'],
    guards: ['ignore_protected_spans'],
    examples: {
      positive: [
        {
          input: 'Having analyzed the dataset, the results show that participants benefit.',
          expected: 'After the dataset was analyzed, the results show that participants benefit.',
        },
      ],
      negative: [
        {
          input: 'Having analyzed the dataset, the researchers found that participants benefit.',
          expected: 'Having analyzed the dataset, the researchers found that participants benefit.',
        },
      ],
    },
    provenance: 'Layer 2 Syntactic Agency & Dangling Modifier Resolution Engine.',
  },
  {
    id: 'SYN-DANG-PERF-NEG-001',
    category: 'SYN',
    tier: 'tier2-syntax',
    priority: 95,
    description:
      'Resolve negative dangling perfect participial modifier ("Not having / Having not [V3] [Object], [Non-Agentive Subject]...") to a causal finite clause.',
    match: {
      type: 'dependency_pattern',
      relation: 'dangling_negative_perfect_participle',
    },
    replacement: 'Because [Object] had not been [V3]',
    confidence: 0.985,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer', 'agency_tracking'],
    guards: ['ignore_protected_spans'],
    examples: {
      positive: [
        {
          input: 'Not having calibrated the sensors, the telemetry remained noisy.',
          expected: 'Because the sensors had not been calibrated, the telemetry remained noisy.',
        },
      ],
      negative: [
        {
          input: 'Not having calibrated the sensors, the engineers postponed the test.',
          expected: 'Not having calibrated the sensors, the engineers postponed the test.',
        },
      ],
    },
    provenance: 'Layer 2 Syntactic Agency & Dangling Modifier Resolution Engine.',
  },
  {
    id: 'SYN-DANG-PERF-INTR-001',
    category: 'SYN',
    tier: 'tier2-syntax',
    priority: 94,
    description:
      'Resolve intransitive dangling perfect participial modifier by inferring the implied agent from preceding context or domain semantics.',
    match: {
      type: 'dependency_pattern',
      relation: 'dangling_intransitive_perfect_participle',
    },
    replacement: 'After [Inferred Agent] [V_past] ...',
    confidence: 0.975,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer', 'discourse_agent_inference'],
    guards: ['ignore_protected_spans'],
    examples: {
      positive: [
        {
          input: 'Having arrived at the laboratory, the experiment began immediately.',
          expected: 'After the researchers arrived at the laboratory, the experiment began immediately.',
        },
      ],
      negative: [
        {
          input: 'Having arrived at the laboratory, the researchers began the experiment immediately.',
          expected: 'Having arrived at the laboratory, the researchers began the experiment immediately.',
        },
      ],
    },
    provenance: 'Layer 2 Discourse Agent Inference Engine.',
  },
  {
    id: 'SYN-DANG-PREP-GER-001',
    category: 'SYN',
    tier: 'tier2-syntax',
    priority: 95,
    description:
      'Resolve dangling prepositional gerund phrase ("After/Upon/Before/By/Without [V-ing] [Object], [Non-Agentive Subject]...") into a concordant finite clause.',
    match: {
      type: 'dependency_pattern',
      relation: 'dangling_prepositional_gerund',
    },
    replacement: 'After/When/Before [Object] was/were [V3]',
    confidence: 0.985,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer', 'agency_tracking'],
    guards: ['ignore_protected_spans'],
    examples: {
      positive: [
        {
          input: 'After analyzing the dataset, the results show a significant pattern.',
          expected: 'After the dataset was analyzed, the results show a significant pattern.',
        },
      ],
      negative: [
        {
          input: 'After analyzing the dataset, the authors reported a significant pattern.',
          expected: 'After analyzing the dataset, the authors reported a significant pattern.',
        },
      ],
    },
    provenance: 'Layer 2 Syntactic Agency & Dangling Modifier Resolution Engine.',
  },
  {
    id: 'SYN-DANG-ELLIP-001',
    category: 'SYN',
    tier: 'tier2-syntax',
    priority: 95,
    description:
      'Resolve dangling elliptical adverbial clause ("While/When/Once/Although [V-ing] [Object], [Non-Agentive Subject]...") into a concordant passive or agent-explicit clause.',
    match: {
      type: 'dependency_pattern',
      relation: 'dangling_elliptical_adverbial',
    },
    replacement: 'While/When/Once [Object] was/were [being] [V3]',
    confidence: 0.985,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer', 'agency_tracking'],
    guards: ['ignore_protected_spans'],
    examples: {
      positive: [
        {
          input: 'While analyzing the samples, the instrument malfunctioned.',
          expected: 'While the samples were being analyzed, the instrument malfunctioned.',
        },
      ],
      negative: [
        {
          input: 'While analyzing the samples, the technician noticed a leak.',
          expected: 'While analyzing the samples, the technician noticed a leak.',
        },
      ],
    },
    provenance: 'Layer 2 Syntactic Agency & Dangling Modifier Resolution Engine.',
  },
  {
    id: 'SYN-DANG-PRES-PART-001',
    category: 'SYN',
    tier: 'tier2-syntax',
    priority: 94,
    description:
      'Resolve dangling bare present participial modifier ("[V-ing] [Object/PP], [Non-Agentive Subject]...") into a concordant finite temporal clause.',
    match: {
      type: 'dependency_pattern',
      relation: 'dangling_present_participle',
    },
    replacement: 'When [Object] was/were [V3] | As [Inferred Agent] [V_past] ...',
    confidence: 0.98,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer', 'agency_tracking'],
    guards: ['ignore_protected_spans'],
    examples: {
      positive: [
        {
          input: 'Examining the dataset, the results revealed a clear correlation.',
          expected: 'When the dataset was examined, the results revealed a clear correlation.',
        },
      ],
      negative: [
        {
          input: 'Examining the dataset, the analyst discovered a clear correlation.',
          expected: 'Examining the dataset, the analyst discovered a clear correlation.',
        },
      ],
    },
    provenance: 'Layer 2 Syntactic Agency & Dangling Modifier Resolution Engine.',
  },
  {
    id: 'SYN-DANG-INF-001',
    category: 'SYN',
    tier: 'tier2-syntax',
    priority: 93,
    description:
      'Resolve dangling purpose infinitive ("To [V] [Object], [Non-Agentive Subject] [Active Verb]...") by aligning the purpose clause passively.',
    match: {
      type: 'dependency_pattern',
      relation: 'dangling_purpose_infinitive',
    },
    replacement: 'For [Object] to be [V3]',
    confidence: 0.975,
    autoApply: true,
    enabled: true,
    requires: ['clause_analyzer', 'agency_tracking'],
    guards: ['ignore_protected_spans'],
    examples: {
      positive: [
        {
          input: 'To understand the trend, the chart shows quarterly growth.',
          expected: 'For the trend to be understood, the chart shows quarterly growth.',
        },
      ],
      negative: [
        {
          input: 'To understand the trend, researchers must inspect the quarterly chart.',
          expected: 'To understand the trend, researchers must inspect the quarterly chart.',
        },
      ],
    },
    provenance: 'Layer 2 Syntactic Agency & Dangling Modifier Resolution Engine.',
  },
];

function isPluralNounPhrase(np: string): boolean {
  const cleaned = np.trim();
  const lower = cleaned.toLowerCase();
  if (/^(they|them|we|us|you|these|those|both|many|several|few|all)\b/i.test(lower)) {
    return true;
  }
  if (/^(it|this|that|he|him|she|her|i|me|a|an|each|every|one)\b/i.test(lower)) {
    return false;
  }
  if (/^(?:the|these|those|our|their|your|my|his|her|all|some|many|several|two|three|four|five|\d+)?\s*data\b/i.test(lower)) {
    return true;
  }

  // Extract head noun before prepositional modifier ("all the submitted articles from 2024" -> "articles")
  const beforePP = lower.split(/\b(?:of|in|on|for|with|from|at|by|about|during|between|among|that|which|who)\b/)[0].trim();
  const tokens = beforePP.split(/\s+/);
  const head = tokens[tokens.length - 1]?.replace(/[^a-z-]/g, '') || '';
  if (!head) return false;
  if (PLURAL_HEAD_EXCEPTIONS.has(head)) return false;
  if (head === 'people' || head === 'children' || head === 'men' || head === 'women' || head === 'criteria' || head === 'phenomena' || head === 'analyses' || head === 'hypotheses') {
    return true;
  }
  if (head.endsWith('s') && !head.endsWith('ss') && !head.endsWith('us') && !head.endsWith('is') && head.length > 2) {
    return true;
  }
  return false;
}

function toSubjectObjectPronoun(np: string): string {
  const lower = np.trim().toLowerCase();
  if (lower === 'them') return 'they';
  if (lower === 'him') return 'he';
  if (lower === 'her') return 'she';
  if (lower === 'us') return 'we';
  if (lower === 'me') return 'I';
  return np.trim();
}

function lowercaseInitialIfNotProper(np: string): string {
  const trimmed = np.trim();
  if (!trimmed) return trimmed;
  // Preserve "I" or acronyms or proper names like "Dr. Smith"
  if (/^(I\b|[A-Z]{2,}|Dr\.|Mr\.|Ms\.|Mrs\.|Prof\.)/.test(trimmed)) return trimmed;
  // Lowercase leading determiners or common nouns
  if (/^(The|A|An|This|That|These|Those|All|Some|Many|Several|Each|Every|Our|Their|His|Her|Its|My|Your|No|Both|Few)\b/.test(trimmed)) {
    return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
  }
  return trimmed;
}

// Determiners and modifiers that signal the next word is a noun rather than a finite verb
const DETERMINERS_AND_MODS = new Set([
  'the', 'a', 'an', 'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her',
  'its', 'our', 'their', 'such', 'all', 'some', 'many', 'several', 'few', 'both',
  'each', 'every', 'no', 'any', 'empirical', 'preliminary', 'initial', 'final',
  'new', 'old', 'main', 'primary', 'secondary', 'recent', 'previous', 'current',
  'collected', 'submitted', 'observed', 'measured', 'recorded', 'experimental',
  'clinical', 'statistical', 'quarterly', 'annual', 'overall', 'average', 'total',
]);

// Words that frequently serve as nouns inside a subject NP (don't treat as verb boundary when preceded by determiner/adj)
const NOUN_HOMOGRAPHS = new Set([
  'result', 'results', 'study', 'studies', 'report', 'reports', 'test', 'tests',
  'plan', 'plans', 'process', 'processes', 'measure', 'measures', 'work', 'works',
  'change', 'changes', 'cause', 'causes', 'drop', 'drops', 'increase', 'increases',
  'decrease', 'decreases', 'model', 'models', 'design', 'designs', 'review', 'reviews',
  'control', 'controls', 'record', 'records', 'sample', 'samples', 'check', 'checks',
  'experiment', 'experiments', 'research', 'output', 'outputs', 'survey', 'surveys',
  'project', 'projects', 'support', 'supports', 'present', 'presents', 'display', 'displays',
  'offer', 'offers', 'issue', 'issues', 'need', 'needs', 'use', 'uses', 'show', 'shows',
]);

/**
 * Extracts matrix subject NP & head noun, and detects whether the subject is non-agentive.
 */
function analyzeMatrixSubject(afterComma: string): {
  subjectNP: string;
  headNoun: string;
  isAgentive: boolean;
  isNonAgentive: boolean;
  isPastMatrix: boolean;
  isPassiveMatrix: boolean;
} | null {
  const cleaned = afterComma.replace(/^[\s"'“‘«„(\[]+/, '').trim();
  if (!cleaned) return null;

  // Check leading pronoun
  const pronMatch = cleaned.match(
    /^(I|we|you|he|she|they|it|this|that|these|those|there|someone|somebody|anyone|anybody|everyone|everybody|no\s+one|nobody|everything|nothing|something|one)\b(?:\s+(?:who|which|that)\b)?/i
  );
  if (pronMatch) {
    const pron = pronMatch[1].toLowerCase();
    const restAfterPron = cleaned.slice(pronMatch[0].length).trim();
    const isAgentive = /^(i|we|you|he|she|they|someone|somebody|anyone|anybody|everyone|everybody|no\s+one|nobody|one)$/.test(pron);
    const isNonAgentive = /^(it|this|that|these|those|there|everything|nothing|something)$/.test(pron);

    // Check if 'this/that/these/those' is actually a determiner before a noun (e.g. "these results show")
    if (/^(this|that|these|those)$/.test(pron) && restAfterPron && !/^(is|are|was|were|has|have|had|will|would|can|could|may|might|shall|should|must|do|does|did|shows?|indicated?|reveals?|demonstrated?|suggests?|appears?|seems?|remains?|means?|proves?|requires?|needs?|becomes?|became)\b/i.test(restAfterPron)) {
      // Fall through to full NP parser
    } else {
      const isPassiveMatrix = /^(?:is|are|was|were|has\s+been|have\s+been|had\s+been|will\s+be|would\s+be)\s+(?:not\s+)?(?:being\s+)?[a-z]+(?:ed|en|t)\b/i.test(restAfterPron);
      const isPastMatrix = /^(?:was|were|had|did|[a-z]+ed|showed|revealed|indicated|demonstrated|found|became|appeared|seemed|dropped|fell|rose|grew|began|started|improved|remained|varied|malfunctioned|stalled|vanished|went|came|took|made|gave|left|kept)\b/i.test(restAfterPron);
      return {
        subjectNP: pronMatch[1],
        headNoun: pron,
        isAgentive,
        isNonAgentive,
        isPastMatrix,
        isPassiveMatrix,
      };
    }
  }

  // Scan candidate finite verbs to find the true clause verb boundary (skipping nouns after determiners)
  const verbCandidateRegex =
    /\s+\b(is|are|was|were|has|have|had|will|would|can|could|may|might|shall|should|must|do|does|did|show|shows|showed|indicate|indicates|indicated|reveal|reveals|revealed|demonstrate|demonstrates|demonstrated|suggest|suggests|suggested|prove|proves|proved|confirm|confirms|confirmed|appear|appears|appeared|seem|seems|seemed|look|looks|looked|become|becomes|became|remain|remains|remained|improve|improves|improved|drop|drops|dropped|increase|increases|increased|decrease|decreases|decreased|vary|varies|varied|begin|begins|began|start|starts|started|end|ends|ended|continue|continues|continued|fail|fails|failed|malfunction|malfunctions|malfunctioned|require|requires|required|need|needs|needed|stay|stays|stayed|stall|stalls|stalled|vanish|vanishes|vanished|emerge|emerges|emerged|occur|occurs|occurred|exist|exists|existed|contain|contains|contained|include|includes|included|provide|provides|provided|offer|offers|offered|reflect|reflects|reflected|highlight|highlights|highlighted|support|supports|supported|contradict|contradicts|contradicted|represent|represents|represented|present|presents|presented|display|displays|displayed|exhibit|exhibits|exhibited|produce|produces|produced|yield|yields|yielded|cause|causes|caused|lead|leads|led|result|results|resulted|explain|explains|explained|clarify|clarifies|clarified|found|discovered|noticed|observed|reported|concluded|decided|saw|heard|felt|knew|thought|wrote|read|built|created|designed|implemented|rejected|accepted|published|checked|submitted|collected|gathered|examined|analyzed|analysed|reviewed|evaluated|tested|measured|verified|prepared|completed|arrived|visited|ran|went|came|took|made|gave|left|kept|[a-z]{4,}ed)\b/gi;

  let verbIndex: number | undefined;
  let vm: RegExpExecArray | null;
  while ((vm = verbCandidateRegex.exec(cleaned)) !== null) {
    const candVerb = vm[1].toLowerCase();
    const prefix = cleaned.slice(0, vm.index).trim();
    const prefixTokens = prefix.split(/\s+/);
    const prevWord = prefixTokens[prefixTokens.length - 1]?.toLowerCase() || '';

    // Skip if preceded by a determiner/adjective and candidate could be a noun (e.g. "the results", "the submitted articles", "500 samples")
    if (DETERMINERS_AND_MODS.has(prevWord) && (NOUN_HOMOGRAPHS.has(candVerb) || candVerb.endsWith('ed'))) {
      continue;
    }
    // Also skip "-ed" prenominal adjectives before a noun like "the submitted articles"
    if (candVerb.endsWith('ed')) {
      const afterCand = cleaned.slice(vm.index + vm[0].length).trim();
      const nextWord = afterCand.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z-]/g, '') || '';
      if (NOUN_HOMOGRAPHS.has(nextWord) || AGENTIVE_NOUNS.has(nextWord) || INANIMATE_NOUNS.has(nextWord)) {
        continue;
      }
    }

    verbIndex = vm.index;
    break;
  }

  const npSlice = verbIndex !== undefined
    ? cleaned.slice(0, verbIndex).trim()
    : cleaned.split(/[,;.]/)[0].trim();

  // Strip trailing relative clause, PP, or parenthetical from npSlice if any
  const beforeModifierClause = npSlice.split(/\s*(?:,|\b(?:of|in|on|for|with|from|at|by|about|regarding|concerning|above|below|near|beside|behind|under|over|around|inside|outside|across|through|toward|towards|along|onto|into|that|which|who)\b)\s*/i)[0].trim();
  const words = beforeModifierClause.split(/\s+/);
  if (words.length === 0 || words.length > 8) return null;

  // Check if proper title like "Dr. Smith" or "Prof. Lee"
  if (/^(Dr\.|Mr\.|Ms\.|Mrs\.|Prof\.)/i.test(beforeModifierClause)) {
    return {
      subjectNP: npSlice,
      headNoun: words[words.length - 1].toLowerCase(),
      isAgentive: true,
      isNonAgentive: false,
      isPastMatrix: false,
      isPassiveMatrix: false,
    };
  }

  const headNoun = words[words.length - 1].toLowerCase().replace(/[^a-z-]/g, '');
  if (!headNoun) return null;

  const isAgentive = AGENTIVE_NOUNS.has(headNoun);
  const isInanimateBySuffix =
    !isAgentive &&
    headNoun.length >= 5 &&
    /(?:tion|sion|ment|ness|ity|ance|ence|ism|ology|graphy|metry|telemetry|ics|ware|base)$/.test(headNoun);
  const isNonAgentive = !isAgentive && (INANIMATE_NOUNS.has(headNoun) || isInanimateBySuffix);

  const afterSubject = verbIndex !== undefined
    ? cleaned.slice(verbIndex).trim()
    : '';

  const isPassiveMatrix = /^(?:is|are|was|were|has\s+been|have\s+been|had\s+been|will\s+be|would\s+be)\s+(?:not\s+)?(?:being\s+)?[a-z]+(?:ed|en|t)\b/i.test(afterSubject);
  const isPastMatrix = /^(?:was|were|had|did|[a-z]+ed|showed|revealed|indicated|demonstrated|found|became|appeared|seemed|dropped|fell|rose|grew|began|started|improved|remained|varied|malfunctioned|stalled|vanished|went|came|took|made|gave|left|kept|led|wrote|saw|heard|felt)\b/i.test(afterSubject);

  return {
    subjectNP: npSlice,
    headNoun,
    isAgentive,
    isNonAgentive,
    isPastMatrix,
    isPassiveMatrix,
  };
}

/**
 * Infers the most plausible active human/institutional agent from preceding discourse
 * or semantic domain cues when an intransitive modifier has no direct object to passivize.
 */
function inferAgentFromContext(
  priorActiveAgent: string | null,
  introText: string,
  matrixText: string
): string {
  if (priorActiveAgent) {
    return lowercaseInitialIfNotProper(priorActiveAgent);
  }
  const combined = `${introText} ${matrixText}`.toLowerCase();
  if (/\b(dataset|data|experiment|study|samples|lab|laboratory|hypothesis|analysis|trial|results|findings|survey|specimen|microscope|telescope)\b/.test(combined)) {
    return 'the researchers';
  }
  if (/\b(manuscript|paper|article|draft|chapter|essay|book|report|citations|bibliography)\b/.test(combined)) {
    return 'the authors';
  }
  if (/\b(code|algorithm|model|software|server|database|system|bug|pipeline|api|patch|latency|sensors|telemetry)\b/.test(combined)) {
    return 'the engineers';
  }
  if (/\b(patient|hospital|clinic|symptoms|medication|treatment|diagnosis|surgery|ward|doctor)\b/.test(combined)) {
    return /\b(diagnosed|prescribed|operated|examined|treated)\b/.test(combined) ? 'the clinicians' : 'the patient';
  }
  if (/\b(budget|revenue|profits|market|sales|quarterly|company|firm|deadline|project|proposal)\b/.test(combined)) {
    return 'the team';
  }
  return 'we';
}

/**
 * Extracts an active animate subject from a sentence to propagate as priorActiveAgent to following sentences.
 */
function extractActiveAgentFromSentence(sentenceText: string): string | null {
  const cleaned = sentenceText.replace(/^[\s"'“‘«„(\[]+/, '').trim();
  const commaIdx = cleaned.indexOf(',');
  // Skip introductory modifier if present
  const mainPart =
    commaIdx !== -1 && /^(?:Having|After|Upon|Before|While|When|Once|Although|Though|By|Without|To|In\s+order\s+to|\w+ing)\b/i.test(cleaned)
      ? cleaned.slice(commaIdx + 1).trim()
      : cleaned;

  const subjInfo = analyzeMatrixSubject(mainPart);
  if (subjInfo && subjInfo.isAgentive && !subjInfo.isPassiveMatrix) {
    return subjInfo.subjectNP;
  }
  return null;
}

/**
 * Splits a transitive verb phrase tail into direct object NP and optional trailing adverbial/PP.
 */
function splitObjectAndTrailingModifier(rest: string): {
  objectNP: string;
  trailing: string;
  isIntransitive: boolean;
} {
  const trimmed = rest.trim();
  if (!trimmed) {
    return { objectNP: '', trailing: '', isIntransitive: true };
  }

  // If the phrase starts directly with a preposition or purely temporal/spatial adverbial, it's intransitive
  if (/^(?:in|on|at|to|from|with|for|by|into|through|across|over|under|after|before|during|since|until|about|around|between|among|down|up|out|away|back|home|early|late|hard|well|fast|slowly|quickly|carefully|quietly|all\s+(?:day|night|week|morning|evening))\b/i.test(trimmed)) {
    return { objectNP: '', trailing: trimmed, isIntransitive: true };
  }

  // Split trailing standalone manner/temporal adverbs so object NP head noun and plural agreement stay clean
  const advMatch = trimmed.match(
    /^(.+?)\s+(carefully|thoroughly|completely|closely|directly|briefly|clearly|repeatedly|separately|simultaneously|independently|systematically|manually|automatically|randomly|accurately|yesterday|earlier|previously|recently|carelessly|quickly|slowly)$/i
  );
  if (advMatch) {
    return {
      objectNP: advMatch[1].trim(),
      trailing: ` ${advMatch[2]}`,
      isIntransitive: false,
    };
  }

  return { objectNP: trimmed, trailing: '', isIntransitive: false };
}

/**
 * Finds the comma separating an introductory modifier from the matrix clause.
 */
function findModifierCommaIndex(sentenceText: string): number {
  let idx = -1;
  while ((idx = sentenceText.indexOf(',', idx + 1)) !== -1) {
    const before = sentenceText.slice(0, idx).trim();
    const after = sentenceText.slice(idx + 1).trim();
    if (!after) continue;
    // Skip serial list commas inside modifier (e.g. "Having collected, cleaned, and analyzed the dataset, the results...")
    if (/^(?:and|or)\b/i.test(after)) continue;
    // Check if left side ends with a single participle verb in a list like "Having collected"
    if (/^(?:Having|After|Before|Upon|While|When|By|Without)?\s*\w+(?:ed|ing)$/i.test(before) && /^(?:\w+(?:ed|ing)|and|or)\b/i.test(after)) {
      continue;
    }
    const subj = analyzeMatrixSubject(after);
    if (subj) {
      return idx;
    }
  }
  return -1;
}

/**
 * Analyzes text across all sentences for dangling modifiers and generates deterministic
 * Layer 2 CorrectionCandidates with discourse/context inference.
 */
export function analyzeDanglingModifiers(fullText: string): CorrectionCandidate[] {
  const candidates: CorrectionCandidate[] = [];
  const sentences = segmentSentences(fullText);

  let priorActiveAgent: string | null = null;

  for (const sentence of sentences) {
    const rawSentence = sentence.text;
    // Preserve any leading quotes/whitespace
    const leadingMatch = rawSentence.match(/^([\s"'“‘«„(\[]*)/);
    const leadingPrefix = leadingMatch ? leadingMatch[1] : '';
    const contentStartOffset = sentence.start + leadingPrefix.length;
    const content = rawSentence.slice(leadingPrefix.length);

    const commaIndex = findModifierCommaIndex(content);
    if (commaIndex === -1) {
      const agent = extractActiveAgentFromSentence(rawSentence);
      if (agent) priorActiveAgent = agent;
      continue;
    }

    const introRaw = content.slice(0, commaIndex);
    const introTrimmed = introRaw.trim();
    const afterComma = content.slice(commaIndex + 1);

    const matrixInfo = analyzeMatrixSubject(afterComma);
    if (!matrixInfo || matrixInfo.isAgentive || !matrixInfo.isNonAgentive) {
      const agent = extractActiveAgentFromSentence(rawSentence);
      if (agent) priorActiveAgent = agent;
      continue;
    }

    const introStart = contentStartOffset;
    const introEnd = contentStartOffset + introRaw.length;
    const preserveCap = /^[A-Z]/.test(introTrimmed);
    const applyCap = (s: string) => (preserveCap ? s.charAt(0).toUpperCase() + s.slice(1) : s);

    // ------------------------------------------------------------------
    // 1. NEGATIVE PERFECT PARTICIPLE: "Not having [V3] [Obj]" / "Having not [V3] [Obj]"
    // ------------------------------------------------------------------
    const negPerfMatch = introTrimmed.match(
      /^(?:Not\s+having|Having\s+not)\s+(?:(carefully|thoroughly|properly|adequately|fully|previously|yet|already)\s+)?([a-z]+)(?:\s+(.+))?$/i
    );
    if (negPerfMatch) {
      const adv = negPerfMatch[1] ? `${negPerfMatch[1].toLowerCase()} ` : '';
      const verbToken = negPerfMatch[2];
      const rest = negPerfMatch[3] || '';
      if (verbToken.toLowerCase() !== 'been' && isPastParticipleToken(verbToken)) {
        const { objectNP, trailing, isIntransitive } = splitObjectAndTrailingModifier(rest);
        if (!isIntransitive && !INTRANSITIVE_VERBS.has(verbToken.toLowerCase()) && objectNP) {
          const objClean = lowercaseInitialIfNotProper(toSubjectObjectPronoun(objectNP));
          const replacement = applyCap(`Because ${objClean} had not been ${adv}${verbToken.toLowerCase()}${trailing}`);
          candidates.push({
            ruleId: 'SYN-DANG-PERF-NEG-001',
            start: introStart,
            end: introEnd,
            original: introRaw,
            replacement,
            confidence: 0.985,
            category: 'SYN',
            rationale: `Dangling negative perfect participle '${introTrimmed}' lacks an agentive matrix subject ('${matrixInfo.subjectNP}'). Resolved via passive causal clause over inferred patient '${objClean}'.`,
            provenance: 'Layer 2 Syntactic Agency & Dangling Modifier Engine',
          });
          continue;
        }
      }
    }

    // ------------------------------------------------------------------
    // 2. PERFECT PARTICIPLE: "Having [adv?] [V3] [Obj/PP]"
    //    (Negative control: skip "Having been [V3]" which is already passive!)
    // ------------------------------------------------------------------
    const perfMatch = introTrimmed.match(
      /^Having\s+(?:(carefully|thoroughly|properly|adequately|fully|previously|already|just|successfully|completely|recently|systematically|exhaustively)\s+)?([a-z]+)(?:\s+(.+))?$/i
    );
    if (perfMatch) {
      const adv = perfMatch[1] ? `${perfMatch[1].toLowerCase()} ` : '';
      const verbToken = perfMatch[2];
      const rest = perfMatch[3] || '';

      if (verbToken.toLowerCase() !== 'been' && isPastParticipleToken(verbToken)) {
        const { objectNP, trailing, isIntransitive } = splitObjectAndTrailingModifier(rest);
        const verbLower = verbToken.toLowerCase();

        if (!isIntransitive && !INTRANSITIVE_VERBS.has(verbLower) && objectNP) {
          const objClean = lowercaseInitialIfNotProper(toSubjectObjectPronoun(objectNP));
          const isPluralObj = isPluralNounPhrase(objClean);
          const bePast = isPluralObj ? 'were' : 'was';
          const replacement = applyCap(`After ${objClean} ${bePast} ${adv}${verbLower}${trailing}`);

          candidates.push({
            ruleId: 'SYN-DANG-PERF-001',
            start: introStart,
            end: introEnd,
            original: introRaw,
            replacement,
            confidence: 0.985,
            category: 'SYN',
            rationale: `Dangling perfect participle '${introTrimmed}' implies a human agent, whereas matrix subject '${matrixInfo.subjectNP}' is non-agentive. Resolved by inferring passive temporal clause over '${objClean}'.`,
            provenance: 'Layer 2 Syntactic Agency & Dangling Modifier Engine',
          });
          continue;
        } else {
          // Intransitive perfect participle (e.g. "Having arrived at the station, the train...")
          const agent = inferAgentFromContext(priorActiveAgent, introTrimmed, afterComma);
          const pastVerb = v3ToPastTense(verbLower);
          const tail = rest ? ` ${rest.trim()}` : '';
          const replacement = applyCap(`After ${agent} ${adv}${pastVerb}${tail}`);

          candidates.push({
            ruleId: 'SYN-DANG-PERF-INTR-001',
            start: introStart,
            end: introEnd,
            original: introRaw,
            replacement,
            confidence: 0.975,
            category: 'SYN',
            rationale: `Intransitive dangling participle '${introTrimmed}' resolved by inferring context/domain agent '${agent}' for non-agentive subject '${matrixInfo.subjectNP}'.`,
            provenance: 'Layer 2 Discourse Agent Inference Engine',
          });
          continue;
        }
      }
    }

    // ------------------------------------------------------------------
    // 3. PREPOSITIONAL GERUND: "(After|Upon|On|Before|By|Without|In) [V-ing] [Obj/PP]"
    // ------------------------------------------------------------------
    const prepGerMatch = introTrimmed.match(
      /^(After|Upon|On|Before|By|Without|In)\s+(?:(carefully|thoroughly|properly|completely|systematically|first)\s+)?([a-z]+ing)(?:\s+(.+))?$/i
    );
    if (prepGerMatch) {
      const prep = prepGerMatch[1].toLowerCase();
      const adv = prepGerMatch[2] ? `${prepGerMatch[2].toLowerCase()} ` : '';
      const gerund = prepGerMatch[3];
      const rest = prepGerMatch[4] || '';
      const baseVerb = gerundToBase(gerund);
      const v3 = baseToPastParticiple(baseVerb);
      const vPast = baseToPastTense(baseVerb);

      if (!IMPERSONAL_PARTICIPLES.has(gerund.toLowerCase())) {
        const { objectNP, trailing, isIntransitive } = splitObjectAndTrailingModifier(rest);

        if (!isIntransitive && !INTRANSITIVE_VERBS.has(gerund.toLowerCase()) && objectNP) {
          const objClean = lowercaseInitialIfNotProper(toSubjectObjectPronoun(objectNP));
          const isPluralObj = isPluralNounPhrase(objClean);
          const bePast = isPluralObj ? 'were' : 'was';
          const bePres = isPluralObj ? 'are' : 'is';

          let finiteClause = '';
          if (prep === 'after' || prep === 'before') {
            finiteClause = `${prep} ${objClean} ${bePast} ${adv}${v3}${trailing}`;
          } else if (prep === 'upon' || prep === 'on' || prep === 'by' || prep === 'in') {
            finiteClause = `when ${objClean} ${bePast} ${adv}${v3}${trailing}`;
          } else if (prep === 'without') {
            const beTense = matrixInfo.isPastMatrix ? bePast : bePres;
            finiteClause = `if ${objClean} ${beTense} not ${adv}${v3}${trailing}`;
          }

          if (finiteClause) {
            candidates.push({
              ruleId: 'SYN-DANG-PREP-GER-001',
              start: introStart,
              end: introEnd,
              original: introRaw,
              replacement: applyCap(finiteClause),
              confidence: 0.985,
              category: 'SYN',
              rationale: `Dangling prepositional gerund '${introTrimmed}' lacks an agentive matrix subject ('${matrixInfo.subjectNP}'). Harmonized into concordant finite clause.`,
              provenance: 'Layer 2 Syntactic Agency & Dangling Modifier Engine',
            });
            continue;
          }
        } else {
          const agent = inferAgentFromContext(priorActiveAgent, introTrimmed, afterComma);
          const tail = rest ? ` ${rest.trim()}` : '';
          const subord = prep === 'upon' || prep === 'on' || prep === 'by' ? 'when' : prep === 'without' ? 'if' : prep;
          const clause =
            prep === 'without'
              ? `if ${agent} did not ${adv}${baseVerb}${tail}`
              : `${subord} ${agent} ${adv}${vPast}${tail}`;

          candidates.push({
            ruleId: 'SYN-DANG-PREP-GER-001',
            start: introStart,
            end: introEnd,
            original: introRaw,
            replacement: applyCap(clause),
            confidence: 0.975,
            category: 'SYN',
            rationale: `Intransitive dangling gerund '${introTrimmed}' resolved by inferring agent '${agent}'.`,
            provenance: 'Layer 2 Discourse Agent Inference Engine',
          });
          continue;
        }
      }
    }

    // ------------------------------------------------------------------
    // 4. ELLIPTICAL ADVERBIAL CLAUSE: "(While|When|Once|Although|Though|If) [V-ing] [Obj/PP]"
    // ------------------------------------------------------------------
    const ellipMatch = introTrimmed.match(
      /^(While|When|Once|Although|Though|If)\s+(?:(carefully|thoroughly|actively|still|currently)\s+)?([a-z]+ing)(?:\s+(.+))?$/i
    );
    if (ellipMatch) {
      const subord = ellipMatch[1].toLowerCase();
      const adv = ellipMatch[2] ? `${ellipMatch[2].toLowerCase()} ` : '';
      const gerund = ellipMatch[3];
      const rest = ellipMatch[4] || '';
      const v3 = gerundToPastParticiple(gerund);
      const vPast = gerundToPastTense(gerund);

      const { objectNP, trailing, isIntransitive } = splitObjectAndTrailingModifier(rest);
      if (!isIntransitive && !INTRANSITIVE_VERBS.has(gerund.toLowerCase()) && objectNP) {
        const objClean = lowercaseInitialIfNotProper(toSubjectObjectPronoun(objectNP));
        const isPluralObj = isPluralNounPhrase(objClean);
        const bePast = isPluralObj ? 'were' : 'was';
        const passiveClause =
          subord === 'while'
            ? `while ${objClean} ${bePast} ${adv}being ${v3}${trailing}`
            : `${subord} ${objClean} ${bePast} ${adv}${v3}${trailing}`;

        candidates.push({
          ruleId: 'SYN-DANG-ELLIP-001',
          start: introStart,
          end: introEnd,
          original: introRaw,
          replacement: applyCap(passiveClause),
          confidence: 0.985,
          category: 'SYN',
          rationale: `Dangling elliptical adverbial clause '${introTrimmed}' harmonized to explicit passive subject '${objClean}'.`,
          provenance: 'Layer 2 Syntactic Agency & Dangling Modifier Engine',
        });
        continue;
      } else {
        const agent = inferAgentFromContext(priorActiveAgent, introTrimmed, afterComma);
        const isPluralAgent = isPluralNounPhrase(agent);
        const bePast = isPluralAgent ? 'were' : 'was';
        const tail = rest ? ` ${rest.trim()}` : '';
        const activeClause =
          subord === 'while'
            ? `while ${agent} ${bePast} ${adv}${gerund.toLowerCase()}${tail}`
            : `${subord} ${agent} ${adv}${vPast}${tail}`;

        candidates.push({
          ruleId: 'SYN-DANG-ELLIP-001',
          start: introStart,
          end: introEnd,
          original: introRaw,
          replacement: applyCap(activeClause),
          confidence: 0.975,
          category: 'SYN',
          rationale: `Elliptical dangling clause '${introTrimmed}' resolved by inferring agent '${agent}'.`,
          provenance: 'Layer 2 Discourse Agent Inference Engine',
        });
        continue;
      }
    }

    // ------------------------------------------------------------------
    // 5. BARE PRESENT PARTICIPLE: "[V-ing] [Obj/PP], [Non-Agentive Subject]..."
    // ------------------------------------------------------------------
    const presPartMatch = introTrimmed.match(
      /^([A-Za-z]+ing)(?:\s+(carefully|thoroughly|closely|briefly))?(?:\s+(.+))?$/i
    );
    if (presPartMatch) {
      const gerund = presPartMatch[1];
      const gerundLower = gerund.toLowerCase();
      const adv = presPartMatch[2] ? `${presPartMatch[2].toLowerCase()} ` : '';
      const rest = presPartMatch[3] || '';

      // Skip impersonal prepositional participles ("Assuming", "Considering", "Regarding", etc.)
      if (!IMPERSONAL_PARTICIPLES.has(gerundLower) && !/^(being|having|nothing|something|everything|anything|during|morning|evening|string|thing|ring|king|wing|spring|bring)$/i.test(gerundLower)) {
        const { objectNP, trailing, isIntransitive } = splitObjectAndTrailingModifier(rest);
        const v3 = gerundToPastParticiple(gerundLower);
        const vPast = gerundToPastTense(gerundLower);

        if (!isIntransitive && !INTRANSITIVE_VERBS.has(gerundLower) && objectNP) {
          const objClean = lowercaseInitialIfNotProper(toSubjectObjectPronoun(objectNP));
          const isPluralObj = isPluralNounPhrase(objClean);
          const bePast = isPluralObj ? 'were' : 'was';
          const replacement = applyCap(`when ${objClean} ${bePast} ${adv}${v3}${trailing}`);

          candidates.push({
            ruleId: 'SYN-DANG-PRES-PART-001',
            start: introStart,
            end: introEnd,
            original: introRaw,
            replacement,
            confidence: 0.98,
            category: 'SYN',
            rationale: `Dangling present participle '${introTrimmed}' lacks an agentive matrix subject ('${matrixInfo.subjectNP}'). Resolved via temporal passive clause.`,
            provenance: 'Layer 2 Syntactic Agency & Dangling Modifier Engine',
          });
          continue;
        } else if (rest) {
          const agent = inferAgentFromContext(priorActiveAgent, introTrimmed, afterComma);
          const replacement = applyCap(`as ${agent} ${adv}${vPast} ${rest.trim()}`);

          candidates.push({
            ruleId: 'SYN-DANG-PRES-PART-001',
            start: introStart,
            end: introEnd,
            original: introRaw,
            replacement,
            confidence: 0.975,
            category: 'SYN',
            rationale: `Dangling intransitive participle '${introTrimmed}' resolved by inferring agent '${agent}'.`,
            provenance: 'Layer 2 Discourse Agent Inference Engine',
          });
          continue;
        }
      }
    }

    // ------------------------------------------------------------------
    // 6. PURPOSE INFINITIVE WITH ACTIVE NON-AGENTIVE MATRIX VERB:
    //    "(To|In order to) [V_base] [Object], [Non-Agentive Subject] [Active Epistemic Verb]..."
    // ------------------------------------------------------------------
    const infMatch = introTrimmed.match(
      /^(?:In\s+order\s+to|To)\s+([a-z]+)\s+(.+)$/i
    );
    if (infMatch && !matrixInfo.isPassiveMatrix) {
      const baseVerb = infMatch[1].toLowerCase();
      const rest = infMatch[2];
      const { objectNP, trailing, isIntransitive } = splitObjectAndTrailingModifier(rest);
      if (!isIntransitive && !INTRANSITIVE_VERBS.has(baseVerb) && objectNP) {
        // Only trigger when matrix clause uses an active epistemic/presentation verb (shows, indicates, demonstrates, reveals)
        if (/^\s*[^,]*\b(?:show|shows|showed|indicate|indicates|indicated|reveal|reveals|revealed|demonstrate|demonstrates|demonstrated|illustrate|illustrates|illustrated|summarize|summarizes|summarized|display|displays|displayed)\b/i.test(afterComma)) {
          const objClean = lowercaseInitialIfNotProper(toSubjectObjectPronoun(objectNP));
          const v3 = baseToPastParticiple(baseVerb);
          const prefix = /^In\s+order\s+to/i.test(introTrimmed) ? 'In order for' : 'For';
          const replacement = applyCap(`${prefix} ${objClean} to be ${v3}${trailing}`);

          candidates.push({
            ruleId: 'SYN-DANG-INF-001',
            start: introStart,
            end: introEnd,
            original: introRaw,
            replacement,
            confidence: 0.975,
            category: 'SYN',
            rationale: `Dangling purpose infinitive '${introTrimmed}' precedes non-agentive active subject '${matrixInfo.subjectNP}'. Aligned passively as '${replacement}'.`,
            provenance: 'Layer 2 Syntactic Agency & Dangling Modifier Engine',
          });
          continue;
        }
      }
    }

    // Track active animate subject for subsequent sentences in the paragraph
    const agent = extractActiveAgentFromSentence(rawSentence);
    if (agent) priorActiveAgent = agent;
  }

  return candidates;
}
