"use client";

import { useEffect, useState } from "react";

type Cell = {
  address: string;
};

export default function Home() {
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(3);
  const [data, setData] = useState<Cell[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [address, setAddress] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("gridData");
    if (saved) {
      setData(JSON.parse(saved));
    } else {
      generateCells(4, 3);
    }
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      localStorage.setItem("gridData", JSON.stringify(data));
    }
  }, [data]);

  const generateCells = (r: number, c: number) => {
    const total = r * c;
    const newData = Array.from({ length: total }, () => ({
      address: ""
    }));
    setData(newData);
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
      {/* Header */}
      <div className="header">
        <input
          type="number"
          value={rows}
          onChange={(e) => {
            const r = Number(e.target.value);
            setRows(r);
            generateCells(r, cols);
          }}
        />

        <input
          type="number"
          value={cols}
          onChange={(e) => {
            const c = Number(e.target.value);
            setCols(c);
            generateCells(rows, c);
          }}
        />

        <button onClick={() => window.print()}>Print</button>
      </div>

      {/* Grid */}
      <div className="a4-container">
        <div
          className="grid"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {data.map((cell, i) => (
            <div
              key={i}
              className="cell"
              onClick={() => openForm(i)}
            >
              {cell.address ? (
                <div className="content">{cell.address}</div>
              ) : (
                <span className="placeholder">＋</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Popup */}
      {selectedIndex !== null && (
        <div className="overlay">
          <div className="modal">
            <textarea
              autoFocus
              placeholder="Paste address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <div className="actions">
              <button className="primary" onClick={save}>Save</button>
              <button onClick={() => setSelectedIndex(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}