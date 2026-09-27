import { relations } from "drizzle-orm";
import {
  bigint,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const vendedorEstadoEnum = pgEnum("vendedor_estado", [
  "activo",
  "inactivo",
  "suspendido",
]);

export const cartonEstadoEnum = pgEnum("carton_estado", [
  "disponible",
  "asignado",
  "vendido",
  "anulado",
  "devuelto",
]);

export const rendicionEstadoEnum = pgEnum("rendicion_estado", [
  "pendiente",
  "parcial",
  "saldado",
  "auditado",
]);

export const premioEstadoEnum = pgEnum("premio_estado", [
  "pendiente",
  "cantado",
  "validado",
  "entregado",
]);

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "referente",
  "vendedor",
  "escribano",
]);

export const localidades = pgTable(
  "localidades",
  {
    id: serial("id").primaryKey(),
    nombre: varchar("nombre", { length: 150 }).notNull(),
    provincia: varchar("provincia", { length: 100 }).notNull(),
    departamentoZona: varchar("departamento_zona", { length: 150 }).notNull(),
    referenteLocal: varchar("referente_local", { length: 150 }),
    telefonoReferente: varchar("telefono_referente", { length: 50 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("localidades_provincia_idx").on(table.provincia),
  ],
);

export const vendedores = pgTable(
  "vendedores",
  {
    id: serial("id").primaryKey(),
    codigoVendedor: varchar("codigo_vendedor", { length: 50 }).notNull(),
    nombreCompleto: varchar("nombre_completo", { length: 200 }).notNull(),
    dni: varchar("dni", { length: 20 }).notNull(),
    telefono: varchar("telefono", { length: 50 }),
    email: varchar("email", { length: 150 }),
    localidadId: integer("localidad_id")
      .notNull()
      .references(() => localidades.id, { onDelete: "cascade" }),
    comisionPorcentaje: numeric("comision_porcentaje", { precision: 5, scale: 2 })
      .notNull()
      .default("15.00"),
    estado: vendedorEstadoEnum("estado").notNull().default("activo"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("vendedores_codigo_unique").on(table.codigoVendedor),
    uniqueIndex("vendedores_dni_unique").on(table.dni),
    index("vendedores_localidad_idx").on(table.localidadId),
    index("vendedores_dni_idx").on(table.dni),
  ],
);

export const compradores = pgTable(
  "compradores",
  {
    id: serial("id").primaryKey(),
    nombreCompleto: varchar("nombre_completo", { length: 200 }).notNull(),
    dni: varchar("dni", { length: 20 }).notNull(),
    telefono: varchar("telefono", { length: 50 }),
    email: varchar("email", { length: 150 }),
    direccion: varchar("direccion", { length: 255 }),
    localidadId: integer("localidad_id").references(() => localidades.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("compradores_dni_unique").on(table.dni),
    index("compradores_dni_idx").on(table.dni),
    index("compradores_nombre_idx").on(table.nombreCompleto),
  ],
);

export const cartones = pgTable(
  "cartones",
  {
    id: serial("id").primaryKey(),
    numeroCarton: bigint("numero_carton", { mode: "number" }).notNull(),
    serie: varchar("serie", { length: 50 }).notNull().default("SERIE-ORO-2026"),
    talonario: varchar("talonario", { length: 50 }).notNull().default("TAL-01"),
    precio: numeric("precio", { precision: 10, scale: 2 }).notNull().default("5000.00"),
    estado: cartonEstadoEnum("estado").notNull().default("disponible"),
    vendedorId: integer("vendedor_id").references(() => vendedores.id, {
      onDelete: "set null",
    }),
    localidadId: integer("localidad_id").references(() => localidades.id, {
      onDelete: "set null",
    }),
    numerosBingo: jsonb("numeros_bingo").$type<number[]>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("cartones_numero_unique").on(table.numeroCarton),
    index("cartones_numero_idx").on(table.numeroCarton),
    index("cartones_estado_idx").on(table.estado),
    index("cartones_vendedor_idx").on(table.vendedorId),
  ],
);

export const ventas = pgTable(
  "ventas",
  {
    id: serial("id").primaryKey(),
    codigoRecibo: varchar("codigo_recibo", { length: 60 }).notNull(),
    cartonId: integer("carton_id")
      .notNull()
      .references(() => cartones.id, { onDelete: "restrict" }),
    compradorId: integer("comprador_id")
      .notNull()
      .references(() => compradores.id, { onDelete: "restrict" }),
    vendedorId: integer("vendedor_id")
      .notNull()
      .references(() => vendedores.id, { onDelete: "restrict" }),
    localidadId: integer("localidad_id")
      .notNull()
      .references(() => localidades.id, { onDelete: "restrict" }),
    fechaVenta: timestamp("fecha_venta", { withTimezone: true }).defaultNow().notNull(),
    monto: numeric("monto", { precision: 10, scale: 2 }).notNull(),
    metodoPago: varchar("metodo_pago", { length: 50 }).notNull(),
    comprobantePago: varchar("comprobante_pago", { length: 100 }),
    observaciones: text("observaciones"),
    estadoPago: varchar("estado_pago", { length: 30 }).notNull().default("cobrado"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("ventas_recibo_unique").on(table.codigoRecibo),
    uniqueIndex("ventas_carton_unique").on(table.cartonId),
    index("ventas_carton_idx").on(table.cartonId),
    index("ventas_comprador_idx").on(table.compradorId),
    index("ventas_vendedor_idx").on(table.vendedorId),
    index("ventas_fecha_idx").on(table.fechaVenta),
  ],
);

export const rendiciones = pgTable(
  "rendiciones",
  {
    id: serial("id").primaryKey(),
    codigoRendicion: varchar("codigo_rendicion", { length: 60 }).notNull(),
    vendedorId: integer("vendedor_id")
      .notNull()
      .references(() => vendedores.id, { onDelete: "cascade" }),
    localidadId: integer("localidad_id")
      .notNull()
      .references(() => localidades.id, { onDelete: "cascade" }),
    fechaRendicion: timestamp("fecha_rendicion", { withTimezone: true })
      .defaultNow()
      .notNull(),
    cartonesEntregados: integer("cartones_entregados").notNull().default(0),
    cartonesVendidos: integer("cartones_vendidos").notNull().default(0),
    cartonesDevueltos: integer("cartones_devueltos").notNull().default(0),
    totalBruto: numeric("total_bruto", { precision: 12, scale: 2 }).notNull(),
    comisionRetenida: numeric("comision_retenida", { precision: 12, scale: 2 }).notNull(),
    totalARendir: numeric("total_a_rendir", { precision: 12, scale: 2 }).notNull(),
    totalRendido: numeric("total_rendido", { precision: 12, scale: 2 }).notNull(),
    diferencia: numeric("diferencia", { precision: 12, scale: 2 }).notNull(),
    estado: rendicionEstadoEnum("estado").notNull().default("pendiente"),
    observaciones: text("observaciones"),
    comprobanteDeposito: varchar("comprobante_deposito", { length: 100 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("rendiciones_codigo_unique").on(table.codigoRendicion)],
);

export const premiosSorteo = pgTable("premios_sorteo", {
  id: serial("id").primaryKey(),
  orden: integer("orden").notNull(),
  nombrePremio: varchar("nombre_premio", { length: 200 }).notNull(),
  descripcion: text("descripcion"),
  montoEstimado: numeric("monto_estimado", { precision: 14, scale: 2 }),
  cartonGanadorId: integer("carton_ganador_id").references(() => cartones.id, {
    onDelete: "set null",
  }),
  horaGanado: timestamp("hora_ganado", { withTimezone: true }),
  estado: premioEstadoEnum("estado").notNull().default("pendiente"),
  notasEscribano: text("notas_escribano"),
  imagen: varchar("imagen", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    email: varchar("email", { length: 150 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: userRoleEnum("role").notNull().default("vendedor"),
    localidadId: integer("localidad_id").references(() => localidades.id, {
      onDelete: "set null",
    }),
    vendedorId: integer("vendedor_id").references(() => vendedores.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

export const sorteoBolillas = pgTable(
  "sorteo_bolillas",
  {
    id: serial("id").primaryKey(),
    numero: integer("numero").notNull(),
    orden: integer("orden").notNull(),
    extraidaEn: timestamp("extraida_en", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("sorteo_bolillas_numero_unique").on(table.numero)],
);

export const localidadesRelations = relations(localidades, ({ many }) => ({
  vendedores: many(vendedores),
  compradores: many(compradores),
  cartones: many(cartones),
  ventas: many(ventas),
  rendiciones: many(rendiciones),
  users: many(users),
}));

export const vendedoresRelations = relations(vendedores, ({ one, many }) => ({
  localidad: one(localidades, {
    fields: [vendedores.localidadId],
    references: [localidades.id],
  }),
  cartones: many(cartones),
  ventas: many(ventas),
  rendiciones: many(rendiciones),
}));

export const compradoresRelations = relations(compradores, ({ one, many }) => ({
  localidad: one(localidades, {
    fields: [compradores.localidadId],
    references: [localidades.id],
  }),
  ventas: many(ventas),
}));

export const cartonesRelations = relations(cartones, ({ one }) => ({
  vendedor: one(vendedores, {
    fields: [cartones.vendedorId],
    references: [vendedores.id],
  }),
  localidad: one(localidades, {
    fields: [cartones.localidadId],
    references: [localidades.id],
  }),
  venta: one(ventas, {
    fields: [cartones.id],
    references: [ventas.cartonId],
  }),
}));

export const ventasRelations = relations(ventas, ({ one }) => ({
  carton: one(cartones, {
    fields: [ventas.cartonId],
    references: [cartones.id],
  }),
  comprador: one(compradores, {
    fields: [ventas.compradorId],
    references: [compradores.id],
  }),
  vendedor: one(vendedores, {
    fields: [ventas.vendedorId],
    references: [vendedores.id],
  }),
  localidad: one(localidades, {
    fields: [ventas.localidadId],
    references: [localidades.id],
  }),
}));

export const rendicionesRelations = relations(rendiciones, ({ one }) => ({
  vendedor: one(vendedores, {
    fields: [rendiciones.vendedorId],
    references: [vendedores.id],
  }),
  localidad: one(localidades, {
    fields: [rendiciones.localidadId],
    references: [localidades.id],
  }),
}));

export const premiosRelations = relations(premiosSorteo, ({ one }) => ({
  cartonGanador: one(cartones, {
    fields: [premiosSorteo.cartonGanadorId],
    references: [cartones.id],
  }),
}));

export const usersRelations = relations(users, ({ one }) => ({
  localidad: one(localidades, {
    fields: [users.localidadId],
    references: [localidades.id],
  }),
  vendedor: one(vendedores, {
    fields: [users.vendedorId],
    references: [vendedores.id],
  }),
}));

export type Localidad = typeof localidades.$inferSelect;
export type Vendedor = typeof vendedores.$inferSelect;
export type Comprador = typeof compradores.$inferSelect;
export type Carton = typeof cartones.$inferSelect;
export type Venta = typeof ventas.$inferSelect;
export type Rendicion = typeof rendiciones.$inferSelect;
export type PremioSorteo = typeof premiosSorteo.$inferSelect;
export type User = typeof users.$inferSelect;
export type Role = User["role"];
export type CartonEstado = Carton["estado"];
