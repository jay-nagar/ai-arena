"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity, AudioLines, BrainCircuit, ChevronRight, CircleDot, Clock3,
  Crown, Database, Eye, FastForward, Flame, Gauge, GitBranch, Handshake, History,
  Map, MemoryStick, Network, Pause, Play, Radio, Search, Shield, ShieldAlert,
  SkipBack, Sparkles, StepForward, Swords, Users, WandSparkles, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

type Team = { name: string; sigil: string; color: string; members: number; cohesion: number; ideology: string; stance: string; region: string; power: number };
type FeedEvent = { id: number; tick: string; type: "diplomacy" | "conflict" | "movement" | "dialogue"; title: string; detail: string; accent: string };

const initialTeams: Team[] = [
  { name: "The Meridian", sigil: "M", color: "#ffb55e", members: 17, cohesion: 83, ideology: "Ordered abundance", stance: "Fortifying", region: "Sunhold", power: 88 },
  { name: "Ash Covenant", sigil: "A", color: "#ef6a62", members: 15, cohesion: 68, ideology: "Strength through trial", stance: "Mobilizing", region: "Cinder March", power: 79 },
  { name: "Verdant Accord", sigil: "V", color: "#70d9a4", members: 18, cohesion: 76, ideology: "Reciprocal flourishing", stance: "Negotiating", region: "Greenmere", power: 75 },
  { name: "Quiet Assembly", sigil: "Q", color: "#8fc5ff", members: 14, cohesion: 91, ideology: "Knowledge before action", stance: "Observing", region: "Bell Archive", power: 70 },
  { name: "Tidebound", sigil: "T", color: "#5ee0e8", members: 16, cohesion: 72, ideology: "Freedom through motion", stance: "Trading", region: "Tideward", power: 66 },
  { name: "Iron Chorus", sigil: "I", color: "#c6a5ff", members: 17, cohesion: 64, ideology: "One voice, many wills", stance: "Recruiting", region: "Deep Forge", power: 82 },
  { name: "Emberkin", sigil: "E", color: "#ff8e54", members: 15, cohesion: 59, ideology: "Memory makes destiny", stance: "Fracturing", region: "Old Kilns", power: 61 },
  { name: "Lumen Freeholds", sigil: "L", color: "#f8df74", members: 16, cohesion: 80, ideology: "Sovereignty by consent", stance: "Mediating", region: "Lantern Fields", power: 73 },
];

const agents = [
  { name: "Maelin Voss", role: "First Speaker", team: "The Meridian", initials: "MV", loyalty: 78, fear: 32, ambition: 86, belief: 71, relation: 64, combatRole: "Vanguard anchor", weapon: "Ashwood spear", skill: 84, xp: 73, morale: 76, injury: "Bruised ribs", training: "Shieldwall III", frame: "Tall · rangewright", physique: "Reach +18 · carry +12 · stealth −9 · upkeep +8" },
  { name: "Iria Sable", role: "Envoy", team: "Verdant Accord", initials: "IS", loyalty: 61, fear: 20, ambition: 72, belief: 84, relation: 81, combatRole: "Field support", weapon: "Yew longbow", skill: 71, xp: 58, morale: 88, injury: "Clear", training: "Skirmish II", frame: "Compact · sliprunner", physique: "Agility +17 · concealment +14 · power −10 · upkeep −7" },
  { name: "Corin Vale", role: "Tactician", team: "Ash Covenant", initials: "CV", loyalty: 88, fear: 47, ambition: 68, belief: 77, relation: 42, combatRole: "Breach captain", weapon: "Bearded axe", skill: 92, xp: 89, morale: 64, injury: "Burn strain", training: "Vanguard IV", frame: "Heavy · bastion", physique: "Power +21 · durability +16 · speed −14 · upkeep +13" },
  { name: "Nyra Quell", role: "Archivist", team: "Quiet Assembly", initials: "NQ", loyalty: 69, fear: 28, ambition: 55, belief: 93, relation: 74, combatRole: "Signal keeper", weapon: "Arming sword", skill: 67, xp: 61, morale: 79, injury: "Clear", training: "Watch III", frame: "Lithe · threader", physique: "Tight access +19 · speed +11 · carry −9 · durability −7" },
];

const seedFeed: FeedEvent[] = [
  { id: 4, tick: "Cycle 43 · 18:42", type: "movement", title: "A defection changes the balance", detail: "Sera Quill leaves the Emberkin for the Tidebound after three failed votes on food access.", accent: "#5ee0e8" },
  { id: 3, tick: "Cycle 43 · 18:38", type: "dialogue", title: "“Trust is not surrender.”", detail: "Iria Sable persuades two Meridian delegates to reopen the eastern passage.", accent: "#70d9a4" },
  { id: 2, tick: "Cycle 43 · 18:31", type: "diplomacy", title: "The Halo Compact is ratified", detail: "Lumen Freeholds and Quiet Assembly guarantee mutual sanctuary for 6 cycles.", accent: "#f8df74" },
  { id: 1, tick: "Cycle 43 · 18:24", type: "conflict", title: "Iron Chorus fractures at Resonant Deep", detail: "A 5-member reform bloc threatens schism unless leadership opens its council.", accent: "#c6a5ff" },
];

const simulationEvents = [
  { title: "Recruitment succeeds at Driftward", detail: "Tidebound gains one unaffiliated navigator; practical freedom aligned with their strongest ambition.", type: "movement" as const, accent: "#5ee0e8" },
  { title: "A merger proposal enters council", detail: "Verdant Accord and Lumen Freeholds begin a 3-cycle union vote. Both retain independent identities for now.", type: "diplomacy" as const, accent: "#70d9a4" },
  { title: "Emberkin schism contained", detail: "The memory-keeper bloc wins autonomy inside the faction, avoiding a split below viable strength.", type: "movement" as const, accent: "#ff8e54" },
  { title: "Ash Covenant issues an ultimatum", detail: "Corin Vale demands access to the Sunvault. Meridian mobilizes but leaves a diplomatic channel open.", type: "conflict" as const, accent: "#ef6a62" },
  { title: "“I choose the people who chose me.”", detail: "Kei Oran rejects Iron Chorus recruitment after comparing loyalty ties across both factions.", type: "dialogue" as const, accent: "#8fc5ff" },
];

function EventIcon({ type }: { type: FeedEvent["type"] }) {
  const Icon = type === "conflict" ? Swords : type === "diplomacy" ? Handshake : type === "dialogue" ? AudioLines : Users;
  return <Icon size={15} />;
}

export default function Home() {
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [cycle, setCycle] = useState(43);
  const [teams, setTeams] = useState(initialTeams);
  const [feed, setFeed] = useState(seedFeed);
  const [selectedTeam, setSelectedTeam] = useState(0);
  const [selectedAgent, setSelectedAgent] = useState(0);
  const [activeView, setActiveView] = useState<"world" | "factions" | "people">("world");
  const [controlOpen, setControlOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [branch, setBranch] = useState("Prime");
  const [fallen, setFallen] = useState(0);
  const [lastAction, setLastAction] = useState("No overseer intervention this cycle");
  const [interventionStrength, setInterventionStrength] = useState<"Whisper" | "Pressure" | "Override">("Pressure");
  const [selectedLever, setSelectedLever] = useState("Secret exposed");
  const [values, setValues] = useState({ loyalty: 78, belief: 71, fear: 32, ambition: 86, relation: 64 });
  const totalCharacters = useMemo(() => teams.reduce((sum, team) => sum + team.members, 0), [teams]);
  const chosenAgent = agents[selectedAgent];

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setCycle((value) => value + 1);
      setFeed((current) => {
        const next = simulationEvents[(current[0].id + speed) % simulationEvents.length];
        return [{ ...next, id: current[0].id + 1, tick: `Cycle ${cycle + 1} · live` }, ...current].slice(0, 8);
      });
    }, 6500 / speed);
    return () => window.clearInterval(timer);
  }, [running, speed, cycle]);

  const triggerWorldEvent = (kind: string) => {
    setLastAction(`${kind} seeded by overseer · agents are adapting`);
    setFeed((current) => [{
      id: current[0].id + 1, tick: `Cycle ${cycle} · overseer`,
      type: kind === "Resource shock" ? "conflict" : "movement",
      title: `${kind} enters the world`,
      detail: "Characters received the event as new evidence. Their next decisions will weigh beliefs, loyalties, risk, and relationships.",
      accent: "#ffb55e",
    }, ...current]);
  };

  const shiftMember = () => {
    setTeams((current) => current.map((team, index) => {
      if (index === 6 && team.members > 10) return { ...team, members: team.members - 1, cohesion: team.cohesion + 2 };
      if (index === 4) return { ...team, members: team.members + 1, cohesion: team.cohesion + 1 };
      return team;
    }));
    setFeed((current) => [{
      id: current[0].id + 1, tick: `Cycle ${cycle} · autonomous`, type: "movement",
      title: "Sera Quill defects to Tidebound",
      detail: "Decision summary: repeated policy conflict (high), Tidebound trust tie (strong), personal risk (acceptable). Viability guard preserved all 8 teams above 10 members.",
      accent: "#5ee0e8",
    }, ...current]);
    setLastAction("Autonomous defection resolved · population conserved");
  };

  const commitIntervention = () => {
    const force = interventionStrength === "Whisper" ? "subtle" : interventionStrength === "Pressure" ? "forceful" : "overwhelming";
    const cascade: FeedEvent[] = [
      { id: feed[0].id + 4, tick: `Cycle ${cycle} · cascade 4`, type: "conflict", title: "Ash Covenant begins mobilization", detail: `War risk rises as rivals interpret the ${force} intervention as a threat to the balance.`, accent: "#ef6a62" },
      { id: feed[0].id + 3, tick: `Cycle ${cycle} · cascade 3`, type: "diplomacy", title: "Halo Compact calls emergency council", detail: "Allies demand verification, while neutral teams offer mediation.", accent: "#f8df74" },
      { id: feed[0].id + 2, tick: `Cycle ${cycle} · cascade 2`, type: "movement", title: "Reform bloc tests its leadership", detail: "Three members consider defection; the viability covenant prevents a destructive split.", accent: "#c6a5ff" },
      { id: feed[0].id + 1, tick: `Cycle ${cycle} · overseer`, type: "dialogue", title: `${chosenAgent.name} interprets the intervention`, detail: `${selectedLever} applied at ${interventionStrength.toLowerCase()} strength. Resistance 34%: accepted as evidence, rejected as command.`, accent: "#ffb55e" },
    ];
    setFeed((current) => [...cascade, ...current].slice(0, 8));
    setLastAction(`${selectedLever} · ${interventionStrength} · 4-system cascade underway`);
    setControlOpen(false);
  };

  const stepTimeline = () => {
    setRunning(false);
    setCycle((value) => value + 1);
    const next = simulationEvents[(feed[0].id + 1) % simulationEvents.length];
    setFeed((current) => [{ ...next, id: current[0].id + 1, tick: `Cycle ${cycle + 1} · stepped` }, ...current].slice(0, 8));
    setLastAction("Advanced exactly one autonomous resolution");
  };

  const rewindTimeline = () => {
    setRunning(false);
    setCycle(38);
    setBranch("Prime");
    setFallen(0);
    setTeams(initialTeams);
    setFeed([{ ...seedFeed[2], id: feed[0].id + 1, tick: "Cycle 38 · restored checkpoint", title: "Rewound before the Halo Compact", detail: "Prime remains preserved. The simulation is paused before ratification so the Overseer can intervene." }, ...seedFeed]);
    setTimelineOpen(true);
  };

  const branchTimeline = () => {
    setRunning(false);
    setBranch("Echo-1");
    setFeed((current) => [{ id: current[0].id + 1, tick: `Cycle ${cycle} · branch point`, type: "diplomacy", title: "Echo-1 diverges from Prime", detail: "A non-destructive alternate timeline begins here. Prime remains available for comparison and restoration.", accent: "#8fc5ff" }, ...current]);
    setTimelineOpen(true);
  };

  const resolvePermadeath = () => {
    if (fallen > 0) return;
    setRunning(false);
    setFallen(1);
    setTeams((current) => current.map((team, index) => index === 0 ? { ...team, members: team.members - 1, cohesion: team.cohesion - 9 } : team));
    const consequences: FeedEvent[] = [
      { id: feed[0].id + 5, tick: `Cycle ${cycle} · consequence`, type: "conflict", title: "The Meridian vows an answer", detail: "A revenge bloc gains support. Ash Covenant raises shields as war risk climbs to 71%.", accent: "#ef6a62" },
      { id: feed[0].id + 4, tick: `Cycle ${cycle} · diplomacy`, type: "diplomacy", title: "Verdant Accord suspends the passage pact", detail: "The alliance demands an inquiry before it will risk more lives.", accent: "#70d9a4" },
      { id: feed[0].id + 3, tick: `Cycle ${cycle} · succession`, type: "movement", title: "A succession vote begins", detail: "Edrin's council seat is vacant. Three candidates reorganize the leadership coalition.", accent: "#f8df74" },
      { id: feed[0].id + 2, tick: `Cycle ${cycle} · morale`, type: "dialogue", title: "Meridian morale falls 14 points", detail: "Friends grieve, rivals hesitate, and Maelin's loyalty hardens into resolve.", accent: "#8fc5ff" },
      { id: feed[0].id + 1, tick: `Cycle ${cycle} · chronicle`, type: "conflict", title: "Edrin Holt has fallen", detail: "Permanent death: removed from all active rosters and future decisions. Preserved only in the Chronicle and snapshots before this cycle.", accent: "#a5a9b2" },
    ];
    setFeed((current) => [...consequences, ...current].slice(0, 8));
    setLastAction("Permadeath resolved · succession, morale, alliance and revenge cascades active");
  };

  return (
    <main className="min-h-screen bg-[#080a0f] text-[#f5f1e8]">
      <header className="topbar">
        <div className="brand"><div className="brand-mark"><CircleDot size={19} /></div><div><strong>ORRERY</strong><span>THE SENTIENT ARENA</span></div></div>
        <nav className="view-tabs" aria-label="Arena views">
          {(["world", "factions", "people"] as const).map((view) => <button key={view} onClick={() => setActiveView(view)} className={activeView === view ? "active" : ""}>{view}</button>)}
        </nav>
        <div className="sim-controls">
          <span className="live-chip"><i /> SIMULATION LIVE</span>
          <button className="icon-button" onClick={() => setRunning(!running)} aria-label={running ? "Pause simulation" : "Resume simulation"}>{running ? <Pause size={16} /> : <Play size={16} />}</button>
          {[1, 2, 4].map((value) => <button key={value} className={`speed ${speed === value ? "active" : ""}`} onClick={() => setSpeed(value)}>{value}×</button>)}
          <button className="timeline-button" onClick={() => setTimelineOpen(true)}><History size={14} /> Timeline</button>
          <Button onClick={() => setControlOpen(true)} className="overseer-button"><WandSparkles size={15} /> Overseer</Button>
        </div>
      </header>

      <section className="status-ribbon">
        <div><Clock3 size={13} /><span>CYCLE</span><strong>{cycle}</strong></div>
        <div><Users size={13} /><span>SOULS</span><strong>{totalCharacters}</strong></div>
        <div><History size={13} /><span>FALLEN</span><strong>{fallen}</strong></div>
        <div><Shield size={13} /><span>VIABLE TEAMS</span><strong>{teams.length} / 8</strong></div>
        <div><Swords size={13} /><span>ACTIVE WARS</span><strong>2</strong></div>
        <div><Handshake size={13} /><span>PACT NETWORK</span><strong>67%</strong></div>
        <div className="ribbon-note"><Sparkles size={13} /> Local agent engine · no API required</div>
      </section>

      <div className="workspace">
        <aside className="left-panel">
          <div className="panel-heading"><div><span>FACTION ARRAY</span><strong>Power & cohesion</strong></div><button aria-label="Search factions"><Search size={15} /></button></div>
          <div className="team-list">
            {teams.map((team, index) => (
              <button className={`team-row ${selectedTeam === index ? "selected" : ""}`} key={team.name} onClick={() => setSelectedTeam(index)}>
                <span className="sigil" style={{ color: team.color, borderColor: `${team.color}55`, background: `${team.color}12` }}>{team.sigil}</span>
                <span className="team-copy"><span><strong>{team.name}</strong><em>{team.members}</em></span><small>{team.stance} · {team.region}</small><i><b style={{ width: `${team.power}%`, background: team.color }} /></i></span>
              </button>
            ))}
          </div>
          <div className="leadership-card">
            <span><Crown size={12} /> EMERGENT LEADERSHIP</span>
            <strong>{selectedTeam === 0 ? "Maelin Voss" : `${teams[selectedTeam].sigil} Council`} · 68% mandate</strong>
            <small>Selected by coalition vote · next challenge in 4 cycles</small>
          </div>
          <div className="viability-card"><ShieldAlert size={17} /><div><strong>Population covenant holding</strong><span>8 autonomous teams · minimum 10 each · 128 total</span></div></div>
        </aside>

        <section className="center-stage">
          <div className="world-header">
            <div><span className="eyebrow">THE SHATTERED MARCHES · LIVE</span><h1>Every allegiance is a choice.</h1><p>128 autonomous lives are bargaining, believing, and becoming.</p></div>
            <div className="world-weather"><Radio size={14} /><span>WORLD TENSION</span><strong>RISING · 72</strong></div>
          </div>
          <div className="arena-map">
            <div className="map-grid" /><div className="orbit orbit-one" /><div className="orbit orbit-two" />
            <div className="core"><span>THE</span><strong>WELL</strong><i /></div>
            {teams.map((team, index) => {
              const positions = [[16, 23], [72, 18], [82, 48], [68, 77], [33, 81], [9, 59], [42, 16], [43, 61]];
              return (
                <button key={team.name} onClick={() => setSelectedTeam(index)} className={`map-node node-${index} ${selectedTeam === index ? "selected" : ""}`} style={{ left: `${positions[index][0]}%`, top: `${positions[index][1]}%`, "--team-color": team.color } as React.CSSProperties}>
                  <span>{team.sigil}</span><div><strong>{team.name}</strong><small>{team.members} souls · {team.cohesion}% cohesion</small></div>
                </button>
              );
            })}
            <svg className="alliance-lines" viewBox="0 0 1000 500" preserveAspectRatio="none" aria-hidden="true">
              <path d="M180 120 Q500 20 730 100" /><path d="M730 100 Q900 220 820 250" /><path d="M160 300 Q380 460 680 390" /><path className="war" d="M730 100 Q570 180 430 90" /><path d="M420 310 Q550 410 680 390" />
            </svg>
            <div className="map-legend"><span><i className="ally" /> Pact</span><span><i className="war" /> Hostility</span><span><i className="motion" /> Migration</span></div>
          </div>
          <div className="decision-strip">
            <div className="decision-avatar" style={{ background: `${teams[selectedTeam].color}22`, color: teams[selectedTeam].color }}>{chosenAgent.initials}</div>
            <div className="decision-copy"><span className="eyebrow"><BrainCircuit size={12} /> DECISION IN MOTION · {chosenAgent.name}</span><p>“If the passage opens, I can make peace look like strength.”</p><div className="reason-tags"><span>Protect team <b>+42</b></span><span>Trust in Iria <b>+28</b></span><span>Fear of coup <b>−17</b></span></div></div>
            <button className="trace-button" onClick={() => setControlOpen(true)}>Inspect summary <ChevronRight size={14} /></button>
          </div>
        </section>

        <aside className="right-panel">
          <div className="panel-heading"><div><span>CHRONICLE</span><strong>What just changed</strong></div><Activity size={16} className="activity-icon" /></div>
          <div className="feed">
            {feed.slice(0, 5).map((event, index) => (
              <article key={event.id} className={index === 0 ? "fresh" : ""}><div className="event-marker" style={{ color: event.accent, borderColor: `${event.accent}40` }}><EventIcon type={event.type} /></div><div><time>{event.tick}</time><h3>{event.title}</h3><p>{event.detail}</p>{index === 0 && <button>Why this happened <ChevronRight size={12} /></button>}</div></article>
            ))}
          </div>
          <div className="autonomy-card"><div><Zap size={15} /><strong>TEAM AUTONOMY</strong><Badge>GUARDED</Badge></div><p>Recruitment, defections, mergers and schisms resolve locally. Viability rules prevent collapse below 8 teams or 10 members.</p><Button variant="outline" onClick={shiftMember}>Resolve next membership vote</Button></div>
        </aside>
      </div>

      {activeView === "people" && (
        <section className="character-inspector">
          <header><div><span className="eyebrow">CHARACTER INSPECTION · LIVE LOADOUT</span><h2>{chosenAgent.name}</h2><p>{chosenAgent.role} · {chosenAgent.team}</p></div><div className="level-medallion"><span>LEVEL</span><strong>17</strong></div></header>
          <div className="combat-profile">
            <div className="portrait-block"><span>{chosenAgent.initials}</span><strong>{chosenAgent.combatRole}</strong><small>Morale {chosenAgent.morale}% · {chosenAgent.injury}</small></div>
            <div className="loadout-grid">
              <article><span>PRIMARY · AI PREFERRED</span><h3>{chosenAgent.weapon}</h3><p>Chosen from personality, doctrine, terrain and past success</p><strong>PROFICIENCY {chosenAgent.skill}</strong><i><b style={{ width: `${chosenAgent.skill}%` }} /></i></article>
              <article><span>ARMOR</span><h3>Riveted mail & gambeson</h3><p>Team access: uncommon · condition 82%</p><strong>PROTECTION 63</strong><i><b style={{ width: "63%" }} /></i></article>
              <article><span>OFF-HAND</span><h3>Oak round shield</h3><p>Favored for narrow roads and holding doctrine</p><strong>MASTERY 74</strong><i><b style={{ width: "74%" }} /></i></article>
            </div>
          </div>
          <div className="combat-details">
            <article><span>EXPERIENCE PROGRESSION</span><strong>{chosenAgent.xp}% to level 18</strong><i><b style={{ width: `${chosenAgent.xp}%` }} /></i><small>+340 XP · defended the eastern passage</small></article>
            <article><span>TRAINING & CONDITION</span><strong>{chosenAgent.training}</strong><p>Injury: {chosenAgent.injury} · readiness adjusted, recovery in 2 cycles</p></article>
            <article><span>WHY THIS LOADOUT?</span><p><b>+36</b> protective personality · <b>+24</b> Meridian holding doctrine · <b>+18</b> confined terrain · <b>+11</b> past success</p></article>
            <article className="physique-card"><span>PHYSIQUE · BALANCED TRADEOFF</span><strong>{chosenAgent.frame}</strong><p>{chosenAgent.physique}</p><small>Training and equipment modify these traits, but never erase frame differences.</small></article>
          </div>
          <div className="battle-outcome"><Swords size={18} /><div><span>RECENT BATTLE OUTCOME · ABSTRACT GAME SIMULATION</span><strong>Passage defense: narrow victory</strong><p>Shield cohesion and terrain affinity overcame inferior equipment access. Maelin gained experience but suffered a temporary morale/injury penalty.</p></div><Badge>NON-INSTRUCTIONAL</Badge><button onClick={resolvePermadeath} disabled={fallen > 0}>{fallen > 0 ? "Outcome resolved" : "Resolve fatal outcome"}</button></div>
          {fallen > 0 && <div className="death-chronicle"><History size={17} /><div><span>HISTORICAL CHRONICLE · PERMANENT</span><strong>Edrin Holt · Meridian councilor · Cycle {cycle}</strong><p>Removed from the active roster and all future decisions. This record and pre-death timeline snapshots are the only remnants. Rewind before Cycle {cycle} to branch a timeline where Edrin still lives.</p></div></div>}
        </section>
      )}

      <div className="timeline-dock">
        <div className="timeline-identity"><GitBranch size={14} /><span>BRANCH</span><strong>{branch}</strong></div>
        <button onClick={rewindTimeline} title="Rewind to major event"><SkipBack size={15} /></button>
        <button onClick={() => setRunning(!running)} className="primary-time" title={running ? "Pause" : "Play"}>{running ? <Pause size={15} /> : <Play size={15} />}</button>
        <button onClick={stepTimeline} title="Step one event"><StepForward size={15} /></button>
        <div className="timeline-now"><span>CYCLE {cycle}</span><strong>{running ? `${speed}× LIVE` : "OUTCOME HELD"}</strong><small title={lastAction}>{lastAction}</small><i /></div>
        <button className="branch-action" onClick={branchTimeline}><GitBranch size={14} /> Branch here</button>
        <button className="compare-action" onClick={() => setTimelineOpen(true)}>Compare</button>
      </div>

      <div className={`timeline-console ${timelineOpen ? "open" : ""}`}>
        <button className="timeline-scrim" onClick={() => setTimelineOpen(false)} aria-label="Close timeline" />
        <section>
          <header><div><span className="eyebrow"><History size={13} /> TEMPORAL ORRERY</span><h2>Edit history without erasing it.</h2><p>Pause before resolution, alter the conditions, then watch a new future diverge.</p></div><button onClick={() => setTimelineOpen(false)}>×</button></header>
          <div className="branch-compare">
            <article className={branch === "Prime" ? "active" : ""}><span>ORIGINAL · PRESERVED</span><h3>Prime</h3><strong>8 teams · 2 wars · 67% pact density</strong><p>Halo Compact ratifies. Meridian opens the eastern passage.</p></article>
            <article className={branch === "Echo-1" ? "active" : ""}><span>ALTERNATE · {branch === "Echo-1" ? "ACTIVE" : "PREVIEW"}</span><h3>Echo-1</h3><strong>8 teams · 3 wars · 51% pact density</strong><p>Secret orders surface before the vote. Ash Covenant mobilizes.</p></article>
          </div>
          <div className="timeline-track">
            {[
              ["38", "Secret intercepted", "MAJOR"], ["40", "Schism vote", "HELD"], ["43", "Halo Compact", "MAJOR"], ["44", "Passage opens", "PENDING"],
            ].map(([tick, title, state], index) => <button key={tick} className={index === 2 ? "active" : ""} onClick={() => { setCycle(Number(tick)); setRunning(false); }}><i /><span>CYCLE {tick} · {state}</span><strong>{title}</strong><small>{index < 2 ? "Resolved" : index === 2 ? "Branch point" : "Unresolved"}</small></button>)}
          </div>
          <div className="event-editor">
            <div><span>OUTCOME HELD FOR INTERVENTION</span><h3>The Halo Compact ratification</h3><p>Resolution has not been committed. Edit the event or change its inputs before agents respond.</p></div>
            <div className="editor-actions"><button onClick={() => setLastAction("Event edited before resolution")}>Edit event</button><button onClick={() => setLastAction("Pending event cancelled")}>Cancel</button><button onClick={() => setLastAction("Event replaced with emergency summit")}>Replace</button><button onClick={stepTimeline} className="resolve">Trigger now</button></div>
          </div>
          <div className="consequence-compare">
            <span><b>PRIME</b> Alliance stability +18 · rebellion risk 12% · war risk 31%</span>
            <i>VERSUS</i>
            <span><b>ECHO-1</b> Alliance stability −9 · rebellion risk 41% · war risk 63%</span>
          </div>
        </section>
      </div>

      <div className={`control-drawer ${controlOpen ? "open" : ""}`}>
        <button className="drawer-scrim" onClick={() => setControlOpen(false)} aria-label="Close controls" />
        <aside>
          <div className="drawer-header"><div><span className="eyebrow"><Eye size={13} /> OVERSEER LENS</span><h2>Rewrite the balance of power.</h2><p>From a quiet doubt to an undeniable act. Characters still interpret, resist, and retaliate.</p></div><button onClick={() => setControlOpen(false)}>×</button></div>
          <div className="intensity-control">
            <div className="section-title"><span>INTERVENTION FORCE</span><small>Autonomy resistance: {interventionStrength === "Whisper" ? "82%" : interventionStrength === "Pressure" ? "34%" : "8%"}</small></div>
            <div>{(["Whisper", "Pressure", "Override"] as const).map((level) => <button key={level} onClick={() => setInterventionStrength(level)} className={interventionStrength === level ? "active" : ""}><strong>{level}</strong><small>{level === "Whisper" ? "Nudge" : level === "Pressure" ? "Compel" : "Overwhelm"}</small></button>)}</div>
          </div>
          <div className="agent-picker">
            {agents.map((agent, index) => <button onClick={() => { setSelectedAgent(index); setValues({ loyalty: agent.loyalty, belief: agent.belief, fear: agent.fear, ambition: agent.ambition, relation: agent.relation }); }} className={selectedAgent === index ? "active" : ""} key={agent.name}><span>{agent.initials}</span><div><strong>{agent.name}</strong><small>{agent.role} · {agent.team}</small></div></button>)}
          </div>
          <div className="control-section">
            <div className="section-title"><span>INNER COMPASS</span><small>Changes become context, not commands</small></div>
            {([["loyalty", "Loyalty", Shield], ["belief", "Ideological conviction", Flame], ["fear", "Fear", ShieldAlert], ["ambition", "Ambition", Crown], ["relation", "Trust in Iria Sable", Handshake]] as const).map(([key, label, Icon]) => (
              <label className="slider-row" key={key}><span><Icon size={14} /> {label}<b>{values[key]}</b></span><Slider value={[values[key]]} onValueChange={(value) => setValues((old) => ({ ...old, [key]: Array.isArray(value) ? value[0] : value }))} /></label>
            ))}
          </div>
          <div className="control-section">
            <div className="section-title"><span>MEMORY & INFORMATION</span><small>Plant, reveal, suppress, or restore</small></div>
            <div className="lever-grid">{[["Plant a memory", MemoryStick], ["Reveal hidden orders", Eye], ["Suppress a fact", Database], ["Expose a secret", Sparkles]].map(([label, Icon]) => <button key={label as string} className={selectedLever === label ? "active" : ""} onClick={() => setSelectedLever(label as string)}><Icon size={13} />{label as string}</button>)}</div>
          </div>
          <div className="control-section">
            <div className="section-title"><span>POWER & MEMBERSHIP</span><small>Direct control · viability enforced</small></div>
            <div className="lever-grid">{[["Change team", Users], ["Install leader", Crown], ["Alter relationship", Network], ["Transfer territory", Map], ["Grant resources", Database], ["Shift military strength", Swords]].map(([label, Icon]) => <button key={label as string} className={selectedLever === label ? "active" : ""} onClick={() => setSelectedLever(label as string)}><Icon size={13} />{label as string}</button>)}</div>
          </div>
          <div className="control-section"><div className="section-title"><span>WORLD EVENTS</span><small>Changes cascade through every system</small></div><div className="lever-grid">{["Resource shock", "Secret exposed", "Call a summit", "Spark uprising", "Redraw border", "Declare ceasefire"].map((event) => <button key={event} className={selectedLever === event ? "active" : ""} onClick={() => { setSelectedLever(event); triggerWorldEvent(event); }}><Sparkles size={13} />{event}</button>)}</div></div>
          <div className="cascade-preview">
            <div className="cascade-head"><Gauge size={17} /><div><span>LIKELY CONSEQUENCES</span><strong>{selectedLever} · {interventionStrength}</strong></div><b>LIVE MODEL</b></div>
            <div className="cascade-path">
              <span><i>1</i><strong>Interpretation</strong><small>{interventionStrength === "Override" ? "Complies under duress" : "Tests against beliefs"}</small></span>
              <em>→</em><span><i>2</i><strong>Resistance</strong><small>{interventionStrength === "Whisper" ? "High · may ignore" : "Visible backlash"}</small></span>
              <em>→</em><span><i>3</i><strong>Cascade</strong><small>Alliance → rebellion → war</small></span>
            </div>
            <p>Forecast: Meridian cohesion <b>−12</b> · Ash hostility <b>+19</b> · rebellion risk <b>41%</b> · war risk <b>63%</b></p>
          </div>
          <Button className={`commit-button ${interventionStrength === "Override" ? "danger" : ""}`} onClick={commitIntervention}>Apply {interventionStrength.toLowerCase()} intervention <FastForward size={15} /></Button>
        </aside>
      </div>
    </main>
  );
}
