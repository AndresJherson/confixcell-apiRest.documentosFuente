import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DocumentoTransaccionService } from '../documento-transaccion.service';
import { ModuleRef } from '@nestjs/core';
import { ERROR, ERROR_DOCUMENT } from 'src/utils/constants';
import { SessionData } from 'src/utils/interfaces';
import { Almacen, Cliente, DbPreset, NotaVenta, Prop, Usuario } from '@confixcell/modelos';
import { v4 } from 'uuid';
import { DocumentoMovimientoService } from '../../documentos-movimiento/documento-movimiento.service';
import { ConectorService } from 'src/infrastructure/services/conector.service';
import { NotaVentaOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/NotaVentaOrm';
import { DocumentoFuenteService } from '../../documento-fuente.service';
import { EntradaEfectivoService } from 'src/domain/application/movimientos-recurso/entrada/entrada-efectivo.service';
import { SalidaBienConsumoService } from 'src/domain/application/movimientos-recurso/salida/salida-bien-consumo.service';
import { SalidaProduccionService } from 'src/domain/application/movimientos-recurso/salida/salida-produccion.service';
import { DbPresetService } from 'src/domain/application/preset/db-preset.service';
import { DocumentoFuenteOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentoFuenteOrm';
import { MovimientoRecursoService } from 'src/domain/application/movimientos-recurso/movimiento-recurso.service';

@Injectable()
export class NotaVentaService {

    private documentoFuenteService!: DocumentoFuenteService;
    private documentoTransaccionService!: DocumentoTransaccionService;
    private documentoMovimientoService!: DocumentoMovimientoService;

    private entradaEfectivoService!: EntradaEfectivoService;
    private salidaBienConsumoService!: SalidaBienConsumoService;
    private salidaProduccionService!: SalidaProduccionService;
    private dbPresetService!: DbPresetService;
    private movimientoRecursoService!: MovimientoRecursoService;


    constructor(
        private conectorService: ConectorService,
        private moduleRef: ModuleRef,
    )
    {}


    onModuleInit() 
    {
        this.documentoFuenteService = this.moduleRef.get( DocumentoFuenteService, { strict: false } );
        this.documentoTransaccionService = this.moduleRef.get( DocumentoTransaccionService, { strict: false } );
        this.documentoMovimientoService = this.moduleRef.get( DocumentoMovimientoService, { strict: false } );

        this.entradaEfectivoService = this.moduleRef.get( DocumentoMovimientoService, { strict: false } );
        this.salidaBienConsumoService = this.moduleRef.get( DocumentoMovimientoService, { strict: false } );
        this.salidaProduccionService = this.moduleRef.get( DocumentoMovimientoService, { strict: false } );
        this.dbPresetService = this.moduleRef.get( DocumentoMovimientoService, { strict: false } );
        this.movimientoRecursoService = this.moduleRef.get( MovimientoRecursoService, { strict: false } );

        if ( !this.documentoFuenteService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
        if ( !this.documentoTransaccionService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
        if ( !this.documentoMovimientoService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );

        if ( !this.entradaEfectivoService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
        if ( !this.salidaBienConsumoService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
        if ( !this.salidaProduccionService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
        if ( !this.dbPresetService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
        if ( !this.movimientoRecursoService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
    }


    async executeCreateCollection( s: SessionData, notasVenta: NotaVenta[] )
    {
        await this.documentoTransaccionService.executeCreateCollection( s, notasVenta );

        await NotaVentaOrm.bulkCreate( notasVenta.map( item => ({
            id: item.id,
            fechaCompromiso: item.fechaCompromiso,
            clienteUuid: item.cliente?.uuid,
            nvPrioridadId: item.prioridad?.id,
            usuarioTecnicoUuid: item.usuarioTecnico?.uuid,
            nvEstadoId: item.estado?.id
        }) ), {
            transaction: s.transaction
        } );

        await this.entradaEfectivoService.executeCreateCollection( s, notasVenta.flatMap( item => item.entradasEfectivo ) );
        await this.salidaBienConsumoService.executeCreateCollection( s, notasVenta.flatMap( item => item.salidasBienConsumo ) );
        await this.salidaProduccionService.executeCreateCollection( s, notasVenta.flatMap( item => item.salidasProduccionServicioReparacion ) );
    }


    async getCollection( s: SessionData )
    {
        return await this.conectorService.executeQuery({
            target: NotaVenta,
            transaction: s.transaction,
            query: this.query
        }).then( data => data.map( item => item.procesarInformacion() ) );
    }


    async getCollectionByUsuarioUuid( s: SessionData, usuario: Usuario )
    {
        return await this.conectorService.executeQuery({
            target: NotaVenta,
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


    async getCollectionByClienteUuid( s: SessionData, cliente: Cliente )
    {
        return await this.conectorService.executeQuery({
            target: NotaVenta,
            transaction: s.transaction,
            query: `
                ${this.query}
                where nota_venta.cliente_uuid ${cliente?.uuid !== undefined ? ' = :clienteUuid ' : ' is null ' }
            `,
            parameters: {
                clienteUuid: cliente?.uuid ?? null
            }
        }).then( data => data.map( item => item.procesarInformacion() ) );
    }


    async getObjectByUuid( s: SessionData, item: NotaVenta )
    {
        const data = await this.conectorService.executeQuery({
            target: NotaVenta,
            transaction: s.transaction,
            query: `
                ${this.query}
                and df.uuid ${item.uuid === undefined ? ' is null ': ' = :uuid '}
            `,
            parameters: {
                uuid: item.uuid ?? null
            }
        });

        if ( !data.length ) throw new InternalServerErrorException( ERROR.UUID_INVALIDATE );

        return data[0].procesarInformacion();
    }


    async create( s: SessionData, item: NotaVenta )
    {
        const almacenProductos = await this.dbPresetService.getObjectByTarget( s, new DbPreset({ target: 'nv_salida_bien_consumo.almacen_uuid' }) );
        if ( almacenProductos.valor === undefined ) throw new InternalServerErrorException( `${almacenProductos.titulo} NO ESTABLECIDO` );

        const almacenProductosServicioReparacion = await this.dbPresetService.getObjectByTarget( s, new DbPreset({ target: 'nv_servicio_reparacion_recurso_bien_consumo.almacen_uuid' }) );
        if ( almacenProductosServicioReparacion.valor === undefined ) throw new InternalServerErrorException( `${almacenProductosServicioReparacion.titulo} NO ESTABLECIDO` );

        item.set({
            uuid: v4(),
            codigoSerie: undefined,
            codigoNumero: undefined,
            fechaEmision: undefined,
            fechaAnulacion: undefined,
            docsEntradaEfectivo: [],
            docsEntradaBienConsumo: [],
            docsSalidaEfectivo: [],
            docsSalidaBienConsumo: [],
            salidasBienConsumo: item.salidasBienConsumo.map( sal => sal.set({
                uuid: v4(),
                almacen: new Almacen({
                    uuid: almacenProductos.valor
                })
            }) ),
            salidasProduccionServicioReparacion: item.salidasProduccionServicioReparacion.map( sal => sal.set({
                uuid: v4(),
                recursosBienConsumo: sal.recursosBienConsumo.map( recurso => recurso.set({
                    uuid: v4(),
                    almacen: new Almacen({
                        uuid: almacenProductosServicioReparacion.valor
                    })
                }) )
            }) )
        })
        .setRelation()
        .procesarInformacion();


        await this.executeCreateCollection( s, [ item ] );
        return await this.getObjectByUuid( s, item );
    }


    async createAndIssue( s: SessionData, item: NotaVenta )
    {
        const dateTimeEmision = Prop.toDateTime( item.fechaEmision );
        if ( !dateTimeEmision.isValid ) throw new InternalServerErrorException( ERROR_DOCUMENT.DATETIME_ISSUE_INVALIDATE );

        const almacenProductos = await this.dbPresetService.getObjectByTarget( s, new DbPreset({ target: 'nv_salida_bien_consumo.almacen_uuid' }) );
        if ( almacenProductos.valor === undefined ) throw new InternalServerErrorException( `${almacenProductos.titulo} NO ESTABLECIDO` );

        const almacenProductosServicioReparacion = await this.dbPresetService.getObjectByTarget( s, new DbPreset({ target: 'nv_servicio_reparacion_recurso_bien_consumo.almacen_uuid' }) );
        if ( almacenProductosServicioReparacion.valor === undefined ) throw new InternalServerErrorException( `${almacenProductosServicioReparacion.titulo} NO ESTABLECIDO` );

        item.set({
            uuid: v4(),
            fechaAnulacion: undefined,
            codigoSerie: `NV${dateTimeEmision.toFormat( 'yyyy' )}`,
            salidasBienConsumo: item.salidasBienConsumo.map( sal => sal.set({
                uuid: v4(),
                almacen: new Almacen({
                    uuid: almacenProductos.valor
                })
            }) ),
            salidasProduccionServicioReparacion: item.salidasProduccionServicioReparacion.map( sal => sal.set({
                uuid: v4(),
                recursosBienConsumo: sal.recursosBienConsumo.map( recurso => recurso.set({
                    uuid: v4(),
                    almacen: new Almacen({
                        uuid: almacenProductosServicioReparacion.valor
                    }),
                }) ),
                recursosServicio: sal.recursosServicio.map( recurso => recurso.set({
                    uuid: v4()
                }) )
            }) ),
            entradasEfectivo: item.entradasEfectivo.map( ent => ent.set({
                uuid: v4()
            }) ),
            docsEntradaEfectivo: item.docsEntradaEfectivo.map( doc => doc.set({
                uuid: v4(),
                entradas: doc.entradas.map( ent => ent.set({
                    uuid: v4()
                }) )
            }) ),
            docsEntradaBienConsumo: item.docsEntradaBienConsumo.map( doc => doc.set({
                uuid: v4(),
                entradas: doc.entradas.map( ent => ent.set({
                    uuid: v4()
                }) )
            }) ),
            docsSalidaEfectivo: item.docsSalidaEfectivo.map( doc => doc.set({
                uuid: v4(),
                salidas: doc.salidas.map( sal => sal.set({
                    uuid: v4()
                }) )
            }) ),
            docsSalidaBienConsumo: item.docsSalidaBienConsumo.map( doc => doc.set({
                uuid: v4(),
                salidas: doc.salidas.map( sal => sal.set({
                    uuid: v4()
                }) )
            }) )
        })
    
        item.documentosMovimientos.forEach( doc => {
            const dateTimeEmisionMovimiento = Prop.toDateTime( doc.fechaEmision );
            if ( !dateTimeEmisionMovimiento.isValid ) throw new InternalServerErrorException( ERROR_DOCUMENT.DATETIME_ISSUE_INVALIDATE );
            doc.set({
                codigoSerie: `MOV${dateTimeEmisionMovimiento.toFormat( 'yyyy' )}`
            })
        } );


        const codigos = await this.documentoFuenteService.getRecordCodigos({
            transaction: s.transaction,
            series: [ item.codigoSerie!, ...item.documentosMovimientos.map( doc => doc.codigoSerie! ) ]
        });

        item.set({
            codigoNumero: codigos[item.codigoSerie!],
            docsEntradaEfectivo: item.docsEntradaEfectivo.map( doc => {
                doc.set({
                    codigoNumero: codigos[doc.codigoSerie!]
                })
                codigos[doc.codigoSerie!]++;

                return doc;
            } ),
            docsEntradaBienConsumo: item.docsEntradaBienConsumo.map( doc => {
                doc.set({
                    codigoNumero: codigos[doc.codigoSerie!]
                })
                codigos[doc.codigoSerie!]++;

                return doc;
            } ),
            docsSalidaEfectivo: item.docsSalidaEfectivo.map( doc => {
                doc.set({
                    codigoNumero: codigos[doc.codigoSerie!]
                })
                codigos[doc.codigoSerie!]++;

                return doc;
            } ),
            docsSalidaBienConsumo: item.docsSalidaBienConsumo.map( doc => {
                doc.set({
                    codigoNumero: codigos[doc.codigoSerie!]
                })
                codigos[doc.codigoSerie!]++;

                return doc;
            } )
        })
        codigos[item.codigoSerie!]++;


        item.setRelation()
        .procesarInformacion();


        await this.executeCreateCollection( s, [ item ] );
        return await this.getObjectByUuid( s, item );
    }


    async update( s: SessionData, item: NotaVenta )
    {
        const item2validate = await this.getObjectByUuid( s, item );
        if ( item2validate.fechaAnulacion ) throw new InternalServerErrorException( ERROR_DOCUMENT.CANT_UPDATE_FROM_VOID );
        if ( item2validate.fechaEmision ) throw new InternalServerErrorException( ERROR_DOCUMENT.CANT_UPDATE_FROM_ISSUED );

        const af1 = await DocumentoFuenteOrm.destroy({
            transaction: s.transaction,
            where: {
                uuid: item.uuid
            }
        });
        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_UPDATE );


        const almacenProductos = await this.dbPresetService.getObjectByTarget( s, new DbPreset({ target: 'nv_salida_bien_consumo.almacen_uuid' }) );
        if ( almacenProductos.valor === undefined ) throw new InternalServerErrorException( `${almacenProductos.titulo} NO ESTABLECIDO` );

        const almacenProductosServicioReparacion = await this.dbPresetService.getObjectByTarget( s, new DbPreset({ target: 'nv_servicio_reparacion_recurso_bien_consumo.almacen_uuid' }) );
        if ( almacenProductosServicioReparacion.valor === undefined ) throw new InternalServerErrorException( `${almacenProductosServicioReparacion.titulo} NO ESTABLECIDO` );

        item.set({
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
            docsSalidaBienConsumo: [],
            salidasBienConsumo: item.salidasBienConsumo.map( sal => sal.set({
                uuid: v4(),
                almacen: new Almacen({
                    uuid: almacenProductos.valor
                })
            }) ),
            salidasProduccionServicioReparacion: item.salidasProduccionServicioReparacion.map( sal => sal.set({
                uuid: v4(),
                recursosBienConsumo: sal.recursosBienConsumo.map( recurso => recurso.set({
                    uuid: v4(),
                    almacen: new Almacen({
                        uuid: almacenProductosServicioReparacion.valor
                    })
                }) )
            }) )
        })
        .setRelation()
        .procesarInformacion();

        
        await this.executeCreateCollection( s, [ item ] );
        return await this.getObjectByUuid( s, item );
    }


    async updateAndIssue( s: SessionData, item: NotaVenta )
    {
        const dateTimeEmision = Prop.toDateTime( item.fechaEmision );
        if ( !dateTimeEmision.isValid ) throw new InternalServerErrorException( ERROR_DOCUMENT.DATETIME_ISSUE_INVALIDATE );

        const item2validate = await this.getObjectByUuid( s, item );
        if ( item2validate.fechaAnulacion ) throw new InternalServerErrorException( ERROR_DOCUMENT.CANT_UPDATE_FROM_VOID );
        if ( item2validate.fechaEmision ) throw new InternalServerErrorException( ERROR_DOCUMENT.CANT_UPDATE_FROM_ISSUED );

        const af1 = await DocumentoFuenteOrm.destroy({
            transaction: s.transaction,
            where: {
                uuid: item.uuid
            }
        });
        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_UPDATE );


        const almacenProductos = await this.dbPresetService.getObjectByTarget( s, new DbPreset({ target: 'nv_salida_bien_consumo.almacen_uuid' }) );
        if ( almacenProductos.valor === undefined ) throw new InternalServerErrorException( `${almacenProductos.titulo} NO ESTABLECIDO` );

        const almacenProductosServicioReparacion = await this.dbPresetService.getObjectByTarget( s, new DbPreset({ target: 'nv_servicio_reparacion_recurso_bien_consumo.almacen_uuid' }) );
        if ( almacenProductosServicioReparacion.valor === undefined ) throw new InternalServerErrorException( `${almacenProductosServicioReparacion.titulo} NO ESTABLECIDO` );

        item.set({
            id: item2validate.id,
            uuid: item2validate.uuid,
            codigoSerie: `NV${dateTimeEmision.toFormat( 'yyyy' )}`,
            fechaCreacion: item2validate.fechaCreacion,
            fechaAnulacion: undefined,
            salidasBienConsumo: item.salidasBienConsumo.map( sal => sal.set({
                uuid: v4(),
                almacen: new Almacen({
                    uuid: almacenProductos.valor
                })
            }) ),
            salidasProduccionServicioReparacion: item.salidasProduccionServicioReparacion.map( sal => sal.set({
                uuid: v4(),
                recursosBienConsumo: sal.recursosBienConsumo.map( recurso => recurso.set({
                    uuid: v4(),
                    almacen: new Almacen({
                        uuid: almacenProductosServicioReparacion.valor
                    })
                }) ),
                recursosServicio: sal.recursosServicio.map( recurso => recurso.set({
                    uuid: v4()
                }) )
            }) ),
            entradasEfectivo: item.entradasEfectivo.map( ent => ent.set({
                uuid: v4()
            }) ),
            docsEntradaEfectivo: item.docsEntradaEfectivo.map( doc => doc.set({
                uuid: v4(),
                entradas: doc.entradas.map( ent => ent.set({
                    uuid: v4()
                }) )
            }) ),
            docsEntradaBienConsumo: item.docsEntradaBienConsumo.map( doc => doc.set({
                uuid: v4(),
                entradas: doc.entradas.map( ent => ent.set({
                    uuid: v4()
                }) )
            }) ),
            docsSalidaEfectivo: item.docsSalidaEfectivo.map( doc => doc.set({
                uuid: v4(),
                salidas: doc.salidas.map( sal => sal.set({
                    uuid: v4()
                }) )
            }) ),
            docsSalidaBienConsumo: item.docsSalidaBienConsumo.map( doc => doc.set({
                uuid: v4(),
                salidas: doc.salidas.map( sal => sal.set({
                    uuid: v4()
                }) )
            }) )
        })

        item.documentosMovimientos.forEach( doc => {
            const dateTimeEmisionMovimiento = Prop.toDateTime( doc.fechaEmision );
            if ( !dateTimeEmisionMovimiento.isValid ) throw new InternalServerErrorException( ERROR_DOCUMENT.DATETIME_ISSUE_INVALIDATE );
            doc.set({
                codigoSerie: `MOV${dateTimeEmisionMovimiento.toFormat( 'yyyy' )}`
            })
        } );


        const codigos = await this.documentoFuenteService.getRecordCodigos({
            transaction: s.transaction,
            series: [ item.codigoSerie!, ...item.documentosMovimientos.map( doc => doc.codigoSerie! ) ]
        });

        item.set({
            codigoNumero: codigos[item.codigoSerie!],
            docsEntradaEfectivo: item.docsEntradaEfectivo.map( doc => {
                doc.set({
                    codigoNumero: codigos[doc.codigoSerie!]
                })
                codigos[doc.codigoSerie!]++;

                return doc;
            } ),
            docsEntradaBienConsumo: item.docsEntradaBienConsumo.map( doc => {
                doc.set({
                    codigoNumero: codigos[doc.codigoSerie!]
                })
                codigos[doc.codigoSerie!]++;

                return doc;
            } ),
            docsSalidaEfectivo: item.docsSalidaEfectivo.map( doc => {
                doc.set({
                    codigoNumero: codigos[doc.codigoSerie!]
                })
                codigos[doc.codigoSerie!]++;

                return doc;
            } ),
            docsSalidaBienConsumo: item.docsSalidaBienConsumo.map( doc => {
                doc.set({
                    codigoNumero: codigos[doc.codigoSerie!]
                })
                codigos[doc.codigoSerie!]++;

                return doc;
            } )
        })
        codigos[item.codigoSerie!]++;


        item.setRelation()
        .procesarInformacion();

        
        await this.executeCreateCollection( s, [ item ] );
        return await this.getObjectByUuid( s, item );
    }


    async updateVoid( s: SessionData, item: NotaVenta )
    {
        const item2validate = await this.getObjectByUuid( s, item );
        if ( item2validate.fechaAnulacion ) throw new InternalServerErrorException( ERROR_DOCUMENT.CANT_UPDATE_FROM_VOID );

        const uuidsMovimientos = [
            ...item2validate.salidasBienConsumo.map( sal => sal.uuid ).filter( uuid => uuid !== undefined ),
            ...item2validate.salidasProduccionServicioReparacion.map( sal => sal.uuid ).filter( uuid => uuid !== undefined ),
            ...item2validate.entradasEfectivo.map( ent => ent.uuid ).filter( uuid => uuid !== undefined ),
            ...item2validate.docsEntradaEfectivo.flatMap( doc => doc.entradas.map( ent => ent.uuid ).filter( uuid => uuid !== undefined ) ),
            ...item2validate.docsEntradaBienConsumo.flatMap( doc => doc.entradas.map( ent => ent.uuid ).filter( uuid => uuid !== undefined ) ),
            ...item2validate.docsSalidaEfectivo.flatMap( doc => doc.salidas.map( sal => sal.uuid ).filter( uuid => uuid !== undefined ) ),
            ...item2validate.docsSalidaBienConsumo.flatMap( doc => doc.salidas.map( sal => sal.uuid ).filter( uuid => uuid !== undefined ) ),
        ];
        await this.movimientoRecursoService.verifyUuidReferences( s, uuidsMovimientos )

        
        const [af1] = await DocumentoFuenteOrm.update({
            fechaAnulacion: item.fechaAnulacion,
            fechaActualizacion: item.fechaActualizacion
        }, {
            transaction: s.transaction,
            where: {
                uuid: item.uuid
            }
        });

        if ( af1 === 0 ) throw new InternalServerErrorException(ERROR.NON_UPDATE);
        return await this.getObjectByUuid( s, item2validate );
    }


    async delete( s: SessionData, item: NotaVenta )
    {
        const item2validate = await this.getObjectByUuid( s, item );
        if ( item2validate.fechaAnulacion ) throw new InternalServerErrorException( ERROR_DOCUMENT.CANT_DELETE_FROM_VOID );
        if ( item2validate.fechaEmision ) throw new InternalServerErrorException( ERROR_DOCUMENT.CANT_DELETE_FROM_ISSUED );

        const af1 = await DocumentoFuenteOrm.destroy({
            transaction: s.transaction,
            where: {
                uuid: item2validate.uuid
            }
        });

        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_DELETE );
    }


    query = `
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
            'cantidadEntrante', (
                select sum(entrada_bien_consumo.cant)
                from entrada_bien_consumo_valor_salida
                left join entrada_bien_consumo on entrada_bien_consumo.id = entrada_bien_consumo_valor_salida.id
                where entrada_bien_consumo_valor_salida.salida_bien_consumo_id = salida_bien_consumo.id
            ),
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
left join documento_fuente df on df.id = documento_transaccion.id
    `;
}