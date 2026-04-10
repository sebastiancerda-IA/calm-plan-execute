-- SEED MÍNIMO ECOSISTEMA IA IDMA — 2026-04-08T05:07:20Z
-- Ejecutar en Lovable AI o Supabase SQL Editor

DELETE FROM financial_records WHERE period LIKE '%-26' OR period LIKE '%-27';
DELETE FROM institutional_metrics WHERE period = '2026-2027' OR period LIKE '%-26' OR period LIKE '%-27';
DELETE FROM budgets WHERE period = '2026-2027';
DELETE FROM rag_documents;
DELETE FROM alerts;

INSERT INTO agents (id,code,area,name,status,workflow_id,model,description,color,color_secondary,platform,trigger_type,criteria_cna,error_rate,items_processed_24h,created_at,updated_at) VALUES
('a1000000-0000-0000-0000-000000000001','A1','VCM','Agente VCM','active','qpORpaTXazEyOu7t','gemini-2.0-flash','Clasificacion emails VCM, convenios, Erasmus+, CNA C13/C14','#E8734A','#8B5CF6','n8n','schedule',ARRAY['C13','C14'],0,0,'2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('c1000000-0000-0000-0000-000000000002','C1','OTEC','Agente OTEC','active','JUWtdff1JZeOUPtD','gemini-2.0-flash','Gestion OTEC-AMA, cash flow, CRM SENCE','#10B981','#059669','n8n','schedule',ARRAY['C7'],0,0,'2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('b2000000-0000-0000-0000-000000000003','B2','Finanzas','Agente Finanzas','active','PLACEHOLDER_B2','gemini-2.0-flash','Presupuestos, control gerencial, CNA C8','#F97316','#EA580C','claude','manual',ARRAY['C8'],0,0,'2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('ad000000-0000-0000-0000-000000000004','AD','Orquesta','Agente Dios','active','PLACEHOLDER_AD','claude-opus-4-6','Inteligencia estrategica IDMA: acreditacion, crecimiento, ecosistema','#6366F1','#4F46E5','claude','manual',ARRAY['C1','C2','C8','C13','C14'],0,0,'2026-04-08T05:07:20Z','2026-04-08T05:07:20Z')
ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,model=EXCLUDED.model,workflow_id=EXCLUDED.workflow_id,color=EXCLUDED.color,updated_at=NOW();

INSERT INTO rag_documents (id,titulo,categoria,fuente,chunk_count,criterios_cna,agent_id,fecha,created_at) VALUES
('ae364bb7-ca6b-4a07-a959-0d5482178028','[Categoria] ACREDITACION — 79 documentos, 1268 chunks','ACREDITACION','drive',1268,ARRAY['C1','C2','C3','C4','C5','C6','C13','C14'],'a1000000-0000-0000-0000-000000000001','2026-04-08','2026-04-08T05:07:20Z'),
('73358b11-6858-48bd-ad90-dd76ec3b3c7f','[Categoria] CONVENIOS — 12 documentos, 456 chunks','CONVENIOS','drive',456,ARRAY['C13','C14','C7'],'a1000000-0000-0000-0000-000000000001','2026-04-08','2026-04-08T05:07:20Z'),
('f6a6caf6-8aa9-4e23-9f4d-b462860a3009','[Categoria] ADMISION — 10 documentos, 21 chunks','ADMISION','drive',21,ARRAY['C1','C2'],'a1000000-0000-0000-0000-000000000001','2026-04-08','2026-04-08T05:07:20Z'),
('483d8884-13f2-4b25-ac2b-069e2d8cde05','[Categoria] FINANZAS — 0 documentos, 0 chunks','FINANZAS','local',0,ARRAY['C8'],'b2000000-0000-0000-0000-000000000003','2026-04-08','2026-04-08T05:07:20Z');

INSERT INTO institutional_metrics (id,metric_key,metric_value,metric_text,period,created_at,updated_at) VALUES
('f43d39e2-982f-4c72-b722-1d867976a88f','saldo_caja_mes_actual',19555000.0,'CLP','2026-2027','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('717171e3-0e14-4290-8f39-790a8c2b9a87','margen_mes_actual',18555000.0,'CLP','2026-2027','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('548237b9-7a30-4a88-8e0e-15c51b2955fa','ingresos_total_anno',1074500000.0,'CLP','2026-2027','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('f1285842-288f-4120-936c-2453f3235846','egresos_total_anno',1089340000.0,'CLP','2026-2027','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('216d74b5-1e99-49d2-822a-fe89ce949c1d','resultado_neto_anno',-14840000.0,'CLP','2026-2027','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('108a1303-6fc5-4777-bd6e-c456c7dd0413','morosidad_pct',15.0,'porcentaje','2026-2027','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('4db62a12-3464-4506-8481-54b116ec12b2','deuda_morosidad_2025',160000000.0,'CLP','2026-2027','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('18b03831-425f-473f-b2e8-9cc54da343e7','total_rag_chunks',1745.0,'chunks','2026-2027','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('403c5001-3162-4c32-ad2b-8f31ca3f9d0d','total_rag_docs',101.0,'documentos','2026-2027','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('f631ec85-e783-4f2b-95f2-a48cb35b21f4','agentes_activos',2.0,'agentes','2026-2027','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('e3302882-c883-44df-bb4a-26f381134564','saldo_acum_mar_26',19555000.0,'CLP','Mar-26','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('dc87607d-fa21-4c46-9077-015bf47edd8d','margen_mar_26',18555000.0,'CLP','Mar-26','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('2a4f44bc-2923-45fc-81cd-23bfeed8bf29','saldo_acum_abr_26',36910000.0,'CLP','Abr-26','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('fa2a66d4-2e6c-4548-96af-54bc0e42b390','margen_abr_26',17355000.0,'CLP','Abr-26','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('5a52dc38-1c20-4a25-bc13-3cdd6bde86f6','saldo_acum_may_26',42265000.0,'CLP','May-26','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('9d941862-78dd-4a9e-987e-292292e8dec9','margen_may_26',5355000.0,'CLP','May-26','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('96178fb5-1115-4b7f-b8e9-982c497bceec','saldo_acum_jun_26',47620000.0,'CLP','Jun-26','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('93d10e42-2f2c-4782-94e7-eeb4ac04aad5','margen_jun_26',5355000.0,'CLP','Jun-26','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('d4d1a955-93f3-49a8-9343-a42a08c702be','saldo_acum_jul_26',52975000.0,'CLP','Jul-26','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('782a078a-03bd-47f4-a9dd-9373e9e91e61','margen_jul_26',5355000.0,'CLP','Jul-26','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('c7392499-f3f4-4707-8a39-05ed1892f2c3','saldo_acum_ago_26',98330000.0,'CLP','Ago-26','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('2cc456f3-9601-488e-8881-c8a91c09d0b5','margen_ago_26',45355000.0,'CLP','Ago-26','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('51529eb1-72d3-4311-b3b7-d550f2a3a678','saldo_acum_sep_26',75635000.0,'CLP','Sep-26','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('d7466311-4f9d-4457-9c81-b0bb497b4660','margen_sep_26',-22695000.0,'CLP','Sep-26','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('de138f5e-d925-4d82-ac6f-2b70c54b8939','saldo_acum_oct_26',52940000.0,'CLP','Oct-26','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('11f6207e-03a0-4928-97bc-66ab82d91b08','margen_oct_26',-22695000.0,'CLP','Oct-26','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('46bf714f-fe21-417c-8e97-bcdfe9681258','saldo_acum_nov_26',30245000.0,'CLP','Nov-26','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('93affd84-0940-44e3-8d9f-34032eb7ee6e','margen_nov_26',-22695000.0,'CLP','Nov-26','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('dac3eb29-5a42-4c2c-ac28-3aad3fdf57ed','saldo_acum_dic_26',7550000.0,'CLP','Dic-26','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('5969576b-7138-4e1d-a19b-eb7d3581ca44','margen_dic_26',-22695000.0,'CLP','Dic-26','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('9f892e72-b839-4182-b415-81259db6b04e','saldo_acum_ene_27',-3145000.0,'CLP','Ene-27','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('3c6c387e-5827-4463-a4d8-1f3736c2ef35','margen_ene_27',-10695000.0,'CLP','Ene-27','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('1379876d-0e08-4ce9-b636-1aaad432477e','saldo_acum_feb_27',-13840000.0,'CLP','Feb-27','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('13c7f2da-1666-4571-9176-b930a7453caf','margen_feb_27',-10695000.0,'CLP','Feb-27','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z');

INSERT INTO financial_records (id,concept,period,record_type,category,amount,notes,created_at,updated_at) VALUES
('e3bd6e12-6bf0-434a-a852-42ac9b8427b1','TOTAL INGRESOS','Mar-26','ingreso','Ingresos',96500000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('eb32e03d-ccad-4e1f-9c4b-8afe520c5c52','TOTAL EGRESOS','Mar-26','egreso','Egresos',77945000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('49a6cd6a-d0dd-4661-a805-f7184d8c491d','MARGEN MENSUAL','Mar-26','resultado','Resultado',18555000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('3ea050b9-04ba-4884-9241-cfa189b93511','TOTAL INGRESOS','Abr-26','ingreso','Ingresos',109300000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('e89f6781-b84c-4fcc-b19d-376a5aacb642','TOTAL EGRESOS','Abr-26','egreso','Egresos',91945000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('9e2c25b3-a086-4ba7-91bc-8395538d15d6','MARGEN MENSUAL','Abr-26','resultado','Resultado',17355000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('e2ef998c-3796-41f4-87cc-17984edc34aa','TOTAL INGRESOS','May-26','ingreso','Ingresos',97300000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('7fcaea5d-de0c-4f29-bc14-390b28b91a3c','TOTAL EGRESOS','May-26','egreso','Egresos',91945000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('057f2301-82f5-460d-88bd-a43cc338bc3d','MARGEN MENSUAL','May-26','resultado','Resultado',5355000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('8b768f2d-7856-4931-8489-b97acdb61f27','TOTAL INGRESOS','Jun-26','ingreso','Ingresos',97300000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('5b0a962c-4626-4839-8814-d574d7295b27','TOTAL EGRESOS','Jun-26','egreso','Egresos',91945000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('d3119af1-0bfe-478a-b5e3-6259421d8355','MARGEN MENSUAL','Jun-26','resultado','Resultado',5355000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('f1f5dc87-a647-4934-a65d-757b4fbf0957','TOTAL INGRESOS','Jul-26','ingreso','Ingresos',97300000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('6503717b-486c-48b3-96ac-bef36ca89d55','TOTAL EGRESOS','Jul-26','egreso','Egresos',91945000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('04f20c0e-2fb1-47f2-aa53-e5db696c3075','MARGEN MENSUAL','Jul-26','resultado','Resultado',5355000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('a59f9d8e-76f4-4350-80cf-cbd9364d9d5c','TOTAL INGRESOS','Ago-26','ingreso','Ingresos',137300000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('4f80aac0-1979-497f-a3cb-662cdbe67414','TOTAL EGRESOS','Ago-26','egreso','Egresos',91945000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('ce74aa2c-4e39-41ac-ad10-49848772507a','MARGEN MENSUAL','Ago-26','resultado','Resultado',45355000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('05cf986d-522e-4b82-b8f9-55fcc8faca3c','TOTAL INGRESOS','Sep-26','ingreso','Ingresos',69250000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('60aa543b-398a-4af5-ae3e-1fb9e5308877','TOTAL EGRESOS','Sep-26','egreso','Egresos',91945000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('abd6ff1b-cc9c-4129-a8e1-06c58624cf61','MARGEN MENSUAL','Sep-26','resultado','Resultado',-22695000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('4a5296fa-08b3-4a14-8166-a865f55ab91b','TOTAL INGRESOS','Oct-26','ingreso','Ingresos',69250000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('800fc795-1d54-4356-bc41-a2431836106c','TOTAL EGRESOS','Oct-26','egreso','Egresos',91945000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('b0b9b4d8-bf71-44c1-9f92-34cecde160dc','MARGEN MENSUAL','Oct-26','resultado','Resultado',-22695000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('5a9ed0e3-db11-4f1a-b7bd-567e42d0ae80','TOTAL INGRESOS','Nov-26','ingreso','Ingresos',69250000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('0da8f72d-d2ba-43a2-b896-627a8c7c9a46','TOTAL EGRESOS','Nov-26','egreso','Egresos',91945000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('fcb5015f-0432-4008-ad79-b3a6fa744e26','MARGEN MENSUAL','Nov-26','resultado','Resultado',-22695000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('71f4d555-1f8b-4af2-865a-d62df156cb79','TOTAL INGRESOS','Dic-26','ingreso','Ingresos',69250000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('ac7aa766-ffa6-4779-8c5d-f83ea736f9a8','TOTAL EGRESOS','Dic-26','egreso','Egresos',91945000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('3f5c7a55-a843-4c2f-8403-7ea3c7c47912','MARGEN MENSUAL','Dic-26','resultado','Resultado',-22695000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('c45ddd44-e4a4-4215-9e4e-b867bd915025','TOTAL INGRESOS','Ene-27','ingreso','Ingresos',81250000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('f386d1fd-690c-4e07-a36c-4f523bf0f039','TOTAL EGRESOS','Ene-27','egreso','Egresos',91945000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('57000941-561d-45a9-b025-e157b56eac01','MARGEN MENSUAL','Ene-27','resultado','Resultado',-10695000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('20c9d4c1-91c7-4b2d-b664-40b88888e564','TOTAL INGRESOS','Feb-27','ingreso','Ingresos',81250000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('0b52db0a-4735-4fbd-9cd2-3662300c0985','TOTAL EGRESOS','Feb-27','egreso','Egresos',91945000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('6aa3e078-daaa-4e60-9eae-7181a1c826e3','MARGEN MENSUAL','Feb-27','resultado','Resultado',-10695000.0,'Flujo proyectado Control Gerencial','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('5829bdcf-d8b9-46a5-a882-13d456c3f52b','Arriendo Casa Buin Marzo','Mar-26','ingreso','Arriendo',9200000.0,'Recibido día 5','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('c6aac286-206b-4f59-a8db-185b22c01401','Pago sueldos planta Marzo','Mar-26','egreso','Sueldos',36000000.0,'Día 6 mensual','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('bd616cc5-93e0-484d-b9ab-01afde796321','Honorarios no docentes Marzo','Mar-26','egreso','Honorarios',14000000.0,'Día 6 mensual','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z'),
('60ba949b-3711-483f-8a6f-ea8bf6c9dc68','Proveedores semana 1 Marzo','Mar-26','egreso','Proveedores',1200000.0,'Viernes','2026-04-08T05:07:20Z','2026-04-08T05:07:20Z');

INSERT INTO budgets (id,title,period,budget_type,department,total_amount,allocated_amount,status,description,notes,line_items,created_at,updated_at) VALUES
('9ded3129-2771-403d-b90f-9d61be46a074','Presupuesto Anual IDMA 2026-2027','2026-2027','anual','Direccion General',1074500000,1089340000,'activo',
'Flujo proyectado Mar-2026 a Feb-2027. Deficit -14.8M CLP desde Nov-26. Morosidad 15%.',
'Deuda morosidad 2025: ~160M CLP. Saldo negativo desde Nov-26.','{"Aranceles Brutos": {"tipo": "Ingreso", "total": 930000000.0}, "(-) Castigo Morosidad": {"tipo": "Descuento", "total": -139500000.0}, "Aranceles Netos": {"tipo": "Ingreso Neto", "total": 790500000.0}, "Recuperación Morosidad": {"tipo": "Ingreso", "total": 76000000.0}, "Arriendo Casa Buin": {"tipo": "Ingreso", "total": 110400000.0}, "Proyectos y Cursos": {"tipo": "Ingreso", "total": 80400000.0}, "CTS": {"tipo": "Ingreso", "total": 6000000.0}, "Centro Ecoturismo": {"tipo": "Ingreso", "total": 2400000.0}, "Casa Ecológica": {"tipo": "Ingreso", "total": 8800000.0}, "TOTAL INGRESOS": {"tipo": "TOTAL", "total": 1074500000.0}, "Sueldos Contratos": {"tipo": "A-Crítico", "total": 432000000.0}, "Honorarios no Docentes": {"tipo": "A-Crítico", "total": 168000000.0}, "Honorarios Docentes": {"tipo": "A-Crítico", "total": 154000000.0}, "Gastos Fijos": {"tipo": "B-Operativo", "total": 44400000.0}, "Créditos": {"tipo": "B-Operativo", "total": 126000000.0}, "Isapres": {"tipo": "B-Operativo", "total": 24000000.0}, "AFP": {"tipo": "B-Operativo", "total": 24000000.0}, "Finiquitos": {"tipo": "B-Operativo", "total": 36000000.0}, "Cuota Autos": {"tipo": "C-Complement.", "total": 8940000.0}, "Casa Eco (gasto)": {"tipo": "C-Complement.", "total": 4800000.0}, "CTS (gasto)": {"tipo": "C-Complement.", "total": 7200000.0}, "Ecoturismo (gasto)": {"tipo": "C-Complement.", "total": 2400000.0}, "Proveedores": {"tipo": "B-Operativo", "total": 57600000.0}, "TOTAL EGRESOS": {"tipo": "TOTAL", "total": 1089340000.0}, "MARGEN MENSUAL": {"tipo": "Resultado", "total": -14840000.0}, "SALDO ACUMULADO": {"tipo": "Liquidez", "total": -13840000.0}}'::jsonb,'2026-04-08T05:07:20Z','2026-04-08T05:07:20Z');

INSERT INTO alerts (id,priority,title,description,action_required,agent_id,resolved,created_at) VALUES
('02c18241-5e0c-450a-99e5-9061dfb54476','critica','Deficit Nov-26 a Feb-27','Saldo acumulado cae a -3.1M en Nov-26 y cierra en -13.8M en Feb-27.','Revisar plan recuperacion morosidad + diferir pagos no criticos','b2000000-0000-0000-0000-000000000003',false,'2026-04-08T05:07:20Z'),
('ea43c7f1-a93e-4d13-a0ef-e3df89e2e834','alta','Deuda morosidad 2025: ~160M CLP','Solo se recuperan 76M en 2026. Quedan ~84M sin plan de recuperacion definido.','Activar sistema de cobranza inteligente (FastAPI Railway)','b2000000-0000-0000-0000-000000000003',false,'2026-04-08T05:07:20Z'),
('01b78707-5288-42a3-b8fc-299b94c24dcf','media','Jina AI sin creditos — FINANZAS sin indexar','FINANZAS tiene 0 pts en Qdrant. Control Gerencial no accesible via RAG.','Recargar creditos en jina.ai o evaluar alternativa de embeddings','a1000000-0000-0000-0000-000000000001',false,'2026-04-08T05:07:20Z'),
('d4cf9f67-af91-41a0-935e-c92c176eec54','media','Workflow VCM A1 posiblemente duplicado en n8n','Se detectaron 2 workflows activos de VCM A1. Confirmar cual es el operativo.','Revisar n8n Cloud y desactivar el workflow duplicado','a1000000-0000-0000-0000-000000000001',false,'2026-04-08T05:07:20Z');

SELECT 'agents' AS t, COUNT(*) n FROM agents
UNION ALL SELECT 'rag_documents', COUNT(*) FROM rag_documents
UNION ALL SELECT 'institutional_metrics', COUNT(*) FROM institutional_metrics
UNION ALL SELECT 'financial_records', COUNT(*) FROM financial_records
UNION ALL SELECT 'budgets', COUNT(*) FROM budgets
UNION ALL SELECT 'alerts', COUNT(*) FROM alerts ORDER BY t;
