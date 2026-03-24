"use client";

import { useEffect, useState } from "react";

type Cell = {
  address: string;
};

export default function Home() {
  const [rows, setRows] = useState<number>(4);
  const [cols, setCols] = useState<number>(3);
  const [data, setData] = useState<Cell[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const [address, setAddress] = useState<string>("");

  // Load data
  useEffect(() => {
    const saved = localStorage.getItem("gridData");
    if (saved) {
      setData(JSON.parse(saved));
    } else {
      generateCells(4, 3);
    }
  }, []);

  // Save data
  useEffect(() => {
    if (data.length > 0) {
      localStorage.setItem("gridData", JSON.stringify(data));
    }
  }, [data]);

  const generateCells = (r: number, c: number) => {
    const total = r * c;
    const newData: Cell[] = Array.from({ length: total }, () => ({
      address: ""
    }));
    setData(newData);
  };

  const openForm = (index: number) => {
    setSelectedIndex(index);
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

  const printPage = () => {
    window.print();
  };

  return (
    <div>
      {/* Controls */}
      <div className="controls">
        Rows:
        <input
          type="number"
          value={rows}
          onChange={(e) => {
            const r = Number(e.target.value);
            setRows(r);
            generateCells(r, cols);
          }}
        />

        Columns:
        <input
          type="number"
          value={cols}
          onChange={(e) => {
            const c = Number(e.target.value);
            setCols(c);
            generateCells(rows, c);
          }}
        />

        <button onClick={printPage}>🖨️ Print</button>
      </div>

      {/* A4 Grid */}
      <div className="a4-container">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`
          }}
        >
          {data.map((cell, i) => (
            <div className="cell" key={i}>
              {!cell.address ? (
                <button onClick={() => openForm(i)}>+ Add</button>
              ) : (
                <div className="content">
                  {cell.address}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Popup */}
      {selectedIndex !== null && (
        <div className="overlay">
          <div className="popup">
            <h3>Paste Address</h3>

            <textarea
              autoFocus
              placeholder="Paste address here..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <div className="actions">
              <button onClick={save}>Save</button>
              <button onClick={() => setSelectedIndex(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}