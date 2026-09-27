import ExcelJS from "exceljs";
import { formatDate, moneyExact } from "./format";
import { padronOficial } from "./queries";

type Padron = Awaited<ReturnType<typeof padronOficial>>;

const HEADERS = [
  "N° RECIBO",
  "N° CARTÓN",
  "SERIE",
  "TALONARIO",
  "TITULAR",
  "DNI",
  "TELÉFONO",
  "EMAIL",
  "DOMICILIO",
  "VENDEDOR",
  "CÓDIGO VENDEDOR",
  "LOCALIDAD",
  "PROVINCIA",
  "FECHA VENTA",
  "MONTO",
  "MÉTODO",
  "COMPROBANTE",
  "ESTADO",
];

function rowValues(r: Padron["rows"][number]) {
  return [
    r.recibo,
    r.numeroCarton,
    r.serie,
    r.talonario,
    r.titular,
    r.dni,
    r.telefono ?? "",
    r.email ?? "",
    r.domicilio ?? "",
    r.vendedor,
    r.codigoVendedor,
    r.localidad,
    r.provincia,
    formatDate(r.fechaVenta),
    Number(r.monto),
    r.metodo,
    r.comprobante ?? "",
    "HABILITADO PARA JUGAR",
  ];
}

export async function buildXlsx(padron: Padron) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Bingo Dorado del NEA 2026";
  wb.created = new Date();

  const sheet = wb.addWorksheet("Cartones Sorteo Oficial", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  sheet.columns = HEADERS.map((h, i) => ({
    header: h,
    key: String(i),
    width: Math.max(14, Math.min(28, h.length + 6)),
  }));
  sheet.getRow(1).eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD4AF37" } };
    cell.font = { bold: true, color: { argb: "FF1A1204" }, name: "Calibri" };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });
  sheet.getRow(1).height = 22;
  for (const r of padron.rows) {
    sheet.addRow(rowValues(r));
  }

  const resumen = wb.addWorksheet("Resumen por Localidad");
  resumen.columns = [
    { header: "LOCALIDAD", key: "localidad", width: 28 },
    { header: "PROVINCIA", key: "provincia", width: 16 },
    { header: "CARTONES VENDIDOS", key: "cartones", width: 20 },
    { header: "RECAUDACIÓN", key: "recaudacion", width: 18 },
  ];
  resumen.getRow(1).eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD4AF37" } };
    cell.font = { bold: true, color: { argb: "FF1A1204" } };
  });
  for (const r of padron.resumen) {
    resumen.addRow({
      localidad: r.localidad,
      provincia: r.provincia,
      cartones: Number(r.cartones),
      recaudacion: Number(r.recaudacion),
    });
  }

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}

export function buildCsv(padron: Padron) {
  const lines = [HEADERS.join(";")];
  for (const r of padron.rows) {
    const vals = rowValues(r).map((v) => {
      const s = String(v ?? "");
      if (s.includes(";") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    });
    lines.push(vals.join(";"));
  }
  lines.push("");
  lines.push("RESUMEN POR LOCALIDAD");
  lines.push(["LOCALIDAD", "PROVINCIA", "CARTONES", "RECAUDACIÓN"].join(";"));
  for (const r of padron.resumen) {
    lines.push(
      [r.localidad, r.provincia, String(r.cartones), moneyExact(r.recaudacion)].join(";"),
    );
  }
  return `\uFEFF${lines.join("\r\n")}`;
}
