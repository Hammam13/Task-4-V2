import React, { useEffect, useMemo, useRef, useState } from 'react';

const KEY = 'acl-service-hours-v1';

// Fictional volunteering programs for the self-contained UI/UX exercise.
// Staff names, partners and descriptions are examples, not real university records.
const PROGRAMS = {
  ENV110: {
    name: 'Campus Green Team',
    partner: 'University Sustainability Office',
    description: 'Weekly tree planting, recycling audits and awareness stands that help the campus reduce its waste and energy use.',
    history: [
      {year: '2025/26', supervisors: ['Dr. Heba Lotfy'], coordinators: ['Malak Ashraf', 'Ziad Hamdy']},
      {year: '2024/25', supervisors: ['Dr. Sherif Galal'], coordinators: ['Jana Wael', 'Seif Mostafa']},
    ],
  },
  EDU210: {
    name: 'Peer Tutoring Circle',
    partner: 'Student Learning Center',
    description: 'Senior students run small study groups for first-year courses, preparing worked examples and answering questions.',
    history: [
      {year: '2025/26', supervisors: ['Dr. Nermine Aly'], coordinators: ['Hana Kamal', 'Marwan Essam']},
      {year: '2024/25', supervisors: ['Dr. Waleed Fouad'], coordinators: ['Laila Samy', 'Kareem Ayman']},
    ],
  },
  HLT150: {
    name: 'Blood Drive Crew',
    partner: 'Regional Blood Bank',
    description: 'Volunteers organise campus donation days, register donors and support the medical team on site.',
    history: [
      {year: '2025/26', supervisors: ['Dr. Amr Zaki'], coordinators: ['Salma Reda', 'Omar Hesham']},
      {year: '2024/25', supervisors: ['Dr. Mona Sabry', 'Dr. Amr Zaki'], coordinators: ['Nadia Fikry', 'Tarek Adel']},
    ],
  },
  COM305: {
    name: 'Community Kitchen',
    partner: 'Neighbourhood Food Network',
    description: 'Preparing and packing meals for local families, managing donations and keeping the kitchen inventory up to date.',
    history: [
      {year: '2025/26', supervisors: ['Dr. Ghada Ibrahim'], coordinators: ['Yasmin Talaat', 'Hazem Farid']},
      {year: '2024/25', supervisors: ['Dr. Ghada Ibrahim'], coordinators: ['Rania Saleh', 'Mostafa Emad']},
    ],
  },
  TEC220: {
    name: 'Digital Skills for Seniors',
    partner: 'City Community Library',
    description: 'One-to-one sessions that help older adults use smartphones, video calls, online banking and e-government services safely.',
    history: [
      {year: '2025/26', supervisors: ['Dr. Khaled Mourad'], coordinators: ['Reem Atef', 'Ahmed Nabil']},
      {year: '2024/25', supervisors: ['Dr. Inas Farag'], coordinators: ['Mai Yehia', 'Bassem Hany']},
    ],
  },
};
const PLACEHOLDER_PROGRAM = {
  name: 'Program details not yet added',
  partner: '—',
  description: 'This program does not have a profile in the example directory.',
  history: [],
  missing: true,
};
const getProgram = code => PROGRAMS[code?.toUpperCase()] || PLACEHOLDER_PROGRAM;
const readRoute = () => {
  const match = window.location.hash.match(/^#\/programs\/([^/?#]+)$/);
  return match ? decodeURIComponent(match[1]).toUpperCase() : null;
};
const programHref = code => `#/programs/${encodeURIComponent(code.toUpperCase())}`;

const seed = [
  {id:'e1',programCode:'ENV110',hours:3,reflection:'Planting day was well organised and the team lead explained every step.',owner:'you',name:'You',date:'2026-10-11'},
  {id:'e2',programCode:'EDU210',hours:2,reflection:'If you prepare examples in advance the sessions run smoothly.',owner:'other',name:'Habiba',date:'2026-10-08'},
  {id:'e3',programCode:'HLT150',hours:6,reflection:'Long shift but very rewarding. Bring water and snacks.',owner:'other',name:'Omar',date:'2026-10-03'},
  {id:'e4',programCode:'COM305',hours:4,reflection:'Packing went quickly once roles were clear.',owner:'you',name:'You',date:'2026-09-29'},
  {id:'e5',programCode:'TEC220',hours:2,reflection:'Patience matters more than technical knowledge here.',owner:'other',name:'Lina',date:'2026-09-25'},
  {id:'e6',programCode:'ENV110',hours:5,reflection:'Recycling audit took longer than planned.',owner:'other',name:'Youssef',date:'2026-09-19'},
  {id:'e7',programCode:'EDU210',hours:3,reflection:'Students asked great questions about recursion.',owner:'other',name:'Mariam',date:'2026-09-12'},
  {id:'e8',programCode:'HLT150',hours:8,reflection:'',owner:'other',name:'Ali',date:'2026-09-05'},
  {id:'e9',programCode:'COM305',hours:1,reflection:'Short orientation session only.',owner:'other',name:'Nour',date:'2026-08-28'},
  {id:'e10',programCode:'ENV110',hours:2,reflection:'Good for a first volunteering experience.',owner:'other',name:'Farah',date:'2026-08-20'},
];
function loadEntries(){try{const s=JSON.parse(localStorage.getItem(KEY));return Array.isArray(s)?s:seed;}catch{return seed;}}

const HOUR_LEVELS = [1,2,3,4,5,6,7,8];
const meanHours = a => a.length?(a.reduce((s,e)=>s+e.hours,0)/a.length).toFixed(1):'—';
const sumHours = a => a.reduce((s,e)=>s+e.hours,0);
const sameCode = (a,b) => a.trim().toUpperCase()===b.trim().toUpperCase();
const plural = (n,word) => `${n} ${n===1?word:(word.endsWith('y')?word.slice(0,-1)+'ies':word+'s')}`;
const formatDate = d => {
  const date = new Date(`${d}T00:00:00`);
  return Number.isNaN(date.getTime()) ? d : date.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
};
const byDateDesc = (a,b) => (b.date||'').localeCompare(a.date||'');

/* ---------- Small presentational pieces ---------- */

function HoursMeter({hours}){
  return <span className="hours" aria-label={`${hours} of 8 hours`}>
    <b>{hours} h</b>
    <span className="meter" aria-hidden="true">{HOUR_LEVELS.map(h=><i key={h} className={h<=hours?'on':''}/>)}</span>
  </span>;
}

function Stat({label,value,hint}){
  return <div className="stat"><span className="stat-label">{label}</span><b>{value}</b>{hint&&<span className="stat-hint">{hint}</span>}</div>;
}

function EntryCard({entry,onEdit,showProgram=true}){
  const program = getProgram(entry.programCode);
  const mine = entry.owner==='you';
  return <article className={`entry-card${mine?' mine':''}`}>
    <header className="entry-top">
      {showProgram
        ? <a className="program-link" href={programHref(entry.programCode)} title={`Open ${entry.programCode} program page`}>
            <span className="code">{entry.programCode}</span>
            <span className="program-name">{program.missing?'Not in directory':program.name}</span>
          </a>
        : <span className="volunteer-name">{entry.name}</span>}
      <HoursMeter hours={entry.hours}/>
    </header>
    <p className={`entry-note${entry.reflection?'':' empty-note'}`}>{entry.reflection?`“${entry.reflection}”`:'No reflection written.'}</p>
    <footer>
      <span>{showProgram&&<>{mine?<span className="you-badge">You</span>:entry.name} · </>}{mine&&!showProgram&&<span className="you-badge">Your entry</span>} {formatDate(entry.date)}</span>
      {mine&&<button className="edit-btn" onClick={()=>onEdit(entry)} aria-label={`Edit your ${entry.programCode} entry`}>Edit</button>}
    </footer>
  </article>;
}

/* ---------- App ---------- */

export default function App(){
  const [entries,setEntries] = useState(loadEntries);
  const [query,setQuery] = useState('');
  const [hoursFilter,setHoursFilter] = useState('all');
  const [mineOnly,setMineOnly] = useState(false);
  const [lookup,setLookup] = useState('ENV110');
  const [form,setForm] = useState(null);
  const [errors,setErrors] = useState({});
  const [toast,setToast] = useState(null);
  const [programCode,setProgramCode] = useState(readRoute);
  const [scrollTarget,setScrollTarget] = useState(null);

  useEffect(()=>{
    const onHash = () => {setProgramCode(readRoute());window.scrollTo({top:0,behavior:'instant'});};
    window.addEventListener('hashchange',onHash);
    return ()=>window.removeEventListener('hashchange',onHash);
  },[]);
  useEffect(()=>localStorage.setItem(KEY,JSON.stringify(entries)),[entries]);
  useEffect(()=>{
    if(!toast)return;
    const t = setTimeout(()=>setToast(null),5000);
    return ()=>clearTimeout(t);
  },[toast]);
  useEffect(()=>{
    if(!scrollTarget||programCode)return;
    requestAnimationFrame(()=>{
      if(scrollTarget==='top')window.scrollTo({top:0,behavior:'smooth'});
      else document.getElementById(scrollTarget)?.scrollIntoView({behavior:'smooth',block:'start'});
      setScrollTarget(null);
    });
  },[scrollTarget,programCode]);

  const openProgram = code => {
    window.location.hash = programHref(code);
    setProgramCode(code.toUpperCase());
    window.scrollTo({top:0,behavior:'instant'});
  };
  const goHome = section => {
    if(window.location.hash && window.location.hash!=='#/')window.location.hash='#/';
    setProgramCode(null);
    setScrollTarget(section);
  };

  /* Derived data */
  const sorted = useMemo(()=>[...entries].sort(byDateDesc),[entries]);
  const shown = useMemo(()=>sorted.filter(e=>
    (hoursFilter==='all'||e.hours===Number(hoursFilter)) &&
    (!mineOnly||e.owner==='you') &&
    `${e.programCode} ${e.reflection} ${e.name}`.toLowerCase().includes(query.trim().toLowerCase())
  ),[sorted,query,hoursFilter,mineOnly]);
  const programsLogged = [...new Set(entries.map(e=>e.programCode.toUpperCase()))];
  const allCodes = [...new Set([...Object.keys(PROGRAMS),...programsLogged])];
  const entriesFor = code => sorted.filter(e=>sameCode(e.programCode,code));
  const looked = lookup.trim() ? entriesFor(lookup) : [];
  const spread = HOUR_LEVELS.map(h=>({h,count:entries.filter(e=>e.hours===h).length}));
  const peak = Math.max(...spread.map(s=>s.count),1);
  const mine = entries.filter(e=>e.owner==='you');
  const myCodes = new Set(mine.map(e=>e.programCode.toUpperCase()));
  const filtersActive = query.trim()||hoursFilter!=='all'||mineOnly;

  /* Form */
  function openForm(entry,presetCode=''){
    if(entry&&entry.owner!=='you')return;
    setErrors({});
    setForm({id:entry?.id||null,programCode:entry?.programCode||presetCode,hours:entry?String(entry.hours):'',reflection:entry?.reflection||''});
  }
  const findDuplicate = f => f && f.programCode.trim()
    ? entries.find(e=>e.id!==f.id&&e.owner==='you'&&e.programCode.toLowerCase()===f.programCode.trim().toLowerCase())
    : null;
  function save(ev){
    ev.preventDefault();
    const next = {};
    if(!form.programCode.trim())next.programCode='Enter a program code, for example ENV110.';
    else if(findDuplicate(form))next.programCode='duplicate';
    if(!/^[1-8]$/.test(form.hours.trim()))next.hours='Hours must be a whole number from 1 to 8.';
    setErrors(next);
    if(Object.keys(next).length)return;
    const code = form.programCode.trim().toUpperCase();
    const data={programCode:code,hours:Number(form.hours.trim()),reflection:form.reflection.trim(),name:'You',owner:'you',date:new Date().toISOString().slice(0,10)};
    const program = getProgram(code);
    const label = program.missing?code:`${code} · ${program.name}`;
    if(form.id){
      setEntries(entries.map(e=>e.id===form.id?{...e,...data}:e));
      setToast({message:`Changes saved — ${plural(data.hours,'hour')} for ${label}.`,code});
    }else{
      setEntries([{...data,id:'e-'+Date.now()},...entries]);
      setToast({message:`Logged ${plural(data.hours,'hour')} for ${label}.`,code});
    }
    setForm(null);
  }
  function resetAll(){
    if(!window.confirm('Reset all data?\n\nThis removes any entries you added or edited and restores the example records.'))return;
    setEntries(seed);setQuery('');setHoursFilter('all');setMineOnly(false);setLookup('ENV110');setForm(null);
    setToast({message:'Data reset — the example records have been restored.'});
  }
  const clearFilters = () => {setQuery('');setHoursFilter('all');setMineOnly(false);};

  const navItems = [
    {id:'programs',label:'Programs',go:()=>{setMineOnly(false);goHome('programs');}},
    {id:'activity',label:'Volunteer activity',go:()=>{setMineOnly(false);goHome('activity');}},
    {id:'mine',label:'My hours',go:()=>{setMineOnly(true);setQuery('');setHoursFilter('all');goHome('activity');}},
  ];

  return <div className="hub">
    <a className="skip-link" href="#main" onClick={e=>{e.preventDefault();document.getElementById('main')?.focus();}}>Skip to content</a>
    <nav className="topbar" aria-label="Main">
      <a className="brand" href="#/" onClick={e=>{e.preventDefault();goHome('top');}}><span className="brand-mark" aria-hidden="true">◆</span>Service<b>Hours</b></a>
      <div className="tabs">{navItems.map(n=><button key={n.id} className="tab" onClick={n.go}>{n.label}</button>)}</div>
      <button className="primary" onClick={()=>openForm(null)}><span aria-hidden="true">+</span> Log hours</button>
    </nav>

    <main className="page" id="main" tabIndex={-1}>
      {programCode
        ? <ProgramPage
            code={programCode}
            entries={entriesFor(programCode)}
            myEntry={mine.find(e=>sameCode(e.programCode,programCode))}
            onBack={()=>goHome('programs')}
            onLog={()=>openForm(null,programCode)}
            onEdit={openForm}
            onCopied={ok=>setToast({message:ok?'Link copied — anyone with it can open this program page.':'Copy the address bar to share this page.'})}
          />
        : <>
          <header className="intro">
            <div>
              <h1>Find a program, see the real effort, log your hours</h1>
              <p>Compare community service programs by how many hours volunteers actually put in and what they said about it.</p>
            </div>
            <ol className="steps" aria-label="How it works">
              <li><button onClick={()=>goHome('programs')}><b>1</b>Browse programs</button></li>
              <li><button onClick={()=>goHome('activity')}><b>2</b>Read volunteer reflections</button></li>
              <li><button onClick={()=>openForm(null)}><b>3</b>Log your own hours</button></li>
            </ol>
          </header>

          <section className="card overview" aria-labelledby="overview-h">
            <div className="card-head"><h2 id="overview-h">Overview</h2><span className="muted">Across all programs</span></div>
            <div className="overview-body">
              <div className="stats">
                <Stat label="Total entries" value={entries.length} hint="logged so far"/>
                <Stat label="Average per entry" value={meanHours(entries)} hint="hours"/>
                <Stat label="Programs with activity" value={programsLogged.length} hint={`of ${allCodes.length} listed`}/>
                <Stat label="Your hours" value={sumHours(mine)} hint={`in ${plural(mine.length,'entry')}`}/>
              </div>
              <figure className="dist">
                <figcaption>Hours per entry <span className="muted">— how many entries logged each amount</span></figcaption>
                <div className="bars" role="list">
                  {spread.map(s=><button type="button" role="listitem" key={s.h} className={`bar${hoursFilter===String(s.h)?' sel':''}`}
                    onClick={()=>{setHoursFilter(String(s.h));setMineOnly(false);goHome('activity');}}
                    aria-label={`${s.h} hour${s.h===1?'':'s'}: ${plural(s.count,'entry')}. Show these entries.`}
                    title={`Show entries with ${s.h} h`}>
                    <span className="bar-count">{s.count}</span>
                    <span className="bar-track"><i style={{height:`${s.count/peak*100}%`}}/></span>
                    <span className="bar-label">{s.h}h</span>
                  </button>)}
                </div>
              </figure>
            </div>
          </section>

          <section id="programs" className="section" aria-labelledby="programs-h">
            <div className="section-head">
              <div><h2 id="programs-h">Programs</h2><p className="muted">Effort is based on hours previous volunteers logged. Open a program for its team, description and every reflection.</p></div>
            </div>
            <div className="programs-layout">
              <div className="program-grid">
                {allCodes.map(code=>{
                  const p = getProgram(code), list = entriesFor(code), latest = list.find(e=>e.reflection);
                  return <a className="program-card" key={code} href={programHref(code)}>
                    <div className="program-card-top">
                      <span className="code">{code}</span>
                      {myCodes.has(code)&&<span className="logged-badge">✓ You logged hours</span>}
                    </div>
                    <h3>{p.missing?code:p.name}</h3>
                    <p className="partner">{p.missing?'Program details not yet added':p.partner}</p>
                    <dl className="mini-stats">
                      <div><dt>Avg / entry</dt><dd>{meanHours(list)}{list.length?' h':''}</dd></div>
                      <div><dt>Entries</dt><dd>{list.length}</dd></div>
                      <div><dt>Total</dt><dd>{sumHours(list)} h</dd></div>
                    </dl>
                    <p className="quote">{latest?<>“{latest.reflection}” <span>— {latest.name}</span></>:<span>No reflections yet.</span>}</p>
                    <span className="card-cta">View program →</span>
                  </a>;
                })}
              </div>

              <aside className="card lookup" aria-labelledby="lookup-h">
                <h2 id="lookup-h">Program check</h2>
                <p className="muted">Know a program code? Check its numbers instantly.</p>
                <label className="field-label" htmlFor="lookup">Program code</label>
                <input id="lookup" className="input" list="program-codes" value={lookup} onChange={e=>setLookup(e.target.value)} placeholder="e.g. HLT150" autoComplete="off"/>
                <p className="lookup-name">{lookup.trim()
                  ? (getProgram(lookup).missing?`${lookup.trim().toUpperCase()} isn't in the directory`:getProgram(lookup).name)
                  : 'Type a code to see results'}</p>
                <dl className="lookup-result">
                  <div><dt>Avg hours / entry</dt><dd>{meanHours(looked)}</dd></div>
                  <div><dt>Entries</dt><dd>{looked.length}</dd></div>
                  <div><dt>Total hours</dt><dd>{sumHours(looked)}</dd></div>
                </dl>
                <button className="secondary full" disabled={!lookup.trim()} onClick={()=>openProgram(lookup.trim())}>Open program page</button>
              </aside>
            </div>
          </section>

          <section id="activity" className="card section-card" aria-labelledby="activity-h">
            <div className="card-head">
              <div><h2 id="activity-h">{mineOnly?'My hours':'Volunteer activity'}</h2>
                <p className="muted">{mineOnly?'Entries you logged. You can edit any of them.':'What volunteers logged and said, newest first. You can edit entries marked “You”.'}</p></div>
              <span className="count" aria-live="polite">Showing {shown.length} of {entries.length}</span>
            </div>
            <div className="filters">
              <label className="search">
                <span className="sr-only">Search entries</span>
                <input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search program code, reflection or volunteer name"/>
              </label>
              <label className="select">
                <span className="sr-only">Filter by hours</span>
                <select value={hoursFilter} onChange={e=>setHoursFilter(e.target.value)}>
                  <option value="all">Any number of hours</option>
                  {HOUR_LEVELS.map(h=><option key={h} value={h}>{plural(h,'hour')}</option>)}
                </select>
              </label>
              <label className="toggle"><input type="checkbox" checked={mineOnly} onChange={e=>setMineOnly(e.target.checked)}/> Only my entries</label>
              {filtersActive&&<button className="link-btn" onClick={clearFilters}>Clear filters</button>}
            </div>
            {shown.length
              ? <div className="entry-grid">{shown.map(e=><EntryCard key={e.id} entry={e} onEdit={openForm}/>)}</div>
              : <div className="empty"><p>No entries match these filters.</p>{filtersActive&&<button className="secondary" onClick={clearFilters}>Clear filters</button>}</div>}
          </section>
        </>}
    </main>

    <footer className="site-footer">
      <span>Demo app — all programs, staff and entries are fictional sample data, saved only in this browser.</span>
      <button className="danger-link" onClick={resetAll}>Reset data</button>
    </footer>

    <datalist id="program-codes">{allCodes.map(c=><option key={c} value={c}>{getProgram(c).missing?'':getProgram(c).name}</option>)}</datalist>

    {form&&<EntryForm form={form} setForm={setForm} errors={errors} setErrors={setErrors} onSave={save}
      onClose={()=>setForm(null)} duplicate={findDuplicate(form)}
      myCodes={new Set(mine.filter(e=>e.id!==form.id).map(e=>e.programCode.toUpperCase()))}
      onEditExisting={e=>openForm(e)}/>}

    {toast&&<div className="toast" role="status">
      <span>✓ {toast.message}</span>
      {toast.code&&readRoute()!==toast.code&&<button className="toast-action" onClick={()=>{openProgram(toast.code);setToast(null);}}>View program</button>}
      <button className="toast-close" onClick={()=>setToast(null)} aria-label="Dismiss">×</button>
    </div>}
  </div>;
}

/* ---------- Program details page ---------- */

function ProgramPage({code,entries,myEntry,onBack,onLog,onEdit,onCopied}){
  const program = getProgram(code);
  const copyLink = async () => {
    try{await navigator.clipboard.writeText(window.location.href);onCopied(true);}catch{onCopied(false);}
  };
  const years = ['2025/26','2024/25'];
  return <article className="program-page">
    <button className="crumb" onClick={onBack}>← All programs</button>
    <header className="program-hero">
      <div className="program-hero-text">
        <span className="tag">{code}</span>
        <h1>{program.name}</h1>
        <p>{program.missing?'No partner organisation on record':<>Partner: {program.partner}</>}</p>
        <div className="hero-actions">
          {myEntry
            ? <button className="hero-primary" onClick={()=>onEdit(myEntry)}>Edit your entry ({myEntry.hours} h)</button>
            : <button className="hero-primary" onClick={onLog}>+ Log hours for {code}</button>}
          <button className="hero-ghost" onClick={copyLink}>Copy share link</button>
        </div>
      </div>
      <dl className="hero-stats">
        <div><dt>Avg hours / entry</dt><dd>{meanHours(entries)}</dd></div>
        <div><dt>Entries</dt><dd>{entries.length}</dd></div>
        <div><dt>Total hours</dt><dd>{sumHours(entries)}</dd></div>
      </dl>
    </header>

    <div className="program-layout">
      <div className="program-main">
        <section className="card about" aria-labelledby="about-h">
          <h2 id="about-h">About this program</h2>
          {program.missing&&<p className="notice">Program details not yet added. Hours logged under this code still count.</p>}
          <p>{program.description}</p>
          <dl>
            <dt>Partner organisation</dt><dd>{program.partner}</dd>
            <dt>Program code</dt><dd>{code}</dd>
          </dl>
        </section>

        <section className="card" aria-labelledby="pentries-h">
          <div className="card-head">
            <div><h2 id="pentries-h">What volunteers logged</h2><p className="muted">{plural(entries.length,'entry')}, newest first</p></div>
          </div>
          {entries.length
            ? <div className="entry-list">{entries.map(e=><EntryCard key={e.id} entry={e} onEdit={onEdit} showProgram={false}/>)}</div>
            : <div className="empty"><p>Nobody has logged hours for this program yet.</p><button className="secondary" onClick={onLog}>Be the first to log hours</button></div>}
        </section>
      </div>

      <section className="card team" aria-labelledby="team-h">
        <h2 id="team-h">Program team</h2>
        <p className="muted">Faculty supervisors and student coordinators.</p>
        {years.map(y=>{
          const h = program.history.find(x=>x.year===y);
          return <div className="team-year" key={y}>
            <h3>{y}</h3>
            {h ? <>
              <span className="label">Faculty supervisor{h.supervisors.length===1?'':'s'}</span>
              <ul>{h.supervisors.map(s=><li key={s}>{s}</li>)}</ul>
              <span className="label">Student coordinators</span>
              <ul>{h.coordinators.map(s=><li key={s}>{s}</li>)}</ul>
            </> : <p className="muted">No team records for this year.</p>}
          </div>;
        })}
        <p className="fine-print">Illustrative program and staff records; all names are fictional.</p>
      </section>
    </div>
  </article>;
}

/* ---------- Log / edit form ---------- */

function EntryForm({form,setForm,errors,setErrors,onSave,onClose,duplicate,myCodes,onEditExisting}){
  const firstRef = useRef(null);
  useEffect(()=>{
    firstRef.current?.focus();
    const onKey = e => {if(e.key==='Escape')onClose();};
    window.addEventListener('keydown',onKey);
    return ()=>window.removeEventListener('keydown',onKey);
  },[form.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (field,value) => {
    setForm(f=>({...f,[field]:value}));
    if(errors[field])setErrors(e=>({...e,[field]:undefined}));
  };
  const code = form.programCode.trim().toUpperCase();
  const program = code ? getProgram(code) : null;
  const codeError = errors.programCode && errors.programCode!=='duplicate' ? errors.programCode : null;

  return <div className="scrim" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="form-h">
      <div className="drawer-head">
        <h2 id="form-h">{form.id?'Edit your entry':'Log your hours'}</h2>
        <button onClick={onClose} aria-label="Close">×</button>
      </div>
      <p className="muted drawer-intro">You can log one entry per program, with 1 to 8 hours.</p>
      <form onSubmit={onSave} noValidate>
        <div className="field">
          <label className="field-label" htmlFor="f-code">Program code <span className="req">required</span></label>
          <input id="f-code" ref={firstRef} className="input" list="program-codes" value={form.programCode}
            onChange={e=>update('programCode',e.target.value)} placeholder="e.g. TEC220" autoComplete="off"
            aria-invalid={!!(codeError||duplicate)} aria-describedby="f-code-help"/>
          <div id="f-code-help" className="field-help">
            {codeError
              ? <span className="error">{codeError}</span>
              : duplicate
                ? <span className="error">You already logged {duplicate.hours} h for {code}. Only one entry per program is allowed. <button type="button" className="inline-link" onClick={()=>onEditExisting(duplicate)}>Edit that entry instead</button></span>
                : program
                  ? (program.missing?<span>{code} isn't in the directory. You can still log it, but its page will show “Program details not yet added”.</span>:<span className="ok">✓ {program.name} · {program.partner}</span>)
                  : <span>Pick a program below or type its code.</span>}
          </div>
          <div className="chips" role="group" aria-label="Choose a program">
            {Object.keys(PROGRAMS).map(c=>{
              const done = myCodes.has(c);
              return <button type="button" key={c} className={`chip${sameCode(code||' ',c)?' on':''}${done?' done':''}`}
                onClick={()=>update('programCode',c)} title={done?'You already logged hours for this program':PROGRAMS[c].name}>
                <b>{c}</b> {PROGRAMS[c].name}{done&&<em> · logged</em>}
              </button>;
            })}
          </div>
        </div>

        <div className="field">
          <span className="field-label" id="f-hours-label">Hours <span className="req">required · whole number 1–8</span></span>
          <div className="hours-picker" role="radiogroup" aria-labelledby="f-hours-label" aria-describedby="f-hours-help">
            {HOUR_LEVELS.map(h=><button type="button" role="radio" aria-checked={form.hours.trim()===String(h)} key={h}
              className={form.hours.trim()===String(h)?'on':''} onClick={()=>update('hours',String(h))}>{h}</button>)}
          </div>
          <label className="hours-typed">or type it:
            <input className="input small" inputMode="numeric" value={form.hours} onChange={e=>update('hours',e.target.value)}
              placeholder="1–8" aria-label="Hours" aria-invalid={!!errors.hours} aria-describedby="f-hours-help"/>
          </label>
          <div id="f-hours-help" className="field-help">{errors.hours?<span className="error">{errors.hours}</span>:<span>Count the time you actually spent volunteering.</span>}</div>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="f-refl">Reflection <span className="opt">optional</span></label>
          <textarea id="f-refl" className="input" value={form.reflection} rows={5} onChange={e=>update('reflection',e.target.value)}
            placeholder="What did you do? Any tips for the next volunteer?"/>
          <div className="field-help"><span>Other students read these when they're choosing a program.</span></div>
        </div>

        <div className="drawer-actions">
          <button type="submit" className="primary">{form.id?'Save changes':'Log hours'}</button>
          <button type="button" className="secondary" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </aside>
  </div>;
}
