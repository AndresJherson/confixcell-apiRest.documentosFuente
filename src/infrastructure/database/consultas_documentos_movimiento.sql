use confixcell_documentos_fuente;
select * from documento_movimiento;

-- base

select json_object(
    'id', documento_fuente.id,
    'uuid', documento_fuente.uuid,
    'codigoSerie', documento_fuente.cod_serie,
    'codigoNumero', documento_fuente.cod_numero,
    'fechaEmision', concat(documento_fuente.f_emision,'Z'),
    'fechaAnulacion', concat(documento_fuente.f_anulacion,'Z'),
    'concepto', documento_fuente.concepto,
    'importeNeto', documento_fuente.importe_neto,
    'usuario', json_object( 'uuid', documento_fuente.usuario_uuid ),
    'fechaCreacion', concat(documento_fuente.f_creacion,'Z'),
    'fechaActualizacion', concat(documento_fuente.f_actualizacion,'Z'),
    'documentoTransaccion', (
        select json_object(
            'id', df.id,
            'uuid', df.uuid,
            'codigoSerie', df.cod_serie,
            'codigoNumero', df.cod_numero,
            'fechaCreacion', concat(df.f_creacion,'Z'),
            'fechaActualizacion', concat(df.f_actualizacion,'Z'),
            'fechaEmision', concat(df.f_emision,'Z'),
            'fechaAnulacion', concat(df.f_anulacion,'Z'),
            'concepto', df.concepto,
            'importeNeto', df.importe_neto,
            'usuario', json_object( 'uuid', df.usuario_uuid ),
            'fechaCreacion', concat(df.f_creacion,'Z'),
            'fechaActualizacion', concat(df.f_actualizacion,'Z')
        )
        from documento_transaccion
        left join documento_fuente df on df.id = documento_transaccion.id
        where documento_transaccion.id = documento_movimiento.documento_transaccion_id
    ),
    'notas', (
        select json_arrayagg(json_object(
            'id', nota.id,
            'fecha', nota.fecha,
            'descripcion', nota.descripcion,
            'usuario', json_object( 'uuid', nota.usuario_uuid )
        )) as json
        from nota
        where nota.documento_fuente_id = documento_fuente.id
    )
) as json
from documento_movimiento
left join documento_fuente on documento_fuente.id = documento_movimiento.id;


-- documento_entrada_efectivo

select json_object(
    'type', 'DocumentoEntradaEfectivo',
    'id', documento_fuente.id,
    'uuid', documento_fuente.uuid,
    'codigoSerie', documento_fuente.cod_serie,
    'codigoNumero', documento_fuente.cod_numero,
    'fechaEmision', concat(documento_fuente.f_emision,'Z'),
    'fechaAnulacion', concat(documento_fuente.f_anulacion,'Z'),
    'concepto', documento_fuente.concepto,
    'importeNeto', documento_fuente.importe_neto,
    'usuario', json_object( 'uuid', documento_fuente.usuario_uuid ),
    'fechaCreacion', concat(documento_fuente.f_creacion,'Z'),
    'fechaActualizacion', concat(documento_fuente.f_actualizacion,'Z'),
    'documentoTransaccion', (
        select json_object(
            'id', df.id,
            'uuid', df.uuid,
            'codigoSerie', df.cod_serie,
            'codigoNumero', df.cod_numero,
            'fechaCreacion', concat(df.f_creacion,'Z'),
            'fechaActualizacion', concat(df.f_actualizacion,'Z'),
            'fechaEmision', concat(df.f_emision,'Z'),
            'fechaAnulacion', concat(df.f_anulacion,'Z'),
            'concepto', df.concepto,
            'importeNeto', df.importe_neto,
            'usuario', json_object( 'uuid', df.usuario_uuid ),
            'fechaCreacion', concat(df.f_creacion,'Z'),
            'fechaActualizacion', concat(df.f_actualizacion,'Z')
        )
        from documento_transaccion
        left join documento_fuente df on df.id = documento_transaccion.id
        where documento_transaccion.id = documento_movimiento.documento_transaccion_id
    ),
    'notas', (
        select json_arrayagg(json_object(
            'id', nota.id,
            'fecha', nota.fecha,
            'descripcion', nota.descripcion,
            'usuario', json_object( 'uuid', nota.usuario_uuid )
        )) as json
        from nota
        where nota.documento_fuente_id = documento_fuente.id
    ),

    'entradas', ( 
        select json_arrayagg(cte_entrada_efectivo.json)
        from (

            select 
                entrada_efectivo.documento_fuente_id as documento_fuente_id,
                json_object(
                    'type', 'EntradaEfectivoContado',
                    'id', entrada_efectivo.id,
                    'uuid', entrada_efectivo.uuid,
                    'medioTransferencia', (
                        select json_object(
                            'id', medio_transferencia.id,
                            'nombre', medio_transferencia.nombre
                        ) as json
                        from medio_transferencia
                        where medio_transferencia.id = entrada_efectivo_contado.medio_transferencia_id
                    ),
                    'importeValorNeto', entrada_efectivo.valor
                ) as json
            from entrada_efectivo_contado
            left join entrada_efectivo on entrada_efectivo.id = entrada_efectivo_contado.id

            union all

            select 
                entrada_efectivo.documento_fuente_id as documento_fuente_id,
                json_object(
                    'type', 'EntradaEfectivoCredito',
                    'id', entrada_efectivo.id,
                    'uuid', entrada_efectivo.uuid,
                    'importeValorNeto', entrada_efectivo.valor,
                    'tasaInteresDiario', entrada_efectivo_credito.tasa_interes_diario,
                    'cuotas', (
                        select json_arrayagg(json_object(
                            'id', entrada_efectivo_cuota.id,
                            'numero', entrada_efectivo_cuota.numero,
                            'fechaInicio', concat(entrada_efectivo_cuota.f_inicio,'Z'),
                            'fechaVencimiento', concat(entrada_efectivo_cuota.f_vencimiento,'Z'),
                            'importeCuota', entrada_efectivo_cuota.cuota,
                            'importeAmortizacion', entrada_efectivo_cuota.amortizacion,
                            'importeInteres', entrada_efectivo_cuota.interes,
                            'importeSaldo', entrada_efectivo_cuota.saldo
                        ))
                        from entrada_efectivo_cuota
                        where entrada_efectivo_cuota.entrada_efectivo_credito_id = entrada_efectivo_credito.id
                    )
                ) as json
            from entrada_efectivo_credito
            left join entrada_efectivo on entrada_efectivo.id = entrada_efectivo_credito.id

        ) as cte_entrada_efectivo
        where cte_entrada_efectivo.documento_fuente_id = documento_movimiento.id
    )
) as json
from documento_movimiento
left join documento_fuente on documento_fuente.id = documento_movimiento.id
where exists (
    select 1
    from entrada_efectivo
    where entrada_efectivo.documento_fuente_id = documento_movimiento.id
);

-- documento_entrada_bien_consumo

select json_object(
    'type', 'DocumentoEntradaBienConsumo',
    'id', documento_fuente.id,
    'uuid', documento_fuente.uuid,
    'codigoSerie', documento_fuente.cod_serie,
    'codigoNumero', documento_fuente.cod_numero,
    'fechaEmision', concat(documento_fuente.f_emision,'Z'),
    'fechaAnulacion', concat(documento_fuente.f_anulacion,'Z'),
    'concepto', documento_fuente.concepto,
    'importeNeto', documento_fuente.importe_neto,
    'usuario', json_object( 'uuid', documento_fuente.usuario_uuid ),
    'fechaCreacion', concat(documento_fuente.f_creacion,'Z'),
    'fechaActualizacion', concat(documento_fuente.f_actualizacion,'Z'),
    'documentoTransaccion', (
        select json_object(
            'id', df.id,
            'uuid', df.uuid,
            'codigoSerie', df.cod_serie,
            'codigoNumero', df.cod_numero,
            'fechaCreacion', concat(df.f_creacion,'Z'),
            'fechaActualizacion', concat(df.f_actualizacion,'Z'),
            'fechaEmision', concat(df.f_emision,'Z'),
            'fechaAnulacion', concat(df.f_anulacion,'Z'),
            'concepto', df.concepto,
            'importeNeto', df.importe_neto,
            'usuario', json_object( 'uuid', df.usuario_uuid ),
            'fechaCreacion', concat(df.f_creacion,'Z'),
            'fechaActualizacion', concat(df.f_actualizacion,'Z')
        )
        from documento_transaccion
        left join documento_fuente df on df.id = documento_transaccion.id
        where documento_transaccion.id = documento_movimiento.documento_transaccion_id
    ),
    'notas', (
        select json_arrayagg(json_object(
            'id', nota.id,
            'fecha', nota.fecha,
            'descripcion', nota.descripcion,
            'usuario', json_object( 'uuid', nota.usuario_uuid )
        )) as json
        from nota
        where nota.documento_fuente_id = documento_fuente.id
    ),

    'entradas', (
        select json_arrayagg(cte_entrada_bien_consumo.json)
        from (

            select 
                entrada_bien_consumo.documento_fuente_id as documento_fuente_id,
                json_object(
                    'type', 'EntradaBienConsumoValorNuevo',
                    'id', entrada_bien_consumo.id,
                    'uuid', entrada_bien_consumo.uuid,
                    'almacen', json_object( 'uuid', entrada_bien_consumo.almacen_uuid ),
                    'bienConsumo', json_object( 'uuid', entrada_bien_consumo.bien_consumo_uuid ),
                    'cantidadEntrante', entrada_bien_consumo.cant,
                    'cantidadSaliente', (
                        select sum(salida_bien_consumo.cant)
                        from salida_bien_consumo_valor_entrada
                        left join salida_bien_consumo on salida_bien_consumo.id = salida_bien_consumo_valor_entrada.id
                        where salida_bien_consumo_valor_entrada.entrada_bien_consumo_id = entrada_bien_consumo.id
                    ),
                    'importeValorUnitario', entrada_bien_consumo_valor_nuevo.valor_uni
                ) as json
            from entrada_bien_consumo_valor_nuevo
            left join entrada_bien_consumo on entrada_bien_consumo.id = entrada_bien_consumo_valor_nuevo.id

            union all

            select 
                entrada_bien_consumo.documento_fuente_id as documento_fuente_id,
                json_object(
                    'typee', 'EntradaBienConsumoValorSalida',
                    'id', entrada_bien_consumo.id,
                    'uuid', entrada_bien_consumo.uuid,
                    'almacen', json_object( 'uuid', entrada_bien_consumo.almacen_uuid ),
                    'bienConsumo', json_object( 'uuid', entrada_bien_consumo.bien_consumo_uuid ),
                    'cantidadEntrante', entrada_bien_consumo.cant,
                    'cantidadSaliente', (
                        select sum(salida_bien_consumo.cant)
                        from salida_bien_consumo_valor_entrada
                        left join salida_bien_consumo on salida_bien_consumo.id = salida_bien_consumo_valor_entrada.id
                        where salida_bien_consumo_valor_entrada.entrada_bien_consumo_id = entrada_bien_consumo.id
                    ),
                    'salida', json_object( 'id', entrada_bien_consumo_valor_salida.salida_bien_consumo_id )
                ) as json
            from entrada_bien_consumo_valor_salida
            left join entrada_bien_consumo on entrada_bien_consumo.id = entrada_bien_consumo_valor_salida.id

        ) as cte_entrada_bien_consumo
        where cte_entrada_bien_consumo.documento_fuente_id = documento_movimiento.id
    )
) as json
from documento_movimiento
left join documento_fuente on documento_fuente.id = documento_movimiento.id
where exists (
    select 1
    from entrada_bien_consumo
    where entrada_bien_consumo.documento_fuente_id = documento_movimiento.id
);


-- documento_salida_efectivo

select json_object(
    'type', 'DocumentoSalidaEfectivo',
    'id', documento_fuente.id,
    'uuid', documento_fuente.uuid,
    'codigoSerie', documento_fuente.cod_serie,
    'codigoNumero', documento_fuente.cod_numero,
    'fechaEmision', concat(documento_fuente.f_emision,'Z'),
    'fechaAnulacion', concat(documento_fuente.f_anulacion,'Z'),
    'concepto', documento_fuente.concepto,
    'importeNeto', documento_fuente.importe_neto,
    'usuario', json_object( 'uuid', documento_fuente.usuario_uuid ),
    'fechaCreacion', concat(documento_fuente.f_creacion,'Z'),
    'fechaActualizacion', concat(documento_fuente.f_actualizacion,'Z'),
    'documentoTransaccion', (
        select json_object(
            'id', df.id,
            'uuid', df.uuid,
            'codigoSerie', df.cod_serie,
            'codigoNumero', df.cod_numero,
            'fechaCreacion', concat(df.f_creacion,'Z'),
            'fechaActualizacion', concat(df.f_actualizacion,'Z'),
            'fechaEmision', concat(df.f_emision,'Z'),
            'fechaAnulacion', concat(df.f_anulacion,'Z'),
            'concepto', df.concepto,
            'importeNeto', df.importe_neto,
            'usuario', json_object( 'uuid', df.usuario_uuid ),
            'fechaCreacion', concat(df.f_creacion,'Z'),
            'fechaActualizacion', concat(df.f_actualizacion,'Z')
        )
        from documento_transaccion
        left join documento_fuente df on df.id = documento_transaccion.id
        where documento_transaccion.id = documento_movimiento.documento_transaccion_id
    ),
    'notas', (
        select json_arrayagg(json_object(
            'id', nota.id,
            'fecha', nota.fecha,
            'descripcion', nota.descripcion,
            'usuario', json_object( 'uuid', nota.usuario_uuid )
        )) as json
        from nota
        where nota.documento_fuente_id = documento_fuente.id
    ),

    'salidas', (
        select json_arrayagg(cte_salida_efectivo.json)
        from (

            select 
                salida_efectivo.documento_fuente_id as documento_fuente_id,
                json_object(
                    'type', 'SalidaEfectivoContado',
                    'id', salida_efectivo.id,
                    'uuid', salida_efectivo.uuid,
                    'medioTransferencia', (
                        select json_object(
                            'id', medio_transferencia.id,
                            'nombre', medio_transferencia.nombre
                        ) as json
                        from medio_transferencia
                        where medio_transferencia.id = salida_efectivo_contado.medio_transferencia_id
                    ),
                    'importeValorNeto', salida_efectivo.valor
                ) as json
            from salida_efectivo_contado
            left join salida_efectivo on salida_efectivo.id = salida_efectivo_contado.id

            union all

            select 
                salida_efectivo.documento_fuente_id as documento_fuente_id,
                json_object(
                    'type', 'SalidaEfectivoCredito',
                    'id', salida_efectivo.id,
                    'uuid', salida_efectivo.uuid,
                    'importeValorNeto', salida_efectivo.valor,
                    'tasaInteresDiario', salida_efectivo_credito.tasa_interes_diario,
                    'cuotas', (
                        select json_arrayagg(json_object(
                            'id', salida_efectivo_cuota.id,
                            'numero', salida_efectivo_cuota.numero,
                            'fechaInicio', concat(salida_efectivo_cuota.f_inicio,'Z'),
                            'fechaVencimiento', concat(salida_efectivo_cuota.f_vencimiento,'Z'),
                            'impoteCuota', salida_efectivo_cuota.cuota,
                            'importeAmortizacion', salida_efectivo_cuota.amortizacion,
                            'importeInteres', salida_efectivo_cuota.interes,
                            'impoteSaldo', salida_efectivo_cuota.saldo
                        ))
                        from salida_efectivo_cuota
                        where salida_efectivo_cuota.salida_efectivo_credito_id = salida_efectivo_credito.id
                    )
                ) as json
            from salida_efectivo_credito
            left join salida_efectivo on salida_efectivo.id = salida_efectivo_credito.id

        ) as cte_salida_efectivo
        where cte_salida_efectivo.documento_fuente_id = documento_movimiento.id
    )
) as json
from documento_movimiento
left join documento_fuente on documento_fuente.id = documento_movimiento.id
where exists (
    select 1
    from salida_efectivo
    where salida_efectivo.documento_fuente_id = documento_movimiento.id
);


-- documento_salida_bien_consumo

select json_object(
    'type', 'DocumentoSalidaBienConsumo',
    'id', documento_fuente.id,
    'uuid', documento_fuente.uuid,
    'codigoSerie', documento_fuente.cod_serie,
    'codigoNumero', documento_fuente.cod_numero,
    'fechaEmision', concat(documento_fuente.f_emision,'Z'),
    'fechaAnulacion', concat(documento_fuente.f_anulacion,'Z'),
    'concepto', documento_fuente.concepto,
    'importeNeto', documento_fuente.importe_neto,
    'usuario', json_object( 'uuid', documento_fuente.usuario_uuid ),
    'fechaCreacion', concat(documento_fuente.f_creacion,'Z'),
    'fechaActualizacion', concat(documento_fuente.f_actualizacion,'Z'),
    'documentoTransaccion', (
        select json_object(
            'id', df.id,
            'uuid', df.uuid,
            'codigoSerie', df.cod_serie,
            'codigoNumero', df.cod_numero,
            'fechaCreacion', concat(df.f_creacion,'Z'),
            'fechaActualizacion', concat(df.f_actualizacion,'Z'),
            'fechaEmision', concat(df.f_emision,'Z'),
            'fechaAnulacion', concat(df.f_anulacion,'Z'),
            'concepto', df.concepto,
            'importeNeto', df.importe_neto,
            'usuario', json_object( 'uuid', df.usuario_uuid ),
            'fechaCreacion', concat(df.f_creacion,'Z'),
            'fechaActualizacion', concat(df.f_actualizacion,'Z')
        )
        from documento_transaccion
        left join documento_fuente df on df.id = documento_transaccion.id
        where documento_transaccion.id = documento_movimiento.documento_transaccion_id
    ),
    'notas', (
        select json_arrayagg(json_object(
            'id', nota.id,
            'fecha', nota.fecha,
            'descripcion', nota.descripcion,
            'usuario', json_object( 'uuid', nota.usuario_uuid )
        )) as json
        from nota
        where nota.documento_fuente_id = documento_fuente.id
    ),

    'salidas', (
        select json_arrayagg(cte_salida_bien_consumo.json)
        from (

            select 
                salida_bien_consumo.documento_fuente_id as documento_fuente_id,
                json_object(
                    'type', 'SalidaBienConsumoValorNuevo',
                    'id', salida_bien_consumo.id,
                    'uuid', salida_bien_consumo.uuid,
                    'almacen', json_object( 'uuid', salida_bien_consumo.almacen_uuid ),
                    'bienConsumo', json_object( 'uuid', salida_bien_consumo.bien_consumo_uuid ),
                    'cantidadSaliente', salida_bien_consumo.cant,
                    'cantidadEntrante', (
                        select sum(entrada_bien_consumo.cant)
                        from entrada_bien_consumo_valor_salida
                        left join entrada_bien_consumo on entrada_bien_consumo.id = entrada_bien_consumo_valor_salida.id
                        where entrada_bien_consumo_valor_salida.salida_bien_consumo_id = salida_bien_consumo.id
                    ),
                    'importePrecioUnitario', salida_bien_consumo.precio_uni
                ) as json
            from salida_bien_consumo_valor_nuevo
            left join salida_bien_consumo on salida_bien_consumo.id = salida_bien_consumo_valor_nuevo.id

            union all

            select 
                salida_bien_consumo.documento_fuente_id as documento_fuente_id,
                json_object(
                    'type', 'SalidaBienConsumoValorEntrada',
                    'id', salida_bien_consumo.id,
                    'uuid', salida_bien_consumo.uuid,
                    'almacen', json_object( 'uuid', salida_bien_consumo.almacen_uuid ),
                    'bienConsumo', json_object( 'uuid', salida_bien_consumo.bien_consumo_uuid ),
                    'cantidadSaliente', salida_bien_consumo.cant,
                    'cantidadEntrante', (
                        select sum(entrada_bien_consumo.cant)
                        from entrada_bien_consumo_valor_salida
                        left join entrada_bien_consumo on entrada_bien_consumo.id = entrada_bien_consumo_valor_salida.id
                        where entrada_bien_consumo_valor_salida.salida_bien_consumo_id = salida_bien_consumo.id
                    ),
                    'importePrecioUnitario', salida_bien_consumo.precio_uni,
                    'entrada', json_object( 'id', salida_bien_consumo_valor_entrada.entrada_bien_consumo_id )
                ) as json
            from salida_bien_consumo_valor_entrada
            left join salida_bien_consumo on salida_bien_consumo.id = salida_bien_consumo_valor_entrada.id

        ) as cte_salida_bien_consumo
        where cte_salida_bien_consumo.documento_fuente_id = documento_movimiento.id
    )
) as json
from documento_movimiento
left join documento_fuente on documento_fuente.id = documento_movimiento.id
where exists (
    select 1
    from salida_bien_consumo
    where salida_bien_consumo.documento_fuente_id = documento_movimiento.id
);