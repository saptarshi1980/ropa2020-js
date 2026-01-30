import React from "react";

/* ==================================================
   PAY MATRIX DATA
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
   PNG GENERATOR
   ================================================== */

function downloadPayMatrixPNG(gp) {
  const rows = PAY_MATRIX[gp];

  const rowHeight = 30;
  const titleHeight = 50;
  const headerHeight = 40;
  const paddingBottom = 30;

  const canvasWidth = 720;
  const canvasHeight =
    titleHeight + headerHeight + rows.length * rowHeight + paddingBottom;

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");

  /* Background */
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  /* Title */
  ctx.fillStyle = "#000000";
  ctx.font = "bold 20px Arial";
  ctx.fillText(`Revised Pay Matrix – GP ${gp}`, 200, 32);

  /* Header */
  const headerY = titleHeight + 20;

  ctx.font = "bold 14px Arial";
  ctx.fillText("Level", 60, headerY);
  ctx.fillText("Pre-Revised Basic", 230, headerY);
  ctx.fillText("Revised Basic", 470, headerY);

  ctx.beginPath();
  ctx.moveTo(40, headerY + 6);
  ctx.lineTo(680, headerY + 6);
  ctx.stroke();

  /* Table Body */
  ctx.font = "14px Arial";
  let startY = titleHeight + headerHeight;

  rows.forEach(([oldB, newB], i) => {
    const y = startY + i * rowHeight;
    ctx.fillText(i + 1, 70, y);
    ctx.fillText(`₹ ${oldB.toLocaleString()}`, 230, y);
    ctx.fillText(`₹ ${newB.toLocaleString()}`, 470, y);
  });

  /* Download */
  const link = document.createElement("a");
  link.download = `pay_matrix_gp_${gp}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

/* ==================================================
   COMPONENT (HORIZONTALLY CENTERED ONLY)
   ================================================== */

export default function PayMatrixImage() {
  return (
    <div
      style={{
        textAlign: "center",
        paddingTop: "40px", // gives some space from top
        background: "#f5f7fa",
        minHeight: "100vh"
      }}
    >
      <div
        style={{
          display: "inline-block",
          textAlign: "center",
          padding: "30px 40px",
          background: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          maxWidth: "400px",
          width: "100%"
        }}
      >
        <h3 style={{ marginBottom: "20px" }}>
          📷 Download Revised Pay Matrix
        </h3>

        <button
          onClick={() => downloadPayMatrixPNG(6600)}
          style={buttonStyle}
        >
          ⬇ GP 6600 PNG
        </button>

        <br /><br />

        <button
          onClick={() => downloadPayMatrixPNG(7600)}
          style={buttonStyle}
        >
          ⬇ GP 7600 PNG
        </button>
      </div>
    </div>
  );
}

/* ==================================================
   BUTTON STYLE
   ================================================== */

const buttonStyle = {
  padding: "10px 20px",
  fontSize: "15px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  background: "#1976d2",
  color: "#ffffff",
  width: "100%"
};
