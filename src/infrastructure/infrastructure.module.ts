import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { DocumentoFuenteOrm } from './entities/DocumentosFuente/DocumentoFuenteOrm';
import { DocumentoTransaccionOrm } from './entities/DocumentosFuente/DocumentosTransaccion/DocumentoTransaccionOrm';
import { DocumentoMovimientoOrm } from './entities/DocumentosFuente/DocumentosMovimiento/DocumentoMovimientoOrm';
import { NotaOrm } from './entities/DocumentosFuente/Nota/NotaOrm';
import { LiquidacionTipoOrm } from './entities/DocumentosFuente/DocumentosTransaccion/LiquidactionTipoOrm';
import { NotaTransaccionEntradaOrm } from './entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionEntrada/NotaTransaccionEntradaOrm';
import { NteDetalleOrm } from './entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionEntrada/NteDetalleOrm';
import { NteCreditoOrm } from './entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionEntrada/NteCreditoOrm';
import { NteCuotaOrm } from './entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionEntrada/NteCuotaOrm';
import { ComprobanteTipoOrm } from './entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionEntrada/ComprobanteTipoOrm';
import { NotaTransaccionSalidaOrm } from './entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionSalida/NotaTransaccionSalidaOrm';
import { NtsDetalleOrm } from './entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionSalida/NtsDetalleOrm';
import { NtsCreditoOrm } from './entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionSalida/NtsCreditoOrm';
import { NtsCuotaOrm } from './entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionSalida/NtsCuotaOrm';
import { NotaVentaOrm } from './entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/NotaVentaOrm';
import { NvEstadoOrm } from './entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/NvEstadoOrm';
import { NvPrioridadOrm } from './entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/NvPrioridadOrm';
import { NvEntradaEfectivoOrm } from './entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/EntradaEfectivo/NvEntradaEfectivoOrm';
import { NvSalidaBienConsumoOrm } from './entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/SalidaBienConsumo/NvSalidaBienConsumoOrm';
import { NvServicioReparacionOrm } from './entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/SalidaProduccionServicioReparacion/NvServicioReparacionOrm';
import { NvServicioReparacionRecursoServicioOrm } from './entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/SalidaProduccionServicioReparacion/NvServicioReparacionRecursoServicioOrm';
import { NvServicioReparacionRecursoBienConsumoOrm } from './entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/SalidaProduccionServicioReparacion/NvServicioReparacionRecursoBienConsumoOrm';
import { NvCategoriaReparacionOrm } from './entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/SalidaProduccionServicioReparacion/NvCategoriaReparacionOrm';
import { MedioTransferenciaOrm } from './entities/MovimientosRecurso/MedioTransferenciaOrm';
import { EntradaEfectivoOrm } from './entities/MovimientosRecurso/Entrada/EntradaEfectivo/EntradaEfectivoOrm';
import { EntradaEfectivoContadoOrm } from './entities/MovimientosRecurso/Entrada/EntradaEfectivo/EntradaEfectivoContadoOrm';
import { EntradaEfectivoCreditoOrm } from './entities/MovimientosRecurso/Entrada/EntradaEfectivo/EntradaEfectivoCreditoOrm';
import { EntradaEfectivoCuotaOrm } from './entities/MovimientosRecurso/Entrada/EntradaEfectivo/EntradaEfectivoCuotaOrm';
import { EntradaBienConsumoOrm } from './entities/MovimientosRecurso/Entrada/EntradaBienConsumo/EntradaBienConsumoOrm';
import { EntradaBienConsumoValorNuevoOrm } from './entities/MovimientosRecurso/Entrada/EntradaBienConsumo/EntradaBienConsumoValorNuevoOrm';
import { EntradaBienConsumoValorSalidaOrm } from './entities/MovimientosRecurso/Entrada/EntradaBienConsumo/EntradaBienConsumoValorSalidaOrm';
import { SalidaEfectivoOrm } from './entities/MovimientosRecurso/Salida/SalidaEfectivo/SalidaEfectivoOrm';
import { SalidaEfectivoContadoOrm } from './entities/MovimientosRecurso/Salida/SalidaEfectivo/SalidaEfectivoContadoOrm';
import { SalidaEfectivoCreditoOrm } from './entities/MovimientosRecurso/Salida/SalidaEfectivo/SalidaEfectivoCreditoOrm';
import { SalidaEfectivoCuotaOrm } from './entities/MovimientosRecurso/Salida/SalidaEfectivo/SalidaEfectivoCuotaOrm';
import { SalidaBienConsumoOrm } from './entities/MovimientosRecurso/Salida/SalidaBienConsumo/SalidaBienConsumoOrm';
import { SalidaBienConsumoValorNuevoOrm } from './entities/MovimientosRecurso/Salida/SalidaBienConsumo/SalidaBienConsumoValorNuevoOrm';
import { SalidaBienConsumoValorEntradaOrm } from './entities/MovimientosRecurso/Salida/SalidaBienConsumo/SalidaBienConsumoValorEntradaOrm';
import { SalidaProduccionOrm } from './entities/MovimientosRecurso/Salida/SalidaProduccion/SalidaProduccionOrm';
import { SalidaProduccionServicioOrm } from './entities/MovimientosRecurso/Salida/SalidaProduccion/SalidaProduccionServicioOrm';
import { DbPresetOrm } from './entities/Preset/DbPresetOrm';
import { HttpModule } from '@nestjs/axios';
import { ConectorService } from './services/conector.service';
import { IntegridadService } from './services/integridad.service';
import { DocumentoFuenteRepository } from './repositories/documentos-fuente/documento-fuente.service';
import { DocumentoMovimientoRepository } from './repositories/documentos-fuente/documentos-movimiento/documento-movimiento.service';
import { DocumentoEntradaBienConsumoRepository } from './repositories/documentos-fuente/documentos-movimiento/entrada/documento-entrada-bien-consumo.service';
import { DocumentoEntradaEfectivoRepository } from './repositories/documentos-fuente/documentos-movimiento/entrada/documento-entrada-efectivo.service';
import { DocumentoSalidaBienConsumoRepository } from './repositories/documentos-fuente/documentos-movimiento/salida/documento-salida-bien-consumo.service';
import { DocumentoSalidaEfectivoRepository } from './repositories/documentos-fuente/documentos-movimiento/salida/documento-salida-efectivo.service';
import { DocumentoTransaccionRepository } from './repositories/documentos-fuente/documentos-transaccion/documento-transaccion.service';
import { NotaTransaccionEntradaRepository } from './repositories/documentos-fuente/documentos-transaccion/nota-transaccion-entrada/nota-transaccion-entrada.service';
import { ComprobanteTipoRepository } from './repositories/documentos-fuente/documentos-transaccion/nota-transaccion-entrada/comprobante-tipo.service';
import { NotaTransaccionSalidaRepository } from './repositories/documentos-fuente/documentos-transaccion/nota-transaccion-salida/nota-transaccion-salida.service';
import { NotaVentaRepository } from './repositories/documentos-fuente/documentos-transaccion/nota-venta/nota-venta.service';
import { NvCategoriaReparacionRepository } from './repositories/documentos-fuente/documentos-transaccion/nota-venta/nv-categoria-reparacion.service';
import { NvEstadoRepository } from './repositories/documentos-fuente/documentos-transaccion/nota-venta/nv-estado.service';
import { NvPrioridadRepository } from './repositories/documentos-fuente/documentos-transaccion/nota-venta/nv-prioridad.service';
import { NotaRepository } from './repositories/documentos-fuente/nota/nota.service';
import { LiquidacionTipoRepository } from './repositories/documentos-fuente/liquidacion-tipo.service';
import { MedioTransferenciaRepository } from './repositories/documentos-fuente/medio-transferencia.service';
import { MovimientoRecursoRepository } from './repositories/movimientos-recurso/movimiento-recurso.service';
import { EntradaEfectivoRepository } from './repositories/movimientos-recurso/entrada/entrada-efectivo.service';
import { EntradaBienConsumoRepository } from './repositories/movimientos-recurso/entrada/entrada-bien-consumo.service';
import { SalidaEfectivoRepository } from './repositories/movimientos-recurso/salida/salida-efectivo.service';
import { SalidaBienConsumoRepository } from './repositories/movimientos-recurso/salida/salida-bien-consumo.service';
import { SalidaProduccionRepository } from './repositories/movimientos-recurso/salida/salida-produccion.service';
import { DbPresetRepository } from './repositories/preset/db-preset.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        SequelizeModule.forRoot({
            dialect: 'mysql',
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            autoLoadModels: true,
            define: {
                timestamps: false
            },
            dialectOptions: {
                typeCast: (field, next) => {
                    if (field.type === 'DATETIME' || field.type === 'DATE' || field.type === 'TIMESTAMP') {
                        const val = field.string();
                        if (field.type === 'DATETIME' && val ) return `${val} Z`
                        else return val;
                    }
                    return next();
                }
            }
        }),
        SequelizeModule.forFeature([
            DocumentoFuenteOrm,
            DocumentoTransaccionOrm,
            DocumentoMovimientoOrm,
            NotaOrm,
            LiquidacionTipoOrm,

            NotaTransaccionEntradaOrm,
            NteDetalleOrm,
            NteCreditoOrm,
            NteCuotaOrm,
            ComprobanteTipoOrm,

            NotaTransaccionSalidaOrm,
            NtsDetalleOrm,
            NtsCreditoOrm,
            NtsCuotaOrm,

            NotaVentaOrm,
            NvEstadoOrm,
            NvPrioridadOrm,
            NvEntradaEfectivoOrm,
            NvSalidaBienConsumoOrm,
            NvServicioReparacionOrm,
            NvServicioReparacionRecursoServicioOrm,
            NvServicioReparacionRecursoBienConsumoOrm,
            NvCategoriaReparacionOrm,

            MedioTransferenciaOrm,

            EntradaEfectivoOrm,
            EntradaEfectivoContadoOrm,
            EntradaEfectivoCreditoOrm,
            EntradaEfectivoCuotaOrm,

            EntradaBienConsumoOrm,
            EntradaBienConsumoValorNuevoOrm,
            EntradaBienConsumoValorSalidaOrm,

            SalidaEfectivoOrm,
            SalidaEfectivoContadoOrm,
            SalidaEfectivoCreditoOrm,
            SalidaEfectivoCuotaOrm,

            SalidaBienConsumoOrm,
            SalidaBienConsumoValorNuevoOrm,
            SalidaBienConsumoValorEntradaOrm,

            SalidaProduccionOrm,
            SalidaProduccionServicioOrm,

            DbPresetOrm
        ]),
        HttpModule,
    ],
    providers: [
        ConectorService,
        IntegridadService,

        DocumentoFuenteRepository,
        NotaRepository,
        LiquidacionTipoRepository,
        MedioTransferenciaRepository,

        DocumentoMovimientoRepository,
        DocumentoEntradaEfectivoRepository,
        DocumentoEntradaBienConsumoRepository,
        DocumentoSalidaEfectivoRepository,
        DocumentoSalidaBienConsumoRepository,

        DocumentoTransaccionRepository,
        NotaTransaccionEntradaRepository,
        ComprobanteTipoRepository,
        NotaTransaccionSalidaRepository,
        NotaVentaRepository,
        NvCategoriaReparacionRepository,
        NvEstadoRepository,
        NvPrioridadRepository,

        MovimientoRecursoRepository,
        EntradaEfectivoRepository,
        EntradaBienConsumoRepository,
        SalidaEfectivoRepository,
        SalidaBienConsumoRepository,
        SalidaProduccionRepository,

        DbPresetRepository
    ],
    exports: [
        ConectorService,
        IntegridadService,
        
        DocumentoFuenteRepository,
        NotaRepository,
        LiquidacionTipoRepository,
        MedioTransferenciaRepository,

        DocumentoMovimientoRepository,
        DocumentoEntradaEfectivoRepository,
        DocumentoEntradaBienConsumoRepository,
        DocumentoSalidaEfectivoRepository,
        DocumentoSalidaBienConsumoRepository,

        DocumentoTransaccionRepository,
        NotaTransaccionEntradaRepository,
        ComprobanteTipoRepository,
        NotaTransaccionSalidaRepository,
        NotaVentaRepository,
        NvCategoriaReparacionRepository,
        NvEstadoRepository,
        NvPrioridadRepository,

        MovimientoRecursoRepository,
        EntradaEfectivoRepository,
        EntradaBienConsumoRepository,
        SalidaEfectivoRepository,
        SalidaBienConsumoRepository,
        SalidaProduccionRepository,

        DbPresetRepository
    ]
})
export class InfrastructureModule {}
