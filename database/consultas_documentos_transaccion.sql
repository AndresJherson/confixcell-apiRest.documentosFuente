use confixcell_documentos_fuente;


-- base

select json_object(
    'id', df.id,
    'uuid', df.uuid,
    'codigoSerie', df.cod_serie,
    'codigoNumero', df.cod_numero,
    'fechaEmision', concat(df.f_emision,'Z'),
    'fechaAnulacion', concat(df.f_anulacion,'Z'),
    'concepto', df.concepto,
    'importeNeto', df.importe_neto,
    'usuario', json_object( 'uuid', df.usuario_uuid ),
    'fechaCreacion', concat(df.f_creacion,'Z'),
    'fechaActualizacion', concat(df.f_actualizacion,'Z'),
    'notas', (
        select json_arrayagg(json_object(
            'id', nota.id,
            'fecha', nota.fecha,
            'descripcion', nota.descripcion,
            'usuario', json_object( 'uuid', nota.usuario_uuid )
        )) as json
        from nota
        where nota.documento_fuente_id = df.id
    ),
    'docsEntradaEfectivo', (
        select json_arrayagg(json_object(
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
        )) as json
        from documento_movimiento
        left join documento_fuente on documento_fuente.id = documento_movimiento.id
        where exists (
            select 1
            from entrada_efectivo
            where entrada_efectivo.documento_fuente_id = documento_movimiento.id
        )
        and documento_movimiento.documento_transaccion_id = documento_transaccion.id
    ),
    'docsEntradaBienConsumo', (
        select json_arrayagg(json_object(
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
                            'salida', json_object( 'id', entrada_bien_consumo_valor_salida.salida_bien_consumo_id )
                        ) as json
                    from entrada_bien_consumo_valor_salida
                    left join entrada_bien_consumo on entrada_bien_consumo.id = entrada_bien_consumo_valor_salida.id

                ) as cte_entrada_bien_consumo
                where cte_entrada_bien_consumo.documento_fuente_id = documento_movimiento.id
            )
        )) as json
        from documento_movimiento
        left join documento_fuente on documento_fuente.id = documento_movimiento.id
        where exists (
            select 1
            from entrada_bien_consumo
            where entrada_bien_consumo.documento_fuente_id = documento_movimiento.id
        )
        and documento_movimiento.documento_transaccion_id = documento_transaccion.id
    ),
    'docsSalidaEfectivo', (
        select json_arrayagg(json_object(
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
        )) as json
        from documento_movimiento
        left join documento_fuente on documento_fuente.id = documento_movimiento.id
        where exists (
            select 1
            from salida_efectivo
            where salida_efectivo.documento_fuente_id = documento_movimiento.id
        )
        and documento_movimiento.documento_transaccion_id = documento_transaccion.id
    ),
    'docsSalidaBienConsumo', (
        select json_arrayagg(json_object(
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
                            'importePrecioUnitario', salida_bien_consumo.precio_uni,
                            'entrada', json_object( 'id', salida_bien_consumo_valor_entrada.entrada_bien_consumo_id )
                        ) as json
                    from salida_bien_consumo_valor_entrada
                    left join salida_bien_consumo on salida_bien_consumo.id = salida_bien_consumo_valor_entrada.id

                ) as cte_salida_bien_consumo
                where cte_salida_bien_consumo.documento_fuente_id = documento_movimiento.id
            )
        )) as json
        from documento_movimiento
        left join documento_fuente on documento_fuente.id = documento_movimiento.id
        where exists (
            select 1
            from salida_bien_consumo
            where salida_bien_consumo.documento_fuente_id = documento_movimiento.id
        )
        and documento_movimiento.documento_transaccion_id = documento_transaccion.id
    )
) as json
from documento_transaccion
left join documento_fuente df on df.id = documento_transaccion.id;


-- nota_transaccion_entrada
-- contado: liquidacion_tipo_id = 1
-- credito: liquidacion_tipo_id = 2

select json_object(
    'type', 'NotaTransaccionEntrada',
    'id', df.id,
    'uuid', df.uuid,
    'codigoSerie', df.cod_serie,
    'codigoNumero', df.cod_numero,
    'fechaEmision', concat(df.f_emision,'Z'),
    'fechaAnulacion', concat(df.f_anulacion,'Z'),
    'concepto', df.concepto,
    'importeNeto', df.importe_neto,
    'usuario', json_object( 'uuid', df.usuario_uuid ),
    'fechaCreacion', concat(df.f_creacion,'Z'),
    'fechaActualizacion', concat(df.f_actualizacion,'Z'),
    'notas', (
        select json_arrayagg(json_object(
            'id', nota.id,
            'fecha', nota.fecha,
            'descripcion', nota.descripcion,
            'usuario', json_object( 'uuid', nota.usuario_uuid )
        )) as json
        from nota
        where nota.documento_fuente_id = df.id
    ),
    'docsEntradaEfectivo', (
        select json_arrayagg(json_object(
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
        )) as json
        from documento_movimiento
        left join documento_fuente on documento_fuente.id = documento_movimiento.id
        where exists (
            select 1
            from entrada_efectivo
            where entrada_efectivo.documento_fuente_id = documento_movimiento.id
        )
        and documento_movimiento.documento_transaccion_id = documento_transaccion.id
    ),
    'docsEntradaBienConsumo', (
        select json_arrayagg(json_object(
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
                            'salida', json_object( 'id', entrada_bien_consumo_valor_salida.salida_bien_consumo_id )
                        ) as json
                    from entrada_bien_consumo_valor_salida
                    left join entrada_bien_consumo on entrada_bien_consumo.id = entrada_bien_consumo_valor_salida.id

                ) as cte_entrada_bien_consumo
                where cte_entrada_bien_consumo.documento_fuente_id = documento_movimiento.id
            )
        )) as json
        from documento_movimiento
        left join documento_fuente on documento_fuente.id = documento_movimiento.id
        where exists (
            select 1
            from entrada_bien_consumo
            where entrada_bien_consumo.documento_fuente_id = documento_movimiento.id
        )
        and documento_movimiento.documento_transaccion_id = documento_transaccion.id
    ),
    'docsSalidaEfectivo', (
        select json_arrayagg(json_object(
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
        )) as json
        from documento_movimiento
        left join documento_fuente on documento_fuente.id = documento_movimiento.id
        where exists (
            select 1
            from salida_efectivo
            where salida_efectivo.documento_fuente_id = documento_movimiento.id
        )
        and documento_movimiento.documento_transaccion_id = documento_transaccion.id
    ),
    'docsSalidaBienConsumo', (
        select json_arrayagg(json_object(
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
                            'importePrecioUnitario', salida_bien_consumo.precio_uni,
                            'entrada', json_object( 'id', salida_bien_consumo_valor_entrada.entrada_bien_consumo_id )
                        ) as json
                    from salida_bien_consumo_valor_entrada
                    left join salida_bien_consumo on salida_bien_consumo.id = salida_bien_consumo_valor_entrada.id

                ) as cte_salida_bien_consumo
                where cte_salida_bien_consumo.documento_fuente_id = documento_movimiento.id
            )
        )) as json
        from documento_movimiento
        left join documento_fuente on documento_fuente.id = documento_movimiento.id
        where exists (
            select 1
            from salida_bien_consumo
            where salida_bien_consumo.documento_fuente_id = documento_movimiento.id
        )
        and documento_movimiento.documento_transaccion_id = documento_transaccion.id
    ),

    'comprobanteTipo', (
        select json_object(
            'id', comprobante_tipo.id,
            'nombre', comprobante_tipo.nombre
        ) as json
        from comprobante_tipo
        where comprobante_tipo.id = nota_transaccion_entrada.comprobante_tipo_id
    ),
    'comprobanteCodigoSerie', nota_transaccion_entrada.comprobante_cod_serie,
    'comprobanteCodigoNumero', nota_transaccion_entrada.comprobante_cod_numero,
    'proveedor', json_object( 'uuid', nota_transaccion_entrada.proveedor_uuid ),
    'proveedorDocumentoIdentificacion', json_object( 'uuid', nota_transaccion_entrada.proveedor_documento_identificacion_uuid ),
    'proveedorCodigo', nota_transaccion_entrada.proveedor_cod,
    'proveedorNombre', nota_transaccion_entrada.proveedor_nombre,
    'proveedorCelular', nota_transaccion_entrada.proveedor_celular,
    'liquidacion', (
        select json_object(
            'id', liquidacion_tipo.id,
            'nombre', liquidacion_tipo.nombre
        ) as json
        from liquidacion_tipo
        where liquidacion_tipo.id = nota_transaccion_entrada.liquidacion_tipo_id
    ),
    'detalles', (
        select json_arrayagg(json_object(
            'id', nte_detalle.id,
            'recurso', json_object( 'uuid', nte_detalle.recurso_uuid ),
            'concepto', nte_detalle.concepto,
            'cantidad', nte_detalle.cant,
            'importeUnitario', nte_detalle.precio_uni,
            'importeDescuento', nte_detalle.descuento,
            'comentario', nte_detalle.comentario
        ))
        from nte_detalle
        where nte_detalle.nota_transaccion_entrada_id = nota_transaccion_entrada.id
    ),
    'credito', (
        select json_object(
            'id', entrada_efectivo.id,
            'uuid', entrada_efectivo.uuid,
            'importeValorNeto', entrada_efectivo.valor,
            'tasaInteresDiario', nte_credito.tasa_interes_diario,
            'cuotas', (
                select json_arrayagg(json_object(
                    'id', nte_cuota.id,
                    'numero', nte_cuota.numero,
                    'fechaInicio', concat(nte_cuota.f_inicio,'Z'),
                    'fechaVencimiento', concat(nte_cuota.f_vencimiento,'Z'),
                    'impoteCuota', nte_cuota.cuota,
                    'impoteAmortizacion', nte_cuota.amortizacion,
                    'importeInteres', nte_cuota.interes,
                    'importeSaldo', nte_cuota.saldo
                ))
                from nte_cuota
                where nte_cuota.nte_credito_id = nte_credito.id
            )
        ) as json
        from nte_credito
        left join entrada_efectivo on entrada_efectivo.id = nte_credito.id
        where nte_credito.nota_transaccion_entrada_id = nota_transaccion_entrada.id
    )
) as json
from nota_transaccion_entrada
left join documento_transaccion on documento_transaccion.id = nota_transaccion_entrada.id
left join documento_fuente df on df.id = documento_transaccion.id;


-- nota_transaccion_salida
-- contado: liquidacion_tipo_id = 1
-- credito: liquidacion_tipo_id = 2

select json_object(
    'type', 'NotaTransaccionSalida',
    'id', df.id,
    'uuid', df.uuid,
    'codigoSerie', df.cod_serie,
    'codigoNumero', df.cod_numero,
    'fechaEmision', concat(df.f_emision,'Z'),
    'fechaAnulacion', concat(df.f_anulacion,'Z'),
    'concepto', df.concepto,
    'importeNeto', df.importe_neto,
    'usuario', json_object( 'uuid', df.usuario_uuid ),
    'fechaCreacion', concat(df.f_creacion,'Z'),
    'fechaActualizacion', concat(df.f_actualizacion,'Z'),
    'notas', (
        select json_arrayagg(json_object(
            'id', nota.id,
            'fecha', nota.fecha,
            'descripcion', nota.descripcion,
            'usuario', json_object( 'uuid', nota.usuario_uuid )
        )) as json
        from nota
        where nota.documento_fuente_id = df.id
    ),
    'docsEntradaEfectivo', (
        select json_arrayagg(json_object(
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
        )) as json
        from documento_movimiento
        left join documento_fuente on documento_fuente.id = documento_movimiento.id
        where exists (
            select 1
            from entrada_efectivo
            where entrada_efectivo.documento_fuente_id = documento_movimiento.id
        )
        and documento_movimiento.documento_transaccion_id = documento_transaccion.id
    ),
    'docsEntradaBienConsumo', (
        select json_arrayagg(json_object(
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
                            'salida', json_object( 'id', entrada_bien_consumo_valor_salida.salida_bien_consumo_id )
                        ) as json
                    from entrada_bien_consumo_valor_salida
                    left join entrada_bien_consumo on entrada_bien_consumo.id = entrada_bien_consumo_valor_salida.id

                ) as cte_entrada_bien_consumo
                where cte_entrada_bien_consumo.documento_fuente_id = documento_movimiento.id
            )
        )) as json
        from documento_movimiento
        left join documento_fuente on documento_fuente.id = documento_movimiento.id
        where exists (
            select 1
            from entrada_bien_consumo
            where entrada_bien_consumo.documento_fuente_id = documento_movimiento.id
        )
        and documento_movimiento.documento_transaccion_id = documento_transaccion.id
    ),
    'docsSalidaEfectivo', (
        select json_arrayagg(json_object(
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
        )) as json
        from documento_movimiento
        left join documento_fuente on documento_fuente.id = documento_movimiento.id
        where exists (
            select 1
            from salida_efectivo
            where salida_efectivo.documento_fuente_id = documento_movimiento.id
        )
        and documento_movimiento.documento_transaccion_id = documento_transaccion.id
    ),
    'docsSalidaBienConsumo', (
        select json_arrayagg(json_object(
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
                            'importePrecioUnitario', salida_bien_consumo.precio_uni,
                            'entrada', json_object( 'id', salida_bien_consumo_valor_entrada.entrada_bien_consumo_id )
                        ) as json
                    from salida_bien_consumo_valor_entrada
                    left join salida_bien_consumo on salida_bien_consumo.id = salida_bien_consumo_valor_entrada.id

                ) as cte_salida_bien_consumo
                where cte_salida_bien_consumo.documento_fuente_id = documento_movimiento.id
            )
        )) as json
        from documento_movimiento
        left join documento_fuente on documento_fuente.id = documento_movimiento.id
        where exists (
            select 1
            from salida_bien_consumo
            where salida_bien_consumo.documento_fuente_id = documento_movimiento.id
        )
        and documento_movimiento.documento_transaccion_id = documento_transaccion.id
    ),

    'cliente', json_object( 'uuid', nota_transaccion_salida.cliente_uuid ),
    'clienteDocumentoIdentificacion', json_object( 'uuid', nota_transaccion_salida.cliente_documento_identificacion_uuid ),
    'clienteCodigo', nota_transaccion_salida.cliente_cod,
    'clienteNombre', nota_transaccion_salida.cliente_nombre,
    'clienteCelular', nota_transaccion_salida.cliente_celular,
    'liquidacion', (
        select json_object(
            'id', liquidacion_tipo.id,
            'nombre', liquidacion_tipo.nombre
        ) as json
        from liquidacion_tipo
        where liquidacion_tipo.id = nota_transaccion_salida.liquidacion_tipo_id
    ),
    'detalles', (
        select json_arrayagg(json_object(
            'id', nts_detalle.id,
            'recurso', json_object( 'uuid', nts_detalle.recurso_uuid ),
            'concepto', nts_detalle.concepto,
            'cantidad', nts_detalle.cant,
            'importeUnitario', nts_detalle.precio_uni,
            'importeDescuento', nts_detalle.descuento,
            'comentario', nts_detalle.comentario
        ))
        from nts_detalle
        where nts_detalle.nota_transaccion_salida_id = nota_transaccion_salida.id
    ),
    'credito', (
        select json_object(
            'id', salida_efectivo.id,
            'uuid', salida_efectivo.uuid,
            'importeValorNeto', salida_efectivo.valor,
            'tasaInteresDiario', nts_credito.tasa_interes_diario,
            'cuotas', (
                select json_arrayagg(json_object(
                    'id', nts_cuota.id,
                    'numero', nts_cuota.numero,
                    'fechaInicio', concat(nts_cuota.f_inicio,'Z'),
                    'fechaVencimiento', concat(nts_cuota.f_vencimiento,'Z'),
                    'impoteCuota', nts_cuota.cuota,
                    'importeAmortizacion', nts_cuota.amortizacion,
                    'importeInteres', nts_cuota.interes,
                    'importeSaldo', nts_cuota.saldo
                ))
                from nts_cuota
                where nts_cuota.nts_credito_id = nts_credito.id
            )
        ) as json
        from nts_credito
        left join salida_efectivo on salida_efectivo.id = nts_credito.id
        where nts_credito.nota_transaccion_salida_id = nota_transaccion_salida.id
    )
) as json
from nota_transaccion_salida
left join documento_transaccion on documento_transaccion.id = nota_transaccion_salida.id
left join documento_fuente df on df.id = documento_transaccion.id;


-- nota_venta

select json_object(
    'type', 'NotaVenta',
    'id', df.id,
    'uuid', df.uuid,
    'codigoSerie', df.cod_serie,
    'codigoNumero', df.cod_numero,
    'fechaEmision', concat(df.f_emision,'Z'),
    'fechaAnulacion', concat(df.f_anulacion,'Z'),
    'concepto', df.concepto,
    'importeNeto', df.importe_neto,
    'usuario', json_object( 'uuid', df.usuario_uuid ),
    'fechaCreacion', concat(df.f_creacion,'Z'),
    'fechaActualizacion', concat(df.f_actualizacion,'Z'),
    'notas', (
        select json_arrayagg(json_object(
            'id', nota.id,
            'fecha', nota.fecha,
            'descripcion', nota.descripcion,
            'usuario', json_object( 'uuid', nota.usuario_uuid )
        )) as json
        from nota
        where nota.documento_fuente_id = df.id
    ),
    'docsEntradaEfectivo', (
        select json_arrayagg(json_object(
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
        )) as json
        from documento_movimiento
        left join documento_fuente on documento_fuente.id = documento_movimiento.id
        where exists (
            select 1
            from entrada_efectivo
            where entrada_efectivo.documento_fuente_id = documento_movimiento.id
        )
        and documento_movimiento.documento_transaccion_id = documento_transaccion.id
    ),
    'docsEntradaBienConsumo', (
        select json_arrayagg(json_object(
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
                            'salida', json_object( 'id', entrada_bien_consumo_valor_salida.salida_bien_consumo_id )
                        ) as json
                    from entrada_bien_consumo_valor_salida
                    left join entrada_bien_consumo on entrada_bien_consumo.id = entrada_bien_consumo_valor_salida.id

                ) as cte_entrada_bien_consumo
                where cte_entrada_bien_consumo.documento_fuente_id = documento_movimiento.id
            )
        )) as json
        from documento_movimiento
        left join documento_fuente on documento_fuente.id = documento_movimiento.id
        where exists (
            select 1
            from entrada_bien_consumo
            where entrada_bien_consumo.documento_fuente_id = documento_movimiento.id
        )
        and documento_movimiento.documento_transaccion_id = documento_transaccion.id
    ),
    'docsSalidaEfectivo', (
        select json_arrayagg(json_object(
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
        )) as json
        from documento_movimiento
        left join documento_fuente on documento_fuente.id = documento_movimiento.id
        where exists (
            select 1
            from salida_efectivo
            where salida_efectivo.documento_fuente_id = documento_movimiento.id
        )
        and documento_movimiento.documento_transaccion_id = documento_transaccion.id
    ),
    'docsSalidaBienConsumo', (
        select json_arrayagg(json_object(
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
                            'importePrecioUnitario', salida_bien_consumo.precio_uni,
                            'entrada', json_object( 'id', salida_bien_consumo_valor_entrada.entrada_bien_consumo_id )
                        ) as json
                    from salida_bien_consumo_valor_entrada
                    left join salida_bien_consumo on salida_bien_consumo.id = salida_bien_consumo_valor_entrada.id

                ) as cte_salida_bien_consumo
                where cte_salida_bien_consumo.documento_fuente_id = documento_movimiento.id
            )
        )) as json
        from documento_movimiento
        left join documento_fuente on documento_fuente.id = documento_movimiento.id
        where exists (
            select 1
            from salida_bien_consumo
            where salida_bien_consumo.documento_fuente_id = documento_movimiento.id
        )
        and documento_movimiento.documento_transaccion_id = documento_transaccion.id
    ),
        
    'fechaCompromiso', concat(nota_venta.f_compromiso,'Z'),
    'cliente', json_object( 'uuid', nota_venta.cliente_uuid ),
    'prioridad', (
        select json_object(
            'id', nv_prioridad.id,
            'nombre', nv_prioridad.nombre
        )
        from nv_prioridad
        where nv_prioridad.id = nota_venta.nv_prioridad_id
    ),
    'usuarioTecnico', json_object( 'uuid', nota_venta.usuario_tecnico_uuid ),
    'estado', (
        select json_object(
            'id', nv_estado.id,
            'nombre', nv_estado.nombre
        )
        from nv_estado
        where nv_estado.id = nota_venta.nv_estado_id
    ),

    'salidasBienConsumo', (
        select json_arrayagg(json_object(
            'id', salida_bien_consumo.id,
            'uuid', salida_bien_consumo.uuid,
            'almacen', json_object( 'uuid', salida_bien_consumo.almacen_uuid ),
            'bienConsumo', json_object( 'uuid', salida_bien_consumo.bien_consumo_uuid ),
            'cantidadSaliente', salida_bien_consumo.cant,
            'importePrecioUnitario', salida_bien_consumo.precio_uni,
            'importeDescuento', nv_salida_bien_consumo.descuento
        )) as json
        from nv_salida_bien_consumo
        left join salida_bien_consumo on salida_bien_consumo.id = nv_salida_bien_consumo.id
        where nv_salida_bien_consumo.nota_venta_id = nota_venta.id
    ),
    'salidasProduccionServicioReparacion', (
        select json_arrayagg(json_object(
            'id', salida_produccion.id,
            'importePrecioNeto', salida_produccion.precio,
            'servicio', json_object( 'uuid', salida_produccion_servicio.servicio_uuid ),
            'pantallaModelo', json_object( 'uuid', nv_servicio_reparacion.pantalla_modelo_uuid ),
            'imei', nv_servicio_reparacion.imei,
            'patron', nv_servicio_reparacion.patron,
            'contrasena', nv_servicio_reparacion.contrasena,
            'problema', nv_servicio_reparacion.problema,
            'recursosServicio', (
                select json_arrayagg(json_object(
                    'id', nv_servicio_reparacion_recurso_servicio.id,
                    'uuid', nv_servicio_reparacion_recurso_servicio.uuid,
                    'categoriaReparacion', (
                        select json_object(
                            'id', nv_categoria_reparacion.id,
                            'nombre', nv_categoria_reparacion.nombre
                        ) as json
                        from nv_categoria_reparacion
                        where nv_categoria_reparacion.id = nv_servicio_reparacion_recurso_servicio.nv_categoria_reparacion_id
                    ),
                    'descripcion', nv_servicio_reparacion_recurso_servicio.descripcion,
                    'fechaInicio', concat(nv_servicio_reparacion_recurso_servicio.f_inicio,'Z'),
                    'fechaFinal', concat(nv_servicio_reparacion_recurso_servicio.f_final,'Z'),
                    'importePrecio', nv_servicio_reparacion_recurso_servicio.precio
                ))
                from nv_servicio_reparacion_recurso_servicio
                where nv_servicio_reparacion_recurso_servicio.nv_servicio_reparacion_id = nv_servicio_reparacion.id
            ),
            'recursosBienConsumo', (
                select json_arrayagg(json_object(
                    'id', nv_servicio_reparacion_recurso_bien_consumo.id,
                    'uuid', nv_servicio_reparacion_recurso_bien_consumo.uuid,
                    'fecha', nv_servicio_reparacion_recurso_bien_consumo.fecha,
                    'almacen', json_object( 'uuid', nv_servicio_reparacion_recurso_bien_consumo.almacen_uuid ),
                    'bienConsumo', json_object( 'uuid', nv_servicio_reparacion_recurso_bien_consumo.bien_consumo_uuid ),
                    'cantidad', nv_servicio_reparacion_recurso_bien_consumo.cant,
                    'importePrecioUnitario', nv_servicio_reparacion_recurso_bien_consumo.precio_uni
                ))
                from nv_servicio_reparacion_recurso_bien_consumo
                where nv_servicio_reparacion_recurso_bien_consumo.nv_servicio_reparacion_id = nv_servicio_reparacion.id
            )
        )) as json
        from nv_servicio_reparacion
        left join salida_produccion_servicio on salida_produccion_servicio.id = nv_servicio_reparacion.id
        left join salida_produccion on salida_produccion.id = salida_produccion_servicio.id
        where nv_servicio_reparacion.nota_venta_id = nota_venta.id
    ),
    'entradasEfectivo', (
        select json_arrayagg(json_object(
            'id', entrada_efectivo.id,
            'uuid', entrada_efectivo.uuid,
            'numero', nv_entrada_efectivo.numero,
            'fecha', nv_entrada_efectivo.fecha,
            'medioTransferencia', (
                select json_object(
                    'id', medio_transferencia.id,
                    'nombre', medio_transferencia.nombre
                ) as json
                from medio_transferencia
                where medio_transferencia.id = nv_entrada_efectivo.medio_transferencia_id
            ),
            'importeValorNeto', entrada_efectivo.valor
        )) as json
        from nv_entrada_efectivo
        left join entrada_efectivo on entrada_efectivo.id = nv_entrada_efectivo.id
        where nv_entrada_efectivo.nota_venta_id = nota_venta.id
    )
) as json
from nota_venta
left join documento_transaccion on documento_transaccion.id = nota_venta.id
left join documento_fuente df on df.id = documento_transaccion.id;
