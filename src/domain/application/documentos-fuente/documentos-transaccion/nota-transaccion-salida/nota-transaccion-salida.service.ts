import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DocumentoTransaccionService } from '../documento-transaccion.service';
import { ModuleRef } from '@nestjs/core';
import { ERROR, ERROR_DOCUMENT } from 'src/utils/constants';
import { SessionData } from 'src/utils/interfaces';
import { Cliente, NotaTransaccionSalida, Prop, Usuario } from '@confixcell/modelos';
import { DocumentoMovimientoService } from '../../documentos-movimiento/documento-movimiento.service';
import { v4 } from 'uuid';
import { ConectorService } from 'src/infrastructure/services/conector.service';
import { NotaTransaccionSalidaOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionSalida/NotaTransaccionSalidaOrm';
import { NtsDetalleOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionSalida/NtsDetalleOrm';
import { SalidaEfectivoService } from 'src/domain/application/movimientos-recurso/salida/salida-efectivo.service';
import { DocumentoFuenteService } from '../../documento-fuente.service';
import { DocumentoFuenteOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentoFuenteOrm';
import { MovimientoRecursoService } from 'src/domain/application/movimientos-recurso/movimiento-recurso.service';
import { DocumentoTransaccionOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentosTransaccion/DocumentoTransaccionOrm';
import { firstValueFrom } from 'rxjs';
import { ClientNats } from '@nestjs/microservices';

@Injectable()
export class NotaTransaccionSalidaService {

    private documentoFuenteService!: DocumentoFuenteService;
    private documentoTransaccionService!: DocumentoTransaccionService;
    private documentoMovimientoService!: DocumentoMovimientoService;
    private salidaEfectivoService!: SalidaEfectivoService;
    private movimientoRecursoService!: MovimientoRecursoService;


    constructor(
        private conectorService: ConectorService,
        @Inject('NATS') private clientNats: ClientNats,
        private moduleRef: ModuleRef
    )
    {}


    onModuleInit() 
    {
        this.documentoFuenteService = this.moduleRef.get( DocumentoFuenteService, { strict: false } );
        this.documentoTransaccionService = this.moduleRef.get( DocumentoTransaccionService, { strict: false } );
        this.documentoMovimientoService = this.moduleRef.get( DocumentoMovimientoService, { strict: false } );
        this.salidaEfectivoService = this.moduleRef.get( SalidaEfectivoService, { strict: false } );
        this.movimientoRecursoService = this.moduleRef.get( MovimientoRecursoService, { strict: false } );

        if ( !this.documentoFuenteService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
        if ( !this.documentoTransaccionService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
        if ( !this.documentoMovimientoService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
        if ( !this.salidaEfectivoService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
        if ( !this.movimientoRecursoService ) throw new InternalServerErrorException( ERROR.NON_SET_SERVICE );
    }


    async executeCreateCollection( s: SessionData, items: NotaTransaccionSalida[], withSupertype: boolean = true )
    {
        if ( withSupertype )
            await this.documentoTransaccionService.executeCreateCollection( s, items );

        await NotaTransaccionSalidaOrm.bulkCreate( items.map( item => ({
            id: item.id,
            clienteUuid: item.cliente?.uuid,
            clienteDocumentoIdentificacionUuid: item.clienteDocumentoIdentificacion?.uuid,
            clienteCodigo: item.clienteCodigo,
            clienteNombre: item.clienteNombre,
            clienteCelular: item.clienteCelular,
            liquidacionTipoId: item.liquidacion?.id,
            ntsDetallesOrm: item.detalles.map( detalle => new NtsDetalleOrm({
                notaTransaccionSalidaId: detalle.notaTransaccionSalida?.id,
                recursoUuid: detalle.recurso?.uuid,
                concepto: detalle.concepto,
                importeUnitario: detalle.importeUnitario,
                cantidad: detalle.cantidad,
                importeDescuento: detalle.importeDescuento,
                comentario: detalle.comentario
            }) )
        }) ), {
            transaction: s.transaction
        } );

        await this.salidaEfectivoService.executeCreateCollection( s, items.filter( item => item.liquidacion?.id === 2 )
            .map( item => item.credito )
            .filter( credito => credito !== undefined ) );
    }


    async getCollection( s: SessionData )
    {
        return await this.conectorService.executeQuery({
            target: NotaTransaccionSalida,
            transaction: s.transaction,
            query: this.query
        }).then( data => data.map( item => item.setRelation().procesarInformacion() ) );
    }


    async getCollectionByUsuarioUuid( s: SessionData, usuario: Usuario )
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
        }).then( data => data.map( item => item.setRelation().procesarInformacion() ) );
    }


    async getCollectionByClienteUuid( s: SessionData, cliente: Cliente )
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
        }).then( data => data.map( item => item.setRelation().procesarInformacion() ) );
    }


    async getObjectByUuid( s: SessionData, item: NotaTransaccionSalida )
    {
        const data = await this.conectorService.executeQuery({
            target: NotaTransaccionSalida,
            transaction: s.transaction,
            query: `
                ${this.query}
                where df.uuid ${item.uuid === undefined ? ' is null ': ' = :uuid '}
            `,
            parameters: {
                uuid: item.uuid ?? null
            }
        });

        if ( !data.length ) throw new InternalServerErrorException( ERROR.UUID_INVALIDATE );

        return data[0].setRelation()
            .procesarInformacion();
    }


    async create( s: SessionData, item: NotaTransaccionSalida )
    {
        if ( !item.dateTimeEmision.isValid ) {

            item.set({
                uuid: v4(),
                codigoSerie: undefined,
                codigoNumero: undefined,
                fechaEmision: undefined,
                fechaAnulacion: undefined,
                usuario: s.usuarioSession,
                detalles: item.detalles.map( detalle => detalle.set({
                    uuid: v4()
                }) ),
                docsEntradaEfectivo: [],
                docsEntradaBienConsumo: [],
                docsSalidaEfectivo: [],
                docsSalidaBienConsumo: [],
            })
            .setRelation()
            .procesarInformacion();
    
    
            await this.executeCreateCollection( s, [ item ] );
            return await this.getObjectByUuid( s, item );

        }
        else {

            item.set({
                uuid: v4(),
                fechaAnulacion: undefined,
                codigoSerie: `NTS${item.dateTimeEmision.toFormat( 'yyyy' )}`,
                usuario: s.usuarioSession,
                detalles: item.detalles.map( detalle => detalle.set({
                    uuid: v4()
                }) ),
                docsEntradaEfectivo: item.docsEntradaEfectivo.map( doc => doc.set({
                    uuid: v4(),
                    usuario: s.usuarioSession,
                    entradas: doc.entradas.map( ent => ent.set({
                        uuid: v4()
                    }) )
                }) ),
                docsEntradaBienConsumo: item.docsEntradaBienConsumo.map( doc => doc.set({
                    uuid: v4(),
                    usuario: s.usuarioSession,
                    entradas: doc.entradas.map( ent => ent.set({
                        uuid: v4()
                    }) )
                }) ),
                docsSalidaEfectivo: item.docsSalidaEfectivo.map( doc => doc.set({
                    uuid: v4(),
                    usuario: s.usuarioSession,
                    salidas: doc.salidas.map( sal => sal.set({
                        uuid: v4()
                    }) )
                }) ),
                docsSalidaBienConsumo: item.docsSalidaBienConsumo.map( doc => doc.set({
                    uuid: v4(),
                    usuario: s.usuarioSession,
                    salidas: doc.salidas.map( sal => sal.set({
                        uuid: v4()
                    }) )
                }) )
            });
        
            item.documentosMovimiento.forEach( doc => {
                if ( !doc.dateTimeEmision.isValid ) throw new InternalServerErrorException( ERROR_DOCUMENT.DATETIME_ISSUE_INVALIDATE );
                doc.set({
                    codigoSerie: `MOV${doc.dateTimeEmision.toFormat( 'yyyy' )}`
                })
            } );
        
        
            const codigos = await this.documentoFuenteService.getRecordCodigos({
                transaction: s.transaction,
                series: [ item.codigoSerie!, ...item.documentosMovimiento.map( doc => doc.codigoSerie! ) ]
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
            const item2send = await this.getObjectByUuid( s, item );
            s.postCommitEvents.push(() => firstValueFrom(this.clientNats.emit('kardexBienConsumo.crearMovimiento', item2send.toRecordKardexBienConsumo())));
            return item2send;

        }
    }


    async update( s: SessionData, item: NotaTransaccionSalida )
    {
        const item2validate = await this.getObjectByUuid( s, item );
        if ( item2validate.fechaAnulacion ) throw new InternalServerErrorException( ERROR_DOCUMENT.CANT_UPDATE_FROM_VOID );
        if ( item2validate.fechaEmision ) throw new InternalServerErrorException( ERROR_DOCUMENT.CANT_UPDATE_FROM_ISSUED );

        const af1 = await DocumentoTransaccionOrm.destroy({
            transaction: s.transaction,
            where: {
                id: item.id
            }
        });
        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_UPDATE );


        if ( !item.dateTimeEmision.isValid ) {

            item.set({
                id: item2validate.id,
                uuid: item2validate.uuid,
                codigoSerie: undefined,
                codigoNumero: undefined,
                fechaCreacion: item2validate.fechaCreacion,
                fechaEmision: undefined,
                fechaAnulacion: undefined,
                usuario: s.usuarioSession,
                detalles: item.detalles.map( detalle => detalle.set({
                    uuid: v4()
                }) ),
                docsEntradaEfectivo: [],
                docsEntradaBienConsumo: [],
                docsSalidaEfectivo: [],
                docsSalidaBienConsumo: []
            })
            .setRelation()
            .procesarInformacion();

            await DocumentoFuenteOrm.update({
                concepto: item.concepto ?? null as any,
                importeNeto: item.importeNeto,
                usuarioUuid: item.usuario?.uuid ?? null as any,
                fechaActualizacion: item.fechaActualizacion ?? null as any
            }, {
                transaction: s.transaction,
                where: {
                    uuid: item.uuid
                }
            });

            await this.documentoTransaccionService.executeCreateCollection( s, [ item ], false );
            await this.executeCreateCollection( s, [ item ], false );
            return await this.getObjectByUuid( s, item );

        }
        else {

            item.set({
                id: item2validate.id,
                uuid: item2validate.uuid,
                codigoSerie: `NTS${item.dateTimeEmision.toFormat( 'yyyy' )}`,
                fechaCreacion: item2validate.fechaCreacion,
                fechaAnulacion: undefined,
                usuario: s.usuarioSession,
                detalles: item.detalles.map( detalle => detalle.set({
                    uuid: v4()
                }) ),
                docsEntradaEfectivo: item.docsEntradaEfectivo.map( doc => doc.set({
                    uuid: v4(),
                    usuario: s.usuarioSession,
                    entradas: doc.entradas.map( ent => ent.set({
                        uuid: v4()
                    }) )
                }) ),
                docsEntradaBienConsumo: item.docsEntradaBienConsumo.map( doc => doc.set({
                    uuid: v4(),
                    usuario: s.usuarioSession,
                    entradas: doc.entradas.map( ent => ent.set({
                        uuid: v4()
                    }) )
                }) ),
                docsSalidaEfectivo: item.docsSalidaEfectivo.map( doc => doc.set({
                    uuid: v4(),
                    usuario: s.usuarioSession,
                    salidas: doc.salidas.map( sal => sal.set({
                        uuid: v4()
                    }) )
                }) ),
                docsSalidaBienConsumo: item.docsSalidaBienConsumo.map( doc => doc.set({
                    uuid: v4(),
                    usuario: s.usuarioSession,
                    salidas: doc.salidas.map( sal => sal.set({
                        uuid: v4()
                    }) )
                }) )
            });

            item.documentosMovimiento.forEach( doc => {
                if ( !doc.dateTimeEmision.isValid ) throw new InternalServerErrorException( ERROR_DOCUMENT.DATETIME_ISSUE_INVALIDATE );
                doc.set({
                    codigoSerie: `MOV${doc.dateTimeEmision.toFormat( 'yyyy' )}`
                })
            } );


            const codigos = await this.documentoFuenteService.getRecordCodigos({
                transaction: s.transaction,
                series: [ item.codigoSerie!, ...item.documentosMovimiento.map( doc => doc.codigoSerie! ) ]
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


            await DocumentoFuenteOrm.update({
                codigoSerie: item.codigoSerie ?? null as any,
                codigoNumero: item.codigoNumero ?? null as any,
                fechaEmision: item.fechaEmision ?? null as any,
                fechaAnulacion: item.fechaAnulacion ?? null as any,
                concepto: item.concepto ?? null as any,
                importeNeto: item.importeNeto,
                usuarioUuid: item.usuario?.uuid ?? null as any,
                fechaActualizacion: item.fechaActualizacion ?? null as any
            }, {
                transaction: s.transaction,
                where: {
                    uuid: item.uuid
                }
            });

            await this.documentoTransaccionService.executeCreateCollection( s, [ item ], false );
            await this.executeCreateCollection( s, [ item ], false );

            const item2send = await this.getObjectByUuid( s, item );
            s.postCommitEvents.push( () => firstValueFrom(this.clientNats.emit('kardexBienConsumo.crearMovimiento', item2send.toRecordKardexBienConsumo())) );
            return item2send;
            
        }
    }


    async updateVoid( s: SessionData, item: NotaTransaccionSalida )
    {
        const item2validate = await this.getObjectByUuid( s, item );
        if ( item2validate.fechaAnulacion ) throw new InternalServerErrorException( ERROR_DOCUMENT.CANT_UPDATE_FROM_VOID );

        await this.movimientoRecursoService.verifyUuidReferences( s, item2validate.movimientos.map( mov => mov.uuid ).filter( uuid => uuid !== undefined ) )

        const [af1] = await DocumentoFuenteOrm.update({
            fechaAnulacion: item.fechaAnulacion ?? null as any,
            fechaActualizacion: item.fechaActualizacion ?? null as any,
            usuarioUuid: s.usuarioSession.uuid ?? null as any
        }, {
            transaction: s.transaction,
            where: {
                uuid: item2validate.uuid
            }
        });

        if ( af1 === 0 ) throw new InternalServerErrorException(ERROR.NON_UPDATE);

        s.postCommitEvents.push( () => firstValueFrom(this.clientNats.emit('kardexBienConsumo.eliminarMovimiento', item2validate.toRecordKardexBienConsumo())) )
        return await this.getObjectByUuid( s, item2validate );
    }


    async delete( s: SessionData, item: NotaTransaccionSalida )
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
left join documento_fuente df on df.id = documento_transaccion.id
    `;
}