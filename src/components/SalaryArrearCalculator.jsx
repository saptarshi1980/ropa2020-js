import React, { useState } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import * as XLSX from "xlsx";

dayjs.extend(customParseFormat);

/* ==================================================
   PAY MATRICES (OLD, NEW)
   ================================================== */

const PAY_MATRIX = {
  6600: [
    [73700, 76500], [76000, 78800], [78300, 81200], [80700, 83700],
    [83200, 86300], [85700, 88900], [88300, 91600], [91000, 94400],
    [93800, 97300], [96700, 100300], [99700, 103400], [102700, 106600],
    [105800, 109800], [109000, 113100], [112300, 116500],
    [115700, 120000], [119200, 123600], [122800, 127400],
    [126500, 131300], [130300, 135300], [134300, 139400],
    [138400, 143600], [142600, 148000], [146900, 152500],
    [151400, 157100], [156000, 161900], [160700, 166800],
    [165600, 171900]
  ],
  7600: [
    [96800, 102600], [99800, 105700], [102800, 108900],
    [105900, 112200], [109100, 115600], [112400, 119100],
    [115800, 122700], [119300, 126400], [122900, 130200],
    [126600, 134200], [130400, 138300], [134400, 142500],
    [138500, 146800], [142700, 151300], [147000, 155900],
    [151500, 160600], [156100, 165500], [160800, 170500],
    [165700, 175700], [170700, 181000], [175900, 186500],
    [181200, 192100]
  ]
};

/* ==================================================
   DA HISTORY
   ================================================== */

const DA_HISTORY = [
  ["2020-01-01", 0.10],
  ["2021-01-01", 0.13],
  ["2023-03-01", 0.16],
  ["2024-01-01", 0.20],
  ["2024-04-01", 0.24],
  ["2025-04-01", 0.28]
];

function getDA(date) {
  let da = DA_HISTORY[0][1];

  DA_HISTORY.forEach(([d, v]) => {
    const eff = dayjs(d);
    if (eff.isBefore(date) || eff.isSame(date)) {
      da = v;
    }
  });

  return da;
}


/* ==================================================
   INCREMENT RULE
   ================================================== */

function incrementDue(current, incMonth) {
  return current.month() + 1 === incMonth && current.year() >= 2020;
}

/* ==================================================
   COMPONENT
   ================================================== */

export default function SalaryArrearCalculator() {
  const [initialGP, setInitialGP] = useState(6600);
  const [initialBasic, setInitialBasic] = useState(PAY_MATRIX[6600][0][0]);
  const [incrementMonth, setIncrementMonth] = useState(7);
  const [arrearUpto, setArrearUpto] = useState("202602");
  const [promotionMonth, setPromotionMonth] = useState("");
  const [rows, setRows] = useState([]);
  const [totalArrear, setTotalArrear] = useState(0);

  /* ==================================================
     MAIN CALCULATION
     ================================================== */

  const generateArrear = () => {
    let current = dayjs("2020-01-01");
    let end = dayjs(`${arrearUpto}01`, "YYYYMMDD");
    let promotionDate = promotionMonth
      ? dayjs(`${promotionMonth}01`, "YYYYMMDD")
      : null;

    let currentGP = initialGP;
    let step = PAY_MATRIX[currentGP].findIndex(r => r[0] === initialBasic);
    let promoted = false;

    let data = [];
    let total = 0;

    while (current.isBefore(end) || current.isSame(end)) {

      let promotionThisMonth = false;

      // ===== Promotion =====
      if (promotionDate && current.isSame(promotionDate) && !promoted) {
        currentGP = 7600;
        step = 0; // fixation only
        promoted = true;
        promotionThisMonth = true;
      }

      // ===== Increment =====
      if (!promotionThisMonth && incrementDue(current, incrementMonth)) {
        step = Math.min(step + 1, PAY_MATRIX[currentGP].length - 1);
      }

      const [oldBasic, newBasic] = PAY_MATRIX[currentGP][step];
      const da = getDA(current);

      const oldSalary = Math.round(oldBasic * (1 + da));
      const newSalary = Math.round(newBasic * (1 + da));
      const arrear = newSalary - oldSalary;

      total += arrear;

      data.push({
        Month: current.format("MMM-YYYY"),
        "Grade Pay": currentGP,
        "Old Basic": oldBasic,
        "New Basic": newBasic,
        "DA %": Math.round(da * 100),
        "Old Basic + DA": oldSalary,
        "New Basic + DA": newSalary,
        "Monthly Arrear": arrear
      });

      current = current.add(1, "month");
    }

    setRows(data);
    setTotalArrear(total);
  };

  /* ==================================================
     EXCEL DOWNLOAD
     ================================================== */

  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Arrear Report");
    XLSX.writeFile(wb, "ropa_arrear_report.xlsx");
  };

  /* ==================================================
     UI
     ================================================== */

  return (
  <div className="container">
    {/* <h2>📊 ROPA-2020 Salary Arrear Calculator</h2> */}

    <div className="form-grid">
      <div className="form-group">
        <label>Initial Grade Pay</label>
        <select value={initialGP} onChange={e => {
          const gp = Number(e.target.value);
          setInitialGP(gp);
          setInitialBasic(PAY_MATRIX[gp][0][0]);
        }}>
          <option value={6600}>GP 6600</option>
          <option value={7600}>GP 7600</option>
        </select>
      </div>

      <div className="form-group">
        <label>Initial Basic (Jan-2020)</label>
        <select value={initialBasic} onChange={e => setInitialBasic(Number(e.target.value))}>
          {PAY_MATRIX[initialGP].map(([b]) => (
            <option key={b} value={b}>₹ {b}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Increment Month</label>
        <select value={incrementMonth} onChange={e => setIncrementMonth(Number(e.target.value))}>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {dayjs().month(i).format("MMMM")}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Arrear upto (YYYYMM)</label>
        <input value={arrearUpto} onChange={e => setArrearUpto(e.target.value)} />
      </div>

      <div className="form-group">
        <label>Promotion Month (optional)</label>
        <input value={promotionMonth} onChange={e => setPromotionMonth(e.target.value)} />
      </div>
    </div>

    <div className="button-row">
      <button onClick={generateArrear}>Generate Arrear</button>
      {rows.length > 0 && (
        <button onClick={downloadExcel}>⬇ Download Excel</button>
      )}
    </div>

    {rows.length > 0 && (
      <div className="result-box">
        <h3>✅ Total Arrear: ₹ {totalArrear.toLocaleString()}</h3>

        <div className="table-wrapper">
         <table>
          <thead>
            <tr>
              {Object.keys(rows[0]).map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {Object.values(r).map((v, j) => (
                  <td key={j}>{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    )}
  </div>
);

}
