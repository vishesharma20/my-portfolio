import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  APPLE_SPRITES,
  BRANCH_PIVOT,
  CANOPY_PIVOT,
  DECOR_APPLES,
  DECOR_APPLE_DIAMETER,
  LAYER_BOX,
  LEAF_SPRITES,
  SKILL_APPLES,
  SKILL_APPLE_DIAMETER,
  STAGE_H,
  STAGE_W,
  TRUNK_BASE_Y,
  TRUNK_HIT,
  TRUNK_PIVOT_X,
  advance,
  branchPose,
  canopyPose,
  createSim,
  isFinished,
  restPose,
  trunkSkew,
  type TreeSim,
} from "./treeMotion";

type StageSkill = { title: string; position: string };

type Props = {
  skills: StageSkill[];
  selected: string | null;
  onSelect: (title: string | null) => void;
};

type Phase = "idle" | "resetting" | "playing" | "settled";

const TRUNK_CLIP = `polygon(${TRUNK_HIT.map((p) => `${p.x}px ${p.y}px`).join(", ")})`;
const FADE_MS = 360;

/** Layout of a skill apple sprite: element size and where its body centre sits. */
function skillSprite(spriteKey: string) {
  const m = APPLE_SPRITES[spriteKey];
  const k = SKILL_APPLE_DIAMETER / (2 * m.r);
  return { w: m.w * k, h: m.h * k, ox: m.cx * k, oy: m.cy * k };
}

function appleTransform(i: number, x: number, y: number, rot: number, scale: number) {
  const s = skillSprite(SKILL_APPLES[i].sprite);
  return `translate(${x - s.ox}px, ${y - s.oy}px) rotate(${rot}rad) scale(${scale})`;
}

export default function TreeStage({ skills, selected, onSelect }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const trunkRef = useRef<HTMLDivElement>(null);
  const branchRef = useRef<HTMLDivElement>(null);
  const canopyRef = useRef<HTMLDivElement>(null);
  const appleRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const leafRefs = useRef<(HTMLImageElement | null)[]>([]);

  const phaseRef = useRef<Phase>("idle");
  const landedRef = useRef<boolean[]>(SKILL_APPLES.map(() => false));
  const rafRef = useRef(0);
  const timersRef = useRef<number[]>([]);

  const [phase, setPhaseState] = useState<Phase>("idle");
  const [landed, setLanded] = useState<boolean[]>(() => SKILL_APPLES.map(() => false));

  const setPhase = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhaseState(next);
  }, []);

  const later = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  }, []);

  /* Fit the 1376 x 768 stage to the page the same way `background-size: cover` fits the artwork. */
  useLayoutEffect(() => {
    const stage = stageRef.current;
    const host = stage?.parentElement;
    if (!stage || !host) return;
    const fit = () => {
      const r = host.getBoundingClientRect();
      const k = Math.max(r.width / STAGE_W, r.height / STAGE_H);
      stage.style.transform = `translate(-50%, -50%) scale(${k})`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  const placeHanging = useCallback(() => {
    SKILL_APPLES.forEach((cfg, i) => {
      const el = appleRefs.current[i];
      if (el) el.style.transform = appleTransform(i, cfg.hang.x, cfg.hang.y, 0, 1);
    });
  }, []);

  const clearPoses = useCallback(() => {
    for (const el of [trunkRef.current, branchRef.current, canopyRef.current]) if (el) el.style.transform = "";
    for (const el of leafRefs.current) if (el) el.style.opacity = "0";
  }, []);

  useLayoutEffect(() => {
    placeHanging();
  }, [placeHanging]);

  useEffect(
    () => () => {
      cancelAnimationFrame(rafRef.current);
      timersRef.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );

  const markLanded = useCallback((index: number) => {
    if (landedRef.current[index]) return;
    landedRef.current = landedRef.current.map((v, i) => (i === index ? true : v));
    setLanded(landedRef.current);
  }, []);

  /* ---- the main shake ---- */
  const run = useCallback(() => {
    setPhase("playing");
    const sim: TreeSim = createSim((Math.random() * 2 ** 32) >>> 0);
    const t0 = performance.now();

    const frame = (now: number) => {
      const t = (now - t0) / 1000;
      advance(sim, t);

      const trunk = trunkRef.current;
      if (trunk) trunk.style.transform = `skewX(${trunkSkew(t)}rad)`;
      const b = branchPose(t);
      if (branchRef.current) branchRef.current.style.transform = `translate(${b.dx}px, ${b.dy}px) rotate(${b.rot}rad)`;
      const c = canopyPose(t);
      if (canopyRef.current) canopyRef.current.style.transform = `translate(${c.dx}px, ${c.dy}px) rotate(${c.rot}rad)`;

      sim.apples.forEach((a, i) => {
        const el = appleRefs.current[i];
        if (el) el.style.transform = appleTransform(i, a.outX, a.outY, a.outRot, a.outScale);
        if (a.phase === "rest") markLanded(i);
      });

      sim.leaves.forEach((l, i) => {
        const el = leafRefs.current[i];
        if (!el) return;
        const sprite = LEAF_SPRITES[l.sprite];
        el.style.opacity = String(l.alpha);
        el.style.transform = `translate(${l.x - sprite.w / 2}px, ${l.y - sprite.h / 2}px) rotate(${l.rot}rad) scale(${l.scale0})`;
      });

      if (isFinished(sim, t)) {
        clearPoses();
        setPhase("settled");
        return;
      }
      rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);
  }, [clearPoses, markLanded, setPhase]);

  /* ---- reduced motion: no shake, the apples simply appear on the grass ---- */
  const dropInstantly = useCallback(() => {
    setPhase("resetting");
    appleRefs.current.forEach((el) => {
      if (el) {
        el.style.transition = `opacity ${FADE_MS}ms ease`;
        el.style.opacity = "0";
      }
    });
    later(() => {
      SKILL_APPLES.forEach((cfg, i) => {
        const el = appleRefs.current[i];
        const r = restPose(cfg);
        if (el) {
          el.style.transform = appleTransform(i, r.x, r.y, r.rot, r.scale);
          el.style.opacity = "1";
        }
      });
      landedRef.current = SKILL_APPLES.map(() => true);
      setLanded(landedRef.current);
      later(() => {
        appleRefs.current.forEach((el) => el && (el.style.transition = ""));
        setPhase("settled");
      }, FADE_MS);
    }, FADE_MS);
  }, [later, setPhase]);

  /* ---- replay: fallen apples fade out, reappear on their branches, then the tree is shaken again ---- */
  const resetApples = useCallback(
    (then: () => void) => {
      setPhase("resetting");
      landedRef.current = SKILL_APPLES.map(() => false);
      setLanded(landedRef.current);
      appleRefs.current.forEach((el) => {
        if (el) {
          el.style.transition = `opacity ${FADE_MS}ms ease`;
          el.style.opacity = "0";
        }
      });
      later(() => {
        placeHanging();
        appleRefs.current.forEach((el) => el && (el.style.opacity = "1"));
        later(() => {
          appleRefs.current.forEach((el) => el && (el.style.transition = ""));
          then();
        }, FADE_MS);
      }, FADE_MS + 40);
    },
    [later, placeHanging, setPhase],
  );

  const shake = useCallback(() => {
    if (phaseRef.current === "playing" || phaseRef.current === "resetting") return;
    onSelect(null);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = reduce ? dropInstantly : run;
    if (landedRef.current.some(Boolean)) resetApples(start);
    else start();
  }, [dropInstantly, onSelect, resetApples, run]);

  const live = phase === "playing";
  const canopy = LAYER_BOX.canopy;

  return (
    <div className={`tree-stage${live ? " is-live" : ""}${phase === "playing" || phase === "resetting" ? " is-busy" : ""}`} ref={stageRef}>
      {/* Layers, back to front: trunk, branches, canopy (with the decorative apples riding on it). */}
      <div
        className="tree-layer"
        ref={trunkRef}
        style={{ left: LAYER_BOX.trunk.x, top: LAYER_BOX.trunk.y, width: LAYER_BOX.trunk.w, height: LAYER_BOX.trunk.h, transformOrigin: `${TRUNK_PIVOT_X - LAYER_BOX.trunk.x}px ${TRUNK_BASE_Y - LAYER_BOX.trunk.y}px` }}
      >
        <img className="tree-layer__img" src="/images/tree-trunk.png" alt="" draggable={false} />
      </div>
      <div
        className="tree-layer"
        ref={branchRef}
        style={{ left: LAYER_BOX.branches.x, top: LAYER_BOX.branches.y, width: LAYER_BOX.branches.w, height: LAYER_BOX.branches.h, transformOrigin: `${BRANCH_PIVOT.x - LAYER_BOX.branches.x}px ${BRANCH_PIVOT.y - LAYER_BOX.branches.y}px` }}
      >
        <img className="tree-layer__img" src="/images/tree-branches.png" alt="" draggable={false} />
      </div>
      <div
        className="tree-layer"
        ref={canopyRef}
        style={{ left: canopy.x, top: canopy.y, width: canopy.w, height: canopy.h, transformOrigin: `${CANOPY_PIVOT.x - canopy.x}px ${CANOPY_PIVOT.y - canopy.y}px` }}
      >
        <img className="tree-layer__img" src="/images/tree-canopy.png" alt="" draggable={false} />
        {DECOR_APPLES.map((a, i) => {
          const m = APPLE_SPRITES[a.sprite];
          const k = DECOR_APPLE_DIAMETER / (2 * m.r);
          return (
            <img
              key={i}
              className="tree-decor"
              src={`/images/apples/apple-${a.sprite}.png`}
              alt=""
              draggable={false}
              style={{ left: a.x - canopy.x - m.cx * k, top: a.y - canopy.y - m.cy * k, width: m.w * k, transformOrigin: `${m.cx * k}px ${m.cy * k}px`, transform: `rotate(${a.rot}rad)` }}
            />
          );
        })}
      </div>

      <button
        type="button"
        className="tree-trunk-hit"
        style={{ clipPath: TRUNK_CLIP }}
        onClick={shake}
        aria-label="Give the tree a shake"
        title="Give the tree a shake"
        aria-busy={live}
      />

      {SKILL_APPLES.map((cfg, i) => {
        const skill = skills.find((s) => s.position === cfg.id);
        const s = skillSprite(cfg.sprite);
        return (
          <button
            key={cfg.id}
            type="button"
            ref={(el) => {
              appleRefs.current[i] = el;
            }}
            className={`tree-skill-apple${skill && selected === skill.title ? " is-selected" : ""}`}
            style={{ width: s.w, height: s.h, transformOrigin: `${s.ox}px ${s.oy}px` }}
            disabled={!landed[i]}
            aria-pressed={skill ? selected === skill.title : undefined}
            onClick={() => skill && onSelect(selected === skill.title ? null : skill.title)}
          >
            <img className="tree-skill-apple__img" src={`/images/apples/apple-${cfg.sprite}.png`} alt="" draggable={false} />
            <span className="skill-fruit__name">{skill?.title}</span>
          </button>
        );
      })}

      {LEAF_SPRITES.map((sprite, i) => (
        <img
          key={i}
          ref={(el) => {
            leafRefs.current[i] = el;
          }}
          className="tree-leaf"
          src={`/images/leaves/leaf-${String(i + 1).padStart(2, "0")}.png`}
          alt=""
          draggable={false}
          style={{ width: sprite.w, height: sprite.h }}
        />
      ))}
    </div>
  );
}
