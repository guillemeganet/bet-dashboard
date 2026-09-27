--
-- PostgreSQL database dump
--

\restrict thqHGWuMFS8ZFMwM4QBroikQJZ9vRoCqQ13BfcflbW2Q3ZPWWTte63X7JTsfkZR

-- Dumped from database version 15.16 (Debian 15.16-0+deb12u1)
-- Dumped by pg_dump version 15.16 (Debian 15.16-0+deb12u1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: carton_estado; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.carton_estado AS ENUM (
    'disponible',
    'asignado',
    'vendido',
    'anulado',
    'devuelto'
);


ALTER TYPE public.carton_estado OWNER TO postgres;

--
-- Name: premio_estado; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.premio_estado AS ENUM (
    'pendiente',
    'cantado',
    'validado',
    'entregado'
);


ALTER TYPE public.premio_estado OWNER TO postgres;

--
-- Name: rendicion_estado; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.rendicion_estado AS ENUM (
    'pendiente',
    'parcial',
    'saldado',
    'auditado'
);


ALTER TYPE public.rendicion_estado OWNER TO postgres;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'admin',
    'referente',
    'vendedor',
    'escribano'
);


ALTER TYPE public.user_role OWNER TO postgres;

--
-- Name: vendedor_estado; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.vendedor_estado AS ENUM (
    'activo',
    'inactivo',
    'suspendido'
);


ALTER TYPE public.vendedor_estado OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cartones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cartones (
    id integer NOT NULL,
    numero_carton bigint NOT NULL,
    serie character varying(50) DEFAULT 'SERIE-ORO-2026'::character varying NOT NULL,
    talonario character varying(50) DEFAULT 'TAL-01'::character varying NOT NULL,
    precio numeric(10,2) DEFAULT 5000.00 NOT NULL,
    estado public.carton_estado DEFAULT 'disponible'::public.carton_estado NOT NULL,
    vendedor_id integer,
    localidad_id integer,
    numeros_bingo jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.cartones OWNER TO postgres;

--
-- Name: cartones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cartones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cartones_id_seq OWNER TO postgres;

--
-- Name: cartones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cartones_id_seq OWNED BY public.cartones.id;


--
-- Name: compradores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.compradores (
    id integer NOT NULL,
    nombre_completo character varying(200) NOT NULL,
    dni character varying(20) NOT NULL,
    telefono character varying(50),
    email character varying(150),
    direccion character varying(255),
    localidad_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.compradores OWNER TO postgres;

--
-- Name: compradores_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.compradores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.compradores_id_seq OWNER TO postgres;

--
-- Name: compradores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.compradores_id_seq OWNED BY public.compradores.id;


--
-- Name: localidades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.localidades (
    id integer NOT NULL,
    nombre character varying(150) NOT NULL,
    provincia character varying(100) NOT NULL,
    departamento_zona character varying(150) NOT NULL,
    referente_local character varying(150),
    telefono_referente character varying(50),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.localidades OWNER TO postgres;

--
-- Name: localidades_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.localidades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.localidades_id_seq OWNER TO postgres;

--
-- Name: localidades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.localidades_id_seq OWNED BY public.localidades.id;


--
-- Name: premios_sorteo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.premios_sorteo (
    id integer NOT NULL,
    orden integer NOT NULL,
    nombre_premio character varying(200) NOT NULL,
    descripcion text,
    monto_estimado numeric(14,2),
    carton_ganador_id integer,
    hora_ganado timestamp with time zone,
    estado public.premio_estado DEFAULT 'pendiente'::public.premio_estado NOT NULL,
    notas_escribano text,
    imagen character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.premios_sorteo OWNER TO postgres;

--
-- Name: premios_sorteo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.premios_sorteo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.premios_sorteo_id_seq OWNER TO postgres;

--
-- Name: premios_sorteo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.premios_sorteo_id_seq OWNED BY public.premios_sorteo.id;


--
-- Name: rendiciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rendiciones (
    id integer NOT NULL,
    codigo_rendicion character varying(60) NOT NULL,
    vendedor_id integer NOT NULL,
    localidad_id integer NOT NULL,
    fecha_rendicion timestamp with time zone DEFAULT now() NOT NULL,
    cartones_entregados integer DEFAULT 0 NOT NULL,
    cartones_vendidos integer DEFAULT 0 NOT NULL,
    cartones_devueltos integer DEFAULT 0 NOT NULL,
    total_bruto numeric(12,2) NOT NULL,
    comision_retenida numeric(12,2) NOT NULL,
    total_a_rendir numeric(12,2) NOT NULL,
    total_rendido numeric(12,2) NOT NULL,
    diferencia numeric(12,2) NOT NULL,
    estado public.rendicion_estado DEFAULT 'pendiente'::public.rendicion_estado NOT NULL,
    observaciones text,
    comprobante_deposito character varying(100),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.rendiciones OWNER TO postgres;

--
-- Name: rendiciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rendiciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.rendiciones_id_seq OWNER TO postgres;

--
-- Name: rendiciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rendiciones_id_seq OWNED BY public.rendiciones.id;


--
-- Name: sorteo_bolillas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sorteo_bolillas (
    id integer NOT NULL,
    numero integer NOT NULL,
    orden integer NOT NULL,
    extraida_en timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.sorteo_bolillas OWNER TO postgres;

--
-- Name: sorteo_bolillas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sorteo_bolillas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sorteo_bolillas_id_seq OWNER TO postgres;

--
-- Name: sorteo_bolillas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sorteo_bolillas_id_seq OWNED BY public.sorteo_bolillas.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    email character varying(150) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role public.user_role DEFAULT 'vendedor'::public.user_role NOT NULL,
    localidad_id integer,
    vendedor_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vendedores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendedores (
    id integer NOT NULL,
    codigo_vendedor character varying(50) NOT NULL,
    nombre_completo character varying(200) NOT NULL,
    dni character varying(20) NOT NULL,
    telefono character varying(50),
    email character varying(150),
    localidad_id integer NOT NULL,
    comision_porcentaje numeric(5,2) DEFAULT 15.00 NOT NULL,
    estado public.vendedor_estado DEFAULT 'activo'::public.vendedor_estado NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.vendedores OWNER TO postgres;

--
-- Name: vendedores_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vendedores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.vendedores_id_seq OWNER TO postgres;

--
-- Name: vendedores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vendedores_id_seq OWNED BY public.vendedores.id;


--
-- Name: ventas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ventas (
    id integer NOT NULL,
    codigo_recibo character varying(60) NOT NULL,
    carton_id integer NOT NULL,
    comprador_id integer NOT NULL,
    vendedor_id integer NOT NULL,
    localidad_id integer NOT NULL,
    fecha_venta timestamp with time zone DEFAULT now() NOT NULL,
    monto numeric(10,2) NOT NULL,
    metodo_pago character varying(50) NOT NULL,
    comprobante_pago character varying(100),
    observaciones text,
    estado_pago character varying(30) DEFAULT 'cobrado'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ventas OWNER TO postgres;

--
-- Name: ventas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ventas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ventas_id_seq OWNER TO postgres;

--
-- Name: ventas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ventas_id_seq OWNED BY public.ventas.id;


--
-- Name: cartones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cartones ALTER COLUMN id SET DEFAULT nextval('public.cartones_id_seq'::regclass);


--
-- Name: compradores id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compradores ALTER COLUMN id SET DEFAULT nextval('public.compradores_id_seq'::regclass);


--
-- Name: localidades id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.localidades ALTER COLUMN id SET DEFAULT nextval('public.localidades_id_seq'::regclass);


--
-- Name: premios_sorteo id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.premios_sorteo ALTER COLUMN id SET DEFAULT nextval('public.premios_sorteo_id_seq'::regclass);


--
-- Name: rendiciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rendiciones ALTER COLUMN id SET DEFAULT nextval('public.rendiciones_id_seq'::regclass);


--
-- Name: sorteo_bolillas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sorteo_bolillas ALTER COLUMN id SET DEFAULT nextval('public.sorteo_bolillas_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vendedores id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendedores ALTER COLUMN id SET DEFAULT nextval('public.vendedores_id_seq'::regclass);


--
-- Name: ventas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas ALTER COLUMN id SET DEFAULT nextval('public.ventas_id_seq'::regclass);


--
-- Name: cartones cartones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cartones
    ADD CONSTRAINT cartones_pkey PRIMARY KEY (id);


--
-- Name: compradores compradores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compradores
    ADD CONSTRAINT compradores_pkey PRIMARY KEY (id);


--
-- Name: localidades localidades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.localidades
    ADD CONSTRAINT localidades_pkey PRIMARY KEY (id);


--
-- Name: premios_sorteo premios_sorteo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.premios_sorteo
    ADD CONSTRAINT premios_sorteo_pkey PRIMARY KEY (id);


--
-- Name: rendiciones rendiciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rendiciones
    ADD CONSTRAINT rendiciones_pkey PRIMARY KEY (id);


--
-- Name: sorteo_bolillas sorteo_bolillas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sorteo_bolillas
    ADD CONSTRAINT sorteo_bolillas_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vendedores vendedores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendedores
    ADD CONSTRAINT vendedores_pkey PRIMARY KEY (id);


--
-- Name: ventas ventas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT ventas_pkey PRIMARY KEY (id);


--
-- Name: cartones_estado_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cartones_estado_idx ON public.cartones USING btree (estado);


--
-- Name: cartones_numero_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cartones_numero_idx ON public.cartones USING btree (numero_carton);


--
-- Name: cartones_numero_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX cartones_numero_unique ON public.cartones USING btree (numero_carton);


--
-- Name: cartones_vendedor_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cartones_vendedor_idx ON public.cartones USING btree (vendedor_id);


--
-- Name: compradores_dni_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX compradores_dni_idx ON public.compradores USING btree (dni);


--
-- Name: compradores_dni_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX compradores_dni_unique ON public.compradores USING btree (dni);


--
-- Name: compradores_nombre_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX compradores_nombre_idx ON public.compradores USING btree (nombre_completo);


--
-- Name: localidades_provincia_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX localidades_provincia_idx ON public.localidades USING btree (provincia);


--
-- Name: rendiciones_codigo_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX rendiciones_codigo_unique ON public.rendiciones USING btree (codigo_rendicion);


--
-- Name: sorteo_bolillas_numero_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX sorteo_bolillas_numero_unique ON public.sorteo_bolillas USING btree (numero);


--
-- Name: users_email_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_unique ON public.users USING btree (email);


--
-- Name: vendedores_codigo_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX vendedores_codigo_unique ON public.vendedores USING btree (codigo_vendedor);


--
-- Name: vendedores_dni_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX vendedores_dni_idx ON public.vendedores USING btree (dni);


--
-- Name: vendedores_dni_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX vendedores_dni_unique ON public.vendedores USING btree (dni);


--
-- Name: vendedores_localidad_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX vendedores_localidad_idx ON public.vendedores USING btree (localidad_id);


--
-- Name: ventas_carton_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ventas_carton_idx ON public.ventas USING btree (carton_id);


--
-- Name: ventas_carton_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ventas_carton_unique ON public.ventas USING btree (carton_id);


--
-- Name: ventas_comprador_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ventas_comprador_idx ON public.ventas USING btree (comprador_id);


--
-- Name: ventas_fecha_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ventas_fecha_idx ON public.ventas USING btree (fecha_venta);


--
-- Name: ventas_recibo_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ventas_recibo_unique ON public.ventas USING btree (codigo_recibo);


--
-- Name: ventas_vendedor_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ventas_vendedor_idx ON public.ventas USING btree (vendedor_id);


--
-- Name: cartones cartones_localidad_id_localidades_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cartones
    ADD CONSTRAINT cartones_localidad_id_localidades_id_fk FOREIGN KEY (localidad_id) REFERENCES public.localidades(id) ON DELETE SET NULL;


--
-- Name: cartones cartones_vendedor_id_vendedores_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cartones
    ADD CONSTRAINT cartones_vendedor_id_vendedores_id_fk FOREIGN KEY (vendedor_id) REFERENCES public.vendedores(id) ON DELETE SET NULL;


--
-- Name: compradores compradores_localidad_id_localidades_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compradores
    ADD CONSTRAINT compradores_localidad_id_localidades_id_fk FOREIGN KEY (localidad_id) REFERENCES public.localidades(id) ON DELETE SET NULL;


--
-- Name: premios_sorteo premios_sorteo_carton_ganador_id_cartones_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.premios_sorteo
    ADD CONSTRAINT premios_sorteo_carton_ganador_id_cartones_id_fk FOREIGN KEY (carton_ganador_id) REFERENCES public.cartones(id) ON DELETE SET NULL;


--
-- Name: rendiciones rendiciones_localidad_id_localidades_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rendiciones
    ADD CONSTRAINT rendiciones_localidad_id_localidades_id_fk FOREIGN KEY (localidad_id) REFERENCES public.localidades(id) ON DELETE CASCADE;


--
-- Name: rendiciones rendiciones_vendedor_id_vendedores_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rendiciones
    ADD CONSTRAINT rendiciones_vendedor_id_vendedores_id_fk FOREIGN KEY (vendedor_id) REFERENCES public.vendedores(id) ON DELETE CASCADE;


--
-- Name: users users_localidad_id_localidades_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_localidad_id_localidades_id_fk FOREIGN KEY (localidad_id) REFERENCES public.localidades(id) ON DELETE SET NULL;


--
-- Name: users users_vendedor_id_vendedores_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_vendedor_id_vendedores_id_fk FOREIGN KEY (vendedor_id) REFERENCES public.vendedores(id) ON DELETE SET NULL;


--
-- Name: vendedores vendedores_localidad_id_localidades_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendedores
    ADD CONSTRAINT vendedores_localidad_id_localidades_id_fk FOREIGN KEY (localidad_id) REFERENCES public.localidades(id) ON DELETE CASCADE;


--
-- Name: ventas ventas_carton_id_cartones_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT ventas_carton_id_cartones_id_fk FOREIGN KEY (carton_id) REFERENCES public.cartones(id) ON DELETE RESTRICT;


--
-- Name: ventas ventas_comprador_id_compradores_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT ventas_comprador_id_compradores_id_fk FOREIGN KEY (comprador_id) REFERENCES public.compradores(id) ON DELETE RESTRICT;


--
-- Name: ventas ventas_localidad_id_localidades_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT ventas_localidad_id_localidades_id_fk FOREIGN KEY (localidad_id) REFERENCES public.localidades(id) ON DELETE RESTRICT;


--
-- Name: ventas ventas_vendedor_id_vendedores_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT ventas_vendedor_id_vendedores_id_fk FOREIGN KEY (vendedor_id) REFERENCES public.vendedores(id) ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict thqHGWuMFS8ZFMwM4QBroikQJZ9vRoCqQ13BfcflbW2Q3ZPWWTte63X7JTsfkZR

