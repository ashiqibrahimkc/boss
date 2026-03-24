"use client";

import { useEffect, useState } from "react";

type Cell = {
  address: string;
};

export default function Home() {
  const rows = 7;
  const cols = 3;
  const TOTAL = rows * cols; // ✅ 21

  const [data, setData] = useState<Cell[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [address, setAddress] = useState("");

  // 🔥 LOAD DATA (FIXED LENGTH)
  useEffect(() => {
    const saved = localStorage.getItem("gridData");

    if (saved) {
      const parsed = JSON.parse(saved);

      // ✅ FORCE ONLY 21 CELLS
      const fixed = parsed.slice(0, TOTAL);

      // if less, fill remaining
      while (fixed.length < TOTAL) {
        fixed.push({ address: "" });
      }

      setData(fixed);
    } else {
      generateCells();
    }
  }, []);

  // 🔥 SAVE DATA
  useEffect(() => {
    if (data.length === TOTAL) {
      localStorage.setItem("gridData", JSON.stringify(data));
    }
  }, [data]);

  // 🔥 GENERATE CELLS (ALWAYS 21)
  const generateCells = () => {
    setData(Array.from({ length: TOTAL }, () => ({ address: "" })));
  };

  const openForm = (i: number) => {
    setSelectedIndex(i);
    setAddress("");
  };

  const save = () => {
    if (selectedIndex !== null) {
      const updated = [...data];
      updated[selectedIndex] = { address };
      setData(updated);
      setSelectedIndex(null);
    }
  };

  return (
    <div className="app">

      {/* HEADER */}
      <div className="header">
        <h2>BOSS 💰</h2>
        <button onClick={() => window.print()}>Print</button>
      </div>

      {/* GRID */}
      <div className="a4-container">
        <div className="grid">
          {data.map((cell, i) => (
            <div
              key={i}
              className="cell"
              onClick={() => openForm(i)}
            >
              {cell.address ? (
                <div className="content">{cell.address}</div>
              ) : (
                <span className="plus">＋</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {selectedIndex !== null && (
        <div className="overlay">
          <div className="modal">
            <h3>Paste Address</h3>

            <textarea
              autoFocus
              placeholder="Paste address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <div className="actions">
              <button className="save" onClick={save}>Save</button>
              <button onClick={() => setSelectedIndex(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}