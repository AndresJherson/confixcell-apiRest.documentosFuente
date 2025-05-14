import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DocumentoTransaccionService } from '../documento-transaccion.service';
import { ConectorService } from 'src/services/conector.service';
import { ModuleRef } from '@nestjs/core';
import { ERROR, ERROR_DOCUMENT } from 'src/utils/constants';
import { SessionData } from 'src/utils/interfaces';
import { Cliente, NotaTransaccionSalida, NotaTransaccionSalidaCredito, Prop, Usuario } from '@confixcell/modelos';
import { SalidaEfectivoService } from 'src/repositories/movimientos-recurso/salida/salida-efectivo.service';
import { NotaTransaccionSalidaEntity } from 'src/entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionSalida/NotaTransaccionSalidaEntity';
import { NtsDetalleEntity } from 'src/entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionSalida/NtsDetalleEntity';
import { DocumentoMovimientoService } from '../../documentos-movimiento/documento-movimiento.service';
import { v4 } from 'uuid';

@Injectable()
export class NotaTransaccionSalidaService {

    private documentoTransaccionService!: DocumentoTransaccionService;
    private documentoMovimientoService!: DocumentoMovimientoService;


    constructor(
        private conectorService: ConectorService,
        private moduleRef: ModuleRef,
        private salidaEfectivoService: SalidaEfectivoService
    )
    {}


    onModuleInit() 
    {
        this.documentoTransaccionService = this.moduleRef.get( DocumentoTransaccionService, { strict: false } );
        this.documentoMovimientoService = this.moduleRef.get( DocumentoMovimientoService, { strict: false } );

        if ( !this.documentoTransaccionService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
        if ( !this.documentoMovimientoService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
    }


    async executeCreateCollection( s: SessionData, ntss: NotaTransaccionSalida[] )
    {
        await this.documentoTransaccionService.executeCreateCollection( s, ntss );

        await NotaTransaccionSalidaEntity.bulkCreate( ntss.map( nts => ({
            id: nts.id,
            clienteUuid: nts.cliente?.uuid,
            clienteDocumentoIdentificacionUuid: nts.clienteDocumentoIdentificacion?.uuid,
            clienteCodigo: nts.clienteCodigo,
            clienteNombre: nts.clienteNombre,
            clienteCelular: nts.clienteCelular,
            liquidacionTipoId: nts.liquidacion?.id,
            ntsDetallesEntity: nts.detalles.map( detalle => new NtsDetalleEntity({
                id: detalle.id,
                notaTransaccionSalidaId: detalle.notaTransaccionSalida?.id,
                recursoUuid: detalle.recurso?.uuid,
                concepto: detalle.concepto,
                importeUnitario: detalle.importeUnitario,
                cantidad: detalle.cantidad,
                importeDescuento: detalle.importeDescuento,
                comentario: detalle.comentario
            }) )
        }) ) );

        await this.salidaEfectivoService.executeCreateCollection( s, ntss.filter( nts => nts.liquidacion?.id === 2 )
            .map( nts => nts.credito )
            .filter( credito => credito !== undefined ) );
    }


    async executeDeleteCollection( s: SessionData, ntss: NotaTransaccionSalida[] )
    {
        return await this.documentoTransaccionService.executeDeleteCollection( s, ntss );
    }


    async setCode( s: SessionData, ntss: NotaTransaccionSalida[] )
    {
        return await this.documentoTransaccionService.setCode( s, ntss );
    }


    async getId( s: SessionData )
    {
        return await this.conectorService.getId( s.transaction, 'documento_fuente' );
    }


    async getCollection( s: SessionData )
    {
        return await this.conectorService.executeQuery({
            target: NotaTransaccionSalida,
            transaction: s.transaction,
            query: this.query
        }).then( data => data.map( item => item.procesarInformacion() ) );
    }


    async getCollectionByUsuarioId( s: SessionData, usuario: Usuario )
    {
        return await this.conectorService.executeQuery({
            target: NotaTransaccionSalida,
            transaction: s.transaction,
            query: `
                ${this.query}
                where df.usuario_uuid ${usuario?.uuid !== undefined ? ' = :usuarioUuid ' : ' is null ' }
            `,
            parameters: {
                usuarioUuid: usuario?.uuid ?? null
            }
        }).then( data => data.map( item => item.procesarInformacion() ) );
    }


    async getCollectionByClienteId( s: SessionData, cliente: Cliente )
    {
        return await this.conectorService.executeQuery({
            target: NotaTransaccionSalida,
            transaction: s.transaction,
            query: `
                ${this.query}
                where nota_transaccion_salida.cliente_uuid ${cliente?.uuid !== undefined ? ' = :clienteUuid ' : ' is null ' }
            `,
            parameters: {
                clienteUuid: cliente?.uuid ?? null
            }
        }).then( data => data.map( item => item.procesarInformacion() ) );
    }


    async getObjectById( s: SessionData, nts: NotaTransaccionSalida )
    {
        const data = await this.conectorService.executeQuery({
            target: NotaTransaccionSalida,
            transaction: s.transaction,
            query: `
                ${this.query}
                and nota_transaccion_salida.id ${nts.id === undefined ? ' is null ': ' = :id '}
            `,
            parameters: {
                id: nts.id ?? null
            }
        });

        if ( !data.length ) throw new InternalServerErrorException( ERROR.ID_INVALIDATE );

        return data[0].procesarInformacion();
    }


    async create( s: SessionData, nts: NotaTransaccionSalida )
    {
        nts.set({
            uuid: v4(),
            codigoSerie: undefined,
            codigoNumero: undefined,
            fechaEmision: undefined,
            fechaAnulacion: undefined,
            docsEntradaEfectivo: [],
            docsEntradaBienConsumo: [],
            docsSalidaEfectivo: [],
            docsSalidaBienConsumo: []
        })
        .setRelation({
            documentoFuenteId: await this.getId( s ),
            notaId: await this.conectorService.getId( s.transaction, 'nota' ),
            notaTransaccionSalidaDetalleId: await this.conectorService.getId( s.transaction, 'nts_detalle' ),
            notaTransaccionSalidaCuotaId: await this.conectorService.getId( s.transaction, 'nts_cuota' ),
            entradaEfectivoId: await this.conectorService.getId( s.transaction, 'entrada_efectivo' ),
            entradaBienConsumoId: await this.conectorService.getId( s.transaction, 'entrada_bien_consumo' ),
            salidaEfectivoId: await this.conectorService.getId( s.transaction, 'salida_efectivo' ),
            salidaBienConsumoId: await this.conectorService.getId( s.transaction, 'salida_bien_consumo' )
        })
        .procesarInformacion();


        await this.executeCreateCollection( s, [ nts ] );
        return await this.getObjectById( s, nts );
    }


    async createAndIssue( s: SessionData, nts: NotaTransaccionSalida )
    {   
        const dateTimeEmision = Prop.toDateTime( nts.fechaEmision );
        if ( !dateTimeEmision.isValid ) throw new InternalServerErrorException( ERROR_DOCUMENT.DATETIME_ISSUE_INVALIDATE );

        nts.set({
            uuid: v4(),
            fechaAnulacion: undefined,
            codigoSerie: `NTS${dateTimeEmision.toFormat( 'yyyy' )}`,
        });

        await this.setCode( s, [ nts ] );

        const docsMovimiento = [
            ...nts.docsEntradaEfectivo,
            ...nts.docsEntradaBienConsumo,
            ...nts.docsSalidaEfectivo,
            ...nts.docsSalidaBienConsumo
        ];

        docsMovimiento.forEach( doc => {
            const dateTimeEmisionMovimiento = Prop.toDateTime( doc.fechaEmision );
            if ( !dateTimeEmisionMovimiento.isValid ) throw new InternalServerErrorException( ERROR_DOCUMENT.DATETIME_ISSUE_INVALIDATE );
            doc.set({
                codigoSerie: `MOV${dateTimeEmisionMovimiento.toFormat( 'yyyy' )}`
            })
        } );

        await this.documentoMovimientoService.setCode( s, docsMovimiento );


        nts.setRelation({
            documentoFuenteId: await this.getId( s ),
            notaId: await this.conectorService.getId( s.transaction, 'nota' ),
            notaTransaccionSalidaDetalleId: await this.conectorService.getId( s.transaction, 'nts_detalle' ),
            notaTransaccionSalidaCuotaId: await this.conectorService.getId( s.transaction, 'nts_cuota' ),
            entradaEfectivoId: await this.conectorService.getId( s.transaction, 'entrada_efectivo' ),
            entradaBienConsumoId: await this.conectorService.getId( s.transaction, 'entrada_bien_consumo' ),
            salidaEfectivoId: await this.conectorService.getId( s.transaction, 'salida_efectivo' ),
            salidaBienConsumoId: await this.conectorService.getId( s.transaction, 'salida_bien_consumo' )
        })
        .procesarInformacion();


        await this.executeCreateCollection( s, [ nts ] );
        return await this.getObjectById( s, nts );
    }


    async update( s: SessionData, nts: NotaTransaccionSalida )
    {
        const item2validate = await this.getObjectById( s, nts );
        if ( item2validate.fechaAnulacion ) throw new InternalServerErrorException( ERROR_DOCUMENT.CANT_UPDATE_FROM_VOID );
        if ( item2validate.fechaEmision ) throw new InternalServerErrorException( ERROR_DOCUMENT.CANT_UPDATE_FROM_ISSUED );

        const af1 = await this.executeDeleteCollection( s, [ item2validate ] );
        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_UPDATE );


        nts.set({
            id: item2validate.id,
            uuid: item2validate.uuid,
            codigoSerie: undefined,
            codigoNumero: undefined,
            fechaCreacion: item2validate.fechaCreacion,
            fechaEmision: undefined,
            fechaAnulacion: undefined,
            docsEntradaEfectivo: [],
            docsEntradaBienConsumo: [],
            docsSalidaEfectivo: [],
            docsSalidaBienConsumo: []
        })
        .setRelation({
            documentoFuenteId: await this.getId( s ),
            notaId: await this.conectorService.getId( s.transaction, 'nota' ),
            notaTransaccionSalidaDetalleId: await this.conectorService.getId( s.transaction, 'nts_detalle' ),
            notaTransaccionSalidaCuotaId: await this.conectorService.getId( s.transaction, 'nts_cuota' ),
            entradaEfectivoId: await this.conectorService.getId( s.transaction, 'entrada_efectivo' ),
            entradaBienConsumoId: await this.conectorService.getId( s.transaction, 'entrada_bien_consumo' ),
            salidaEfectivoId: await this.conectorService.getId( s.transaction, 'salida_efectivo' ),
            salidaBienConsumoId: await this.conectorService.getId( s.transaction, 'salida_bien_consumo' )
        })
        .procesarInformacion();


        await this.executeCreateCollection( s, [ nts ] );
        return await this.getObjectById( s, nts );
    }


    async updateAndIssue( s: SessionData, nts: NotaTransaccionSalida )
    {
        const dateTimeEmision = Prop.toDateTime( nts.fechaEmision );
        if ( !dateTimeEmision.isValid ) throw new InternalServerErrorException( ERROR_DOCUMENT.DATETIME_ISSUE_INVALIDATE );
                
        const item2validate = await this.getObjectById( s, nts );
        if ( item2validate.fechaAnulacion ) throw new InternalServerErrorException( ERROR_DOCUMENT.CANT_UPDATE_FROM_VOID );
        if ( item2validate.fechaEmision ) throw new InternalServerErrorException( ERROR_DOCUMENT.CANT_UPDATE_FROM_ISSUED );

        const af1 = await this.executeDeleteCollection( s, [ item2validate ] );
        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_UPDATE );


        nts.set({
            id: item2validate.id,
            uuid: item2validate.uuid,
            codigoSerie: `NTE${dateTimeEmision.toFormat( 'yyyy' )}`,
            fechaCreacion: item2validate.fechaCreacion,
            fechaAnulacion: undefined
        });

        await this.setCode( s, [ nts ] );

        const docsMovimiento = [
            ...nts.docsEntradaEfectivo,
            ...nts.docsEntradaBienConsumo,
            ...nts.docsSalidaEfectivo,
            ...nts.docsSalidaBienConsumo
        ];

        docsMovimiento.forEach( doc => {
            const dateTimeEmisionMovimiento = Prop.toDateTime( doc.fechaEmision );
            if ( !dateTimeEmisionMovimiento.isValid ) throw new InternalServerErrorException( ERROR_DOCUMENT.DATETIME_ISSUE_INVALIDATE );
            doc.set({
                codigoSerie: `MOV${dateTimeEmisionMovimiento.toFormat( 'yyyy' )}`
            })
        } );
        
        await this.documentoMovimientoService.setCode( s, docsMovimiento );

        nts.setRelation({
            documentoFuenteId: await this.getId( s ),
            notaId: await this.conectorService.getId( s.transaction, 'nota' ),
            notaTransaccionSalidaDetalleId: await this.conectorService.getId( s.transaction, 'nts_detalle' ),
            notaTransaccionSalidaCuotaId: await this.conectorService.getId( s.transaction, 'nts_cuota' ),
            entradaEfectivoId: await this.conectorService.getId( s.transaction, 'entrada_efectivo' ),
            entradaBienConsumoId: await this.conectorService.getId( s.transaction, 'entrada_bien_consumo' ),
            salidaEfectivoId: await this.conectorService.getId( s.transaction, 'salida_efectivo' ),
            salidaBienConsumoId: await this.conectorService.getId( s.transaction, 'salida_bien_consumo' )
        })
        .procesarInformacion();
        
        
        await this.executeCreateCollection( s, [ nts ] );
        return await this.getObjectById( s, nts );
    }


    async updateVoid( s: SessionData, nts: NotaTransaccionSalida )
    {
        return await this.documentoTransaccionService.updateVoid( s, nts );
    }


    async delete( s: SessionData, nts: NotaTransaccionSalida )
    {
        const af1 = await this.executeDeleteCollection( s, [ nts ] );
        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_DELETE );
    }


    query = `
        select json_object(
            'type', 'NotaTransaccionSalida',
            'id', df.id,
            'uuid', df.uuid,
            'codigoSerie', df.cod_serie,
            'codigoNumero', df.cod_numero,
            'fechaEmision', df.f_emision,
            'fechaAnulacion', df.f_anulacion,
            'importeNeto', df.importe_neto,
            'establecimiento', json_object( 'uuid', df.establecimiento_uuid ),
            'usuario', json_object( 'uuid', df.usuario_uuid ),

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

            'fechaCreacion', documento_transaccion.f_creacion,
            'fechaActualizacion', documento_transaccion.f_actualizacion,
            'concepto', documento_transaccion.concepto,

            'docsEntradaEfectivo', (
                select json_arrayagg(json_object(
                    'type', 'DocumentoEntradaEfectivo',
                    'id', documento_fuente.id,
                    'uuid', documento_fuente.uuid,
                    'codigoSerie', documento_fuente.cod_serie,
                    'codigoNumero', documento_fuente.cod_numero,
                    'fechaEmision', documento_fuente.f_emision,
                    'fechaAnulacion', documento_fuente.f_anulacion,
                    'importeNeto', documento_fuente.importe_neto,
                    'establecimiento', json_object( 'uuid', documento_fuente.establecimiento_uuid ),
                    'usuario', json_object( 'uuid', documento_fuente.usuario_uuid ),
                    'concepto', documento_movimiento.concepto,
                    'documentoTransaccion', (
                        select json_object(
                            'id', df.id,
                            'uuid', df.uuid,
                            'codigoSerie', df.cod_serie,
                            'codigoNumero', df.cod_numero,
                            'fechaCreacion', documento_transaccion.f_creacion,
                            'fechaActualizacion', documento_transaccion.f_actualizacion,
                            'fechaEmision', df.f_emision,
                            'fechaAnulacion', df.f_anulacion,
                            'importeNeto', df.importe_neto,
                            'establecimiento', json_object( 'uuid', df.establecimiento_uuid ),
                            'usuario', json_object( 'uuid', df.usuario_uuid ),
                            'concepto', documento_transaccion.concepto
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
                                    'importeValorNeto', entrada_efectivo.valor,
                                    'tasaInteresDiario', entrada_efectivo_credito.tasa_interes_diario,
                                    'cuotas', (
                                        select json_arrayagg(json_object(
                                            'id', entrada_efectivo_cuota.id,
                                            'numero', entrada_efectivo_cuota.numero,
                                            'fechaInicio', entrada_efectivo_cuota.f_inicio,
                                            'fechaVencimiento', entrada_efectivo_cuota.f_vencimiento,
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
                    'fechaEmision', documento_fuente.f_emision,
                    'fechaAnulacion', documento_fuente.f_anulacion,
                    'importeNeto', documento_fuente.importe_neto,
                    'establecimiento', json_object( 'uuid', documento_fuente.establecimiento_uuid ),
                    'usuario', json_object( 'uuid', documento_fuente.usuario_uuid ),
                    'concepto', documento_movimiento.concepto,
                    'documentoTransaccion', (
                        select json_object(
                            'id', df.id,
                            'uuid', df.uuid,
                            'codigoSerie', df.cod_serie,
                            'codigoNumero', df.cod_numero,
                            'fechaCreacion', documento_transaccion.f_creacion,
                            'fechaActualizacion', documento_transaccion.f_actualizacion,
                            'fechaEmision', df.f_emision,
                            'fechaAnulacion', df.f_anulacion,
                            'importeNeto', df.importe_neto,
                            'establecimiento', json_object( 'uuid', df.establecimiento_uuid ),
                            'usuario', json_object( 'uuid', df.usuario_uuid ),
                            'concepto', documento_transaccion.concepto
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
                                    'almacen', json_object( 'uuid', entrada_bien_consumo.almacen_uuid ),
                                    'bienConsumo', json_object( 'uuid', entrada_bien_consumo.bien_consumo_uuid ),
                                    'cantidad', entrada_bien_consumo.cant,
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
                                    'almacen', json_object( 'uuid', entrada_bien_consumo.almacen_uuid ),
                                    'bienConsumo', json_object( 'uuid', entrada_bien_consumo.bien_consumo_uuid ),
                                    'cantidad', entrada_bien_consumo.cant,
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
                    'fechaEmision', documento_fuente.f_emision,
                    'fechaAnulacion', documento_fuente.f_anulacion,
                    'importeNeto', documento_fuente.importe_neto,
                    'establecimiento', json_object( 'uuid', documento_fuente.establecimiento_uuid ),
                    'usuario', json_object( 'uuid', documento_fuente.usuario_uuid ),
                    'concepto', documento_movimiento.concepto,
                    'documentoTransaccion', (
                        select json_object(
                            'id', df.id,
                            'uuid', df.uuid,
                            'codigoSerie', df.cod_serie,
                            'codigoNumero', df.cod_numero,
                            'fechaCreacion', documento_transaccion.f_creacion,
                            'fechaActualizacion', documento_transaccion.f_actualizacion,
                            'fechaEmision', df.f_emision,
                            'fechaAnulacion', df.f_anulacion,
                            'importeNeto', df.importe_neto,
                            'establecimiento', json_object( 'uuid', df.establecimiento_uuid ),
                            'usuario', json_object( 'uuid', df.usuario_uuid ),
                            'concepto', documento_transaccion.concepto
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
                                    'importeValorNeto', salida_efectivo.valor,
                                    'tasaInteresDiario', salida_efectivo_credito.tasa_interes_diario,
                                    'cuotas', (
                                        select json_arrayagg(json_object(
                                            'id', salida_efectivo_cuota.id,
                                            'numero', salida_efectivo_cuota.numero,
                                            'fechaInicio', salida_efectivo_cuota.f_inicio,
                                            'fechaVencimiento', salida_efectivo_cuota.f_vencimiento,
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
                    'fechaEmision', documento_fuente.f_emision,
                    'fechaAnulacion', documento_fuente.f_anulacion,
                    'importeNeto', documento_fuente.importe_neto,
                    'establecimiento', json_object( 'uuid', documento_fuente.establecimiento_uuid ),
                    'usuario', json_object( 'uuid', documento_fuente.usuario_uuid ),
                    'concepto', documento_movimiento.concepto,
                    'documentoTransaccion', (
                        select json_object(
                            'id', df.id,
                            'uuid', df.uuid,
                            'codigoSerie', df.cod_serie,
                            'codigoNumero', df.cod_numero,
                            'fechaCreacion', documento_transaccion.f_creacion,
                            'fechaActualizacion', documento_transaccion.f_actualizacion,
                            'fechaEmision', df.f_emision,
                            'fechaAnulacion', df.f_anulacion,
                            'importeNeto', df.importe_neto,
                            'establecimiento', json_object( 'uuid', df.establecimiento_uuid ),
                            'usuario', json_object( 'uuid', df.usuario_uuid ),
                            'concepto', documento_transaccion.concepto
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
                                    'almacen', json_object( 'uuid', salida_bien_consumo.almacen_uuid ),
                                    'bienConsumo', json_object( 'uuid', salida_bien_consumo.bien_consumo_uuid ),
                                    'cantidad', salida_bien_consumo.cant,
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
                                    'almacen', json_object( 'uuid', salida_bien_consumo.almacen_uuid ),
                                    'bienConsumo', json_object( 'uuid', salida_bien_consumo.bien_consumo_uuid ),
                                    'cantidad', salida_bien_consumo.cant,
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

            'fechaCreacion', documento_transaccion.f_creacion,
            'fechaActualizacion', documento_transaccion.f_actualizacion,
            'concepto', documento_transaccion.concepto,

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
                    'importeValorNeto', salida_efectivo.valor,
                    'tasaInteresDiario', nts_credito.tasa_interes_diario,
                    'cuotas', (
                        select json_arrayagg(json_object(
                            'id', nts_cuota.id,
                            'numero', nts_cuota.numero,
                            'fechaInicio', nts_cuota.f_inicio,
                            'fechaVencimiento', nts_cuota.f_vencimiento,
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
        left join documento_fuente df on df.id = documento_transaccion.id
    `;
}