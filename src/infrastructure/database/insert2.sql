-- Registros para Nota de Venta
INSERT INTO confixcell_documentos_fuente.documento_fuente 
    (id, uuid, cod_serie, cod_numero, f_emision, importe_neto, establecimiento_uuid, usuario_uuid) 
VALUES 
    (1, 'a6b7c8d9-e0f1-2345-6789-01a2b3c4d5e6', 'NV', 1001, '2024-07-20 10:00:00', 250.50, 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6', 'z6a7b8c9-d0e1-f2g3-h4i5-j6k7l8m9n0o1');

INSERT INTO confixcell_documentos_fuente.nota_venta 
    (id, f_compromiso, cliente_uuid, nv_prioridad_id, usuario_tecnico_uuid, nv_estado_id) 
VALUES 
    (1, '2024-07-22 10:00:00', 'f6g7h8i9-j0k1-l2m3-n4o5-p6q7r8s9t0u1', 1, 'b2c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7', 1);

INSERT INTO confixcell_documentos_fuente.documento_fuente 
    (id, uuid, cod_serie, cod_numero, f_emision, importe_neto, establecimiento_uuid, usuario_uuid) 
VALUES 
    (2, 'b7c8d9e0-f1a2-3456-7890-12b3c4d5e6f7', 'NV', 1002, '2024-07-21 15:30:00', 120.75, 'b2c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7', 'a7b8c9d0-e1f2-g3h4-i5j6-k7l8m9n0o1p2');

INSERT INTO confixcell_documentos_fuente.nota_venta 
    (id, f_compromiso, cliente_uuid, nv_prioridad_id, usuario_tecnico_uuid, nv_estado_id) 
VALUES 
    (2, '2024-07-23 15:30:00', 'g7h8i9j0-k1l2-m3n4-o5p6-q7r8s9t0u1v2', 2, 'c3d4e5f6-g7h8-i9j0-k1l2-m3n4o5p6q7r8', 2);

-- Registros para Nota de Transaccion de Entrada
INSERT INTO confixcell_documentos_fuente.documento_fuente 
    (id, uuid, cod_serie, cod_numero, f_emision, importe_neto, establecimiento_uuid, usuario_uuid) 
VALUES 
    (3, 'c8d9e0f1-a2b3-4567-8901-23c4d5e6f7a8', 'NTE', 2001, '2024-07-22 09:00:00', 500.00, 'c3d4e5f6-g7h8-i9j0-k1l2-m3n4o5p6q7r8', 'b8c9d0e1-f2g3-h4i5-j6k7-l8m9n0o1p2q3');

INSERT INTO confixcell_documentos_fuente.nota_transaccion_entrada 
    (id, comprobante_tipo_id, comprobante_cod_serie, comprobante_cod_numero, proveedor_uuid, proveedor_documento_identificacion_uuid, proveedor_cod, proveedor_nombre, proveedor_celular, liquidacion_tipo_id) 
VALUES 
    (1, 1, 'A', 123, 'p6q7r8s9-t0u1-v2w3-x4y5-z6a7b8c9d0e1', 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6', 'PROV-NAT-001', 'Proveedor Uno', 987654321, 1);

INSERT INTO confixcell_documentos_fuente.documento_fuente 
    (id, uuid, cod_serie, cod_numero, f_emision, importe_neto, establecimiento_uuid, usuario_uuid) 
VALUES 
    (4, 'd9e0f1a2-b3c4-5678-9012-34d5e6f7a8b9', 'NTE', 2002, '2024-07-23 14:00:00', 750.00, 'd4e5f6g7-h8i9-j0k1-l2m3-n4o5p6q7r8s9', 'c9d0e1f2-g3h4-i5j6-k7l8-m9n0o1p2q3r4');

INSERT INTO confixcell_documentos_fuente.nota_transaccion_entrada 
    (id, comprobante_tipo_id, comprobante_cod_serie, comprobante_cod_numero, proveedor_uuid, proveedor_documento_identificacion_uuid, proveedor_cod, proveedor_nombre, proveedor_celular, liquidacion_tipo_id) 
VALUES 
    (2, 2, 'B', 456, 'q7r8s9t0-u1v2-w3x4-y5z6-a7b8c9d0e1f2', 'b2c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7', 'PROV-NAT-002', 'Proveedor Dos', 123456789, 2);

-- Registros para Nota de Transaccion de Salida
INSERT INTO confixcell_documentos_fuente.documento_fuente 
    (id, uuid, cod_serie, cod_numero, f_emision, importe_neto, establecimiento_uuid, usuario_uuid) 
VALUES 
    (5, 'e0f1a2b3-c4d5-6789-0123-45e6f7a8b9c0', 'NTS', 3001, '2024-07-24 11:00:00', 300.00, 'e5f6g7h8-i9j0-k1l2-m3n4-o5p6q7r8s9t0', 'd0e1f2g3-h4i5-j6k7-l8m9-n0o1p2q3r4s5');

INSERT INTO confixcell_documentos_fuente.nota_transaccion_salida 
    (id, cliente_uuid, cliente_documento_identificacion_uuid, cliente_cod, cliente_nombre, cliente_celular, liquidacion_tipo_id) 
VALUES 
    (1, 'f6g7h8i9-j0k1-l2m3-n4o5-p6q7r8s9t0u1', 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6', 'CLI-NAT-001', 'Cliente Uno', 999888777, 1);

INSERT INTO confixcell_documentos_fuente.documento_fuente 
    (id, uuid, cod_serie, cod_numero, f_emision, importe_neto, establecimiento_uuid, usuario_uuid) 
VALUES 
    (6, 'f1a2b3c4-d5e6-7890-1234-56f7a8b9c0d1', 'NTS', 3002, '2024-07-25 16:00:00', 450.00, 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6', 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6');

INSERT INTO confixcell_documentos_fuente.nota_transaccion_salida 
    (id, cliente_uuid, cliente_documento_identificacion_uuid, cliente_cod, cliente_nombre, cliente_celular, liquidacion_tipo_id) 
VALUES 
    (2, 'g7h8i9j0-k1l2-m3n4-o5p6-q7r8s9t0u1v2', 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6', 'CLI-NAT-002', 'Cliente Dos', 111222333, 2);