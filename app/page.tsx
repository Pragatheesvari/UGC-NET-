"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { QS } from "../data/questions";
import type { Q } from "../data/types";

type IconName =
  | "grid"
  | "book"
  | "target"
  | "file"
  | "chart"
  | "search"
  | "bell"
  | "arrow"
  | "check"
  | "clock"
  | "spark"
  | "play"
  | "menu"
  | "close";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, string> = {
    grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
    book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z",
    target:
      "M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z M12 18a6 6 0 1 0-6-6 6 6 0 0 0 6 6Z M12 14a2 2 0 1 0-2-2 2 2 0 0 0 2 2Z",
    file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M8 13h8 M8 17h8",
    chart: "M3 3v18h18 M18 17V9 M13 17V5 M8 17v-3",
    search: "m21 21-4.34-4.34 M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0Z",
    bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4",
    arrow: "M7 17 17 7 M7 7h10v10",
    check: "m5 12 4 4L19 6",
    clock: "M12 8v4l3 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
    spark: "m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z M19 14l1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z",
    play: "m8 5 12 7-12 7V5Z",
    menu: "M4 6h16M4 12h16M4 18h16",
    close: "m18 6-12 12M6 6l12 12",
  };

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[name]} />
    </svg>
  );
}

const UNITS: Record<1 | 2, string[]> = {
  1: ["Teaching Aptitude", "Research Aptitude", "Comprehension", "Communication", "Mathematical Reasoning and Aptitude", "Logical Reasoning", "Data Interpretation", "Information and Communication Technology (ICT)", "People, Development and Environment", "Higher Education System"],
  2: ["Discrete Structures and Optimization", "Computer System Architecture", "Programming Languages and Computer Graphics", "Database Management Systems", "System Software and Operating System", "Software Engineering", "Data Structures and Algorithms", "Theory of Computation and Compilers", "Data Communication and Computer Networks", "Artificial Intelligence"],
};

// Topic outline per unit (summarised from the UGC NET syllabus; verify against the official PDF)
const SYL: Record<1 | 2, string[][]> = {
  1: [
    ["Teaching: concept, objectives, levels (memory, understanding, reflective)", "Characteristics and basic requirements", "Learner's characteristics", "Factors affecting teaching", "Methods of teaching", "Teaching aids", "Evaluation systems"],
    ["Research: meaning, types, characteristics", "Positivism and post-positivistic approach", "Experimental, descriptive, historical, qualitative, quantitative methods", "Steps of research", "Thesis and article writing", "Application of ICT in research", "Research ethics"],
    ["A passage of text followed by questions"],
    ["Meaning, types, characteristics", "Verbal, non-verbal, inter-cultural, group and classroom communication", "Barriers to effective communication", "Mass media and society"],
    ["Types of reasoning", "Number series, letter series, codes and relationships", "Fractions, time and distance, ratio, proportion, percentage", "Profit and loss, interest and discounting, averages"],
    ["Structure of arguments", "Deductive and inductive reasoning", "Verbal analogies and classification", "Logical diagrams and Venn diagrams", "Analytical reasoning"],
    ["Sources, acquisition and classification of data", "Quantitative and qualitative data", "Bar, histogram, pie, table and line charts", "Data interpretation", "Data and governance"],
    ["Abbreviations and terminology", "Internet, intranet, e-mail, audio and video conferencing", "Digital initiatives in higher education", "ICT and governance"],
    ["Millennium and Sustainable Development Goals", "Human and environment interaction", "Local, regional and global environmental issues", "Pollution, global warming, ozone depletion, acid rain", "Natural hazards and disasters", "Climate change and international agreements", "Environmental protection and policies", "Energy resources"],
    ["Higher learning in ancient India", "Post-independence higher education and research", "Oriental, conventional and non-conventional programmes", "Professional, technical and skill-based education", "Value and environmental education", "Policies, governance and administration"],
  ],
  2: [
    ["Sets, relations, functions", "Propositional and predicate logic", "Graph theory and combinatorics", "Boolean algebra", "Linear programming and optimization"],
    ["Digital logic and number systems", "Processor design, instruction sets, pipelining", "Memory hierarchy and cache", "I/O organization", "Parallel architectures"],
    ["Programming paradigms and OOP", "Parameter passing, scope, binding", "Graphics: line and circle drawing, clipping, transformations"],
    ["ER and relational models, relational algebra", "SQL", "Normalization", "Transactions, concurrency, recovery", "Indexing"],
    ["Process management and scheduling", "Synchronization and deadlocks", "Memory management and virtual memory", "File systems", "Assemblers, loaders, linkers"],
    ["Process models", "Requirements and design", "Testing and metrics", "Project management and quality"],
    ["Arrays, stacks, queues, trees, graphs", "Sorting and searching", "Complexity analysis", "Greedy, dynamic programming, divide and conquer"],
    ["Finite automata and regular languages", "Context-free grammars and pushdown automata", "Turing machines and decidability", "Lexical analysis, parsing, code generation"],
    ["OSI and TCP/IP layers", "Error and flow control", "IP addressing and routing", "Transport and application protocols", "Network security"],
    ["Search strategies", "Knowledge representation and logic", "Machine learning basics", "Neural networks and NLP"],
  ],
};

const initialTasks = [
  { title: "Revise learner characteristics", detail: "Teaching Aptitude", duration: "25 min" },
  { title: "Study sampling methods", detail: "Research Aptitude", duration: "35 min" },
  { title: "Solve 10 practice questions", detail: "Paper 1", duration: "20 min" },
];

function shuffleQuestions(questions: Q[]): Q[] {
  const shuffled = [...questions];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return "Unexpected Supabase error.";
}

const navItems: { label: string; href: string; icon: IconName }[] = [
  { label: "Overview", href: "#overview", icon: "grid" },
  { label: "Study plan", href: "#study-plan", icon: "target" },
  { label: "Subjects", href: "#subjects", icon: "book" },
  { label: "Practice", href: "#practice", icon: "chart" },
  { label: "My notes", href: "#notes", icon: "file" },
];

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const [paper, setPaper] = useState<1 | 2>(1);
  const [unit, setUnit] = useState(-1);
  const [questionOrder, setQuestionOrder] = useState<Q[] | null>(null);
  const [qi, setQi] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [tally, setTally] = useState<Record<string, [number, number]>>({});
  const [user, setUser] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [progressLoadedFor, setProgressLoadedFor] = useState<string | null>(null);
  const [progressStatus, setProgressStatus] = useState<
    "idle" | "loading" | "saving" | "saved" | "error"
  >("idle");
  const [progressError, setProgressError] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setQuestionOrder(shuffleQuestions(QS.filter((question) => question[0] === 1)));
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const sb = supabase;
    if (!sb) return;
    let active = true;
    const updateIdentity = (session: Session | null) => {
      if (!active) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser?.email ?? null);
      setUserId(currentUser?.id ?? null);
      setProgressLoadedFor(null);
      setProgressError("");
      if (!currentUser) {
        setTally({});
        setCompletedTasks([]);
        setProgressStatus("idle");
      }
    };

    sb.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setProgressError(error.message);
        setProgressStatus("error");
        return;
      }
      updateIdentity(data.session);
    }).catch(() => {
      if (active) {
        setProgressError("Could not read the current Supabase session.");
        setProgressStatus("error");
      }
    });
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      updateIdentity(session);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const sb = supabase;
    if (!sb) return;
    let active = true;

    if (!userId) return;

    const loadProgress = async () => {
      setProgressStatus("loading");
      setProgressError("");
      try {
        const { data, error } = await sb
          .from("progress")
          .select("tally, completed_tasks")
          .eq("user_id", userId)
          .maybeSingle();
        if (error) throw error;
        if (!active) return;

        setTally((data?.tally ?? {}) as Record<string, [number, number]>);
        const savedTasks = data?.completed_tasks;
        setCompletedTasks(
          Array.isArray(savedTasks)
            ? savedTasks.filter(
                (index): index is number =>
                  Number.isInteger(index) && index >= 0 && index < initialTasks.length,
              )
            : [],
        );
        setProgressLoadedFor(userId);
        setProgressError("");
        setProgressStatus("saved");
      } catch (error) {
        if (active) {
          setProgressError(getErrorMessage(error));
          setProgressStatus("error");
        }
      }
    };
    void loadProgress();

    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    const sb = supabase;
    if (!sb || !userId || progressLoadedFor !== userId) return;

    let active = true;
    const savedTally = tally;
    const savedTasks = completedTasks;
    const timeout = window.setTimeout(async () => {
      if (active) setProgressStatus("saving");
      try {
        const { error } = await sb.from("progress").upsert({
          user_id: userId,
          tally: savedTally,
          completed_tasks: savedTasks,
          updated_at: new Date().toISOString(),
        });
        if (error) throw error;
        if (active) setProgressStatus("saved");
      } catch (error) {
        if (active) {
          setProgressError(getErrorMessage(error));
          setProgressStatus("error");
        }
      }
    }, 350);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [completedTasks, progressLoadedFor, tally, userId]);

  const qs = (questionOrder ?? QS).filter(
    (x) => x[0] === paper && (unit < 0 || x[1] === unit),
  );
  const cur = qs[qi];
  const start = (p: 1 | 2, u: number) => {
    setQuestionOrder(shuffleQuestions(QS.filter((question) => question[0] === p && (u < 0 || question[1] === u))));
    setPaper(p); setUnit(u); setQi(0); setSel(null); setScore(0); setDone(false);
  };
  const pick = (i: number) => {
    if (sel !== null || !cur) return;
    const ok = i === cur[4];
    setSel(i);
    if (ok) setScore((v) => v + 1);
    const k = `${paper}-${cur[1]}`;
    setTally((t) => {
      const [c, n] = t[k] ?? [0, 0];
      return { ...t, [k]: [c + (ok ? 1 : 0), n + 1] };
    });
  };
  const next = () => {
    if (qi + 1 >= qs.length) setDone(true);
    else { setQi(qi + 1); setSel(null); }
  };

  const subjects = UNITS[paper].map((name, i) => {
    const n = QS.filter((x) => x[0] === paper && x[1] === i).length;
    const [c, t] = tally[`${paper}-${i}`] ?? [0, 0];
    return {
      i, name,
      description: `${n}${paper === 1 ? " / 100" : ""} questions`,
      progress: t ? Math.round((c / t) * 100) : 0,
      lessons: `${t} attempted`,
      color: ["lavender", "peach", "blue", "mint"][i % 4],
      initials: name.split(/[ ,&]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase(),
    };
  });
  const filteredSubjects = subjects.filter((x) => x.name.toLowerCase().includes(query.trim().toLowerCase()));

  const toggleTask = (index: number) => {
    setCompletedTasks((current) =>
      current.includes(index)
        ? current.filter((taskIndex) => taskIndex !== index)
        : [...current, index],
    );
  };

  const progress = Math.round((completedTasks.length / initialTasks.length) * 100);

  return (
    <div className="app-shell" id="overview">
      <aside className={`sidebar${menuOpen ? " sidebar-open" : ""}`}>
        <a className="brand" href="#overview" aria-label="NET Mastery Hub home">
          <span className="brand-mark">N</span>
          <span className="brand-name">NETmaster<span>.</span></span>
        </a>

        <div className="sidebar-label">YOUR SPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {navItems.map((item, index) => (
            <a
              className={`nav-link${index === 0 ? " nav-link-active" : ""}`}
              href={item.href}
              key={item.label}
              onClick={() => setMenuOpen(false)}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
              {item.label === "Study plan" && <span className="nav-dot" />}
            </a>
          ))}
        </nav>

        <div className="sidebar-spacer" />
        <div className="streak-card">
          <div className="streak-icon"><Icon name="spark" size={19} /></div>
          <p className="streak-title">You&apos;re on a roll!</p>
          <p className="streak-copy">You&apos;ve studied 5 days in a row. Keep it up.</p>
          <div className="streak-days" aria-label="Five day study streak">
            {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
              <span className={index < 5 ? "streak-day streak-day-done" : "streak-day"} key={`${day}-${index}`}>
                {index < 5 ? <Icon name="check" size={12} /> : day}
              </span>
            ))}
          </div>
        </div>
        <div className="profile">
          <div className="avatar">{(user ?? "G")[0].toUpperCase()}</div>
          <div className="profile-text">
            <strong>{user ?? "Guest"}</strong>
            <span aria-live="polite">
              {!user
                ? "Not signed in"
                : progressStatus === "loading"
                  ? "Loading your progress..."
                  : progressStatus === "saving"
                    ? "Saving progress..."
                    : progressStatus === "error"
                      ? `Progress sync failed: ${progressError}`
                      : "Progress saved"}
            </span>
          </div>
          <button className="profile-more" aria-label={user ? "Sign out" : "Sign in"} onClick={() => (user ? supabase?.auth.signOut() : router.push("/login"))}>{user ? "Sign out" : "Sign in"}</button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            className="mobile-menu icon-button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon name={menuOpen ? "close" : "menu"} />
          </button>
          <div className="breadcrumb">My learning <span>/</span> <strong>Overview</strong></div>
          <div className="topbar-actions">
            <label className="search-box">
              <Icon name="search" size={18} />
              <input
                type="search"
                placeholder="Search subjects..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search subjects"
              />
              <kbd>/</kbd>
            </label>
            <button className="icon-button notification-button" aria-label="Notifications">
              <Icon name="bell" size={19} />
              <span className="notification-dot" />
            </button>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <p className="eyebrow">YOUR STUDY SPACE</p>
              <h1>Welcome back <span className="wave">✦</span></h1>
              <p className="welcome-subtitle">A little progress each day adds up to big results.</p>
            </div>
            <a className="button button-outline" href="#study-plan">
              <Icon name="target" size={17} /> View study plan
            </a>
          </section>

          <section className="hero-card" aria-label="Your exam preparation">
            <div className="hero-content">
              <span className="hero-kicker"><span className="hero-kicker-dot" /> YOUR UGC NET JOURNEY</span>
              <h2>Every session brings<br />you closer to <em>your goal.</em></h2>
              <p>Stay consistent, trust your preparation, and take it one topic at a time.</p>
              <a className="button button-light" href="#study-plan">
                Continue learning <Icon name="arrow" size={17} />
              </a>
            </div>
            <div className="hero-art" aria-hidden="true">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <div className="hero-sun" />
              <div className="hero-book">
                <div className="book-page book-page-left"><span /><span /><span /><span /></div>
                <div className="book-page book-page-right"><span /><span /><span /><span /></div>
              </div>
              <div className="floating-star star-one">✦</div>
              <div className="floating-star star-two">✧</div>
              <div className="hero-art-caption">ONE DAY AT A TIME</div>
            </div>
          </section>

          <section className="stats-grid" aria-label="Study statistics">
            <article className="stat-card">
              <div className="stat-icon stat-icon-lavender"><Icon name="clock" size={19} /></div>
              <div className="stat-value">12.5<span> hrs</span></div>
              <div className="stat-label">Study time this week</div>
              <div className="stat-foot"><span className="stat-up">↑ 18%</span> vs last week</div>
            </article>
            <article className="stat-card">
              <div className="stat-icon stat-icon-peach"><Icon name="book" size={19} /></div>
              <div className="stat-value">31<span> / 66</span></div>
              <div className="stat-label">Topics completed</div>
              <div className="mini-progress"><span style={{ width: "47%" }} /></div>
            </article>
            <article className="stat-card">
              <div className="stat-icon stat-icon-mint"><Icon name="chart" size={19} /></div>
              <div className="stat-value">78<span>%</span></div>
              <div className="stat-label">Practice accuracy</div>
              <div className="stat-foot"><span className="stat-up">↑ 6%</span> this month</div>
            </article>
            <article className="stat-card">
              <div className="stat-icon stat-icon-blue"><Icon name="spark" size={19} /></div>
              <div className="stat-value">5<span> days</span></div>
              <div className="stat-label">Current study streak</div>
              <div className="stat-foot">Your best is <strong>12 days</strong></div>
            </article>
          </section>

          <div className="dashboard-grid">
            <section className="panel study-panel" id="study-plan">
              <div className="panel-heading">
                <div>
                  <p className="section-eyebrow">YOUR PLAN FOR TODAY</p>
                  <h2>Daily study plan</h2>
                </div>
                <span className="date-pill">3 tasks</span>
              </div>
              <div className="daily-progress">
                <div className="daily-progress-label">
                  <span>{completedTasks.length} of {initialTasks.length} completed</span>
                  <strong>{progress}%</strong>
                </div>
                <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
              </div>
              <div className="task-list">
                {initialTasks.map((task, index) => {
                  const isComplete = completedTasks.includes(index);
                  return (
                    <button
                      className={`task-row${isComplete ? " task-complete" : ""}`}
                      key={task.title}
                      onClick={() => toggleTask(index)}
                      aria-pressed={isComplete}
                    >
                      <span className="task-check">{isComplete && <Icon name="check" size={14} />}</span>
                      <span className="task-copy">
                        <strong>{task.title}</strong>
                        <span>{task.detail}</span>
                      </span>
                      <span className="task-time"><Icon name="clock" size={14} /> {task.duration}</span>
                    </button>
                  );
                })}
              </div>
              <a className="text-link" href="#subjects">Explore all subjects <Icon name="arrow" size={15} /></a>
            </section>

            <section className="panel focus-panel">
              <div className="panel-heading">
                <div>
                  <p className="section-eyebrow">PICK UP WHERE YOU LEFT OFF</p>
                  <h2>Your next step</h2>
                </div>
                <span className="focus-icon"><Icon name="play" size={17} /></span>
              </div>
              <div className="focus-illustration">
                <div className="focus-book"><span /><span /><span /></div>
                <span className="focus-spark focus-spark-a">✦</span>
                <span className="focus-spark focus-spark-b">✧</span>
              </div>
              <div className="focus-meta"><span>TEACHING APTITUDE</span><span>LESSON 13 OF 18</span></div>
              <h3>Methods of Teaching</h3>
              <p>Explore learner-centered approaches and classroom strategies.</p>
              <div className="focus-progress"><span style={{ width: "68%" }} /></div>
              <a href="#subjects" className="button button-dark">Resume lesson <Icon name="arrow" size={16} /></a>
            </section>
          </div>

          <section className="subjects-section" id="subjects">
            <div className="section-header">
              <div>
                <p className="section-eyebrow">BUILD YOUR FOUNDATION</p>
                <h2>Explore units · Paper {paper}</h2>
                <p className="mt-1 text-xs text-[#78817e]">{paper === 1 ? "50 questions · 100 marks · no negative marking" : "100 questions · 200 marks"}</p>
              </div>
              <div className="flex gap-2">
                {([1, 2] as const).map((p) => (
                  <button key={p} onClick={() => start(p, -1)} className={`rounded-full border px-4 py-1.5 font-semibold ${paper === p ? "bg-[#245c4b] text-white" : "bg-white"}`}>
                    Paper {p}
                  </button>
                ))}
              </div>
            </div>
            {filteredSubjects.length > 0 ? (
              <div className="subject-grid">
                {filteredSubjects.map((subject) => (
                  <a className="subject-card" href="#practice" onClick={() => start(paper, subject.i)} key={subject.name}>
                    <div className={`subject-symbol ${subject.color}`}>{subject.initials}</div>
                    <div className="subject-card-title">
                      <h3>{subject.name}</h3>
                      <Icon name="arrow" size={16} />
                    </div>
                    <p>{subject.description}</p>
                    <div className="subject-progress-label"><span>{subject.lessons}</span><strong>{subject.progress}%</strong></div>
                    <div className="progress-track subject-track"><span style={{ width: `${subject.progress}%` }} /></div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="empty-search">
                <Icon name="search" size={22} />
                <p>No subjects found for <strong>&ldquo;{query}&rdquo;</strong></p>
                <button onClick={() => setQuery("")}>Clear search</button>
              </div>
            )}
          </section>

          <section className="panel" id="practice">
            <div className="panel-heading">
              <div>
                <p className="section-eyebrow">PRACTICE ZONE · {paper === 1 ? "PAPER 1" : "PAPER 2 · COMPUTER SCIENCE"}</p>
                <h2>{unit < 0 ? "All units" : UNITS[paper][unit]}</h2>
              </div>
              <span className="date-pill">{qs.length} questions</span>
            </div>
            {unit >= 0 && (
              <ul className="mb-4 flex flex-wrap gap-2">
                {SYL[paper][unit].map((t) => (
                  <li key={t} className="rounded-full bg-[#eaf3ed] px-3 py-1 text-xs text-[#245c4b]">{t}</li>
                ))}
              </ul>
            )}
            {done || !cur ? (
              <div className="py-6 text-center">
                <p className="text-3xl font-bold">{score} / {qs.length}</p>
                <p className="text-[#78817e]">{qs.length ? `${Math.round((score / qs.length) * 100)}% accuracy` : "No questions yet"}</p>
                <button className="button button-dark mt-4" onClick={() => start(paper, unit)}>Try again</button>
              </div>
            ) : (
              <div>
                <p className="mb-1 text-xs text-[#78817e]">Question {qi + 1} of {qs.length} · {UNITS[paper][cur[1]]}</p>
                {cur[5] && (
                  <div className="mb-3 rounded-xl bg-[#f4f1ea] p-4 text-sm leading-relaxed">
                    <p className="mb-1 text-xs font-semibold uppercase text-[#78817e]">Read the passage and answer</p>
                    {cur[5]}
                  </div>
                )}
                <h3 className="mb-3 text-base font-semibold">{cur[2]}</h3>
                <div className="grid gap-2">
                  {cur[3].map((o, i) => {
                    const right = sel !== null && i === cur[4];
                    const wrong = sel === i && i !== cur[4];
                    return (
                      <button key={o} onClick={() => pick(i)} className={`rounded-xl border px-4 py-3 text-left ${right ? "border-green-600 bg-green-50" : wrong ? "border-red-500 bg-red-50" : "bg-white"}`}>
                        {String.fromCharCode(65 + i)}. {o}
                      </button>
                    );
                  })}
                </div>
                {sel !== null && <button className="button button-dark mt-4" onClick={next}>{qi + 1 >= qs.length ? "Finish" : "Next question"}</button>}
              </div>
            )}
            {unit >= 0 && <button className="text-link mt-4" onClick={() => start(paper, -1)}>Practise all units</button>}
          </section>

          <section className="bottom-grid">
            <article className="bottom-card practice-card">
              <div className="bottom-card-icon"><Icon name="target" size={19} /></div>
              <div>
                <p className="section-eyebrow">A QUICK CHALLENGE</p>
                <h2>Ready for a practice break?</h2>
                <p>Take a mixed quiz across every unit of the paper you are studying.</p>
                <a className="text-link" href="#practice" onClick={() => start(paper, -1)}>Start a practice session <Icon name="arrow" size={15} /></a>
              </div>
              <div className="quiz-badge">10<span>Q</span></div>
            </article>
            <article className="bottom-card notes-card" id="notes">
              <div className="bottom-card-icon notes-icon"><Icon name="file" size={19} /></div>
              <div>
                <p className="section-eyebrow">QUICK REVISION</p>
                <h2>Your notes, all in one place</h2>
                <p>Revisit your key takeaways from Teaching Aptitude.</p>
                <a className="text-link" href="#study-plan">Review recent notes <Icon name="arrow" size={15} /></a>
              </div>
              <div className="note-preview" aria-hidden="true"><span /><span /><span /></div>
            </article>
          </section>
          <footer className="page-footer">Units follow the UGC NET syllabus (NTA); verify topics at ugcnet.nta.ac.in. Questions are original practice items, not actual past papers. Streaks and weekly stats are sample content.</footer>
        </div>
      </main>
      {menuOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    </div>
  );
}
