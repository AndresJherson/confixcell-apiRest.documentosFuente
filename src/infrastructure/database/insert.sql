use confixcell_documentos_fuente;

-- db_preset
insert into db_preset (id, uuid, titulo, target, valor) values
(1, 'de774ed3-d93a-45c4-abee-60b480e8b828', 'Almacén de productos para Nota de Venta', 'nv_salida_bien_consumo.almacen_uuid', null),
(2, '926f2f10-2cf2-430f-a2a9-cf9bf0f2818d', 'Almacén de recursos de servicio de reparación para Nota de Venta', 'nv_servicio_reparacion_recurso_bien_consumo.almacen_uuid', null);

-- Insertar datos en tablas de referencia primero
INSERT INTO comprobante_tipo (id, uuid, nombre) VALUES 
(1, 'c98f435d-f736-48a3-bbe9-50d2bab7e62a', 'Factura'), 
(2, '5561c0ca-8fe0-45f6-85a9-9eb28a92ca7b', 'Boleta'),
(3, '78ecc239-c821-4b7b-9599-de07c9e7fc7c', 'Nota de crédito');

INSERT INTO liquidacion_tipo (id, uuid, nombre) VALUES 
(1, '87ff48f5-40e5-418e-a542-79c19c79dd0e', 'Contado'), 
(2, '9aef00db-935e-4b9f-848c-d46eec01d071', 'Crédito');

INSERT INTO medio_transferencia (id, uuid, nombre) VALUES 
(1, 'daba561b-7edf-49f7-8880-ad42320d255f', 'Efectivo'), 
(2, 'b70653f1-d86c-43ad-8266-6f2f80b28adf', 'Transferencia Bancaria'),
(3, '3b8f0175-b811-48e5-b7d8-23dfadc6249e', 'Tarjeta de crédito');

INSERT INTO nv_prioridad (id, uuid, nombre) VALUES 
(1, '217bf2e3-5822-4583-9167-8a5592ccaf2c', 'Alta'), 
(2, '42664e45-07e6-45dc-9206-5a8e39858c46', 'Media'),
(3, 'd9e47f65-4244-4f1a-9ef6-dc96459ae258', 'Baja');

INSERT INTO nv_estado (id, uuid, nombre) VALUES 
(1, '8faffbed-1482-44b9-b5cc-6c743182e36f', 'Pendiente'), 
(2, '28c2bf3d-83b1-471b-a52d-0021b61d7e80', 'En proceso'),
(3, 'ada02d69-efb3-418f-88ae-a24142b25b91', 'Finalizado');

INSERT INTO nv_categoria_reparacion (id, uuid, nombre) VALUES 
(1, '334e16a1-6f95-47a0-926c-a79307646558', 'Pantalla'), 
(2, '853c91e8-f9f4-49e5-8f72-2a1ff3720e07', 'Batería'),
(3, 'c74fd439-1edb-420f-9a86-f22c846d1394', 'Software');


-- DATOS CON ESTRUCTURA ERRONEA

-- Insertar documento_fuente base para todas las transacciones
INSERT INTO documento_fuente (id, uuid, cod_serie, cod_numero, f_emision, concepto, importe_neto, establecimiento_uuid, usuario_uuid, f_creacion, f_actualizacion) VALUES 
(1, 'df-uuid-001', 'A', 1001, '2025-04-10 08:30:00', 'Compra de insumos', 500.00, 'est-uuid-001', 'usr-uuid-001','2025-04-10 08:30:00', '2025-04-10 08:30:00' ),
(2, 'df-uuid-002', 'A', 1002, '2025-04-11 09:15:00', 'Compra de equipos', 750.00, 'est-uuid-001', 'usr-uuid-001','2025-04-11 09:15:00', '2025-04-11 09:15:00' ),
(3, 'df-uuid-003', 'A', 1003, '2025-04-12 10:00:00', 'Venta de productos', 300.00, 'est-uuid-001', 'usr-uuid-001','2025-04-13 11:30:00', '2025-04-13 11:30:00' ),
(4, 'df-uuid-004', 'B', 2001, '2025-04-13 11:30:00', 'Venta de servicios', 600.00, 'est-uuid-002', 'usr-uuid-002','2025-04-14 13:45:00', '2025-04-14 13:45:00' ),
(5, 'df-uuid-005', 'B', 2002, '2025-04-14 13:45:00', 'Traslado entre almacenes', 850.00, 'est-uuid-002', 'usr-uuid-002', '', '' ),
(6, 'df-uuid-006', 'B', 2003, '2025-04-15 14:20:00', 'Servicio de reparación de teléfono', 450.00, 'est-uuid-002', 'usr-uuid-002','2025-04-15 14:20:00', '2025-04-15 14:20:00' ),
(7, 'df-uuid-007', 'C', 3001, '2025-04-16 15:10:00', 'Servicio de mantenimiento de computadora', 1200.00, 'est-uuid-003', 'usr-uuid-003','2025-04-16 15:10:00', '2025-04-16 15:10:00' );

-- Insertar documento_transaccion
INSERT INTO documento_transaccion (id, concepto) VALUES 
(1),
(2),
(3),
(4),
(6),
(7);

-- Insertar documento_movimiento (3 como solicitado)
INSERT INTO documento_movimiento (id, concepto, documento_transaccion_id) VALUES 
(5, 1);

-- 2 Notas de transacción entrada
INSERT INTO nota_transaccion_entrada (id, comprobante_tipo_id, comprobante_cod_serie, comprobante_cod_numero, proveedor_uuid, proveedor_documento_identificacion_uuid, proveedor_cod, proveedor_nombre, proveedor_celular, liquidacion_tipo_id) VALUES 
(1, 1, 'F', 5001, 'prov-uuid-001', 'dni-uuid-001', 'PROV001', 'Suministros Electrónicos S.A.', 999888777, 1),
(2, 1, 'F', 5002, 'prov-uuid-002', 'dni-uuid-002', 'PROV002', 'Tecnología Avanzada E.I.R.L.', 999777666, 2);

-- Detalles de nota transacción entrada
INSERT INTO nte_detalle (id, nota_transaccion_entrada_id, recurso_uuid, concepto, cant, precio_uni, descuento, comentario) VALUES 
(1, 1, 'rec-uuid-001', 'Placas madre', 5.00, 80.00, 0.00, 'Placas de buena calidad'),
(2, 1, 'rec-uuid-002', 'Discos SSD 1TB', 10.00, 30.00, 50.00, 'Con descuento por volumen'),
(3, 2, 'rec-uuid-003', 'Pantallas LCD 15"', 5.00, 120.00, 0.00, 'Para stock'),
(4, 2, 'rec-uuid-004', 'Teclados inalámbricos', 10.00, 25.00, 0.00, 'Modelo estándar');

-- 2 Notas de transacción salida
INSERT INTO nota_transaccion_salida (id, cliente_uuid, cliente_documento_identificacion_uuid, cliente_cod, cliente_nombre, cliente_celular, liquidacion_tipo_id) VALUES 
(3, 'cli-uuid-001', 'dni-uuid-003', 'CLI001', 'Juan Pérez', 987654321, 1),
(4, 'cli-uuid-002', 'dni-uuid-004', 'CLI002', 'María González', 987123456, 2);

-- Detalles de nota transacción salida
INSERT INTO nts_detalle (id, nota_transaccion_salida_id, recurso_uuid, concepto, precio_uni, cant, descuento, comentario) VALUES 
(1, 3, 'rec-uuid-005', 'Laptop HP', 1200.00, 1.00, 0.00, 'Con garantía extendida'),
(2, 3, 'rec-uuid-006', 'Mouse inalámbrico', 20.00, 1.00, 0.00, 'Incluye pilas'),
(3, 4, 'rec-uuid-007', 'Servicio de mantenimiento', 80.00, 1.00, 0.00, 'Limpieza de equipo'),
(4, 4, 'rec-uuid-008', 'Cambio de batería', 50.00, 1.00, 5.00, 'Con descuento fidelidad');

-- 2 Notas de venta (Requieren entrada efectivo, servicio de reparación, etc.)
INSERT INTO nota_venta (id, f_compromiso, cliente_uuid, nv_prioridad_id, usuario_tecnico_uuid, nv_estado_id) VALUES 
(6, '2025-04-17 10:00:00', 'cli-uuid-003', 1, 'usr-uuid-004', 2),
(7, '2025-04-18 11:30:00', 'cli-uuid-004', 2, 'usr-uuid-005', 1);

-- Servicios de reparación para notas de venta
INSERT INTO salida_produccion (id, documento_fuente_id, precio) VALUES 
(6, 6, 250.00),
(7, 7, 350.00);

INSERT INTO salida_produccion_servicio (id, servicio_uuid) VALUES 
(6, 'serv-uuid-001'),
(7, 'serv-uuid-002');

INSERT INTO nv_servicio_reparacion (id, nota_venta_id, pantalla_modelo_uuid, imei, patron, contrasena, problema) VALUES 
(6, 6, 'pant-uuid-001', '123456789012', 1234, 'pwd123', 'Pantalla rota'),
(7, 7, 'pant-uuid-002', '987654321098', 5678, 'pwd456', 'Batería dañada');

-- Recursos de servicio para reparaciones
INSERT INTO nv_servicio_reparacion_recurso_servicio (id, nv_servicio_reparacion_id, nv_categoria_reparacion_id, descripcion, f_inicio, f_final, precio) VALUES 
(1, 6, 1, 'Cambio de pantalla iPhone', '2025-04-15 14:30:00', '2025-04-15 15:30:00', 180.00),
(2, 7, 2, 'Reemplazo de batería Samsung', '2025-04-16 16:00:00', NULL, 120.00);

-- Recursos de bienes consumibles para reparaciones
INSERT INTO nv_servicio_reparacion_recurso_bien_consumo (id, nv_servicio_reparacion_id, almacen_uuid, bien_consumo_uuid, fecha, cant, precio_uni) VALUES 
(1, 6, 'alm-uuid-001', 'bc-uuid-001', '2025-04-15 14:35:00', 1.00, 150.00),
(2, 7, 'alm-uuid-001', 'bc-uuid-002', '2025-04-16 16:10:00', 1.00, 80.00);

-- Entrada de efectivo para notas de venta
INSERT INTO entrada_efectivo (id, documento_fuente_id, valor) VALUES 
(1, 1, 500.00),
(2, 7, 350.00),
(3, 7, 200.00);
INSERT INTO entrada_efectivo_contado (id, medio_transferencia_id) VALUES 
(1, 1),
(2, 2),
(3, 3);

INSERT INTO nv_entrada_efectivo (id, nota_venta_id, numero, fecha, medio_transferencia_id) VALUES 
(1, 6, 1, '2025-04-15 16:00:00', 1),
(2, 7, 1, '2025-04-16 17:00:00', 2);

-- Notas sobre documentos
INSERT INTO nota (id, documento_fuente_id, fecha, descripcion, usuario_uuid) VALUES 
(1, 1, '2025-04-10 09:00:00', 'Recepción verificada completa', 'usr-uuid-001'),
(2, 3, '2025-04-13 12:00:00', 'Cliente satisfecho con el producto', 'usr-uuid-002'),
(3, 6, '2025-04-15 16:30:00', 'Reparación compleja, requiere seguimiento', 'usr-uuid-004'),
(4, 7, '2025-04-16 17:30:00', 'Cliente solicitó garantía extendida', 'usr-uuid-005');



-- DOCUMENTOS DE MOVIMIENTO
-- Insertar 4 nuevos documentos_fuente base para los movimientos
INSERT INTO documento_fuente (id, uuid, cod_serie, cod_numero, f_emision, importe_neto, establecimiento_uuid, usuario_uuid) VALUES 
(8, 'df-uuid-008', 'D', 4001, '2025-04-17 09:30:00', 1500.00, 'est-uuid-001', 'usr-uuid-001'),
(9, 'df-uuid-009', 'D', 4002, '2025-04-17 10:45:00', 650.00, 'est-uuid-001', 'usr-uuid-002'),
(10, 'df-uuid-010', 'D', 4003, '2025-04-18 11:20:00', 800.00, 'est-uuid-002', 'usr-uuid-001'),
(11, 'df-uuid-011', 'D', 4004, '2025-04-18 14:15:00', 320.00, 'est-uuid-002', 'usr-uuid-002');

-- Insertar documento_movimiento (sin relación con documento_transaccion)
INSERT INTO documento_movimiento (id, concepto, documento_transaccion_id) VALUES 
(8, 'Ingreso de efectivo por préstamo', null),
(9, 'Entrada de mercadería por donación', null),
(10, 'Salida de efectivo por pago servicios', null),
(11, 'Salida de bienes por obsolescencia', null);

-- Relacionar con entrada_efectivo
INSERT INTO entrada_efectivo (id, documento_fuente_id, valor) VALUES 
(8, 8, 1500.00);

-- Crear entrada_efectivo_contado para el movimiento 1
INSERT INTO entrada_efectivo_contado (id, medio_transferencia_id) VALUES 
(8, 1); -- Medio transferencia: Efectivo

-- Relacionar con entrada_bien_consumo
INSERT INTO entrada_bien_consumo (id, documento_fuente_id, almacen_uuid, bien_consumo_uuid, cant) VALUES 
(9, 9, 'alm-uuid-002', 'bc-uuid-003', 15.00);

-- Crear entrada_bien_consumo_valor_nuevo para el movimiento 2
INSERT INTO entrada_bien_consumo_valor_nuevo (id, valor_uni) VALUES 
(9, 43.33); -- 650.00 / 15 unidades

-- Relacionar con salida_efectivo
INSERT INTO salida_efectivo (id, documento_fuente_id, valor) VALUES 
(10, 10, 800.00);

-- Crear salida_efectivo_contado para el movimiento 3
INSERT INTO salida_efectivo_contado (id, medio_transferencia_id) VALUES 
(10, 2); -- Medio transferencia: Transferencia Bancaria

-- Relacionar con salida_bien_consumo
INSERT INTO salida_bien_consumo (id, documento_fuente_id, almacen_uuid, bien_consumo_uuid, cant, precio_uni) VALUES 
(11, 11, 'alm-uuid-003', 'bc-uuid-004', 8.00, 40.00);

-- Crear salida_bien_consumo_valor_nuevo para el movimiento 4
INSERT INTO salida_bien_consumo_valor_nuevo (id, valor_uni) VALUES 
(11, 40.00);

-- Agregar notas para cada movimiento
INSERT INTO nota (id, documento_fuente_id, fecha, descripcion, usuario_uuid) VALUES 
(5, 8, '2025-04-17 09:45:00', 'Efectivo recibido como préstamo de socio', 'usr-uuid-001'),
(6, 9, '2025-04-17 11:00:00', 'Mercadería recibida como donación', 'usr-uuid-002'),
(7, 10, '2025-04-18 11:30:00', 'Pago de servicios básicos del local', 'usr-uuid-001'),
(8, 11, '2025-04-18 14:30:00', 'Salida de productos por obsolescencia tecnológica', 'usr-uuid-002');