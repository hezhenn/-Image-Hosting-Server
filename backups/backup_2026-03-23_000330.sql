--
-- PostgreSQL database dump
--

\restrict UCjeho0OOBdJ7b1Rxpa1ObuhuI5E2Qah0ZdZSa10nLPVecXbFH7MDl9a7MCaJfd

-- Dumped from database version 15.17 (Debian 15.17-1.pgdg13+1)
-- Dumped by pg_dump version 15.17 (Debian 15.17-1.pgdg13+1)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.images (
    id integer NOT NULL,
    filename text NOT NULL,
    original_name text NOT NULL,
    size integer NOT NULL,
    file_type text NOT NULL,
    upload_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.images OWNER TO postgres;

--
-- Name: images_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.images_id_seq OWNER TO postgres;

--
-- Name: images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.images_id_seq OWNED BY public.images.id;


--
-- Name: images id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.images ALTER COLUMN id SET DEFAULT nextval('public.images_id_seq'::regclass);


--
-- Data for Name: images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.images (id, filename, original_name, size, file_type, upload_time) FROM stdin;
22	087159d4-57be-4125-b6b5-aaf8208267e7.png	РЎРЅРёРјРѕРє СЌРєСЂР°РЅР° 2022-05-10 225833.png	114447	png	2026-03-22 20:55:15.230382
24	47afda27-e63a-4be2-b8f9-a4a1292a0c0f.jpg	118563537_319325872742107_5315073863817965501_n.jpg	219403	jpg	2026-03-22 21:52:57.264438
25	61f2a39f-a787-4273-a75f-abacb41bb19f.jpg	9ab468690f9a586a39e390c5cbd22a0e.jpg	10045	jpg	2026-03-22 21:54:01.908935
26	97053b46-fe7d-476f-b7cd-a271c12a5459.jpg	9ab468690f9a586a39e390c5cbd22a0e.jpg	10045	jpg	2026-03-22 21:54:18.003782
27	8cc3c638-7612-4fee-9bc3-5560ff2d4681.jpg	9e225bb60e0fb5e47b4faac8409c2129.jpg	47053	jpg	2026-03-22 21:54:26.297469
\.


--
-- Name: images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.images_id_seq', 27, true);


--
-- Name: images images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.images
    ADD CONSTRAINT images_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict UCjeho0OOBdJ7b1Rxpa1ObuhuI5E2Qah0ZdZSa10nLPVecXbFH7MDl9a7MCaJfd

