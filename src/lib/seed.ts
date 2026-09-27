import { db } from "@/db";
import {
  cartones,
  compradores,
  localidades,
  premiosSorteo,
  rendiciones,
  users,
  vendedores,
  ventas,
} from "@/db/schema";
import { DEMO_PASSWORD, SERIE_DEFAULT } from "./constants";
import { generateBingoNumbers, talonarioFor } from "./bingo";
import { hashPassword } from "./session-token";

const LOCALIDADES_SEED = [
  {
    nombre: "Resistencia",
    provincia: "Chaco",
    departamentoZona: "Departamento San Fernando",
    referenteLocal: "MARTA ALICIA BRITEZ",
    telefonoReferente: "3624-551122",
  },
  {
    nombre: "Corrientes Capital",
    provincia: "Corrientes",
    departamentoZona: "Capital",
    referenteLocal: "JORGE LUIS ACUÑA",
    telefonoReferente: "3794-220011",
  },
  {
    nombre: "Posadas",
    provincia: "Misiones",
    departamentoZona: "Capital",
    referenteLocal: "SILVINA BEATRIZ KUSCHNIR",
    telefonoReferente: "3764-889900",
  },
  {
    nombre: "Formosa Capital",
    provincia: "Formosa",
    departamentoZona: "Capital",
    referenteLocal: "RAMON OSCAR INSFRAN",
    telefonoReferente: "3704-667788",
  },
  {
    nombre: "Presidencia Roque Sáenz Peña",
    provincia: "Chaco",
    departamentoZona: "Comandante Fernández",
    referenteLocal: "NORBERTO DANIEL CANTEROS",
    telefonoReferente: "3644-112233",
  },
  {
    nombre: "Goya",
    provincia: "Corrientes",
    departamentoZona: "Goya",
    referenteLocal: "ELIDA ROSA SOSA",
    telefonoReferente: "3777-445566",
  },
  {
    nombre: "Oberá",
    provincia: "Misiones",
    departamentoZona: "Oberá",
    referenteLocal: "PABLO ANDRES KRAMER",
    telefonoReferente: "3755-778899",
  },
  {
    nombre: "Clorinda",
    provincia: "Formosa",
    departamentoZona: "Pilcomayo",
    referenteLocal: "GRACIELA ESTELA BENITEZ",
    telefonoReferente: "3718-334455",
  },
  {
    nombre: "Paso de los Libres",
    provincia: "Corrientes",
    departamentoZona: "Paso de los Libres",
    referenteLocal: "HUGO FERNANDO GOMEZ",
    telefonoReferente: "3772-556677",
  },
  {
    nombre: "Eldorado",
    provincia: "Misiones",
    departamentoZona: "Eldorado",
    referenteLocal: "ANALIA VERONICA RUIZ",
    telefonoReferente: "3751-223344",
  },
];

const VENDEDORES_SEED = [
  { codigo: "VND-CHA-01", nombre: "CARLOS ALBERTO MEZA", dni: "25111222", tel: "3624-100001", email: "carlos.meza@bingodorado.com", loc: "Resistencia", comision: "16.00" },
  { codigo: "VND-CHA-02", nombre: "ROSA MARIA GONZALEZ", dni: "26222333", tel: "3624-100002", email: "rosa.gonzalez@bingodorado.com", loc: "Resistencia", comision: "15.00" },
  { codigo: "VND-CHA-03", nombre: "DIEGO ARMANDO LOPEZ", dni: "27333444", tel: "3644-100003", email: "diego.lopez@bingodorado.com", loc: "Presidencia Roque Sáenz Peña", comision: "17.00" },
  { codigo: "VND-CHA-04", nombre: "LUCIA FERNANDA AQUINO", dni: "28444555", tel: "3644-100004", email: "lucia.aquino@bingodorado.com", loc: "Presidencia Roque Sáenz Peña", comision: "15.50" },
  { codigo: "VND-COR-01", nombre: "MARCELO JAVIER PERALTA", dni: "24555666", tel: "3794-200001", email: "marcelo.peralta@bingodorado.com", loc: "Corrientes Capital", comision: "16.50" },
  { codigo: "VND-COR-02", nombre: "ANA GABRIELA ROMERO", dni: "25666777", tel: "3794-200002", email: "ana.romero@bingodorado.com", loc: "Corrientes Capital", comision: "15.00" },
  { codigo: "VND-COR-03", nombre: "SERGIO DANIEL BARRIOS", dni: "26777888", tel: "3777-200003", email: "sergio.barrios@bingodorado.com", loc: "Goya", comision: "18.00" },
  { codigo: "VND-COR-04", nombre: "PATRICIA NOEMI IBARRA", dni: "27888999", tel: "3772-200004", email: "patricia.ibarra@bingodorado.com", loc: "Paso de los Libres", comision: "15.00" },
  { codigo: "VND-MIS-01", nombre: "FEDERICO MATIAS KLEIN", dni: "28999000", tel: "3764-300001", email: "federico.klein@bingodorado.com", loc: "Posadas", comision: "16.00" },
  { codigo: "VND-MIS-02", nombre: "VERONICA ELIZABETH DIAZ", dni: "23111000", tel: "3755-300002", email: "veronica.diaz@bingodorado.com", loc: "Oberá", comision: "15.50" },
  { codigo: "VND-MIS-03", nombre: "GUSTAVO ADOLFO BENITEZ", dni: "24222111", tel: "3751-300003", email: "gustavo.benitez@bingodorado.com", loc: "Eldorado", comision: "17.50" },
  { codigo: "VND-FOR-01", nombre: "CRISTINA BEATRIZ INSFRAN", dni: "25333222", tel: "3704-400001", email: "cristina.insfran@bingodorado.com", loc: "Formosa Capital", comision: "16.00" },
  { codigo: "VND-FOR-02", nombre: "PABLO CESAR MAIDANA", dni: "26444333", tel: "3704-400002", email: "pablo.maidana@bingodorado.com", loc: "Formosa Capital", comision: "15.00" },
  { codigo: "VND-FOR-03", nombre: "MARTA ALICIA CACERES", dni: "27555444", tel: "3718-400003", email: "marta.caceres@bingodorado.com", loc: "Clorinda", comision: "18.00" },
];

const COMPRADORES_SEED = [
  { nombre: "JUAN CARLOS BENITEZ", dni: "28456789", tel: "3624-551001", email: "juan.benitez@correo.com", dir: "Av. 9 de Julio 1250", loc: "Resistencia" },
  { nombre: "MARIA ELENA GOMEZ", dni: "27123456", tel: "3794-221002", email: "maria.gomez@correo.com", dir: "Junín 880", loc: "Corrientes Capital" },
  { nombre: "ANA LUCIA PERALTA", dni: "30987654", tel: "3764-331003", email: "ana.peralta@correo.com", dir: "Bolívar 450", loc: "Posadas" },
  { nombre: "ROBERTO DANIEL ACOSTA", dni: "25678901", tel: "3704-441004", email: "roberto.acosta@correo.com", dir: "Av. 25 de Mayo 2100", loc: "Formosa Capital" },
  { nombre: "SILVIA BEATRIZ MAIDANA", dni: "29333444", tel: "3644-551005", email: "silvia.maidana@correo.com", dir: "San Martín 333", loc: "Presidencia Roque Sáenz Peña" },
  { nombre: "CARLOS ALBERTO FERNANDEZ", dni: "22115678", tel: "3777-661006", email: "carlos.fernandez@correo.com", dir: "Belgrano 90", loc: "Goya" },
  { nombre: "LAURA GIMENEZ", dni: "33445566", tel: "3755-771007", email: "laura.gimenez@correo.com", dir: "Ruta 14 km 2", loc: "Oberá" },
  { nombre: "PEDRO RAMON OJEDA", dni: "18777654", tel: "3718-881008", email: "pedro.ojeda@correo.com", dir: "San Martín 1500", loc: "Clorinda" },
  { nombre: "VALERIA SOLEDAD RIOS", dni: "35566778", tel: "3772-991009", email: "valeria.rios@correo.com", dir: "Colón 220", loc: "Paso de los Libres" },
  { nombre: "HUGO MARTIN CACERES", dni: "24222110", tel: "3751-101010", email: "hugo.caceres@correo.com", dir: "Av. San Martín 800", loc: "Eldorado" },
  { nombre: "GRACIELA NOEMI TORRES", dni: "26555000", tel: "3624-111011", email: "graciela.torres@correo.com", dir: "French 455", loc: "Resistencia" },
  { nombre: "DIEGO ARMANDO SOSA", dni: "30111222", tel: "3794-121012", email: "diego.sosa@correo.com", dir: "Pellegrini 670", loc: "Corrientes Capital" },
  { nombre: "PATRICIA VERONICA DIAZ", dni: "27888990", tel: "3764-131013", email: "patricia.diaz@correo.com", dir: "Urquiza 210", loc: "Posadas" },
  { nombre: "OSCAR EDUARDO ROMERO", dni: "19888777", tel: "3704-141014", email: "oscar.romero@correo.com", dir: "España 990", loc: "Formosa Capital" },
  { nombre: "CLAUDIA INES MARTINEZ", dni: "31222333", tel: "3644-151015", email: "claudia.martinez@correo.com", dir: "Moreno 145", loc: "Presidencia Roque Sáenz Peña" },
  { nombre: "FERNANDO GABRIEL SUAREZ", dni: "28999001", tel: "3777-161016", email: "fernando.suarez@correo.com", dir: "3 de Abril 500", loc: "Goya" },
  { nombre: "MICAELA AYELEN BRITEZ", dni: "40111222", tel: "3755-171017", email: "micaela.britez@correo.com", dir: "Los Pinos 44", loc: "Oberá" },
  { nombre: "RAMON VICENTE BARRIOS", dni: "17333444", tel: "3718-181018", email: "ramon.barrios@correo.com", dir: "Paraguay 300", loc: "Clorinda" },
  { nombre: "SOFIA BELEN ALMIRON", dni: "38777666", tel: "3772-191019", email: "sofia.almiron@correo.com", dir: "Mitre 88", loc: "Paso de los Libres" },
  { nombre: "LUIS ALBERTO GONZALEZ", dni: "21444555", tel: "3751-201020", email: "luis.gonzalez@correo.com", dir: "Misiones 1200", loc: "Eldorado" },
  { nombre: "CECILIA RAQUEL IBARRA", dni: "29666777", tel: "3624-211021", email: "cecilia.ibarra@correo.com", dir: "López y Planes 77", loc: "Resistencia" },
  { nombre: "MIGUEL ANGEL SOSA", dni: "25333444", tel: "3794-221022", email: "miguel.sosa@correo.com", dir: "Salta 410", loc: "Corrientes Capital" },
  { nombre: "DANIELA FLORENCIA RUIZ", dni: "36888999", tel: "3764-231023", email: "daniela.ruiz@correo.com", dir: "Buenos Aires 55", loc: "Posadas" },
  { nombre: "JOSE LUIS VILLALBA", dni: "20555666", tel: "3704-241024", email: "jose.villalba@correo.com", dir: "Naurá 160", loc: "Formosa Capital" },
  { nombre: "AGUSTINA PAZ MEZA", dni: "41222333", tel: "3644-251025", email: "agustina.meza@correo.com", dir: "Sarmiento 18", loc: "Presidencia Roque Sáenz Peña" },
];

const QUOTAS = [20, 10, 9, 6, 16, 9, 7, 6, 14, 8, 5, 12, 5, 3];

function vendedorIndexForSale(i: number) {
  let acc = 0;
  for (let v = 0; v < QUOTAS.length; v++) {
    acc += QUOTAS[v];
    if (i < acc) return v;
  }
  return i % 14;
}

const METODOS = ["efectivo", "transferencia", "mercadopago", "debito", "efectivo"] as const;

let seeding: Promise<void> | null = null;

export async function ensureSeeded() {
  const existing = await db.select({ id: users.id }).from(users).limit(1);
  if (existing.length) return;
  if (!seeding) seeding = seedAll().finally(() => { seeding = null; });
  await seeding;
}

export async function seedAll() {
  const locRows = await db.insert(localidades).values(LOCALIDADES_SEED).returning();
  const locByName = new Map(locRows.map((l) => [l.nombre, l]));

  const vendRows = await db
    .insert(vendedores)
    .values(
      VENDEDORES_SEED.map((v) => ({
        codigoVendedor: v.codigo,
        nombreCompleto: v.nombre,
        dni: v.dni,
        telefono: v.tel,
        email: v.email,
        localidadId: locByName.get(v.loc)!.id,
        comisionPorcentaje: v.comision,
        estado: "activo" as const,
      })),
    )
    .returning();

  const compRows = await db
    .insert(compradores)
    .values(
      COMPRADORES_SEED.map((c) => ({
        nombreCompleto: c.nombre,
        dni: c.dni,
        telefono: c.tel,
        email: c.email,
        direccion: c.dir,
        localidadId: locByName.get(c.loc)?.id ?? null,
      })),
    )
    .returning();

  const cartonValues = [];
  for (let n = 100001; n <= 100200; n++) {
    const i = n - 100001;
    let estado: "disponible" | "asignado" | "vendido" | "anulado" | "devuelto" = "disponible";
    if (i < 130) estado = "vendido";
    else if (i < 180) estado = "asignado";
    else if (i < 195) estado = "disponible";
    else if (i < 198) estado = "anulado";
    else estado = "devuelto";

    const vIdx = i < 180 ? (i < 130 ? vendedorIndexForSale(i) : i % 14) : 0;
    const vend = vendRows[vIdx];
    cartonValues.push({
      numeroCarton: n,
      serie: SERIE_DEFAULT,
      talonario: talonarioFor(n),
      precio: "5000.00",
      estado,
      vendedorId: estado === "disponible" ? null : vend.id,
      localidadId: estado === "disponible" ? null : vend.localidadId,
      numerosBingo: generateBingoNumbers(n),
    });
  }

  const cartonRows = await db.insert(cartones).values(cartonValues).returning();
  const cartonByNumero = new Map(cartonRows.map((c) => [c.numeroCarton, c]));

  const ventaValues = [];
  for (let i = 0; i < 130; i++) {
    const numero = 100001 + i;
    const carton = cartonByNumero.get(numero)!;
    const vIdx = vendedorIndexForSale(i);
    const vend = vendRows[vIdx];
    const comprador = numero === 100008 ? compRows[0] : compRows[i % compRows.length];
    const fecha = new Date(Date.UTC(2026, 0, 15, 12, 0, 0));
    fecha.setUTCDate(fecha.getUTCDate() + (i % 62));
    fecha.setUTCHours(12 + (i % 8), (i * 7) % 60, 0, 0);
    const metodo = METODOS[i % METODOS.length];
    ventaValues.push({
      codigoRecibo: `REC-2026-${String(i + 1).padStart(5, "0")}`,
      cartonId: carton.id,
      compradorId: comprador.id,
      vendedorId: vend.id,
      localidadId: vend.localidadId,
      fechaVenta: fecha,
      monto: "5000.00",
      metodoPago: metodo,
      comprobantePago:
        metodo === "efectivo"
          ? null
          : metodo === "mercadopago"
            ? `MP-2026-${String(i + 40).padStart(5, "0")}`
            : metodo === "transferencia"
              ? `TR-NEA-${String(i + 100).padStart(4, "0")}`
              : `DEB-${String(i + 200).padStart(4, "0")}`,
      observaciones: i % 17 === 0 ? "Venta territorial en vía pública" : null,
      estadoPago: "cobrado",
    });
  }
  await db.insert(ventas).values(ventaValues);

  const soldByVendor = new Map<number, { vendidos: number; bruto: number }>();
  for (let i = 0; i < 130; i++) {
    const vIdx = vendedorIndexForSale(i);
    const id = vendRows[vIdx].id;
    const cur = soldByVendor.get(id) ?? { vendidos: 0, bruto: 0 };
    cur.vendidos += 1;
    cur.bruto += 5000;
    soldByVendor.set(id, cur);
  }

  const assignedByVendor = new Map<number, number>();
  for (const c of cartonRows) {
    if (!c.vendedorId) continue;
    if (c.estado === "asignado" || c.estado === "vendido" || c.estado === "devuelto") {
      assignedByVendor.set(c.vendedorId, (assignedByVendor.get(c.vendedorId) ?? 0) + 1);
    }
  }

  const rendicionSpecs = [
    { vend: vendRows[0], estado: "saldado" as const, rendidoFactor: 1, devueltos: 0 },
    { vend: vendRows[4], estado: "parcial" as const, rendidoFactor: 0.6, devueltos: 1 },
    { vend: vendRows[8], estado: "pendiente" as const, rendidoFactor: 0, devueltos: 0 },
    { vend: vendRows[11], estado: "saldado" as const, rendidoFactor: 1, devueltos: 0 },
    { vend: vendRows[2], estado: "auditado" as const, rendidoFactor: 1, devueltos: 2 },
  ];

  await db.insert(rendiciones).values(
    rendicionSpecs.map((spec, idx) => {
      const stats = soldByVendor.get(spec.vend.id) ?? { vendidos: 0, bruto: 0 };
      const entregados = assignedByVendor.get(spec.vend.id) ?? stats.vendidos;
      const comisionPct = Number(spec.vend.comisionPorcentaje);
      const comision = Math.round(stats.bruto * (comisionPct / 100) * 100) / 100;
      const aRendir = Math.round((stats.bruto - comision) * 100) / 100;
      const rendido = Math.round(aRendir * spec.rendidoFactor * 100) / 100;
      return {
        codigoRendicion: `RND-2026-${String(idx + 1).padStart(4, "0")}`,
        vendedorId: spec.vend.id,
        localidadId: spec.vend.localidadId,
        fechaRendicion: new Date(Date.UTC(2026, 2, 5 + idx, 15, 30, 0)),
        cartonesEntregados: entregados,
        cartonesVendidos: stats.vendidos,
        cartonesDevueltos: spec.devueltos,
        totalBruto: stats.bruto.toFixed(2),
        comisionRetenida: comision.toFixed(2),
        totalARendir: aRendir.toFixed(2),
        totalRendido: rendido.toFixed(2),
        diferencia: (rendido - aRendir).toFixed(2),
        estado: spec.estado,
        observaciones:
          spec.estado === "pendiente"
            ? "Aguardando depósito en cuenta provincial"
            : spec.estado === "parcial"
              ? "Pago parcial por transferencia bancaria"
              : "Rendición controlada por tesorería provincial",
        comprobanteDeposito: spec.rendidoFactor > 0 ? `DEP-NEA-2026-${idx + 1}` : null,
      };
    }),
  );

  const ganadorHilux = cartonByNumero.get(100008)!;
  const ganadorCronos = cartonByNumero.get(100042)!;

  await db.insert(premiosSorteo).values([
    {
      orden: 1,
      nombrePremio: "Toyota Hilux 4x4 + $15.000.000",
      descripcion: "Camioneta 0km más premio en efectivo. Ronda de oro mayor.",
      montoEstimado: "65000000.00",
      cartonGanadorId: ganadorHilux.id,
      horaGanado: new Date("2026-03-21T21:15:00-03:00"),
      estado: "validado",
      notasEscribano:
        "Acta notarial N° 26/2026. Titular JUAN CARLOS BENITEZ DNI 28.456.789. Cartón BD-100008 habilitado y cotejado.",
      imagen: "/images/prize-hilux.jpg",
    },
    {
      orden: 2,
      nombrePremio: "Fiat Cronos 0km",
      descripcion: "Sedán 0km línea 2026. Segunda ronda provincial.",
      montoEstimado: "28000000.00",
      cartonGanadorId: ganadorCronos.id,
      horaGanado: new Date("2026-03-21T21:40:00-03:00"),
      estado: "cantado",
      notasEscribano: "Cantado en viva voz. Pendiente de validación cruzada final.",
      imagen: "/images/prize-cronos.jpg",
    },
    {
      orden: 3,
      nombrePremio: "Moto 250cc",
      descripcion: "Motocicleta 250 cc 0km para la tercera ronda.",
      montoEstimado: "4500000.00",
      estado: "pendiente",
      imagen: "/images/prize-moto.jpg",
    },
    {
      orden: 4,
      nombrePremio: "Línea de Oro $3.000.000",
      descripcion: "Premio en efectivo por línea completa.",
      montoEstimado: "3000000.00",
      estado: "pendiente",
    },
    {
      orden: 5,
      nombrePremio: "Estímulo red de vendedores",
      descripcion: "Premio especial para el vendedor con mayor recaudación territorial.",
      montoEstimado: "1500000.00",
      estado: "pendiente",
    },
    {
      orden: 6,
      nombrePremio: 'Smart TV 65" 4K',
      descripcion: "Televisor Smart 65 pulgadas 4K — ronda de cierre.",
      montoEstimado: "1200000.00",
      estado: "pendiente",
      imagen: "/images/prize-tv.jpg",
    },
  ]);

  const passwordHash = hashPassword(DEMO_PASSWORD);
  const resistencia = locByName.get("Resistencia")!;
  const vendCha01 = vendRows[0];

  await db.insert(users).values([
    {
      name: "Administración Provincial",
      email: "admin@bingodorado.com",
      passwordHash,
      role: "admin",
    },
    {
      name: "MARTA ALICIA BRITEZ",
      email: "referente@bingodorado.com",
      passwordHash,
      role: "referente",
      localidadId: resistencia.id,
    },
    {
      name: "CARLOS ALBERTO MEZA",
      email: "vendedor@bingodorado.com",
      passwordHash,
      role: "vendedor",
      localidadId: vendCha01.localidadId,
      vendedorId: vendCha01.id,
    },
    {
      name: "Escribana SILVIA N. FALCON",
      email: "escribania@bingodorado.com",
      passwordHash,
      role: "escribano",
    },
  ]);
}
