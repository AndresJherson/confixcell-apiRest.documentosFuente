import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DocumentoTransaccionRepository } from '../documento-transaccion.service';
import { ModuleRef } from '@nestjs/core';
import { ERROR, ERROR_DOCUMENT } from 'src/utils/constants';
import { SessionData } from 'src/utils/interfaces';
import { NotaTransaccionEntrada, Prop, Proveedor, Usuario } from '@confixcell/modelos';
import { v4 } from 'uuid';
import { DocumentoMovimientoRepository } from '../../documentos-movimiento/documento-movimiento.service';
import { ConectorService } from 'src/infrastructure/services/conector.service';
import { EntradaEfectivoRepository } from 'src/infrastructure/repositories/movimientos-recurso/entrada/entrada-efectivo.service';
import { NotaTransaccionEntradaOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionEntrada/NotaTransaccionEntradaOrm';
import { NteDetalleOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionEntrada/NteDetalleOrm';

@Injectable()
export class NotaTransaccionEntradaRepository {

    private documentoTransaccionRepository!: DocumentoTransaccionRepository;
    private documentoMovimientoRepository!: DocumentoMovimientoRepository;


    constructor(
        private conectorService: ConectorService,
        private moduleRef: ModuleRef,
        private entradaEfectivoRepository: EntradaEfectivoRepository
    )
    {}


    onModuleInit() 
    {
        this.documentoTransaccionRepository = this.moduleRef.get( DocumentoTransaccionRepository, { strict: false } );
        this.documentoMovimientoRepository = this.moduleRef.get( DocumentoMovimientoRepository, { strict: false } );

        if ( !this.documentoTransaccionRepository ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
        if ( !this.documentoMovimientoRepository ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
    }


    async executeCreateCollection( s: SessionData, ntes: NotaTransaccionEntrada[] )
    {
        await this.documentoTransaccionRepository.executeCreateCollection( s, ntes );

        await NotaTransaccionEntradaOrm.bulkCreate( ntes.map( nte => ({
            id: nte.id,
            comprobanteTipoId: nte.comprobanteTipo?.id,
            comprobanteCodigoSerie: nte.comprobanteCodigoSerie,
            comprobanteCodigoNumero: nte.comprobanteCodigoNumero,
            proveedorUuid: nte.proveedor?.uuid,
            proveedorDocumentoIdentificacionUuid: nte.proveedorDocumentoIdentificacion?.uuid,
            proveedorCodigo: nte.proveedorCodigo,
            proveedorNombre: nte.proveedorNombre,
            proveedorCelular: nte.proveedorCelular,
            liquidacionTipoId: nte.liquidacion?.id,
            nteDetallesOrm: nte.detalles.map( detalle => new NteDetalleOrm({
                id: detalle.id,
                notaTransaccionEntradaId: detalle.notaTransaccionEntrada?.id,
                recursoUuid: detalle.recurso?.uuid,
                concepto: detalle.concepto,
                cantidad: detalle.cantidad,
                importeUnitario: detalle.importeUnitario,
                importeDescuento: detalle.importeDescuento,
                comentario: detalle.comentario
            }) )
        }) ), {
            transaction: s.transaction
        } );

        await this.entradaEfectivoRepository.executeCreateCollection( s, ntes.filter( nte => nte.liquidacion?.id === 2 )
            .map( nte => nte.credito )
            .filter( credito => credito !== undefined ) );
    }


    async executeDeleteCollection( s: SessionData, ntes: NotaTransaccionEntrada[] )
    {
        return await this.documentoTransaccionRepository.executeDeleteCollection( s, ntes );
    }


    async setCode( s: SessionData, ntes: NotaTransaccionEntrada[] )
    {
        return await this.documentoTransaccionRepository.setCode( s, ntes );
    }


    async getId( s: SessionData )
    {
        return await this.conectorService.getId( s.transaction, 'documento_fuente' );
    }


    async getCollection( s: SessionData )
    {
        return await this.conectorService.executeQuery({
            target: NotaTransaccionEntrada,
            transaction: s.transaction,
            query: this.query
        }).then( data => data.map( item => item.procesarInformacion() ) );
    }


    async getCollectionByUsuarioId( s: SessionData, usuario: Usuario )
    {
        return await this.conectorService.executeQuery({
            target: NotaTransaccionEntrada,
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


    async getCollectionByProveedorId( s: SessionData, proveedor: Proveedor )
    {
        return await this.conectorService.executeQuery({
            target: NotaTransaccionEntrada,
            transaction: s.transaction,
            query: `
                ${this.query}
                where nota_transaccion_entrada.proveedor_uuid ${proveedor?.uuid !== undefined ? ' = :proveedorUuid ' : ' is null ' }
            `,
            parameters: {
                proveedorUuid: proveedor?.uuid ?? null
            }
        }).then( data => data.map( item => item.procesarInformacion() ) );
    }


    async getObjectById( s: SessionData, nte: NotaTransaccionEntrada )
    {
        const data = await this.conectorService.executeQuery({
            target: NotaTransaccionEntrada,
            transaction: s.transaction,
            query: `
                ${this.query}
                and nota_transaccion_entrada.id ${nte.id === undefined ? ' is null ': ' = :id '}
            `,
            parameters: {
                id: nte.id ?? null
            }
        });

        if ( !data.length ) throw new InternalServerErrorException( ERROR.ID_INVALIDATE );

        return data[0].procesarInformacion();
    }


    async create( s: SessionData, nte: NotaTransaccionEntrada )
    {
        nte.set({
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
            notaTransaccionEntradaDetalleId: await this.conectorService.getId( s.transaction, 'nte_detalle' ),
            notaTransaccionEntradaCuotaId: await this.conectorService.getId( s.transaction, 'nte_cuota' ),
            entradaEfectivoId: await this.conectorService.getId( s.transaction, 'entrada_efectivo' ),
            entradaBienConsumoId: await this.conectorService.getId( s.transaction, 'entrada_bien_consumo' ),
            salidaEfectivoId: await this.conectorService.getId( s.transaction, 'salida_efectivo' ),
            salidaBienConsumoId: await this.conectorService.getId( s.transaction, 'salida_bien_consumo' )
        })
        .procesarInformacion();


        await this.executeCreateCollection( s, [ nte ] );
        return await this.getObjectById( s, nte );
    }


    async createAndIssue( s: SessionData, nte: NotaTransaccionEntrada )
    {   
        const dateTimeEmision = Prop.toDateTime( nte.fechaEmision );
        if ( !dateTimeEmision.isValid ) throw new InternalServerErrorException( ERROR_DOCUMENT.DATETIME_ISSUE_INVALIDATE );

        nte.set({
            uuid: v4(),
            fechaAnulacion: undefined,
            codigoSerie: `NTE${dateTimeEmision.toFormat( 'yyyy' )}`,
            docsEntradaEfectivo: nte.docsEntradaEfectivo.map( doc => doc.set({
                uuid: v4(),
                entradas: doc.entradas.map( ent => ent.set({
                    uuid: v4()
                }) )
            }) ),
            docsEntradaBienConsumo: nte.docsEntradaBienConsumo.map( doc => doc.set({
                uuid: v4(),
                entradas: doc.entradas.map( ent => ent.set({
                    uuid: v4()
                }) )
            }) ),
            docsSalidaEfectivo: nte.docsSalidaEfectivo.map( doc => doc.set({
                uuid: v4(),
                salidas: doc.salidas.map( sal => sal.set({
                    uuid: v4()
                }) )
            }) ),
            docsSalidaBienConsumo: nte.docsSalidaBienConsumo.map( doc => doc.set({
                uuid: v4(),
                salidas: doc.salidas.map( sal => sal.set({
                    uuid: v4()
                }) )
            }) )
        });

        await this.setCode( s, [ nte ] );


        const docsMovimiento = [
            ...nte.docsEntradaEfectivo,
            ...nte.docsEntradaBienConsumo,
            ...nte.docsSalidaEfectivo,
            ...nte.docsSalidaBienConsumo
        ];

        docsMovimiento.forEach( doc => {
            const dateTimeEmisionMovimiento = Prop.toDateTime( doc.fechaEmision );
            if ( !dateTimeEmisionMovimiento.isValid ) throw new InternalServerErrorException( ERROR_DOCUMENT.DATETIME_ISSUE_INVALIDATE );
            doc.set({
                codigoSerie: `MOV${dateTimeEmisionMovimiento.toFormat( 'yyyy' )}`
            })
        } );

        await this.documentoMovimientoRepository.setCode( s, docsMovimiento );


        nte.setRelation({
            documentoFuenteId: await this.getId( s ),
            notaId: await this.conectorService.getId( s.transaction, 'nota' ),
            notaTransaccionEntradaDetalleId: await this.conectorService.getId( s.transaction, 'nte_detalle' ),
            notaTransaccionEntradaCuotaId: await this.conectorService.getId( s.transaction, 'cte_cuota' ),
            entradaEfectivoId: await this.conectorService.getId( s.transaction, 'entrada_efectivo' ),
            entradaBienConsumoId: await this.conectorService.getId( s.transaction, 'entrada_bien_consumo' ),
            salidaEfectivoId: await this.conectorService.getId( s.transaction, 'salida_efectivo' ),
            salidaBienConsumoId: await this.conectorService.getId( s.transaction, 'salida_bien_consumo' )
        })
        .procesarInformacion();


        await this.executeCreateCollection( s, [ nte ] );
        return await this.getObjectById( s, nte );
    }


    async update( s: SessionData, nte: NotaTransaccionEntrada )
    {
        const item2validate = await this.getObjectById( s, nte );
        if ( item2validate.fechaAnulacion ) throw new InternalServerErrorException( ERROR_DOCUMENT.CANT_UPDATE_FROM_VOID );
        if ( item2validate.fechaEmision ) throw new InternalServerErrorException( ERROR_DOCUMENT.CANT_UPDATE_FROM_ISSUED );

        const af1 = await this.executeDeleteCollection( s, [ item2validate ] );
        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_UPDATE );


        nte.set({
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
            documentoFuenteId: item2validate.id!,
            notaId: await this.conectorService.getId( s.transaction, 'nota' ),
            notaTransaccionEntradaDetalleId: await this.conectorService.getId( s.transaction, 'nte_detalle' ),
            notaTransaccionEntradaCuotaId: await this.conectorService.getId( s.transaction, 'cte_cuota' ),
            entradaEfectivoId: await this.conectorService.getId( s.transaction, 'entrada_efectivo' ),
            entradaBienConsumoId: await this.conectorService.getId( s.transaction, 'entrada_bien_consumo' ),
            salidaEfectivoId: await this.conectorService.getId( s.transaction, 'salida_efectivo' ),
            salidaBienConsumoId: await this.conectorService.getId( s.transaction, 'salida_bien_consumo' )
        })
        .procesarInformacion();


        await this.executeCreateCollection( s, [ nte ] );
        return await this.getObjectById( s, nte );
    }


    async updateAndIssue( s: SessionData, nte: NotaTransaccionEntrada )
    {
        const dateTimeEmision = Prop.toDateTime( nte.fechaEmision );
        if ( !dateTimeEmision.isValid ) throw new InternalServerErrorException( ERROR_DOCUMENT.DATETIME_ISSUE_INVALIDATE );
                
        const item2validate = await this.getObjectById( s, nte );
        if ( item2validate.fechaAnulacion ) throw new InternalServerErrorException( ERROR_DOCUMENT.CANT_UPDATE_FROM_VOID );
        if ( item2validate.fechaEmision ) throw new InternalServerErrorException( ERROR_DOCUMENT.CANT_UPDATE_FROM_ISSUED );

        const af1 = await this.executeDeleteCollection( s, [ item2validate ] );
        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_UPDATE );


        nte.set({
            id: item2validate.id,
            uuid: item2validate.uuid,
            codigoSerie: `NTE${dateTimeEmision.toFormat( 'yyyy' )}`,
            fechaCreacion: item2validate.fechaCreacion,
            fechaAnulacion: undefined,
            docsEntradaEfectivo: nte.docsEntradaEfectivo.map( doc => doc.set({
                uuid: v4(),
                entradas: doc.entradas.map( ent => ent.set({
                    uuid: v4()
                }) )
            }) ),
            docsEntradaBienConsumo: nte.docsEntradaBienConsumo.map( doc => doc.set({
                uuid: v4(),
                entradas: doc.entradas.map( ent => ent.set({
                    uuid: v4()
                }) )
            }) ),
            docsSalidaEfectivo: nte.docsSalidaEfectivo.map( doc => doc.set({
                uuid: v4(),
                salidas: doc.salidas.map( sal => sal.set({
                    uuid: v4()
                }) )
            }) ),
            docsSalidaBienConsumo: nte.docsSalidaBienConsumo.map( doc => doc.set({
                uuid: v4(),
                salidas: doc.salidas.map( sal => sal.set({
                    uuid: v4()
                }) )
            }) )
        });

        await this.setCode( s, [ nte ] );


        const docsMovimiento = [
            ...nte.docsEntradaEfectivo,
            ...nte.docsEntradaBienConsumo,
            ...nte.docsSalidaEfectivo,
            ...nte.docsSalidaBienConsumo
        ];

        docsMovimiento.forEach( doc => {
            const dateTimeEmisionMovimiento = Prop.toDateTime( doc.fechaEmision );
            if ( !dateTimeEmisionMovimiento.isValid ) throw new InternalServerErrorException( ERROR_DOCUMENT.DATETIME_ISSUE_INVALIDATE );
            doc.set({
                codigoSerie: `MOV${dateTimeEmisionMovimiento.toFormat( 'yyyy' )}`
            })
        } );
        
        await this.documentoMovimientoRepository.setCode( s, docsMovimiento );

        
        nte.setRelation({
            documentoFuenteId: await this.getId( s ),
            notaId: await this.conectorService.getId( s.transaction, 'nota' ),
            notaTransaccionEntradaDetalleId: await this.conectorService.getId( s.transaction, 'nte_detalle' ),
            notaTransaccionEntradaCuotaId: await this.conectorService.getId( s.transaction, 'cte_cuota' ),
            entradaEfectivoId: await this.conectorService.getId( s.transaction, 'entrada_efectivo' ),
            entradaBienConsumoId: await this.conectorService.getId( s.transaction, 'entrada_bien_consumo' ),
            salidaEfectivoId: await this.conectorService.getId( s.transaction, 'salida_efectivo' ),
            salidaBienConsumoId: await this.conectorService.getId( s.transaction, 'salida_bien_consumo' )
        })
        .procesarInformacion();
        
        
        await this.executeCreateCollection( s, [ nte ] );
        return await this.getObjectById( s, nte );
    }


    async updateVoid( s: SessionData, nte: NotaTransaccionEntrada )
    {
        return await this.documentoTransaccionRepository.updateVoid( s, nte );
    }


    async delete( s: SessionData, nte: NotaTransaccionEntrada )
    {
        const item2validate = await this.getObjectById( s, nte );
        if ( item2validate.fechaAnulacion ) throw new InternalServerErrorException( ERROR_DOCUMENT.CANT_DELETE_FROM_VOID );
        if ( item2validate.fechaEmision ) throw new InternalServerErrorException( ERROR_DOCUMENT.CANT_DELETE_FROM_ISSUED );

        const af1 = await this.executeDeleteCollection( s, [ nte ] );
        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_DELETE );
    }


    query = `
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
left join documento_fuente df on df.id = documento_transaccion.id
    `;
}