# 🏆 BINGO DORADO DEL NEA — Edición Provincial 2026

> Sistema provincial de venta de cartones de bingo con trazabilidad total
> **cartón → comprador (nombre + DNI) → vendedor → localidad → fecha → monto**.
> **Chaco • Corrientes • Misiones • Formosa**

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791) ![Drizzle](https://img.shields.io/badge/Drizzle-ORM-C5F74F) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38BDF8)

---

## ✨ Funcionalidades

| Módulo | Ruta | Descripción |
| --- | --- | --- |
| Dashboard ejecutivo | `/dashboard` | KPIs, provincias NEA, top 8 vendedores, premios, ticker en vivo |
| Punto de venta móvil | `/ventas/nueva` | Validación de cartón en vivo, autocompletado por DNI, ticket al confirmar |
| Ventas | `/ventas` | Listado con búsqueda por cartón, DNI, titular o recibo |
| Ticket dorado | `/ventas/[id]/ticket` | Imprimible (CSS print) + compartir por WhatsApp |
| Cartones y lotes | `/cartones` | Filtros, generar lote por rango (máx. 1000), asignar a vendedor |
| Mesa de sorteo | `/sorteo` | Validación cruzada cartón/DNI, adjudicación con acta, bolillero 1–90 con voz |
| Localidades / Vendedores / Compradores | `/localidades` `/vendedores` `/compradores` | ABM con bloqueos de integridad |
| Rendiciones | `/rendiciones` | Bruto − comisión = a rendir; diferencia = rendido − a rendir |
| Exportación oficial | `/exportar` | XLSX (2 hojas), CSV `;` + BOM UTF-8, JSON |

### Reglas de negocio garantizadas
- ❌ Sin **nombre completo** → *"El NOMBRE COMPLETO es OBLIGATORIO para validar ganadores"*
- ❌ DNI fuera de `^[0-9]{7,9}$` → rechazo
- ❌ Cartón ya vendido → **409** con titular, DNI y recibo existentes
- ❌ Cartón anulado/devuelto → bloqueo
- ❌ Adjudicar premio a cartón **no vendido** → bloqueo notarial
- 🔒 Venta en transacción con `SELECT … FOR UPDATE` sobre el cartón y recibo correlativo `REC-2026-00001`

---

## 🧱 Stack

- **Next.js 16** (App Router, Server Components, Server Actions) — front y back en un solo proyecto
- **PostgreSQL** + **Drizzle ORM**
- **Tailwind CSS 4**
- **ExcelJS** para exportaciones
- Autenticación propia con cookie firmada HMAC + contraseñas `scrypt`

## 📁 Estructura

```
├── database/schema.sql          # Esquema SQL completo (referencia / import manual)
├── public/images/               # Logo, premios y fondos
├── src/
│   ├── app/
│   │   ├── (app)/               # Pantallas protegidas (FRONT)
│   │   ├── api/                 # Endpoints REST (BACK)
│   │   ├── login/               # Ingreso
│   │   └── actions.ts           # Server Actions (BACK)
│   ├── components/              # UI reutilizable
│   ├── db/                      # schema.ts + conexión
│   ├── lib/                     # Lógica: ventas, queries, seed, auth, export
│   └── proxy.ts                 # Protección de rutas
├── .env.example
└── drizzle.config.json
```

---

## 🚀 Instalación local

**Requisitos:** Node.js 20+ y PostgreSQL 14+.

```bash
git clone https://github.com/TU_USUARIO/bingo-dorado-nea.git
cd bingo-dorado-nea
npm install
cp .env.example .env        # editar DATABASE_URL y AUTH_SECRET
npx drizzle-kit push        # crea las tablas
npm run dev                 # http://localhost:3000
```

> Al primer ingreso, si la base está vacía, se cargan automáticamente los **datos NEA de ejemplo**.

### Variables de entorno

| Variable | Ejemplo | Descripción |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/bingo_nea` | Conexión PostgreSQL |
| `AUTH_SECRET` | cadena aleatoria larga | Firma de sesiones (obligatorio cambiar en producción) |

Generar un secreto: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

> ⚠️ `drizzle.config.json` tiene la URL local fija. En producción, editala o usá la misma `DATABASE_URL`.

---

## 👤 Usuarios de demostración

Contraseña: **`BingoDorado2026`** (cambiar en producción)

| Rol | Email | Alcance |
| --- | --- | --- |
| admin | `admin@bingodorado.com` | Todo |
| referente | `referente@bingodorado.com` | Solo Resistencia |
| vendedor | `vendedor@bingodorado.com` | POS y stock propio (VND-CHA-01) |
| escribano | `escribania@bingodorado.com` | Sorteo, actas y padrón |

**Datos semilla:** 10 localidades · 14 vendedores · 25 compradores · 200 cartones (100001–100200) · 130 ventas · 5 rendiciones · 6 premios.
Prueba rápida en `/sorteo`: cartón **100008** o DNI **28456789**.

---

## 🌐 Despliegue en producción

### Opción 1 — VPS (Hostinger VPS, DigitalOcean, etc.)

```bash
# en el servidor
sudo apt install -y nodejs npm postgresql nginx
sudo -u postgres createuser -P bingo
sudo -u postgres createdb -O bingo bingo_nea

git clone https://github.com/TU_USUARIO/bingo-dorado-nea.git
cd bingo-dorado-nea
npm ci
nano .env                     # DATABASE_URL + AUTH_SECRET
npx drizzle-kit push
npm run build
npm i -g pm2
pm2 start npm --name bingo -- start
pm2 save && pm2 startup
```

Nginx para `bingo.tudominio.com`:

```nginx
server {
  server_name bingo.tudominio.com;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

SSL: `sudo certbot --nginx -d bingo.tudominio.com`

Actualizar: `git pull && npm ci && npx drizzle-kit push && npm run build && pm2 restart bingo`

### Opción 2 — Vercel + Neon/Supabase (sin servidor)

1. Crear base PostgreSQL en [Neon](https://neon.tech) o [Supabase](https://supabase.com).
2. Importar el repo en [Vercel](https://vercel.com) y cargar `DATABASE_URL` y `AUTH_SECRET`.
3. Ejecutar localmente `npx drizzle-kit push` apuntando a esa base.
4. Asignar el dominio `bingo.tudominio.com` en Vercel.

> ℹ️ El hosting compartido PHP (cPanel/FTP) **no** ejecuta Node.js: usar una de las opciones anteriores.

---

## 🛠️ Scripts

| Comando | Acción |
| --- | --- |
| `npm run dev` | Desarrollo |
| `npm run build` | Build de producción |
| `npm start` | Servidor de producción |
| `npm run typecheck` | Verificación TypeScript |
| `npx drizzle-kit push` | Sincroniza el esquema con la base |

## 🔐 Seguridad

- Nunca subas `.env` (ya está en `.gitignore`).
- Cambiá `AUTH_SECRET` y las contraseñas demo antes de producción.
- Cookies `httpOnly`, `sameSite=lax`, `secure` en producción.

## 📄 Licencia

Uso interno — Bingo Dorado del NEA 2026. Todos los derechos reservados.
