use confixcell_documentos_fuente;


-- entrada_bien_consumo
select cte_entrada_bien_consumo.json
from (
    select 
        entrada_bien_consumo.id as id,
        entrada_bien_consumo.uuid as uuid,
        entrada_bien_consumo.almacen_uuid as almacen_uuid,
        entrada_bien_consumo.bien_consumo_uuid as bien_consumo_uuid,
        json_object(
            'type', 'EntradaBienConsumoValorNuevo',
            'id', entrada_bien_consumo.id,
            'uuid', entrada_bien_consumo.uuid,
            'almacen', json_object('uuid', entrada_bien_consumo.almacen_uuid),
            'bienConsumo', json_object('uuid', entrada_bien_consumo.bien_consumo_uuid),
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
    left join documento_fuente on documento_fuente.id = entrada_bien_consumo.documento_fuente_id
    where documento_fuente.f_emision is not null
    and documento_fuente.f_anulacion is null

    union all

    select 
        entrada_bien_consumo.id as id,
        entrada_bien_consumo.uuid as uuid,
        entrada_bien_consumo.almacen_uuid as almacen_uuid,
        entrada_bien_consumo.bien_consumo_uuid as bien_consumo_uuid,
        json_object(
            'type', 'EntradaBienConsumoValorSalida',
            'id', entrada_bien_consumo.id,
            'uuid', entrada_bien_consumo.uuid,
            'almacen', json_object('uuid', entrada_bien_consumo.almacen_uuid),
            'bienConsumo', json_object('uuid', entrada_bien_consumo.bien_consumo_uuid),
            'cantidadEntrante', entrada_bien_consumo.cant,
            'cantidadSaliente', (
                select sum(salida_bien_consumo.cant)
                from salida_bien_consumo_valor_entrada
                left join salida_bien_consumo on salida_bien_consumo.id = salida_bien_consumo_valor_entrada.id
                where salida_bien_consumo_valor_entrada.entrada_bien_consumo_id = entrada_bien_consumo.id
            )
        ) as json
    from entrada_bien_consumo_valor_salida
    left join entrada_bien_consumo on entrada_bien_consumo.id = entrada_bien_consumo_valor_salida.id
    left join documento_fuente on documento_fuente.id = entrada_bien_consumo.documento_fuente_id
    where documento_fuente.f_emision is not null
    and documento_fuente.f_anulacion is null
) as cte_entrada_bien_consumo;


-- salida_bien_consumo
select cte_salida_bien_consumo.json
from (
    select 
        salida_bien_consumo.id as id,
        salida_bien_consumo.uuid as uuid,
        salida_bien_consumo.almacen_uuid as almacen_uuid,
        salida_bien_consumo.bien_consumo_uuid as bien_consumo_uuid,
        json_object(
            'type', 'SalidaBienConsumoValorNuevo',
            'id', salida_bien_consumo.id,
            'uuid', salida_bien_consumo.uuid,
            'almacen', json_object('uuid', salida_bien_consumo.uuid),
            'bienConsumo', json_object('uuid', salida_bien_consumo.bien_consumo_uuid),
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
    left join documento_fuente on documento_fuente.id = salida_bien_consumo.documento_fuente_id
    where documento_fuente.f_emision is not null
    and documento_fuente.f_anulacion is null

    union all

    select 
        salida_bien_consumo.id as id,
        salida_bien_consumo.uuid as uuid,
        salida_bien_consumo.almacen_uuid as almacen_uuid,
        salida_bien_consumo.bien_consumo_uuid as bien_consumo_uuid,
        json_object(
            'type', 'SalidaBienConsumoValorEntrada',
            'id', salida_bien_consumo.id,
            'uuid', salida_bien_consumo.uuid,
            'almacen', json_object('uuid', salida_bien_consumo.uuid),
            'bienConsumo', json_object('uuid', salida_bien_consumo.bien_consumo_uuid),
            'cantidadSaliente', salida_bien_consumo.cant,
            'cantidadEntrante', (
                select sum(entrada_bien_consumo.cant)
                from entrada_bien_consumo_valor_salida
                left join entrada_bien_consumo on entrada_bien_consumo.id = entrada_bien_consumo_valor_salida.id
                where entrada_bien_consumo_valor_salida.salida_bien_consumo_id = salida_bien_consumo.id
            ),
            'importePrecioUnitario', salida_bien_consumo.precio_uni
        ) as json
    from salida_bien_consumo_valor_entrada
    left join salida_bien_consumo on salida_bien_consumo.id = salida_bien_consumo_valor_entrada.id
    left join documento_fuente on documento_fuente.id = salida_bien_consumo.documento_fuente_id
    where documento_fuente.f_emision is not null
    and documento_fuente.f_anulacion is null
) as cte_salida_bien_consumo;