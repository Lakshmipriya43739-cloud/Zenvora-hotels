import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "../utils/format";
import "./Gallery.css";

const COLORS = ["#e9e4d8", "#c9694a", "#d99a2b", "#4f6b46", "#5f82a8", "#efe9dd", "#2b2b2b", "#e8742c"];

// Placeholder if image fails
const placeholder = (c) =>
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 200"><rect width="150" height="200" fill="#d9dcdf"/>
     <rect y="160" width="150" height="40" fill="#eceeef"/><path d="M45 85 L55 40 H95 L105 85Z" fill="${c}"/>
     <rect x="73" y="85" width="4" height="65" fill="${c}"/><ellipse cx="75" cy="152" rx="24" ry="5" fill="${c}"/></svg>`
  );

const mod = (a, n) => ((a % n) + n) % n;

// 3D Perspective calculation for realistic depth, spread and angle
const getCoverTransform = (d) => {
  const s = Math.sign(d);
  const a = Math.abs(d);
  if (!a) {
    return {
      t: "translate3d(0, 0, 170px) scale(1.08)",
      o: 1,
      z: 100,
    };
  }
  // Smooth stepping for lateral spread and depth receding
  const translateX = s * (160 + (a - 1) * 95);
  const translateZ = -120 - a * 65;
  const rotateY = -s * Math.min(60, 42 + a * 4);
  const scale = Math.max(0.72, 1 - a * 0.08);

  return {
    t: `translate3d(${translateX}px, 0, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
    o: a > 4 ? 0 : Math.max(0.3, 1 - a * 0.18),
    z: 100 - a * 10,
  };
};

export default function Gallery({ items = [] }) {
  const n = items.length;
  const [active, setActive] = useState(0);
  const [broken, setBroken] = useState({});

  const stageRef = useRef(null);
  const drag = useRef({ on: false, startX: 0, startActive: 0, moved: false });

  // Keep active index within bounds if items change
  useEffect(() => {
    if (active >= n && n > 0) setActive(0);
  }, [n, active]);

  // Touch and drag swipe
  const onPointerDown = (e) => {
    if (n === 0) return;
    drag.current = { on: true, startX: e.clientX, startActive: active, moved: false };
  };

  useEffect(() => {
    const move = (e) => {
      const d = drag.current;
      if (!d.on || n === 0) return;
      const dx = e.clientX - d.startX;
      if (Math.abs(dx) > 10) d.moved = true;
      setActive(mod(d.startActive - Math.round(dx / 75), n));
    };
    const up = () => {
      drag.current.on = false;
      setTimeout(() => (drag.current.moved = false), 60);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [n]);

  // Horizontal trackpad / wheel scroll
  useEffect(() => {
    const el = stageRef.current;
    if (!el || n === 0) return;
    const wheel = (e) => {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
      e.preventDefault();
      setActive((a) => mod(a + Math.sign(e.deltaX), n));
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, [n]);

  // Keyboard navigation
  useEffect(() => {
    if (n === 0) return;
    const key = (e) => {
      if (e.key === "ArrowRight") setActive((a) => mod(a + 1, n));
      if (e.key === "ArrowLeft") setActive((a) => mod(a - 1, n));
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [n]);

  if (!items || items.length === 0) {
    return null;
  }

  const srcOf = (i) => (broken[i] ? placeholder(COLORS[i % COLORS.length]) : items[i].src);

  const prev = () => setActive((a) => mod(a - 1, n));
  const next = () => setActive((a) => mod(a + 1, n));

  return (
    <section className="gx-showcase">
      <div className="gx-stage-container">
        {/* Previous Button */}
        <button
          type="button"
          className="gx-nav-btn gx-nav-btn--prev"
          onClick={prev}
          aria-label="Previous hotel"
          title="Previous hotel"
        >
          ‹
        </button>

        {/* 3D Stage with Cards */}
        <div className="gx-stage" ref={stageRef} onPointerDown={onPointerDown}>
          {items.map((it, i) => {
            const d = mod(i - active + n / 2, n) - n / 2;
            const r = getCoverTransform(d);
            const isCenter = d === 0;

            return (
              <div
                key={it.id || i}
                className={`gx-card ${isCenter ? "gx-card--active" : ""}`}
                onClick={() => {
                  if (drag.current.moved) return;
                  setActive(i);
                }}
                style={{
                  transform: r.t,
                  opacity: r.o,
                  zIndex: r.z,
                  pointerEvents: r.o > 0 ? "auto" : "none",
                }}
              >
                <div className="gx-card-inner">
                  <img
                    src={srcOf(i)}
                    alt={it.title}
                    draggable={false}
                    onError={() => setBroken((b) => ({ ...b, [i]: true }))}
                  />

                  {/* Card overlay with title, price and View Details button for the active card */}
                  <div className="gx-card-glass">
                    <div className="gx-card-info">
                      <span className="gx-card-name" title={it.title}>{it.title}</span>
                      {it.price !== undefined && (
                        <div className="gx-card-price-row">
                          <span className="gx-card-cost">{formatPrice(it.price)}</span>
                          <span className="gx-card-period">/ night</span>
                        </div>
                      )}
                    </div>

                    {/* View Details button displayed directly on the selected card */}
                    {isCenter && it.id && (
                      <Link
                        to={`/hotels/${it.id}`}
                        className="btn-card-details gx-card-btn"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Details
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          className="gx-nav-btn gx-nav-btn--next"
          onClick={next}
          aria-label="Next hotel"
          title="Next hotel"
        >
          ›
        </button>
      </div>
    </section>
  );
}
