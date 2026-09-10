"use client";

import { useEffect, useState, useCallback } from "react";

type Cell = {
  address: string;
};

type GridConfig = {
  rows: number;
  cols: number;
};

const MIN_ROWS = 1;
const MAX_ROWS = 10;
const MIN_COLS = 1;
const MAX_COLS = 5;

export default function Home() {
  const [config, setConfig] = useState<GridConfig>({ rows: 7, cols: 3 });
  const [data, setData] = useState<Cell[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [address, setAddress] = useState("");
  const [alertIndex, setAlertIndex] = useState<number | null>(null);

  // ── MOBILE VIEW STATE ──
  const [mobileTab, setMobileTab] = useState<"single" | "grid">("single");
  const [mobileActiveIndex, setMobileActiveIndex] = useState<number>(0);
  const [mobileText, setMobileText] = useState<string>("");

  const total = config.rows * config.cols;

  // ── Dynamic font size: fewer rows → larger text ──
  const getDynamicFontSize = useCallback(() => {
    if (config.rows <= 2) return 26;
    if (config.rows <= 3) return 22;
    if (config.rows <= 4) return 19;
    if (config.rows <= 5) return 17;
    if (config.rows <= 7) return 15;
    return 13;
  }, [config.rows]);

  // ── LOAD DATA ──
  useEffect(() => {
    const savedConfig = localStorage.getItem("bossGridConfig");
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        if (parsed.rows && parsed.cols) {
          setConfig(parsed);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("gridData");
    if (saved) {
      try {
        const parsed: Cell[] = JSON.parse(saved);
        const fixed = parsed.slice(0, total);
        while (fixed.length < total) {
          fixed.push({ address: "" });
        }
        setData(fixed);
      } catch {
        generateCells();
      }
    } else {
      generateCells();
    }
  }, [total]);

  // ── SAVE DATA ──
  useEffect(() => {
    if (data.length === total && total > 0) {
      localStorage.setItem("gridData", JSON.stringify(data));
    }
  }, [data, total]);

  // ── SAVE CONFIG ──
  useEffect(() => {
    localStorage.setItem("bossGridConfig", JSON.stringify(config));
  }, [config]);

  const generateCells = () => {
    setData(Array.from({ length: total }, () => ({ address: "" })));
  };

  // ── CELL TAP HANDLER ──
  const handleCellTap = (i: number) => {
    if (data[i]?.address) {
      // Cell has data → show alert dialog
      setAlertIndex(i);
    } else {
      // Cell is empty → open form directly
      openForm(i);
    }
  };

  const openForm = (i: number) => {
    setSelectedIndex(i);
    setAddress(data[i]?.address || "");
    setAlertIndex(null);
  };

  const save = () => {
    if (selectedIndex !== null) {
      const updated = [...data];
      updated[selectedIndex] = { address };
      setData(updated);
      setSelectedIndex(null);
      setAddress("");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const clearAll = () => {
    // Use the alert dialog pattern for clearing
    if (confirm("Are you sure you want to clear all data?")) {
      localStorage.removeItem("gridData");
      generateCells();
    }
  };

  // ── Config adjusters ──
  const adjustRows = (delta: number) => {
    setConfig((prev) => ({
      ...prev,
      rows: Math.min(MAX_ROWS, Math.max(MIN_ROWS, prev.rows + delta)),
    }));
  };

  const adjustCols = (delta: number) => {
    setConfig((prev) => ({
      ...prev,
      cols: Math.min(MAX_COLS, Math.max(MIN_COLS, prev.cols + delta)),
    }));
  };

  // ── Sync mobile input text when active index changes or cell data changes ──
  useEffect(() => {
    if (data[mobileActiveIndex]) {
      setMobileText(data[mobileActiveIndex]?.address || "");
    }
  }, [mobileActiveIndex, data]);

  const handleMobileSave = () => {
    const updated = [...data];
    if (!updated[mobileActiveIndex]) return;
    updated[mobileActiveIndex] = { address: mobileText.trim() };
    setData(updated);
  };

  const handleMobileSaveAndNext = () => {
    const updated = [...data];
    if (updated[mobileActiveIndex]) {
      updated[mobileActiveIndex] = { address: mobileText.trim() };
      setData(updated);
    }
    let nextIdx = mobileActiveIndex + 1;
    if (nextIdx >= total) nextIdx = 0;
    setMobileActiveIndex(nextIdx);
  };

  const handleMobilePrev = () => {
    setMobileActiveIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
  };

  const handleMobileNext = () => {
    setMobileActiveIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
  };

  const handleMobileClearCurrent = () => {
    const updated = [...data];
    if (updated[mobileActiveIndex]) {
      updated[mobileActiveIndex] = { address: "" };
      setData(updated);
      setMobileText("");
    }
  };

  const filledCount = data.filter((c) => c.address).length;

  // ── CSS Custom Properties for dynamic grid ──
  const gridStyle: React.CSSProperties = {
    ["--grid-cols" as string]: `repeat(${config.cols}, 1fr)`,
    ["--grid-rows" as string]: `repeat(${config.rows}, 1fr)`,
  };

  const cellContentStyle: React.CSSProperties = {
    fontSize: `${getDynamicFontSize()}px`,
  };

  return (
    <div className="app">
      {/* ── HEADER ── */}
      <div className="header">
        <div className="header-brand">
          <h1>BOSS</h1>
          <span className="badge">Print</span>
        </div>
        <div className="actions-top">
          <button className="btn btn-primary" onClick={handlePrint}>
            <span>🖨️</span>
            <span className="btn-label">Print</span>
          </button>
          <button className="btn btn-danger" onClick={clearAll}>
            <span>🗑️</span>
            <span className="btn-label">Clear</span>
          </button>
        </div>
      </div>

      {/* ── SETTINGS BAR ── */}
      <div className="settings-bar">
        <div className="setting-group">
          <label>Rows</label>
          <div className="stepper">
            <button onClick={() => adjustRows(-1)} disabled={config.rows <= MIN_ROWS}>
              −
            </button>
            <span className="stepper-value">{config.rows}</span>
            <button onClick={() => adjustRows(1)} disabled={config.rows >= MAX_ROWS}>
              +
            </button>
          </div>
        </div>

        <div className="settings-divider" />

        <div className="setting-group">
          <label>Columns</label>
          <div className="stepper">
            <button onClick={() => adjustCols(-1)} disabled={config.cols <= MIN_COLS}>
              −
            </button>
            <span className="stepper-value">{config.cols}</span>
            <button onClick={() => adjustCols(1)} disabled={config.cols >= MAX_COLS}>
              +
            </button>
          </div>
        </div>

        <div className="settings-divider" />

        <div className="setting-group">
          <label style={{ color: "var(--text-muted)" }}>
            {config.rows} × {config.cols} = {total} cells
          </label>
        </div>
      </div>

      {/* ── MOBILE TABS (Only visible on mobile) ── */}
      <div className="mobile-tabs mobile-only">
        <button
          className={`mobile-tab-btn ${mobileTab === "single" ? "active" : ""}`}
          onClick={() => setMobileTab("single")}
        >
          ✍️ Single Input
        </button>
        <button
          className={`mobile-tab-btn ${mobileTab === "grid" ? "active" : ""}`}
          onClick={() => setMobileTab("grid")}
        >
          📄 A4 Grid Preview
        </button>
      </div>

      {/* ── MOBILE SINGLE INPUT VIEW ── */}
      {mobileTab === "single" && (
        <div className="mobile-single-input-container mobile-only">
          <div className="mobile-input-card">
            <div className="mobile-card-header">
              <button
                className="nav-arrow-btn"
                onClick={handleMobilePrev}
                title="Previous cell"
              >
                ◀
              </button>
              <div className="mobile-cell-badge">
                <span className="cell-num">
                  Cell {mobileActiveIndex + 1} of {total}
                </span>
                {data[mobileActiveIndex]?.address ? (
                  <span className="status-badge filled">● Filled</span>
                ) : (
                  <span className="status-badge empty">○ Empty</span>
                )}
              </div>
              <button
                className="nav-arrow-btn"
                onClick={handleMobileNext}
                title="Next cell"
              >
                ▶
              </button>
            </div>

            <textarea
              className="mobile-textarea"
              rows={4}
              placeholder={`Paste WhatsApp address for Cell ${mobileActiveIndex + 1}...`}
              value={mobileText}
              onChange={(e) => setMobileText(e.target.value)}
            />

            <div className="mobile-actions">
              <button
                className="btn btn-primary mobile-btn-main"
                onClick={handleMobileSaveAndNext}
              >
                ✓ Save &amp; Next ❯
              </button>
              <div className="mobile-sub-actions">
                <button className="btn btn-ghost" onClick={handleMobileSave}>
                  Save
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleMobileClearCurrent}
                  disabled={!data[mobileActiveIndex]?.address && !mobileText}
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Quick summary chip bar */}
            <div className="mobile-cell-summary">
              <div className="summary-title">
                <span>Quick Select Cell ({filledCount}/{total} Filled)</span>
              </div>
              <div className="summary-chips">
                {data.map((cell, idx) => (
                  <button
                    key={idx}
                    className={`summary-chip ${
                      idx === mobileActiveIndex ? "current" : ""
                    } ${cell.address ? "filled" : ""}`}
                    onClick={() => setMobileActiveIndex(idx)}
                  >
                    #{idx + 1} {cell.address ? "✓" : "+"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── GRID (Always visible on desktop, toggleable on mobile via tab) ── */}
      <div
        className={`a4-container ${
          mobileTab === "grid" ? "mobile-show-grid" : "mobile-hide-grid"
        }`}
      >
        <div className="a4-sheet">
          <div className="grid" style={gridStyle}>
            {data.map((cell, i) => (
              <div
                key={i}
                className={`cell ${cell.address ? "filled" : ""}`}
                onClick={() => handleCellTap(i)}
              >
                {cell.address ? (
                  <div className="content" style={cellContentStyle}>
                    {cell.address}
                  </div>
                ) : (
                  <span className="plus">＋</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── GRID INFO ── */}
      <div className="grid-info">
        <span>
          Total: <strong>{total}</strong>
        </span>
        <span className="filled-count">
          Filled: <strong>{filledCount}</strong>
        </span>
        <span>
          Empty: <strong>{total - filledCount}</strong>
        </span>
      </div>

      {/* ── ALERT DIALOG (for filled cells) ── */}
      {alertIndex !== null && (
        <div className="overlay" onClick={() => setAlertIndex(null)}>
          <div className="alert-dialog" onClick={(e) => e.stopPropagation()}>
            <span className="alert-icon">⚠️</span>
            <h3>Cell Already Has Data</h3>
            <p>This cell already contains an address. Do you want to edit it?</p>
            <div className="alert-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setAlertIndex(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => openForm(alertIndex)}
              >
                ✏️ Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PASTE MODAL ── */}
      {selectedIndex !== null && (
        <div className="overlay" onClick={() => setSelectedIndex(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">
              {data[selectedIndex]?.address ? "Edit Address" : "Paste Address"}
            </h3>
            <p className="modal-subtitle">
              Cell {selectedIndex + 1} of {total}
            </p>

            <textarea
              autoFocus
              placeholder="Paste address from WhatsApp..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setSelectedIndex(null);
                  setAddress("");
                }}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={save}>
                ✓ Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}