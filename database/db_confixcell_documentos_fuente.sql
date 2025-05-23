drop database confixcell_documentos_fuente;
create database confixcell_documentos_fuente charset utf8mb4 collate utf8mb4_bin;
use confixcell_documentos_fuente;

CREATE TABLE documento_fuente (
id INT PRIMARY KEY NOT NULL,
uuid VARCHAR(50) NOT NULL UNIQUE,
cod_serie VARCHAR(50),
cod_numero INT,
f_emision DATETIME,
f_anulacion DATETIME,
concepto VARCHAR(100),
importe_neto DECIMAL(20,2) NOT NULL DEFAULT 0,
usuario_uuid VARCHAR(50) NOT NULL,
f_creacion DATETIME NOT NULL,
f_actualizacion DATETIME NOT NULL);

CREATE TABLE nota (
id INT PRIMARY KEY NOT NULL,
documento_fuente_id INT NOT NULL,
fecha DATETIME NOT NULL,
descripcion VARCHAR(500),
usuario_uuid VARCHAR(50) NOT NULL);

CREATE TABLE documento_transaccion (
id INT PRIMARY KEY NOT NULL);

CREATE TABLE documento_movimiento (
id INT PRIMARY KEY NOT NULL,
documento_transaccion_id INT);

CREATE TABLE entrada_efectivo (
id INT PRIMARY KEY NOT NULL,
uuid VARCHAR(50) NOT NULL UNIQUE,
documento_fuente_id INT NOT NULL,
valor DECIMAL(20,2) NOT NULL);

CREATE TABLE medio_transferencia (
id INT PRIMARY KEY NOT NULL,
nombre VARCHAR(100) NOT NULL UNIQUE);

CREATE TABLE entrada_efectivo_contado (
id INT PRIMARY KEY NOT NULL,
medio_transferencia_id INT NOT NULL);

CREATE TABLE entrada_efectivo_credito (
id INT PRIMARY KEY NOT NULL,
tasa_interes_diario DECIMAL(20,2) NOT NULL DEFAULT 0);

CREATE TABLE entrada_efectivo_cuota (
id INT PRIMARY KEY NOT NULL,
entrada_efectivo_credito_id INT NOT NULL,
numero INT NOT NULL DEFAULT 0,
f_inicio DATETIME NOT NULL,
f_vencimiento DATETIME NOT NULL,
cuota DECIMAL(20,2) NOT NULL DEFAULT 0,
amortizacion DECIMAL(20,2) NOT NULL DEFAULT 0,
interes DECIMAL(20,2) NOT NULL DEFAULT 0,
saldo DECIMAL(20,2) NOT NULL DEFAULT 0);

CREATE TABLE entrada_bien_consumo (
id INT PRIMARY KEY NOT NULL,
uuid VARCHAR(50) NOT NULL UNIQUE,
documento_fuente_id INT NOT NULL,
almacen_uuid VARCHAR(50) NOT NULL,
bien_consumo_uuid VARCHAR(50) NOT NULL,
cant DECIMAL(20,2) NOT NULL DEFAULT 0);

CREATE TABLE entrada_bien_consumo_valor_nuevo (
id INT PRIMARY KEY NOT NULL,
valor_uni DECIMAL(20,2) NOT NULL DEFAULT 0);

CREATE TABLE entrada_bien_consumo_valor_salida (
id INT PRIMARY KEY NOT NULL,
salida_bien_consumo_id INT NOT NULL);

CREATE TABLE entrada_bien_consumo_valor_capital (
id INT PRIMARY KEY NOT NULL,
salida_bien_capital_fijo_id INT NOT NULL);

CREATE TABLE entrada_bien_consumo_valor_produccion (
id INT NOT NULL,
salida_produccion_bien_id INT NOT NULL);

CREATE TABLE entrada_bien_capital (
id INT PRIMARY KEY NOT NULL,
uuid VARCHAR(50) NOT NULL UNIQUE,
documento_fuente_id INT NOT NULL,
almacen_uuid VARCHAR(50) NOT NULL,
bien_capital_uuid VARCHAR(50) NOT NULL);

CREATE TABLE entrada_bien_capital_valor_nuevo (
id INT PRIMARY KEY NOT NULL,
valor_inicial DECIMAL(20,2) NOT NULL DEFAULT 0);

CREATE TABLE entrada_bien_capital_valor_salida (
id INT PRIMARY KEY NOT NULL,
salida_bien_capital_fijo_id INT NOT NULL);

CREATE TABLE entrada_bien_capital_valor_consumo (
id INT PRIMARY KEY NOT NULL,
salida_bien_consumo_id INT NOT NULL);

CREATE TABLE entrada_bien_capital_valor_produccion (
id INT PRIMARY KEY NOT NULL,
salida_produccion_bien_id INT NOT NULL);

CREATE TABLE entrada_servicio (
id INT PRIMARY KEY NOT NULL,
documento_fuente_id INT NOT NULL,
servicio_uuid VARCHAR(50) NOT NULL);

CREATE TABLE entrada_servicio_detalle (
id INT PRIMARY KEY NOT NULL,
uuid VARCHAR(50) NOT NULL UNIQUE,
entrada_servicio_id INT NOT NULL,
f_inicio DATETIME NOT NULL,
f_final DATETIME,
valor DECIMAL(20,2) NOT NULL DEFAULT 0);

CREATE TABLE salida_efectivo (
id INT PRIMARY KEY NOT NULL,
uuid VARCHAR(50) NOT NULL UNIQUE,
documento_fuente_id INT NOT NULL,
valor DECIMAL(20,2) NOT NULL DEFAULT 0);

CREATE TABLE salida_efectivo_contado (
id INT PRIMARY KEY NOT NULL,
medio_transferencia_id INT NOT NULL);

CREATE TABLE salida_efectivo_credito (
id INT PRIMARY KEY NOT NULL,
tasa_interes_diario DECIMAL(20,2) NOT NULL DEFAULT 0);

CREATE TABLE salida_efectivo_cuota (
id INT PRIMARY KEY NOT NULL,
salida_efectivo_credito_id INT NOT NULL,
numero INT NOT NULL DEFAULT 0,
f_inicio DATETIME NOT NULL,
f_vencimiento DATETIME NOT NULL,
cuota DECIMAL(20,2) NOT NULL DEFAULT 0,
amortizacion DECIMAL(20,2) NOT NULL DEFAULT 0,
interes DECIMAL(20,2) NOT NULL DEFAULT 0,
saldo DECIMAL(20,2) NOT NULL DEFAULT 0);

CREATE TABLE salida_bien_consumo (
id INT PRIMARY KEY NOT NULL,
uuid VARCHAR(50) NOT NULL UNIQUE,
documento_fuente_id INT NOT NULL,
almacen_uuid VARCHAR(50) NOT NULL,
bien_consumo_uuid VARCHAR(50) NOT NULL,
cant DECIMAL(20,2) NOT NULL DEFAULT 0,
precio_uni DECIMAL(20,2) NOT NULL DEFAULT 0);

CREATE TABLE salida_bien_consumo_valor_nuevo (
id INT PRIMARY KEY NOT NULL);

CREATE TABLE salida_bien_consumo_valor_entrada (
id INT PRIMARY KEY NOT NULL,
entrada_bien_consumo_id INT NOT NULL);

CREATE TABLE salida_bien_capital_fijo (
id INT PRIMARY KEY NOT NULL,
uuid VARCHAR(50) NOT NULL UNIQUE,
documento_fuente_id INT NOT NULL,
entrada_bien_capital_id INT NOT NULL,
valor_final DECIMAL(20,2) NOT NULL DEFAULT 0);

CREATE TABLE salida_bien_capital_temporal (
id INT PRIMARY KEY NOT NULL,
uuid VARCHAR(50) NOT NULL UNIQUE,
documento_fuente_id INT NOT NULL,
bien_capital_uuid VARCHAR(50) NOT NULL,
f_inicio DATETIME NOT NULL,
f_final DATETIME,
precio DECIMAL(20,2) NOT NULL DEFAULT 0);

CREATE TABLE salida_servicio (
id INT PRIMARY KEY NOT NULL,
documento_fuente_id INT NOT NULL,
servicio_uuid VARCHAR(50) NOT NULL);

CREATE TABLE salida_servicio_detalle (
id INT PRIMARY KEY NOT NULL,
uuid VARCHAR(50) NOT NULL UNIQUE,
salida_servicio_id INT NOT NULL,
f_inicio DATETIME NOT NULL,
f_final DATETIME,
precio DECIMAL(20,2) NOT NULL DEFAULT 0);

CREATE TABLE salida_produccion (
id INT PRIMARY KEY NOT NULL,
documento_fuente_id INT NOT NULL,
precio DECIMAL(20,2) NOT NULL DEFAULT 0);

CREATE TABLE salida_produccion_bien (
id INT PRIMARY KEY NOT NULL,
bien_consumo_uuid VARCHAR(50) NOT NULL,
cant DECIMAL(20,2) NOT NULL DEFAULT 0);

CREATE TABLE salida_produccion_servicio (
id INT PRIMARY KEY NOT NULL,
servicio_uuid VARCHAR(50) NOT NULL);

CREATE TABLE nota_transaccion_entrada (
id INT PRIMARY KEY NOT NULL,
comprobante_tipo_id INT NOT NULL,
comprobante_cod_serie VARCHAR(50),
comprobante_cod_numero INT,
proveedor_uuid VARCHAR(50),
proveedor_documento_identificacion_uuid VARCHAR(50),
proveedor_cod VARCHAR(50),
proveedor_nombre VARCHAR(100),
proveedor_celular BIGINT,
liquidacion_tipo_id INT NOT NULL);

CREATE TABLE nte_detalle (
id INT PRIMARY KEY NOT NULL,
nota_transaccion_entrada_id INT NOT NULL,
recurso_uuid VARCHAR(50),
concepto VARCHAR(200),
cant DECIMAL(20,2) NOT NULL DEFAULT 0,
precio_uni DECIMAL(20,2) NOT NULL DEFAULT 0,
descuento DECIMAL(20,2) NOT NULL DEFAULT 0,
comentario VARCHAR(200));

CREATE TABLE comprobante_tipo (
id INT PRIMARY KEY NOT NULL,
nombre VARCHAR(100) NOT NULL UNIQUE);

CREATE TABLE liquidacion_tipo (
id INT PRIMARY KEY NOT NULL,
nombre VARCHAR(100) NOT NULL UNIQUE);

CREATE TABLE nte_credito (
id INT PRIMARY KEY NOT NULL,
nota_transaccion_entrada_id INT NOT NULL,
tasa_interes_diario DECIMAL(20,2) NOT NULL DEFAULT 0);

CREATE TABLE nte_cuota (
id INT PRIMARY KEY NOT NULL,
nte_credito_id INT NOT NULL,
numero INT NOT NULL DEFAULT 0,
f_inicio DATETIME,
f_vencimiento DATETIME,
cuota DECIMAL(20,2) NOT NULL DEFAULT 0,
amortizacion DECIMAL(20,2) NOT NULL DEFAULT 0,
interes DECIMAL(20,2) NOT NULL DEFAULT 0,
saldo DECIMAL(20,2) NOT NULL DEFAULT 0);

CREATE TABLE nota_transaccion_salida (
id INT PRIMARY KEY NOT NULL,
cliente_uuid VARCHAR(50),
cliente_documento_identificacion_uuid VARCHAR(50),
cliente_cod VARCHAR(50),
cliente_nombre VARCHAR(100),
cliente_celular BIGINT,
liquidacion_tipo_id INT NOT NULL);

CREATE TABLE nts_detalle (
id INT PRIMARY KEY NOT NULL,
nota_transaccion_salida_id INT NOT NULL,
recurso_uuid VARCHAR(50),
concepto VARCHAR(200),
precio_uni DECIMAL(20,2) NOT NULL DEFAULT 0,
cant DECIMAL(20,2) NOT NULL DEFAULT 0,
descuento DECIMAL(20,2) NOT NULL DEFAULT 0,
comentario VARCHAR(200));

CREATE TABLE nts_credito (
id INT PRIMARY KEY NOT NULL,
nota_transaccion_salida_id INT NOT NULL,
tasa_interes_diario DECIMAL(20,2) NOT NULL DEFAULT 0);

CREATE TABLE nts_cuota (
id INT PRIMARY KEY NOT NULL,
nts_credito_id INT NOT NULL,
numero INT NOT NULL DEFAULT 0,
f_inicio DATETIME,
f_vencimiento DATETIME,
cuota DECIMAL(20,2) NOT NULL DEFAULT 0,
amortizacion DECIMAL(20,2) NOT NULL DEFAULT 0,
interes DECIMAL(20,2) NOT NULL DEFAULT 0,
saldo DECIMAL(20,2) NOT NULL DEFAULT 0);

CREATE TABLE nota_venta (
id INT PRIMARY KEY NOT NULL,
f_compromiso DATETIME,
cliente_uuid VARCHAR(50) NOT NULL,
nv_prioridad_id INT NOT NULL,
usuario_tecnico_uuid VARCHAR(50) NOT NULL,
nv_estado_id INT NOT NULL);

CREATE TABLE nv_prioridad (
id INT PRIMARY KEY NOT NULL,
nombre VARCHAR(100) NOT NULL UNIQUE);

CREATE TABLE nv_estado (
id INT PRIMARY KEY NOT NULL,
nombre VARCHAR(100) NOT NULL UNIQUE);

CREATE TABLE nv_salida_bien_consumo (
id INT PRIMARY KEY NOT NULL,
nota_venta_id INT NOT NULL,
descuento DECIMAL(20,2) NOT NULL DEFAULT 0);

CREATE TABLE nv_servicio_reparacion (
id INT PRIMARY KEY NOT NULL,
nota_venta_id INT NOT NULL,
pantalla_modelo_uuid VARCHAR(50) NOT NULL,
imei VARCHAR(100),
patron INT,
contrasena VARCHAR(50),
problema VARCHAR(500));

CREATE TABLE nv_servicio_reparacion_recurso_servicio (
id INT PRIMARY KEY NOT NULL,
uuid VARCHAR(50) NOT NULL,
nv_servicio_reparacion_id INT NOT NULL,
nv_categoria_reparacion_id INT NOT NULL,
descripcion VARCHAR(100),
f_inicio DATETIME NOT NULL,
f_final DATETIME,
precio DECIMAL(20,2) NOT NULL DEFAULT 0);

CREATE TABLE nv_servicio_reparacion_recurso_bien_consumo (
id INT PRIMARY KEY NOT NULL,
uuid VARCHAR(50) NOT NULL UNIQUE,
nv_servicio_reparacion_id INT NOT NULL,
almacen_uuid VARCHAR(50) NOT NULL,
bien_consumo_uuid VARCHAR(50) NOT NULL,
fecha DATETIME NOT NULL,
cant DECIMAL(20,2) NOT NULL DEFAULT 0,
precio_uni DECIMAL(20,2) NOT NULL DEFAULT 0);

CREATE TABLE nv_entrada_efectivo (
id INT PRIMARY KEY NOT NULL,
nota_venta_id INT NOT NULL,
numero INT NOT NULL DEFAULT 0,
fecha DATETIME NOT NULL,
medio_transferencia_id INT NOT NULL);

CREATE TABLE db_preset (
id INT PRIMARY KEY NOT NULL,
titulo VARCHAR(100) NOT NULL,
target VARCHAR(100) NOT NULL UNIQUE,
valor VARCHAR(100));

CREATE TABLE nv_categoria_reparacion (
id INT PRIMARY KEY NOT NULL,
nombre VARCHAR(100) NOT NULL UNIQUE);

CREATE TABLE salida_produccion_bien_standar (
id INT PRIMARY KEY NOT NULL);

CREATE TABLE salida_produccion_bien_actividad (
id INT PRIMARY KEY NOT NULL,
salida_produccion_bien_standar_id INT NOT NULL,
nombre VARCHAR(100) NOT NULL,
f_inicio DATETIME NOT NULL,
f_final DATETIME);

CREATE TABLE salida_produccion_servicio_standar (
id INT PRIMARY KEY NOT NULL);

CREATE TABLE salida_produccion_servicio_actividad (
id INT PRIMARY KEY NOT NULL,
salida_produccion_servicio_standar_id INT NOT NULL,
nombre VARCHAR(100) NOT NULL,
f_inicio DATETIME NOT NULL,
f_final DATETIME);

CREATE TABLE salida_produccion_bien_recurso_bien_consumo (
id INT PRIMARY KEY NOT NULL,
uuid VARCHAR(50) NOT NULL UNIQUE,
salida_produccion_bien_actividad_id INT NOT NULL,
bien_consumo_uuid VARCHAR(50) NOT NULL,
almacen_uuid VARCHAR(50) NOT NULL,
cant DECIMAL(20,2) NOT NULL DEFAULT 0);

CREATE TABLE salids_produccion_servicio_bien_consumo (
id INT PRIMARY KEY NOT NULL,
uuid VARCHAR(50) NOT NULL UNIQUE,
salida_produccion_servicio_actividad_id INT NOT NULL,
bien_consumo_uuid VARCHAR(50) NOT NULL,
almacen_uuid VARCHAR(50) NOT NULL,
cant DECIMAL(20,2) NOT NULL DEFAULT 0);

ALTER	TABLE	nota	ADD	CONSTRAINT	fk1	FOREIGN	KEY	(documento_fuente_id)	REFERENCES	documento_fuente(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	documento_transaccion	ADD	CONSTRAINT	fk2	FOREIGN	KEY	(id)	REFERENCES	documento_fuente(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	documento_movimiento	ADD	CONSTRAINT	fk3	FOREIGN	KEY	(id)	REFERENCES	documento_fuente(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	documento_movimiento	ADD	CONSTRAINT	fk4	FOREIGN	KEY	(documento_transaccion_id)	REFERENCES	documento_transaccion(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	entrada_efectivo	ADD	CONSTRAINT	fk5	FOREIGN	KEY	(documento_fuente_id)	REFERENCES	documento_fuente(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	entrada_efectivo_contado	ADD	CONSTRAINT	fk6	FOREIGN	KEY	(id)	REFERENCES	entrada_efectivo(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	entrada_efectivo_contado	ADD	CONSTRAINT	fk7	FOREIGN	KEY	(medio_transferencia_id)	REFERENCES	medio_transferencia(id)	ON	DELETE	NO	ACTION	ON	UPDATE	NO	ACTION;
ALTER	TABLE	entrada_efectivo_credito	ADD	CONSTRAINT	fk8	FOREIGN	KEY	(id)	REFERENCES	entrada_efectivo(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	entrada_efectivo_cuota	ADD	CONSTRAINT	fk9	FOREIGN	KEY	(entrada_efectivo_credito_id)	REFERENCES	entrada_efectivo_credito(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	entrada_bien_consumo	ADD	CONSTRAINT	fk10	FOREIGN	KEY	(documento_fuente_id)	REFERENCES	documento_fuente(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	entrada_bien_consumo_valor_nuevo	ADD	CONSTRAINT	fk11	FOREIGN	KEY	(id)	REFERENCES	entrada_bien_consumo(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	entrada_bien_consumo_valor_salida	ADD	CONSTRAINT	fk12	FOREIGN	KEY	(id)	REFERENCES	entrada_bien_consumo(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	entrada_bien_consumo_valor_salida	ADD	CONSTRAINT	fk13	FOREIGN	KEY	(salida_bien_consumo_id)	REFERENCES	salida_bien_consumo(id)	ON	DELETE	NO	ACTION	ON	UPDATE	NO	ACTION;
ALTER	TABLE	entrada_bien_consumo_valor_capital	ADD	CONSTRAINT	fk14	FOREIGN	KEY	(id)	REFERENCES	entrada_bien_consumo(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	entrada_bien_consumo_valor_capital	ADD	CONSTRAINT	fk15	FOREIGN	KEY	(salida_bien_capital_fijo_id)	REFERENCES	salida_bien_capital_fijo(id)	ON	DELETE	NO	ACTION	ON	UPDATE	NO	ACTION;
ALTER	TABLE	entrada_bien_consumo_valor_produccion	ADD	CONSTRAINT	fk16	FOREIGN	KEY	(id)	REFERENCES	entrada_bien_consumo(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	entrada_bien_consumo_valor_produccion	ADD	CONSTRAINT	fk17	FOREIGN	KEY	(salida_produccion_bien_id)	REFERENCES	salida_produccion_bien(id)	ON	DELETE	NO	ACTION	ON	UPDATE	NO	ACTION;
ALTER	TABLE	entrada_bien_capital	ADD	CONSTRAINT	fk18	FOREIGN	KEY	(documento_fuente_id)	REFERENCES	documento_fuente(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	entrada_bien_capital_valor_nuevo	ADD	CONSTRAINT	fk19	FOREIGN	KEY	(id)	REFERENCES	entrada_bien_capital(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	entrada_bien_capital_valor_salida	ADD	CONSTRAINT	fk20	FOREIGN	KEY	(id)	REFERENCES	entrada_bien_capital(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	entrada_bien_capital_valor_salida	ADD	CONSTRAINT	fk21	FOREIGN	KEY	(salida_bien_capital_fijo_id)	REFERENCES	salida_bien_capital_fijo(id)	ON	DELETE	NO	ACTION	ON	UPDATE	NO	ACTION;
ALTER	TABLE	entrada_bien_capital_valor_consumo	ADD	CONSTRAINT	fk22	FOREIGN	KEY	(id)	REFERENCES	entrada_bien_capital(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	entrada_bien_capital_valor_consumo	ADD	CONSTRAINT	fk23	FOREIGN	KEY	(salida_bien_consumo_id)	REFERENCES	salida_bien_consumo(id)	ON	DELETE	NO	ACTION	ON	UPDATE	NO	ACTION;
ALTER	TABLE	entrada_bien_capital_valor_produccion	ADD	CONSTRAINT	fk24	FOREIGN	KEY	(id)	REFERENCES	entrada_bien_capital(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	entrada_bien_capital_valor_produccion	ADD	CONSTRAINT	fk25	FOREIGN	KEY	(salida_produccion_bien_id)	REFERENCES	salida_produccion_bien(id)	ON	DELETE	NO	ACTION	ON	UPDATE	NO	ACTION;
ALTER	TABLE	entrada_servicio	ADD	CONSTRAINT	fk26	FOREIGN	KEY	(documento_fuente_id)	REFERENCES	documento_fuente(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	entrada_servicio_detalle	ADD	CONSTRAINT	fk27	FOREIGN	KEY	(entrada_servicio_id)	REFERENCES	entrada_servicio(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	salida_efectivo	ADD	CONSTRAINT	fk28	FOREIGN	KEY	(documento_fuente_id)	REFERENCES	documento_fuente(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	salida_efectivo_contado	ADD	CONSTRAINT	fk29	FOREIGN	KEY	(id)	REFERENCES	salida_efectivo(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	salida_efectivo_contado	ADD	CONSTRAINT	fk30	FOREIGN	KEY	(medio_transferencia_id)	REFERENCES	medio_transferencia(id)	ON	DELETE	NO	ACTION	ON	UPDATE	NO	ACTION;
ALTER	TABLE	salida_efectivo_credito	ADD	CONSTRAINT	fk31	FOREIGN	KEY	(id)	REFERENCES	salida_efectivo(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	salida_efectivo_cuota	ADD	CONSTRAINT	fk32	FOREIGN	KEY	(salida_efectivo_credito_id)	REFERENCES	salida_efectivo_credito(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	salida_bien_consumo	ADD	CONSTRAINT	fk33	FOREIGN	KEY	(documento_fuente_id)	REFERENCES	documento_fuente(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	salida_bien_consumo_valor_nuevo	ADD	CONSTRAINT	fk34	FOREIGN	KEY	(id)	REFERENCES	salida_bien_consumo(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	salida_bien_consumo_valor_entrada	ADD	CONSTRAINT	fk35	FOREIGN	KEY	(id)	REFERENCES	salida_bien_consumo(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	salida_bien_consumo_valor_entrada	ADD	CONSTRAINT	fk36	FOREIGN	KEY	(entrada_bien_consumo_id)	REFERENCES	entrada_bien_consumo(id)	ON	DELETE	NO	ACTION	ON	UPDATE	NO	ACTION;
ALTER	TABLE	salida_bien_capital_fijo	ADD	CONSTRAINT	fk37	FOREIGN	KEY	(documento_fuente_id)	REFERENCES	documento_fuente(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	salida_bien_capital_fijo	ADD	CONSTRAINT	fk38	FOREIGN	KEY	(entrada_bien_capital_id)	REFERENCES	entrada_bien_capital(id)	ON	DELETE	NO	ACTION	ON	UPDATE	NO	ACTION;
ALTER	TABLE	salida_bien_capital_temporal	ADD	CONSTRAINT	fk39	FOREIGN	KEY	(documento_fuente_id)	REFERENCES	documento_fuente(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	salida_servicio	ADD	CONSTRAINT	fk40	FOREIGN	KEY	(documento_fuente_id)	REFERENCES	documento_fuente(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	salida_servicio_detalle	ADD	CONSTRAINT	fk41	FOREIGN	KEY	(salida_servicio_id)	REFERENCES	salida_servicio(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	salida_produccion	ADD	CONSTRAINT	fk42	FOREIGN	KEY	(documento_fuente_id)	REFERENCES	documento_fuente(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	salida_produccion_bien	ADD	CONSTRAINT	fk43	FOREIGN	KEY	(id)	REFERENCES	salida_produccion(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	salida_produccion_servicio	ADD	CONSTRAINT	fk44	FOREIGN	KEY	(id)	REFERENCES	salida_produccion(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	nota_transaccion_entrada	ADD	CONSTRAINT	fk45	FOREIGN	KEY	(id)	REFERENCES	documento_transaccion(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	nota_transaccion_entrada	ADD	CONSTRAINT	fk46	FOREIGN	KEY	(comprobante_tipo_id)	REFERENCES	comprobante_tipo(id)	ON	DELETE	NO	ACTION	ON	UPDATE	NO	ACTION;
ALTER	TABLE	nota_transaccion_entrada	ADD	CONSTRAINT	fk47	FOREIGN	KEY	(liquidacion_tipo_id)	REFERENCES	liquidacion_tipo(id)	ON	DELETE	NO	ACTION	ON	UPDATE	NO	ACTION;
ALTER	TABLE	nte_detalle	ADD	CONSTRAINT	fk48	FOREIGN	KEY	(nota_transaccion_entrada_id)	REFERENCES	nota_transaccion_entrada(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	nte_credito	ADD	CONSTRAINT	fk49	FOREIGN	KEY	(id)	REFERENCES	entrada_efectivo(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	nte_credito	ADD	CONSTRAINT	fk50	FOREIGN	KEY	(nota_transaccion_entrada_id)	REFERENCES	nota_transaccion_entrada(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	nte_cuota	ADD	CONSTRAINT	fk51	FOREIGN	KEY	(nte_credito_id)	REFERENCES	nte_credito(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	nota_transaccion_salida	ADD	CONSTRAINT	fk52	FOREIGN	KEY	(id)	REFERENCES	documento_transaccion(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	nota_transaccion_salida	ADD	CONSTRAINT	fk53	FOREIGN	KEY	(liquidacion_tipo_id)	REFERENCES	liquidacion_tipo(id)	ON	DELETE	NO	ACTION	ON	UPDATE	NO	ACTION;
ALTER	TABLE	nts_detalle	ADD	CONSTRAINT	fk54	FOREIGN	KEY	(nota_transaccion_salida_id)	REFERENCES	nota_transaccion_salida(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	nts_credito	ADD	CONSTRAINT	fk55	FOREIGN	KEY	(id)	REFERENCES	salida_efectivo(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	nts_credito	ADD	CONSTRAINT	fk56	FOREIGN	KEY	(nota_transaccion_salida_id)	REFERENCES	nota_transaccion_salida(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	nts_cuota	ADD	CONSTRAINT	fk57	FOREIGN	KEY	(nts_credito_id)	REFERENCES	nts_credito(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	nota_venta	ADD	CONSTRAINT	fk58	FOREIGN	KEY	(id)	REFERENCES	documento_transaccion(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	nota_venta	ADD	CONSTRAINT	fk59	FOREIGN	KEY	(nv_prioridad_id)	REFERENCES	nv_prioridad(id)	ON	DELETE	NO	ACTION	ON	UPDATE	NO	ACTION;
ALTER	TABLE	nota_venta	ADD	CONSTRAINT	fk60	FOREIGN	KEY	(nv_estado_id)	REFERENCES	nv_estado(id)	ON	DELETE	NO	ACTION	ON	UPDATE	NO	ACTION;
ALTER	TABLE	nv_salida_bien_consumo	ADD	CONSTRAINT	fk61	FOREIGN	KEY	(id)	REFERENCES	salida_bien_consumo(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	nv_salida_bien_consumo	ADD	CONSTRAINT	fk62	FOREIGN	KEY	(nota_venta_id)	REFERENCES	nota_venta(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	nv_servicio_reparacion	ADD	CONSTRAINT	fk63	FOREIGN	KEY	(id)	REFERENCES	salida_produccion_servicio(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	nv_servicio_reparacion	ADD	CONSTRAINT	fk64	FOREIGN	KEY	(nota_venta_id)	REFERENCES	nota_venta(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	nv_servicio_reparacion_recurso_servicio	ADD	CONSTRAINT	fk65	FOREIGN	KEY	(nv_servicio_reparacion_id)	REFERENCES	nv_servicio_reparacion(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	nv_servicio_reparacion_recurso_servicio	ADD	CONSTRAINT	fk66	FOREIGN	KEY	(nv_categoria_reparacion_id)	REFERENCES	nv_categoria_reparacion(id)	ON	DELETE	NO	ACTION	ON	UPDATE	NO	ACTION;
ALTER	TABLE	nv_servicio_reparacion_recurso_bien_consumo	ADD	CONSTRAINT	fk67	FOREIGN	KEY	(nv_servicio_reparacion_id)	REFERENCES	nv_servicio_reparacion(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	nv_entrada_efectivo	ADD	CONSTRAINT	fk68	FOREIGN	KEY	(id)	REFERENCES	entrada_efectivo(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	nv_entrada_efectivo	ADD	CONSTRAINT	fk69	FOREIGN	KEY	(nota_venta_id)	REFERENCES	nota_venta(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	nv_entrada_efectivo	ADD	CONSTRAINT	fk70	FOREIGN	KEY	(medio_transferencia_id)	REFERENCES	medio_transferencia(id)	ON	DELETE	NO	ACTION	ON	UPDATE	NO	ACTION;
ALTER	TABLE	salida_produccion_bien_standar	ADD	CONSTRAINT	fk71	FOREIGN	KEY	(id)	REFERENCES	salida_produccion_bien(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	salida_produccion_bien_actividad	ADD	CONSTRAINT	fk72	FOREIGN	KEY	(salida_produccion_bien_standar_id)	REFERENCES	salida_produccion_bien_standar(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	salida_produccion_servicio_standar	ADD	CONSTRAINT	fk73	FOREIGN	KEY	(id)	REFERENCES	salida_produccion_servicio(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	salida_produccion_servicio_actividad	ADD	CONSTRAINT	fk74	FOREIGN	KEY	(salida_produccion_servicio_standar_id)	REFERENCES	salida_produccion_servicio_standar(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	salida_produccion_bien_recurso_bien_consumo	ADD	CONSTRAINT	fk75	FOREIGN	KEY	(salida_produccion_bien_actividad_id)	REFERENCES	salida_produccion_bien_actividad(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
ALTER	TABLE	salids_produccion_servicio_bien_consumo	ADD	CONSTRAINT	fk76	FOREIGN	KEY	(salida_produccion_servicio_actividad_id)	REFERENCES	salida_produccion_servicio_actividad(id)	ON	DELETE	CASCADE	ON	UPDATE	NO	ACTION;	
alter table documento_fuente add constraint u1 unique (cod_serie, cod_numero);