import { useState, useCallback, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import {
  RotateCcw, FlipHorizontal, Copy,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Zap, Brain,
} from 'lucide-react';
import { PageHeader, SectionLabel } from '@/components/ui';

interface EvalLine { score: string; moves: string; depth: number }

const SAMPLE_PGNS = [
  {
    label: 'Immortal Game',
    pgn: '1.e4 e5 2.f4 exf4 3.Bc4 Qh4+ 4.Kf1 b5 5.Bxb5 Nf6 6.Nf3 Qh6 7.d3 Nh5 8.Nh4 Qg5 9.Nf5 c6 10.g4 Nf6 11.Rg1 cxb5 12.h4 Qg6 13.h5 Qg5 14.Qf3 Ng8 15.Bxf4 Qf6 16.Nc3 Bc5 17.Nd5 Qxb2 18.Bd6 Bxg1 19.e5 Qxa1+ 20.Ke2 Na6 21.Nxg7+ Kd8 22.Qf6+ Nxf6 23.Be7#',
  },
  {
    label: 'Opera Game',
    pgn: '1.e4 e5 2.Nf3 d6 3.d4 Bg4 4.dxe5 Bxf3 5.Qxf3 dxe5 6.Bc4 Nf6 7.Qb3 Qe7 8.Nc3 c6 9.Bg5 b5 10.Nxb5 cxb5 11.Bxb5+ Nbd7 12.O-O-O Rd8 13.Rxd7 Rxd7 14.Rd1 Qe6 15.Bxd7+ Nxd7 16.Qb8+ Nxb8 17.Rd8#',
  },
];

// ─── BOARD SIZE ────────────────────────────────────────────────────────────────
// Fixed size so the board NEVER changes when moves / banners appear or disappear.
const BOARD_PX = 400;

// ─── STOCKFISH HOOK ────────────────────────────────────────────────────────────
function useStockfish() {
  const workerRef   = useRef<Worker | null>(null);
  const callbackRef = useRef<((msg: string) => void) | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let worker: Worker;
    try {
      const blob = new Blob(
        [`importScripts('https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js');`],
        { type: 'application/javascript' },
      );
      const url = URL.createObjectURL(blob);
      worker = new Worker(url);

      worker.onmessage = (e) => {
        const msg: string = e.data;
        if (msg === 'uciok') {
          worker.postMessage('setoption name MultiPV value 3');
          worker.postMessage('isready');
        }
        if (msg === 'readyok') setReady(true);
        callbackRef.current?.(msg);
      };
      worker.onerror = () => setReady(false);
      worker.postMessage('uci');
      workerRef.current = worker;

      return () => { worker.terminate(); URL.revokeObjectURL(url); };
    } catch {
      setReady(false);
    }
  }, []);

  const analyze = useCallback(
    (fen: string, depth: number, onData: (msg: string) => void) => {
      if (!workerRef.current) return;
      callbackRef.current = onData;
      workerRef.current.postMessage('stop');
      workerRef.current.postMessage(`position fen ${fen}`);
      workerRef.current.postMessage(`go depth ${depth}`);
    },
    [],
  );

  const stop = useCallback(() => workerRef.current?.postMessage('stop'), []);
  return { ready, analyze, stop };
}

// ─── UCI PARSER ────────────────────────────────────────────────────────────────
// FIX: Stockfish "score cp" is ALWAYS relative to the side to move.
// Positive = good for the side to move, NOT necessarily good for White.
// We normalise so that positive = good for White (standard display convention).
function parseInfo(line: string, turn: 'w' | 'b'): {
  score: string; moves: string; depth: number; pvIndex: number
} | null {
  if (!line.startsWith('info') || !line.includes(' pv ')) return null;

  const depthM   = line.match(/\bdepth (\d+)/);
  const pvIdxM   = line.match(/\bmultipv (\d+)/);
  const pvM      = line.match(/ pv (.+)/);
  const cpM      = line.match(/\bscore cp (-?\d+)/);
  const mateM    = line.match(/\bscore mate (-?\d+)/);

  if (!depthM || !pvM) return null;

  const depth   = parseInt(depthM[1]);
  const pvIndex = pvIdxM ? parseInt(pvIdxM[1]) : 1;
  const uciMoves = pvM[1].trim().split(/\s+/).slice(0, 6).join(' ');

  let score = '+0.0';
  if (mateM) {
    // Mate score: positive means the side to move is mating
    const raw  = parseInt(mateM[1]);
    const forWhite = turn === 'w' ? raw : -raw;
    score = forWhite > 0 ? `+M${forWhite}` : `-M${Math.abs(forWhite)}`;
  } else if (cpM) {
    // Centipawn: normalise to White's perspective
    const raw  = parseInt(cpM[1]);
    const norm = turn === 'w' ? raw : -raw;
    const pawn = (norm / 100).toFixed(1);
    score = norm >= 0 ? `+${pawn}` : `${pawn}`;
  }

  return { score, moves: uciMoves, depth, pvIndex };
}

// ─── FALLBACK (heuristic) ───────────────────────────────────────────────────
function heuristicEval(game: Chess): EvalLine[] {
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return [{ score: game.isCheckmate() ? '-M0' : '=', moves: '', depth: 0 }];

  const vals: Record<string, number> = { p:1, n:3, b:3.2, r:5, q:9, k:0 };
  let mat = 0;
  for (const row of game.board())
    for (const sq of row)
      if (sq) mat += vals[sq.type] * (sq.color === 'w' ? 1 : -1);

  const scoreStr = mat >= 0 ? `+${mat.toFixed(1)}` : `${mat.toFixed(1)}`;

  const checks = moves.filter(m => m.san.includes('+') || m.san.includes('#'));
  const caps   = moves.filter(m => m.captured);
  const rest   = moves.filter(m => !m.captured && !m.san.includes('+'));
  const top3   = [...checks, ...caps, ...rest].slice(0, 3);

  return top3.map((m, i) => ({
    score: i === 0 ? scoreStr : (mat - i * 0.3).toFixed(1),
    moves: m.from + m.to + (m.promotion ?? ''),
    depth: 1,
  }));
}

// ─── SCORE → EVAL BAR % (White's perspective: 100% = White winning) ──────────
function scoreToPercent(score: string): number {
  if (score.startsWith('+M')) return 95;
  if (score.startsWith('-M')) return 5;
  const v = parseFloat(score);
  if (isNaN(v)) return 50;
  return Math.max(5, Math.min(95, 50 + v * 7));
}

// ─── COMPONENT ─────────────────────────────────────────────────────────────────
export default function AnalysisPage() {
  const [game, setGame]           = useState(() => new Chess());
  const [fen, setFen]             = useState(() => new Chess().fen());
  const [posHistory, setPosHistory]     = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [orientation, setOrientation]   = useState<'white' | 'black'>('white');
  const [pgnInput, setPgnInput]   = useState('');
  const [fenInput, setFenInput]   = useState('');
  const [depth, setDepth]         = useState(16);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentDepth, setCurrentDepth] = useState(0);
  const [evalLines, setEvalLines] = useState<EvalLine[]>([]);
  const [evalPercent, setEvalPercent]   = useState(50);
  const [bestArrow, setBestArrow]       = useState<any[]>([]);
  const [sqStyles, setSqStyles]         = useState<Record<string, React.CSSProperties>>({});
  const [usingFallback, setUsingFallback] = useState(false);

  const { ready: sfReady, analyze, stop } = useStockfish();
  const linesRef  = useRef<Record<number, EvalLine>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Trigger analysis ─────────────────────────────────────────────────────
  const triggerAnalysis = useCallback(
    (currentFen: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      // Show heuristic instantly while engine spins up / as fallback
      try {
        const g = new Chess(currentFen);
        if (!g.isGameOver()) {
          const fb = heuristicEval(g);
          setEvalLines(fb);
          if (fb[0]) {
            setEvalPercent(scoreToPercent(fb[0].score));
            applyBestMove(fb[0].moves.split(' ')[0]);
          }
        }
      } catch { /* ignore */ }

      if (!sfReady) { setUsingFallback(true); return; }
      setUsingFallback(false);
      setIsAnalyzing(true);
      setCurrentDepth(0);
      linesRef.current = {};

      debounceRef.current = setTimeout(() => {
        const turn = new Chess(currentFen).turn();
        analyze(currentFen, depth, (msg) => {
          const parsed = parseInfo(msg, turn);
          if (parsed && parsed.depth > 0) {
            setCurrentDepth(parsed.depth);
            linesRef.current[parsed.pvIndex] = parsed;
            const lines = ([1, 2, 3] as const)
              .map(i => linesRef.current[i])
              .filter(Boolean) as EvalLine[];
            if (lines.length) {
              setEvalLines(lines);
              setEvalPercent(scoreToPercent(lines[0].score));
              applyBestMove(lines[0].moves.split(' ')[0]);
            }
          }
          if (msg.startsWith('bestmove')) setIsAnalyzing(false);
        });
      }, 150);
    },
    [sfReady, analyze, depth],   // eslint-disable-line react-hooks/exhaustive-deps
  );

  function applyBestMove(uci: string) {
    if (!uci || uci.length < 4) { setBestArrow([]); setSqStyles({}); return; }
    const from = uci.slice(0, 2);
    const to   = uci.slice(2, 4);
    setBestArrow([[from, to, '#B8860B']]);
    setSqStyles({
      [from]: { background: 'rgba(184,134,11,0.30)', borderRadius: '4px' },
      [to]:   { background: 'rgba(184,134,11,0.18)', borderRadius: '4px' },
    });
  }

  // Re-analyze when FEN or depth changes
  useEffect(() => {
    triggerAnalysis(fen);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [fen, depth]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Piece drop ──────────────────────────────────────────────────────────
  const onDrop = useCallback(
    (from: string, to: string) => {
      setBestArrow([]); setSqStyles({});
      try {
        const gc = new Chess(game.fen());
        const mv = gc.move({ from, to, promotion: 'q' });
        if (!mv) return false;
        const newFen = gc.fen();
        setGame(gc); setFen(newFen);
        const hist = [...posHistory.slice(0, historyIndex + 1), newFen];
        setPosHistory(hist); setHistoryIndex(hist.length - 1);
        return true;
      } catch { return false; }
    },
    [game, posHistory, historyIndex],
  );

  // ── Load PGN ────────────────────────────────────────────────────────────
  const loadPGN = useCallback(() => {
    try {
      const g = new Chess();
      g.loadPgn(pgnInput.trim());
      const fens: string[] = [];
      const tmp = new Chess();
      for (const m of g.history()) { tmp.move(m); fens.push(tmp.fen()); }
      setGame(g); setFen(g.fen());
      setPosHistory(fens); setHistoryIndex(fens.length - 1);
      setBestArrow([]); setSqStyles({});
    } catch { alert('Invalid PGN — please check the format.'); }
  }, [pgnInput]);

  // ── Load FEN ────────────────────────────────────────────────────────────
  const loadFEN = useCallback(() => {
    try {
      const g = new Chess(fenInput.trim());
      setGame(g); setFen(g.fen());
      setPosHistory([]); setHistoryIndex(-1);
      setBestArrow([]); setSqStyles({});
    } catch { alert('Invalid FEN string.'); }
  }, [fenInput]);

  // ── Navigation ──────────────────────────────────────────────────────────
  const nav = useCallback(
    (dir: 'start' | 'prev' | 'next' | 'end') => {
      if (!posHistory.length) return;
      let idx = historyIndex;
      if (dir === 'start') idx = -1;
      else if (dir === 'prev')  idx = Math.max(-1, idx - 1);
      else if (dir === 'next')  idx = Math.min(posHistory.length - 1, idx + 1);
      else idx = posHistory.length - 1;
      setHistoryIndex(idx);
      const f = idx === -1 ? new Chess().fen() : posHistory[idx];
      setFen(f); setGame(new Chess(f));
      setBestArrow([]); setSqStyles({});
    },
    [posHistory, historyIndex],
  );

  // ── Reset ───────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    stop();
    const g = new Chess();
    setGame(g); setFen(g.fen());
    setPosHistory([]); setHistoryIndex(-1);
    setPgnInput(''); setFenInput('');
    setEvalPercent(50); setEvalLines([]);
    setBestArrow([]); setSqStyles({});
    setCurrentDepth(0); setIsAnalyzing(false);
  }, [stop]);

  // ── Derived ─────────────────────────────────────────────────────────────
  const moveHistory = game.history();
  const movePairs: [string, string?][] = [];
  for (let i = 0; i < moveHistory.length; i += 2)
    movePairs.push([moveHistory[i], moveHistory[i + 1]]);

  const topScore     = evalLines[0]?.score ?? '...';
  const bestMoveUCI  = evalLines[0]?.moves?.split(' ')[0] ?? '';
  const bestMoveSAN  = (() => {
    if (!bestMoveUCI || bestMoveUCI.length < 4) return '';
    try {
      const g  = new Chess(fen);
      const mv = g.move({ from: bestMoveUCI.slice(0,2), to: bestMoveUCI.slice(2,4), promotion: bestMoveUCI[4] ?? 'q' });
      return mv?.san ?? bestMoveUCI;
    } catch { return bestMoveUCI; }
  })();

  // ── Style helpers ────────────────────────────────────────────────────────
  const inputCls = [
    'w-full glass-input rounded-xl px-3 py-2.5 font-mono text-xs border border-white/10 outline-none',
    'focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-white/30',
  ].join(' ');

  const toolbarBtns = [
    { icon: <ChevronsLeft  size={13} />, fn: () => nav('start'), tip: 'First position' },
    { icon: <ChevronLeft   size={13} />, fn: () => nav('prev'),  tip: 'Previous move'  },
    { icon: <FlipHorizontal size={13}/>, fn: () => setOrientation(o => o === 'white' ? 'black' : 'white'), tip: 'Flip board' },
    { icon: <ChevronRight  size={13} />, fn: () => nav('next'),  tip: 'Next move'      },
    { icon: <ChevronsRight size={13} />, fn: () => nav('end'),   tip: 'Last position'  },
    { icon: <RotateCcw     size={13} />, fn: reset,              tip: 'Reset board'    },
    { icon: <Copy          size={13} />, fn: () => navigator.clipboard?.writeText(fen), tip: 'Copy FEN' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 animate-fade-in relative z-10">
      {/* Background glow blobs */}
      <div className="absolute top-[5%] left-[-15%] w-[350px] h-[350px] bg-primary/5 rounded-full filter blur-[100px] pointer-events-none animate-pulse-slow -z-10" />
      <div className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] bg-secondary/5 rounded-full filter blur-[120px] pointer-events-none -z-10" />

      <PageHeader
        title="Analysis Board"
        subtitle="Real Stockfish engine — best move suggestions & deep evaluation"
      />

      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-5 items-start">

        {/* ══ BOARD SIDE ══════════════════════════════════════════════════════ */}
        <div style={{ width: BOARD_PX }} className="mx-auto lg:mx-0 flex-shrink-0">

          {/* Board */}
          <div className="board-shadow rounded-xl overflow-hidden glass-panel p-2.5 border border-white/10 shadow-2xl">
            <Chessboard
              boardWidth={BOARD_PX - 20} // Adjust for glass container padding
              position={fen}
              onPieceDrop={onDrop}
              boardOrientation={orientation}
              customBoardStyle={{ borderRadius: '6px' }}
              customDarkSquareStyle={{ backgroundColor: '#1c1f24' }} // Sleek dark slate
              customLightSquareStyle={{ backgroundColor: '#2d306b' }} // Deep violet glass
              customSquareStyles={sqStyles}
              customArrows={bestArrow}
              areArrowsAllowed
              animationDuration={150}
            />
          </div>

          {/* Toolbar */}
          <div className="grid grid-cols-7 gap-1 mt-2">
            {toolbarBtns.map(({ icon, fn, tip }) => (
              <button
                key={tip} onClick={fn} title={tip}
                className="flex items-center justify-center py-2 bg-white/5 border border-white/5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-all text-xs active:scale-95 shadow-sm"
              >
                {icon}
              </button>
            ))}
          </div>

          {/* Best move banner */}
          <div className="mt-2 glass-panel rounded-xl px-4 py-3 shadow-sm border border-white/10" style={{ minHeight: 60 }}>
            {bestMoveSAN ? (
              <div className="flex items-center gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Zap size={14} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-2xs text-white/60 uppercase tracking-widest font-semibold">Best move</p>
                  <p className="font-mono text-base font-bold text-primary leading-tight">{bestMoveSAN}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xs text-white/60 uppercase tracking-widest font-semibold">Eval</p>
                  <p className={`font-mono text-sm font-bold leading-tight ${
                    topScore.startsWith('+') ? 'text-green-400' :
                    topScore.startsWith('-') ? 'text-red-400' : 'text-white'
                  }`}>{topScore}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-white/40 text-center mt-2.5">
                {isAnalyzing ? 'Calculating best move…' : 'Make a move or load a game'}
              </p>
            )}
          </div>

          {/* Move list */}
          <div className="mt-2 glass-panel rounded-xl p-4 shadow-sm border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="block text-xs font-bold text-primary uppercase tracking-widest">
                Moves
              </span>
              <span className="text-2xs text-white/60 font-semibold">
                {game.turn() === 'w' ? '♔ White' : '♚ Black'} to move
              </span>
            </div>
            <div className="font-mono text-xs text-white/80 leading-loose max-h-28 overflow-y-auto no-scrollbar">
              {movePairs.length === 0 ? (
                <span className="text-white/40">Make a move or load a PGN…</span>
              ) : movePairs.map(([w, b], i) => (
                <span key={i} className="mr-2">
                  <span className="text-white/40">{i + 1}.</span>
                  <span className="text-white hover:text-primary cursor-pointer transition-colors ml-1">{w}</span>
                  {b && <span className="text-white hover:text-primary cursor-pointer transition-colors ml-1">{b}</span>}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ══ ENGINE PANEL ════════════════════════════════════════════════════ */}
        <div className="flex flex-col gap-3">

          {/* Load Game */}
          <div className="glass-panel rounded-xl p-5 shadow-sm border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="block text-xs font-bold text-primary uppercase tracking-widest">
                Load Game
              </span>
              <div className="flex items-center gap-1.5 text-2xs">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  sfReady ? 'bg-emerald-500 animate-pulse-slow' :
                  usingFallback ? 'bg-amber-500' : 'bg-white/20'
                }`} />
                <span className={
                  sfReady ? 'text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20' :
                  usingFallback ? 'text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20' : 
                  'text-white/40 bg-white/5 px-2 py-0.5 rounded-full border border-white/5'
                }>
                  {sfReady ? 'Stockfish ready' : usingFallback ? 'Heuristic mode' : 'Loading engine…'}
                </span>
              </div>
            </div>

            <label className="text-2xs font-semibold text-white/60 uppercase tracking-wider block mb-1.5">PGN</label>
            <textarea
              value={pgnInput}
              onChange={e => setPgnInput(e.target.value)}
              className={`${inputCls} resize-none h-[72px]`}
              placeholder="1. e4 e5 2. Nf3 Nc6…"
            />
            <div className="flex gap-1.5 mt-2 mb-3.5">
              <button onClick={loadPGN}
                className="flex-1 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:shadow-[0_0_20px_rgba(180,197,255,0.4)] active:scale-95 transition-all">
                Load PGN
              </button>
              {SAMPLE_PGNS.map(s => (
                <button key={s.label}
                  onClick={() => { setPgnInput(s.pgn); }}
                  title={`Load ${s.label}`}
                  className="px-3 py-2 glass-panel rounded-xl text-xs text-white/80 hover:bg-white/10 hover:text-white transition-all border border-white/10 active:scale-95 shadow-sm">
                  {s.label.split(' ')[0]}
                </button>
              ))}
            </div>

            <label className="text-2xs font-semibold text-white/60 uppercase tracking-wider block mb-1.5">FEN</label>
            <div className="flex gap-2">
              <input value={fenInput} onChange={e => setFenInput(e.target.value)} className={inputCls}
                placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" />
              <button onClick={loadFEN}
                className="px-4 py-2.5 glass-panel rounded-xl text-xs text-white/80 hover:bg-white/10 hover:text-white transition-all border border-white/10 active:scale-95 shadow-sm">
                Load
              </button>
            </div>
          </div>

          {/* Evaluation */}
          <div className="glass-panel rounded-xl p-5 shadow-sm border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="block text-xs font-bold text-primary uppercase tracking-widest">
                Evaluation
              </span>
              <div className="flex items-center gap-1.5 text-2xs text-white/60 font-mono">
                <Brain size={10} className={isAnalyzing ? 'text-primary animate-pulse' : 'text-white/30'} />
                {(isAnalyzing || currentDepth > 0) ? `depth ${currentDepth}` : ''}
              </div>
            </div>

            <div className="flex items-start gap-3">
              {/* Eval bar */}
              <div className="w-5 rounded-lg overflow-hidden border border-white/10 relative flex-shrink-0" style={{ height: 176 }}>
                {/* Black side on top */}
                <div
                  className="absolute top-0 left-0 right-0 eval-transition"
                  style={{ height: `${100 - evalPercent}%`, background: '#1c1f24' }}
                />
                {/* White side on bottom */}
                <div
                  className="absolute bottom-0 left-0 right-0 eval-transition"
                  style={{ height: `${evalPercent}%`, background: '#c0c1ff' }}
                />
                <div className="absolute top-1 left-0 right-0 text-center text-[6px] font-mono font-bold text-white/60 z-10">B</div>
                <div className="absolute bottom-1 left-0 right-0 text-center text-[6px] font-mono font-bold text-black/60 z-10">W</div>
              </div>

              {/* Lines */}
              <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                {evalLines.length === 0 ? (
                  <div className="flex items-center justify-center text-white/40 text-xs" style={{ height: 176 }}>
                    {isAnalyzing ? 'Analyzing…' : 'Make a move to start analysis'}
                  </div>
                ) : evalLines.map((line, i) => {
                  const pos = !line.score.startsWith('-');
                  return (
                    <div key={i} className={`rounded-xl p-2.5 border transition-all ${
                      i === 0
                        ? 'border-primary/20 bg-primary/5 text-white'
                        : 'border-white/5 bg-white/[0.02] text-white/80'
                    }`}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`font-mono text-xs font-bold ${
                          i === 0
                            ? (pos ? 'text-green-400' : 'text-red-400')
                            : 'text-white/60'
                        }`}>{line.score}</span>
                        <span className="text-2xs text-white/40 font-mono">#{i + 1}</span>
                      </div>
                      <div className="font-mono text-2xs text-white/50 truncate">{line.moves || '—'}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Depth slider */}
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-2xs font-semibold text-white/60 uppercase tracking-wider">Search Depth</span>
                <span className="text-primary font-mono text-xs font-bold">{depth}</span>
              </div>
              <input type="range" min={8} max={24} value={depth}
                onChange={e => setDepth(Number(e.target.value))} className="w-full" />
              <div className="flex justify-between text-2xs text-white/35 mt-0.5 font-mono">
                <span>Fast</span><span>←  depth  →</span><span>Deep</span>
              </div>
            </div>
          </div>

          {/* Perspective */}
          <div className="glass-panel rounded-xl p-5 shadow-sm border border-white/10">
            <span className="block text-xs font-bold text-primary uppercase tracking-widest mb-3">
              Perspective
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(['white', 'black'] as const).map(side => (
                <button key={side} onClick={() => setOrientation(side)}
                  className={`py-2 rounded-xl text-xs font-semibold transition-all border capitalize active:scale-95 ${
                    orientation === side
                      ? 'bg-primary text-on-primary border-primary shadow-md font-bold'
                      : 'glass-panel text-white/70 hover:bg-white/10 hover:text-white border-white/10 bg-transparent'
                  }`}>
                  {side === 'white' ? '♔' : '♚'} {side}
                </button>
              ))}
            </div>
          </div>

          {/* Game status */}
          {(game.isGameOver() || game.isCheck()) && (
            <div className={`rounded-xl border p-3.5 text-sm font-semibold text-center animate-fade-in ${
              game.isCheckmate()
                ? 'border-green-500/20 bg-green-500/10 text-green-400'
                : game.isDraw()
                ? 'border-white/10 bg-white/5 text-white'
                : 'border-amber-500/20 bg-amber-500/10 text-amber-400'
            }`}>
              {game.isCheckmate()
                ? `♚ Checkmate — ${game.turn() === 'w' ? 'Black' : 'White'} wins!`
                : game.isStalemate()         ? '= Stalemate'
                : game.isInsufficientMaterial() ? '= Insufficient material'
                : game.isThreefoldRepetition()  ? '= Threefold repetition'
                : game.isDraw()              ? '= Draw'
                : game.isCheck()             ? `⚡ ${game.turn() === 'w' ? 'White' : 'Black'} is in check`
                : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
