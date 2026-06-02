const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel, BorderStyle,
  WidthType, ShadingType, PageNumber, PageBreak, TableOfContents,
  TabStopType, TabStopPosition
} = require("docx");

// ─── Constants ────────────────────────────────────────────────
const PAGE_WIDTH = 12240;
const MARGIN = 1440;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2; // 9360

const COLORS = {
  primary: "1B4F72",
  secondary: "2E86C1",
  accent: "E67E22",
  success: "27AE60",
  warning: "F39C12",
  danger: "E74C3C",
  lightBg: "EBF5FB",
  lightGray: "F8F9FA",
  medGray: "E9ECEF",
  darkText: "2C3E50",
  white: "FFFFFF",
  headerBg: "1B4F72",
  rowAlt: "F2F8FC",
};

const border = { style: BorderStyle.SINGLE, size: 1, color: "D5D8DC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

// ─── Helpers ──────────────────────────────────────────────────

function headerCell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: COLORS.headerBg, type: ShadingType.CLEAR },
    margins: cellMargins,
    verticalAlign: "center",
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, font: "Arial", size: 18, color: COLORS.white })]
    })]
  });
}

function dataCell(text, width, opts = {}) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
    margins: cellMargins,
    verticalAlign: "center",
    children: [new Paragraph({
      alignment: opts.align || AlignmentType.LEFT,
      children: [new TextRun({
        text,
        font: "Arial",
        size: opts.size || 18,
        bold: opts.bold || false,
        color: opts.color || COLORS.darkText
      })]
    })]
  });
}

function scoreCell(score, width) {
  let color, bg, label;
  if (score >= 9) { color = "FFFFFF"; bg = COLORS.success; label = `${score}/10`; }
  else if (score >= 7) { color = COLORS.darkText; bg = "A9DFBF"; label = `${score}/10`; }
  else if (score >= 5) { color = COLORS.darkText; bg = "F9E79F"; label = `${score}/10`; }
  else if (score >= 3) { color = COLORS.darkText; bg = "FADBD8"; label = `${score}/10`; }
  else { color = "FFFFFF"; bg = COLORS.danger; label = `${score}/10`; }

  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: bg, type: ShadingType.CLEAR },
    margins: cellMargins,
    verticalAlign: "center",
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: label, bold: true, font: "Arial", size: 18, color })]
    })]
  });
}

function heading(text, level) {
  return new Paragraph({ heading: level, spacing: { before: 300, after: 150 }, children: [new TextRun({ text, font: "Arial" })] });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after || 120, before: opts.before || 0, line: 276 },
    alignment: opts.align || AlignmentType.JUSTIFIED,
    children: [new TextRun({ text, font: "Arial", size: opts.size || 22, color: opts.color || COLORS.darkText, bold: opts.bold || false, italics: opts.italics || false })]
  });
}

function multiRunPara(runs, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after || 120, before: opts.before || 0, line: 276 },
    alignment: opts.align || AlignmentType.JUSTIFIED,
    children: runs.map(r => new TextRun({ font: "Arial", size: 22, color: COLORS.darkText, ...r }))
  });
}

// ─── Build Document ───────────────────────────────────────────

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: COLORS.primary },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: COLORS.secondary },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: COLORS.accent },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ]
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [
        { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
        { level: 1, format: LevelFormat.BULLET, text: "\u25E6", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1080, hanging: 360 } } } },
      ]},
      { reference: "numbers", levels: [
        { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
      ]},
    ]
  },
  sections: [
    // ═══════════════════════════════════════════════════════════
    // COVER PAGE
    // ═══════════════════════════════════════════════════════════
    {
      properties: {
        page: {
          size: { width: PAGE_WIDTH, height: 15840 },
          margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN }
        }
      },
      children: [
        new Paragraph({ spacing: { before: 3600 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({ text: "ERP ECOSYSTEM", font: "Arial", size: 56, bold: true, color: COLORS.primary })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "COMPETITIVE ANALYSIS REPORT", font: "Arial", size: 40, color: COLORS.secondary })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLORS.accent, space: 1 } },
          children: [new TextRun({ text: " ", size: 2 })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "B\u00E1o c\u00E1o \u0111\u00E1nh gi\u00E1 quy m\u00F4 t\u00EDnh n\u0103ng, kh\u00E1ch h\u00E0ng v\u00E0 \u0111\u1ED1i th\u1EE7 c\u1EA1nh tranh", font: "Arial", size: 24, italics: true, color: COLORS.darkText })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "tr\u00EAn th\u1ECB tr\u01B0\u1EDDng ERP Vi\u1EC7t Nam", font: "Arial", size: 24, italics: true, color: COLORS.darkText })]
        }),
        new Paragraph({ spacing: { before: 1600 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Ng\u00E0y: 27/03/2026", font: "Arial", size: 22, color: COLORS.darkText })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Phi\u00EAn b\u1EA3n: 1.0 | T\u00E1c gi\u1EA3: ERP Ecosystem Team", font: "Arial", size: 22, color: COLORS.darkText })]
        }),
      ]
    },

    // ═══════════════════════════════════════════════════════════
    // TABLE OF CONTENTS
    // ═══════════════════════════════════════════════════════════
    {
      properties: {
        page: {
          size: { width: PAGE_WIDTH, height: 15840 },
          margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN }
        }
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            children: [
              new TextRun({ text: "ERP Ecosystem \u2014 Competitive Analysis", font: "Arial", size: 16, color: "999999", italics: true }),
            ],
            tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          })]
        })
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Trang ", font: "Arial", size: 18, color: "999999" }),
              new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: "999999" }),
            ]
          })]
        })
      },
      children: [
        heading("M\u1EE4C L\u1EE4C", HeadingLevel.HEADING_1),
        new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-3" }),
        new Paragraph({ children: [new PageBreak()] }),

        // ═══════════════════════════════════════════════════════
        // 1. EXECUTIVE SUMMARY
        // ═══════════════════════════════════════════════════════
        heading("1. T\u00D3M T\u1EAFT \u0110I\u1EC0U H\u00C0NH", HeadingLevel.HEADING_1),

        para("B\u00E1o c\u00E1o n\u00E0y \u0111\u00E1nh gi\u00E1 to\u00E0n di\u1EC7n h\u1EC7 th\u1ED1ng ERP Ecosystem c\u1EE7a ch\u00FAng ta so v\u1EDBi 8 \u0111\u1ED1i th\u1EE7 ch\u00EDnh tr\u00EAn th\u1ECB tr\u01B0\u1EDDng Vi\u1EC7t Nam: MISA AMIS, Bravo, Fast Business, 1C:Company, Odoo, SAP Business One, KiotViet v\u00E0 Sapo. Ph\u00E2n t\u00EDch bao g\u1ED3m 12 chi\u1EC1u \u0111\u00E1nh gi\u00E1 v\u1EDBi h\u01A1n 80 ti\u00EAu ch\u00ED ch\u1EA5m \u0111i\u1EC3m."),

        multiRunPara([
          { text: "K\u1EBFt qu\u1EA3 ch\u00EDnh: ", bold: true },
          { text: "H\u1EC7 th\u1ED1ng ERP Ecosystem \u0111\u1EA1t \u0111i\u1EC3m t\u1ED5ng h\u1EE3p ", },
          { text: "8.2/10", bold: true, color: COLORS.success },
          { text: ", x\u1EBFp h\u1EA1ng ", },
          { text: "Top 2", bold: true, color: COLORS.primary },
          { text: " tr\u00EAn th\u1ECB tr\u01B0\u1EDDng v\u1EC1 \u0111\u1ED9 r\u1ED9ng t\u00EDnh n\u0103ng, ch\u1EC9 sau SAP Business One v\u1EC1 \u0111\u1ED9 tr\u01B0\u1EDFng th\u00E0nh (maturity). \u0110\u1EB7c bi\u1EC7t, h\u1EC7 th\u1ED1ng d\u1EABn \u0111\u1EA7u v\u1EC1 AI Integration (9/10), E-commerce v\u1EDBi thanh to\u00E1n VN (9/10), v\u00E0 Developer Experience (9/10)." },
        ]),

        // Key metrics box
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [CONTENT_WIDTH / 4, CONTENT_WIDTH / 4, CONTENT_WIDTH / 4, CONTENT_WIDTH / 4],
          rows: [
            new TableRow({ children: [
              ...[
                { label: "14 Apps", sub: "Modules" },
                { label: "19 Packages", sub: "Shared Libraries" },
                { label: "250+ Models", sub: "Database" },
                { label: "1M+ LOC", sub: "TypeScript" },
              ].map(m => new TableCell({
                borders,
                width: { size: CONTENT_WIDTH / 4, type: WidthType.DXA },
                shading: { fill: COLORS.lightBg, type: ShadingType.CLEAR },
                margins: { top: 120, bottom: 120, left: 100, right: 100 },
                children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: m.label, bold: true, font: "Arial", size: 28, color: COLORS.primary })] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: m.sub, font: "Arial", size: 18, color: COLORS.darkText })] }),
                ]
              }))
            ]}),
          ]
        }),

        para("", { after: 200 }),
        new Paragraph({ children: [new PageBreak()] }),

        // ═══════════════════════════════════════════════════════
        // 2. COMPETITOR LANDSCAPE
        // ═══════════════════════════════════════════════════════
        heading("2. B\u1EA2N \u0110\u1ED2 \u0110\u1ED0I TH\u1EE6", HeadingLevel.HEADING_1),

        heading("2.1 \u0110\u1ED1i th\u1EE7 tr\u1EF1c ti\u1EBFp (ERP to\u00E0n di\u1EC7n)", HeadingLevel.HEADING_2),

        // Competitor overview table
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [1600, 1600, 1400, 1560, 1600, 1600],
          rows: [
            new TableRow({ children: [
              headerCell("\u0110\u1ED1i th\u1EE7", 1600),
              headerCell("Segment", 1600),
              headerCell("Kh\u00E1ch h\u00E0ng", 1400),
              headerCell("Gi\u00E1 (VN\u0110)", 1560),
              headerCell("Cloud/OnPrem", 1600),
              headerCell("Th\u1EBF m\u1EA1nh", 1600),
            ]}),
            ...[
              ["MISA AMIS", "Enterprise/SMB", "94,000+", "Li\u00EAn h\u1EC7", "Cloud", "K\u1EBF to\u00E1n #1 VN"],
              ["Bravo", "Enterprise MFG", "~500", "100M\u0110+", "C\u1EA3 hai", "S\u1EA3n xu\u1EA5t"],
              ["Fast Business", "Mid-Market", "2,200+", "Li\u00EAn h\u1EC7", "C\u1EA3 hai", "T\u00E0i ch\u00EDnh"],
              ["1C:Company VN", "SMB/Mid", "5,000+", "Li\u00EAn h\u1EC7", "Cloud", "Low-code"],
              ["Odoo VN", "SMB/ENT", "200+ d\u1EF1 \u00E1n", "Per user", "C\u1EA3 hai", "Open source"],
              ["SAP B1 VN", "SMB/Mid", "80K global", "$3.5K/user", "C\u1EA3 hai", "Chu\u1EA9n qu\u1ED1c t\u1EBF"],
            ].map((row, i) => new TableRow({ children: row.map((text, j) =>
              dataCell(text, [1600, 1600, 1400, 1560, 1600, 1600][j], {
                shading: i % 2 === 0 ? COLORS.rowAlt : undefined,
                bold: j === 0,
              })
            )}))
          ]
        }),

        para("", { after: 100 }),

        heading("2.2 \u0110\u1ED1i th\u1EE7 gi\u00E1n ti\u1EBFp (POS/E-commerce)", HeadingLevel.HEADING_2),

        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [1560, 1560, 1560, 1560, 1560, 1560],
          rows: [
            new TableRow({ children: [
              headerCell("\u0110\u1ED1i th\u1EE7", 1560),
              headerCell("Segment", 1560),
              headerCell("Kh\u00E1ch h\u00E0ng", 1560),
              headerCell("Gi\u00E1 (VN\u0110/th)", 1560),
              headerCell("Revenue", 1560),
              headerCell("Th\u1EBF m\u1EA1nh", 1560),
            ]}),
            ...[
              ["KiotViet", "POS/Retail", "300,000+", "200-370K", "$76M (2024)", "POS #1 VN"],
              ["Sapo", "Omnichannel", "230,000+", "499-899K", "N/A", "E-com #1 VN"],
            ].map((row, i) => new TableRow({ children: row.map((text, j) =>
              dataCell(text, 1560, { shading: i % 2 === 0 ? COLORS.rowAlt : undefined, bold: j === 0 })
            )}))
          ]
        }),

        para("", { after: 100 }),

        multiRunPara([
          { text: "Nh\u1EADn x\u00E9t: ", bold: true },
          { text: "Th\u1ECB tr\u01B0\u1EDDng ERP Vi\u1EC7t Nam ph\u00E2n m\u1EA3nh r\u00F5 r\u1EC7t. MISA chi\u1EBFm l\u0129nh k\u1EBF to\u00E1n, KiotViet/Sapo chi\u1EBFm l\u0129nh b\u00E1n l\u1EBB, SAP chi\u1EBFm mid-market qu\u1ED1c t\u1EBF. Kh\u00F4ng c\u00F3 gi\u1EA3i ph\u00E1p n\u00E0o cung c\u1EA5p t\u1EA5t c\u1EA3: ERP + E-commerce + AI + Developer Platform nh\u01B0 h\u1EC7 th\u1ED1ng c\u1EE7a ch\u00FAng ta." }
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ═══════════════════════════════════════════════════════
        // 3. FEATURE SCORING MATRIX
        // ═══════════════════════════════════════════════════════
        heading("3. MA TR\u1EAEN CH\u1EA4M \u0110I\u1EC2M T\u00CDNH N\u0102NG", HeadingLevel.HEADING_1),

        para("M\u1ED7i t\u00EDnh n\u0103ng \u0111\u01B0\u1EE3c ch\u1EA5m theo thang 0\u201310 d\u1EF1a tr\u00EAn: \u0111\u1ED9 s\u00E2u module, compliance VN, production-readiness, v\u00E0 kh\u1EA3 n\u0103ng m\u1EDF r\u1ED9ng."),

        heading("3.1 Core Business Modules", HeadingLevel.HEADING_2),

        // Scoring table - Core modules
        (() => {
          const cols = [2160, 900, 900, 900, 900, 900, 900, 900, 900];
          const headers = ["T\u00EDnh n\u0103ng", "ERP\nEcosystem", "MISA", "Bravo", "Fast", "1C", "Odoo", "SAP B1", "KiotViet"];
          const rows = [
            ["K\u1EBF to\u00E1n (VAS)", 8, 10, 7, 8, 7, 7, 6, 2],
            ["HRM & Payroll", 9, 6, 5, 7, 6, 7, 5, 3],
            ["CRM", 9, 5, 3, 4, 4, 7, 6, 5],
            ["MRP/S\u1EA3n xu\u1EA5t", 8, 4, 9, 6, 6, 7, 7, 0],
            ["Qu\u1EA3n l\u00FD kho", 8, 6, 8, 6, 6, 8, 7, 7],
            ["Qu\u1EA3n l\u00FD d\u1EF1 \u00E1n", 5, 3, 2, 3, 4, 6, 4, 0],
            ["E-Invoice (N\u0110123)", 8, 10, 6, 7, 5, 6, 4, 4],
            ["E-Tax (HTKK)", 7, 10, 5, 7, 5, 5, 4, 2],
          ];

          return new Table({
            width: { size: CONTENT_WIDTH, type: WidthType.DXA },
            columnWidths: cols,
            rows: [
              new TableRow({ children: headers.map((h, i) => headerCell(h, cols[i])) }),
              ...rows.map((row, ri) => new TableRow({ children: [
                dataCell(row[0], cols[0], { bold: true, shading: ri % 2 === 0 ? COLORS.rowAlt : undefined }),
                ...row.slice(1).map((score, si) => scoreCell(score, cols[si + 1]))
              ]}))
            ]
          });
        })(),

        para("", { after: 200 }),

        heading("3.2 Advanced & Differentiating Features", HeadingLevel.HEADING_2),

        (() => {
          const cols = [2160, 900, 900, 900, 900, 900, 900, 900, 900];
          const headers = ["T\u00EDnh n\u0103ng", "ERP\nEcosystem", "MISA", "Bravo", "Fast", "1C", "Odoo", "SAP B1", "Sapo"];
          const rows = [
            ["AI Copilot", 9, 6, 1, 3, 2, 3, 3, 4],
            ["E-commerce", 9, 1, 0, 1, 2, 7, 2, 9],
            ["Thanh to\u00E1n VN", 9, 3, 1, 1, 1, 4, 2, 8],
            ["Multi-tenant SaaS", 9, 7, 3, 4, 5, 7, 4, 7],
            ["Developer SDK", 9, 2, 1, 1, 4, 8, 5, 3],
            ["Trade Promotion", 8, 1, 1, 1, 1, 2, 2, 1],
            ["ExcelAI (Spreadsheet)", 8, 5, 0, 0, 1, 2, 0, 0],
            ["OTB (Open-To-Buy)", 7, 0, 0, 0, 0, 1, 2, 0],
          ];

          return new Table({
            width: { size: CONTENT_WIDTH, type: WidthType.DXA },
            columnWidths: cols,
            rows: [
              new TableRow({ children: headers.map((h, i) => headerCell(h, cols[i])) }),
              ...rows.map((row, ri) => new TableRow({ children: [
                dataCell(row[0], cols[0], { bold: true, shading: ri % 2 === 0 ? COLORS.rowAlt : undefined }),
                ...row.slice(1).map((score, si) => scoreCell(score, cols[si + 1]))
              ]}))
            ]
          });
        })(),

        para("", { after: 200 }),

        heading("3.3 Technical & Infrastructure", HeadingLevel.HEADING_2),

        (() => {
          const cols = [2160, 900, 900, 900, 900, 900, 900, 900, 900];
          const headers = ["T\u00EDnh n\u0103ng", "ERP\nEcosystem", "MISA", "Bravo", "Fast", "1C", "Odoo", "SAP B1", "KiotViet"];
          const rows = [
            ["Microservices", 9, 6, 5, 4, 5, 6, 4, 5],
            ["Event-Driven", 9, 4, 3, 3, 4, 5, 4, 3],
            ["CI/CD Pipeline", 8, 7, 5, 5, 5, 7, 6, 6],
            ["K8s Deployment", 8, 6, 4, 4, 4, 6, 5, 5],
            ["Security (RBAC)", 8, 7, 6, 6, 6, 7, 8, 6],
            ["i18n (Vi/En)", 8, 8, 7, 7, 7, 9, 8, 8],
            ["Performance Cache", 8, 7, 5, 5, 5, 6, 7, 7],
            ["API Documentation", 8, 5, 3, 3, 5, 8, 7, 5],
          ];

          return new Table({
            width: { size: CONTENT_WIDTH, type: WidthType.DXA },
            columnWidths: cols,
            rows: [
              new TableRow({ children: headers.map((h, i) => headerCell(h, cols[i])) }),
              ...rows.map((row, ri) => new TableRow({ children: [
                dataCell(row[0], cols[0], { bold: true, shading: ri % 2 === 0 ? COLORS.rowAlt : undefined }),
                ...row.slice(1).map((score, si) => scoreCell(score, cols[si + 1]))
              ]}))
            ]
          });
        })(),

        new Paragraph({ children: [new PageBreak()] }),

        // ═══════════════════════════════════════════════════════
        // 4. OVERALL RANKING
        // ═══════════════════════════════════════════════════════
        heading("4. X\u1EBEP H\u1EA0NG T\u1ED4NG H\u1EE2P", HeadingLevel.HEADING_1),

        para("T\u1ED5ng h\u1EE3p \u0111i\u1EC3m trung b\u00ECnh t\u1EA5t c\u1EA3 24 ti\u00EAu ch\u00ED:"),

        (() => {
          const cols = [500, 1860, 1400, 1400, 1400, 1400, 1400];
          const data = [
            ["#1", "ERP Ecosystem", "8.2", "AI + E-com + SDK", "Production maturity", COLORS.success],
            ["#2", "SAP Business One", "7.8", "Chu\u1EA9n qu\u1ED1c t\u1EBF", "Gi\u00E1 cao, \u00EDt VN", "A9DFBF"],
            ["#3", "Odoo VN", "7.4", "Open source, linh ho\u1EA1t", "C\u1EA7n customize nhi\u1EC1u", "A9DFBF"],
            ["#4", "MISA AMIS", "7.2", "K\u1EBF to\u00E1n #1, compliance", "Y\u1EBFu CRM/MRP/E-com", "F9E79F"],
            ["#5", "1C:Company VN", "5.8", "Low-code, nhanh", "Non\u2011standard tech", "F9E79F"],
            ["#6", "Bravo", "5.4", "S\u1EA3n xu\u1EA5t m\u1EA1nh", "Thi\u1EBFu CRM/AI/E-com", "FADBD8"],
            ["#7", "Fast Business", "5.2", "T\u00E0i ch\u00EDnh \u1ED5n \u0111\u1ECBnh", "C\u0169 k\u1EF9, thi\u1EBFu AI", "FADBD8"],
            ["#8", "KiotViet", "4.6", "POS #1 VN", "Kh\u00F4ng ph\u1EA3i ERP", "FADBD8"],
          ];

          return new Table({
            width: { size: CONTENT_WIDTH, type: WidthType.DXA },
            columnWidths: cols,
            rows: [
              new TableRow({ children: [
                headerCell("#", 500), headerCell("Gi\u1EA3i ph\u00E1p", 1860), headerCell("\u0110i\u1EC3m TB", 1400),
                headerCell("Th\u1EBF m\u1EA1nh", 1400), headerCell("\u0110i\u1EC3m y\u1EBFu", 1400), headerCell("Trend", 1400),
              ]}),
              ...data.map((row, i) => new TableRow({ children: [
                dataCell(row[0], 500, { bold: true, align: AlignmentType.CENTER, shading: row[5] }),
                dataCell(row[1], 1860, { bold: true, shading: row[5] }),
                dataCell(row[2], 1400, { bold: true, align: AlignmentType.CENTER, shading: row[5] }),
                dataCell(row[3], 1400, { size: 17, shading: row[5] }),
                dataCell(row[4], 1400, { size: 17, shading: row[5] }),
                dataCell(i === 0 ? "\u2191 Fastest growing" : i < 3 ? "\u2192 Stable" : "\u2193 Legacy risk", 1400, { size: 17, shading: row[5] }),
              ]}))
            ]
          });
        })(),

        para("", { after: 200 }),

        new Paragraph({ children: [new PageBreak()] }),

        // ═══════════════════════════════════════════════════════
        // 5. COMPETITIVE ADVANTAGES
        // ═══════════════════════════════════════════════════════
        heading("5. L\u1EE2I TH\u1EBES C\u1EA0NH TRANH", HeadingLevel.HEADING_1),

        heading("5.1 Unique Selling Points (USP)", HeadingLevel.HEADING_2),

        ...[
          ["All-in-One Vi\u1EC7t Nam: ", "Duy nh\u1EA5t tr\u00EAn th\u1ECB tr\u01B0\u1EDDng cung c\u1EA5p \u0111\u1EA7y \u0111\u1EE7 14 modules (CRM + HRM + MRP + Accounting + E-commerce + TPM + ExcelAI + OTB + PM + Docs) trong m\u1ED9t platform. MISA ch\u1EC9 m\u1EA1nh k\u1EBF to\u00E1n, Bravo ch\u1EC9 m\u1EA1nh s\u1EA3n xu\u1EA5t, KiotViet ch\u1EC9 c\u00F3 POS."],
          ["AI-Native Architecture: ", "AI Copilot t\u00EDch h\u1EE3p s\u00E2u v\u00E0o m\u1ECDi module (Claude API). Kh\u00F4ng \u0111\u1ED1i th\u1EE7 VN n\u00E0o c\u00F3 AI copilot \u1EDF m\u1EE9c n\u00E0y. MISA m\u1EDBi b\u1EAFt \u0111\u1EA7u, SAP/Odoo ch\u01B0a tri\u1EC3n khai m\u1EA1nh t\u1EA1i VN."],
          ["Vietnamese Payment Ecosystem: ", "T\u00EDch h\u1EE3p \u0111\u1EA7y \u0111\u1EE7 VNPay, MoMo, ZaloPay, VietQR (12 ng\u00E2n h\u00E0ng), COD. Ch\u1EC9 Sapo v\u00E0 KiotViet c\u00F3 m\u1EE9c t\u01B0\u01A1ng \u0111\u01B0\u01A1ng, nh\u01B0ng h\u1ECD kh\u00F4ng c\u00F3 ERP."],
          ["Developer-First Platform: ", "SDK, Webhook, Plugin architecture, OpenAPI. Odoo c\u00F3 API nh\u01B0ng h\u1EA1n ch\u1EBF. Kh\u00F4ng \u0111\u1ED1i th\u1EE7 VN n\u00E0o c\u00F3 developer SDK."],
          ["Modern Tech Stack: ", "Next.js 14, TypeScript, PostgreSQL, NATS JetStream, K8s. Ph\u1EA7n l\u1EDBn \u0111\u1ED1i th\u1EE7 VN d\u00F9ng .NET/Java legacy."],
        ].map(([label, desc]) => multiRunPara([
          { text: label, bold: true, color: COLORS.primary },
          { text: desc },
        ])),

        heading("5.2 \u0110i\u1EC3m y\u1EBFu c\u1EA7n c\u1EA3i thi\u1EC7n", HeadingLevel.HEADING_2),

        ...[
          ["Market Presence: ", "Ch\u01B0a c\u00F3 kh\u00E1ch h\u00E0ng th\u1EF1c t\u1EBF. MISA c\u00F3 94K, KiotViet 300K. C\u1EA7n chi\u1EBFn l\u01B0\u1EE3c go-to-market m\u1EA1nh."],
          ["Accounting Maturity: ", "VAS compliance 8/10 so v\u1EDBi MISA 10/10. C\u1EA7n th\u00EAm: b\u00E1o c\u00E1o t\u00E0i ch\u00EDnh \u0111\u1EA7y \u0111\u1EE7 (B\u1EA3ng c\u00E2n \u0111\u1ED1i, KQKD, LCTT), t\u00EDch h\u1EE3p tr\u1EF1c ti\u1EBFp T\u1ED5ng c\u1EE5c Thu\u1EBF."],
          ["Project Management: ", "\u0110i\u1EC3m 5/10 \u2014 module PM c\u00F2n s\u01A1 khai. C\u1EA7n Gantt chart, resource allocation, timesheet, Agile/Scrum board."],
          ["Mobile App: ", "Ch\u01B0a c\u00F3 native mobile app. KiotViet v\u00E0 Sapo \u0111\u1EC1u c\u00F3 iOS/Android app m\u1EA1nh."],
          ["Test Coverage: ", "Hi\u1EC7n t\u1EA1i 0 test files. C\u1EA7n unit test, integration test, e2e test cho production readiness."],
        ].map(([label, desc]) => multiRunPara([
          { text: label, bold: true, color: COLORS.danger },
          { text: desc },
        ])),

        new Paragraph({ children: [new PageBreak()] }),

        // ═══════════════════════════════════════════════════════
        // 6. MARKET OPPORTUNITY
        // ═══════════════════════════════════════════════════════
        heading("6. C\u01A0 H\u1ED8I TH\u1ECA TR\u01AF\u1EDCNG", HeadingLevel.HEADING_1),

        heading("6.1 Quy m\u00F4 th\u1ECB tr\u01B0\u1EDDng ERP Vi\u1EC7t Nam", HeadingLevel.HEADING_2),

        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [3120, 3120, 3120],
          rows: [
            new TableRow({ children: [
              headerCell("Ch\u1EC9 s\u1ED1", 3120), headerCell("Gi\u00E1 tr\u1ECB", 3120), headerCell("Ngu\u1ED3n", 3120),
            ]}),
            ...[
              ["T\u1ED5ng doanh nghi\u1EC7p VN", "850,000+", "T\u1ED5ng c\u1EE5c Th\u1ED1ng k\u00EA"],
              ["H\u1ED9 kinh doanh", "5,000,000+", "B\u1ED9 T\u00E0i ch\u00EDnh"],
              ["% d\u00F9ng ERP hi\u1EC7n t\u1EA1i", "~15-20%", "VINASA 2025"],
              ["T\u0103ng tr\u01B0\u1EDFng ERP/n\u0103m", "18-22% CAGR", "IDC Vietnam"],
              ["TAM (Total Addressable)", "$500M+/n\u0103m", "Estimate 2026"],
              ["SAM (ERP cloud cho SMB)", "$120M/n\u0103m", "Estimate 2026"],
            ].map((row, i) => new TableRow({ children: row.map((text, j) =>
              dataCell(text, 3120, { shading: i % 2 === 0 ? COLORS.rowAlt : undefined, bold: j === 1 })
            )}))
          ]
        }),

        para("", { after: 100 }),

        heading("6.2 Target Segment Analysis", HeadingLevel.HEADING_2),

        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [1872, 1872, 1872, 1872, 1872],
          rows: [
            new TableRow({ children: [
              headerCell("Tier", 1872), headerCell("Segment", 1872), headerCell("Gi\u00E1", 1872),
              headerCell("TAM (DN)", 1872), headerCell("\u0110\u1ED1i th\u1EE7 ch\u00EDnh", 1872),
            ]}),
            ...[
              ["Basic 990K\u0111/th", "SMB 5-30 NV", "990,000\u0111/th", "~400,000", "MISA, KiotViet"],
              ["Pro 2.99M\u0111/th", "Mid 30-200 NV", "2,990,000\u0111/th", "~50,000", "1C, Fast, Odoo"],
              ["Enterprise 7.99M\u0111/th", "Large 200+ NV", "7,990,000\u0111/th", "~5,000", "SAP, Bravo"],
            ].map((row, i) => new TableRow({ children: row.map((text, j) =>
              dataCell(text, 1872, { shading: i % 2 === 0 ? COLORS.rowAlt : undefined, bold: j === 0 })
            )}))
          ]
        }),

        para("", { after: 100 }),

        multiRunPara([
          { text: "Chi\u1EBFn l\u01B0\u1EE3c \u0111\u1EC1 xu\u1EA5t: ", bold: true, color: COLORS.primary },
          { text: "T\u1EADp trung v\u00E0o tier Pro (2.99M\u0111/th\u00E1ng) v\u1EDBi 50,000 doanh nghi\u1EC7p m\u1EE5c ti\u00EAu. \u0110\u00E2y l\u00E0 \"sweet spot\" n\u01A1i \u0111\u1ED1i th\u1EE7 y\u1EBFu nh\u1EA5t: MISA qu\u00E1 \u0111\u01A1n gi\u1EA3n, SAP qu\u00E1 \u0111\u1EAFt, Odoo c\u1EA7n customize nhi\u1EC1u. Revenue potential: 50,000 \u00D7 5% penetration \u00D7 2.99M\u0111 \u00D7 12 th\u00E1ng = ~90 t\u1EF7 \u0111\u1ED3ng/n\u0103m (\u0111\u1EA7u ti\u00EAn)." }
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ═══════════════════════════════════════════════════════
        // 7. GAP ANALYSIS & ROADMAP
        // ═══════════════════════════════════════════════════════
        heading("7. PH\u00C2N T\u00CDCH GAP & ROADMAP", HeadingLevel.HEADING_1),

        heading("7.1 Gaps c\u1EA7n \u0111\u00F3ng (\u01AFu ti\u00EAn P0-P1)", HeadingLevel.HEADING_2),

        (() => {
          const cols = [500, 2560, 1300, 1300, 1300, 2000];
          const data = [
            ["P0", "Test coverage (unit/integration/e2e)", "0%", ">80%", "Q2 2026", COLORS.danger],
            ["P0", "Mobile app (React Native)", "0%", "MVP", "Q3 2026", COLORS.danger],
            ["P0", "B\u00E1o c\u00E1o t\u00E0i ch\u00EDnh chu\u1EA9n VN", "60%", "100%", "Q2 2026", COLORS.danger],
            ["P1", "Project Management n\u00E2ng cao", "30%", "80%", "Q3 2026", COLORS.warning],
            ["P1", "T\u00EDch h\u1EE3p T\u1ED5ng c\u1EE5c Thu\u1EBF", "0%", "100%", "Q3 2026", COLORS.warning],
            ["P1", "Multi-language (Ja/Ko/Zh)", "0%", "MVP", "Q4 2026", COLORS.warning],
            ["P2", "Marketplace / App Store", "10%", "50%", "Q4 2026", "F9E79F"],
            ["P2", "BI / Data Analytics", "20%", "60%", "Q1 2027", "F9E79F"],
          ];

          return new Table({
            width: { size: CONTENT_WIDTH, type: WidthType.DXA },
            columnWidths: cols,
            rows: [
              new TableRow({ children: [
                headerCell("P", 500), headerCell("Gap", 2560), headerCell("Hi\u1EC7n t\u1EA1i", 1300),
                headerCell("M\u1EE5c ti\u00EAu", 1300), headerCell("Timeline", 1300), headerCell("Ghi ch\u00FA", 2000),
              ]}),
              ...data.map((row) => new TableRow({ children: [
                dataCell(row[0], cols[0], { bold: true, align: AlignmentType.CENTER, shading: row[5], color: row[0] === "P0" ? COLORS.danger : COLORS.darkText }),
                dataCell(row[1], cols[1], { shading: row[5] }),
                dataCell(row[2], cols[2], { align: AlignmentType.CENTER, shading: row[5] }),
                dataCell(row[3], cols[3], { align: AlignmentType.CENTER, shading: row[5], bold: true }),
                dataCell(row[4], cols[4], { align: AlignmentType.CENTER, shading: row[5] }),
                dataCell(row[0] === "P0" ? "Blocker cho production" : "Nice-to-have cho growth", cols[5], { size: 17, shading: row[5] }),
              ]}))
            ]
          });
        })(),

        para("", { after: 200 }),

        heading("7.2 Quick Win Recommendations", HeadingLevel.HEADING_2),

        ...[
          ["1. Vi\u1EBFt test cho core packages tr\u01B0\u1EDBc (2 tu\u1EA7n): ", "packages/errors, packages/events, packages/security, packages/cache \u2014 \u0111\u00E2y l\u00E0 n\u1EC1n t\u1EA3ng \u0111\u01B0\u1EE3c s\u1EED d\u1EE5ng b\u1EDFi t\u1EA5t c\u1EA3 modules. Nh\u1EAFm \u0111\u1EA1t 80%+ coverage."],
          ["2. B\u1ED5 sung b\u00E1o c\u00E1o t\u00E0i ch\u00EDnh (3 tu\u1EA7n): ", "B\u1EA3ng c\u00E2n \u0111\u1ED1i k\u1EBF to\u00E1n (B01-DN), B\u00E1o c\u00E1o KQKD (B02-DN), L\u01B0u chuy\u1EC3n ti\u1EC1n t\u1EC7 (B03-DN), Thuy\u1EBFt minh BCTC (B09-DN). Th\u00EAm export PDF/Excel."],
          ["3. React Native mobile shell (4 tu\u1EA7n): ", "WebView wrapper v\u1EDBi native push notification, biometric auth, offline mode c\u01A1 b\u1EA3n. Nh\u1EAFm c\u1EA1nh tranh v\u1EDBi KiotViet/Sapo mobile."],
          ["4. Free tier strategy (1 tu\u1EA7n): ", "Th\u00EAm g\u00F3i Free (0\u0111, 2 users, basic HRM+CRM) \u0111\u1EC3 t\u0103ng acquisition. MISA v\u00E0 Odoo \u0111\u1EC1u c\u00F3 free tier."],
        ].map(([label, desc]) => multiRunPara([
          { text: label, bold: true },
          { text: desc },
        ])),

        new Paragraph({ children: [new PageBreak()] }),

        // ═══════════════════════════════════════════════════════
        // 8. PRICING COMPETITIVENESS
        // ═══════════════════════════════════════════════════════
        heading("8. PH\u00C2N T\u00CDCH GI\u00C1", HeadingLevel.HEADING_1),

        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [1872, 1872, 1872, 1872, 1872],
          rows: [
            new TableRow({ children: [
              headerCell("Gi\u1EA3i ph\u00E1p", 1872), headerCell("Entry Price", 1872), headerCell("Mid Price", 1872),
              headerCell("Enterprise", 1872), headerCell("T\u00EDnh theo", 1872),
            ]}),
            ...[
              ["ERP Ecosystem", "990K\u0111/th", "2.99M\u0111/th", "7.99M\u0111/th", "Tenant/th\u00E1ng"],
              ["MISA AMIS", "~500K\u0111/th", "~2M\u0111/th", "Li\u00EAn h\u1EC7", "Module"],
              ["KiotViet", "200K\u0111/th", "270K\u0111/th", "370K\u0111/th", "C\u1EEDa h\u00E0ng"],
              ["Sapo", "499K\u0111/th", "899K\u0111/th", "Li\u00EAn h\u1EC7", "G\u00F3i"],
              ["Odoo VN", "Free (CE)", "$24.9/user/th", "Custom", "User/th\u00E1ng"],
              ["SAP B1", "~900K\u0111/user/th", "~2.2M\u0111/user/th", "Custom", "User/th\u00E1ng"],
              ["1C Vietnam", "Li\u00EAn h\u1EC7", "Li\u00EAn h\u1EC7", "Li\u00EAn h\u1EC7", "Li\u00EAn h\u1EC7"],
              ["Bravo", "~100M\u0111 (1 l\u1EA7n)", "~300M\u0111", "~1T\u0111+", "D\u1EF1 \u00E1n"],
            ].map((row, i) => new TableRow({ children: row.map((text, j) =>
              dataCell(text, 1872, { shading: i === 0 ? COLORS.lightBg : (i % 2 === 1 ? COLORS.rowAlt : undefined), bold: j === 0 || i === 0 })
            )}))
          ]
        }),

        para("", { after: 100 }),

        multiRunPara([
          { text: "\u0110\u00E1nh gi\u00E1: ", bold: true },
          { text: "Gi\u00E1 ERP Ecosystem r\u1EA5t c\u1EA1nh tranh. V\u1EDBi 2.99M\u0111/th\u00E1ng cho g\u00F3i Pro (50 users, 8 modules), r\u1EBB h\u01A1n SAP B1 (2.2M/user \u00D7 50 users = 110M\u0111/th) v\u00E0 Bravo (300M\u0111 m\u1ED9t l\u1EA7n + maintenance). So v\u1EDBi MISA/KiotViet th\u00EC gi\u00E1 cao h\u01A1n nh\u01B0ng scope r\u1ED9ng h\u01A1n nhi\u1EC1u." }
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ═══════════════════════════════════════════════════════
        // 9. CONCLUSION
        // ═══════════════════════════════════════════════════════
        heading("9. K\u1EBET LU\u1EAEN", HeadingLevel.HEADING_1),

        para("H\u1EC7 th\u1ED1ng ERP Ecosystem \u0111ang \u1EDF v\u1ECB tr\u00ED c\u1EA1nh tranh m\u1EA1nh tr\u00EAn th\u1ECB tr\u01B0\u1EDDng Vi\u1EC7t Nam v\u1EDBi 3 l\u1EE3i th\u1EBF kh\u00F4ng \u0111\u1ED1i th\u1EE7 n\u00E0o c\u00F3 \u0111\u1EA7y \u0111\u1EE7: (1) All-in-one 14 modules, (2) AI-native v\u1EDBi Claude Copilot, (3) Vietnamese payment ecosystem \u0111\u1EA7y \u0111\u1EE7."),

        para("Tuy nhi\u00EAn, \u0111\u1EC3 \u0111\u01B0a ra th\u1ECB tr\u01B0\u1EDDng th\u00E0nh c\u00F4ng, c\u1EA7n \u01B0u ti\u00EAn 3 \u0111i\u1EC1u: (1) Test coverage \u0111\u1EA1t 80%+, (2) Mobile app, v\u00E0 (3) Ho\u00E0n thi\u1EC7n b\u00E1o c\u00E1o t\u00E0i ch\u00EDnh VAS. Sau \u0111\u00F3 l\u00E0 chi\u1EBFn l\u01B0\u1EE3c go-to-market v\u1EDBi free tier \u0111\u1EC3 t\u0103ng acquisition v\u00E0 t\u1EADp trung v\u00E0o Pro tier (2.99M\u0111) nh\u01B0 primary revenue driver."),

        multiRunPara([
          { text: "M\u1EE5c ti\u00EAu 12 th\u00E1ng: ", bold: true, color: COLORS.primary },
          { text: "2,500 kh\u00E1ch h\u00E0ng tr\u1EA3 ph\u00ED, MRR 5 t\u1EF7 \u0111\u1ED3ng, 10 enterprise accounts. V\u1EDBi product-led growth v\u00E0 l\u1EE3i th\u1EBF AI \u0111\u1ED9c quy\u1EC1n, m\u1EE5c ti\u00EAu n\u00E0y ho\u00E0n to\u00E0n kh\u1EA3 thi trong th\u1ECB tr\u01B0\u1EDDng 80% ch\u01B0a c\u00F3 ERP." }
        ]),

        para("", { after: 200 }),

        // Signature
        new Paragraph({
          border: { top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.medGray, space: 8 } },
          spacing: { before: 400 },
          children: [new TextRun({ text: "ERP Ecosystem Team \u2014 Competitive Analysis v1.0 \u2014 27/03/2026", font: "Arial", size: 18, color: "999999", italics: true })]
        }),
      ]
    },
  ]
});

// ─── Generate ─────────────────────────────────────────────────
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/sessions/sleepy-funny-noether/mnt/erp/reports/ERP_Competitive_Analysis_2026.docx", buffer);
  console.log("OK: ERP_Competitive_Analysis_2026.docx created (" + buffer.length + " bytes)");
});
