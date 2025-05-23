import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConectorService } from './services/conector.service';
import { DbPresetService } from './repositories/preset/db-preset.service';
import { NotaTransaccionEntradaService } from './repositories/documentos-fuente/documentos-transaccion/nota-transaccion-entrada/nota-transaccion-entrada.service';
import { NotaTransaccionSalidaService } from './repositories/documentos-fuente/documentos-transaccion/nota-transaccion-salida/nota-transaccion-salida.service';
import { NotaVentaService } from './repositories/documentos-fuente/documentos-transaccion/nota-venta/nota-venta.service';
import { DocumentoEntradaEfectivoService } from './repositories/documentos-fuente/documentos-movimiento/entrada/documento-entrada-efectivo.service';
import { DocumentoEntradaBienConsumoService } from './repositories/documentos-fuente/documentos-movimiento/entrada/documento-entrada-bien-consumo.service';
import { DocumentoSalidaBienConsumoService } from './repositories/documentos-fuente/documentos-movimiento/salida/documento-salida-bien-consumo.service';
import { DocumentoSalidaEfectivoService } from './repositories/documentos-fuente/documentos-movimiento/salida/documento-salida-efectivo.service';
import { DocumentoMovimientoService } from './repositories/documentos-fuente/documentos-movimiento/documento-movimiento.service';
import { DocumentoTransaccionService } from './repositories/documentos-fuente/documentos-transaccion/documento-transaccion.service';
import { DocumentoFuenteService } from './repositories/documentos-fuente/documento-fuente.service';
import { EntradaEfectivoService } from './repositories/movimientos-recurso/entrada/entrada-efectivo.service';
import { EntradaBienConsumoService } from './repositories/movimientos-recurso/entrada/entrada-bien-consumo.service';
import { SalidaBienConsumoService } from './repositories/movimientos-recurso/salida/salida-bien-consumo.service';
import { SalidaEfectivoService } from './repositories/movimientos-recurso/salida/salida-efectivo.service';
import { DocumentoFuenteEntity } from './entities/DocumentosFuente/DocumentoFuenteEntity';
import { DocumentoTransaccionEntity } from './entities/DocumentosFuente/DocumentosTransaccion/DocumentoTransaccionEntity';
import { DocumentoMovimientoEntity } from './entities/DocumentosFuente/DocumentosMovimiento/DocumentoMovimientoEntity';
import { NotaEntity } from './entities/DocumentosFuente/Nota/NotaEntity';
import { LiquidacionTipoEntity } from './entities/DocumentosFuente/DocumentosTransaccion/LiquidactionTipoEntity';
import { NotaTransaccionEntradaEntity } from './entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionEntrada/NotaTransaccionEntradaEntity';
import { NteCreditoEntity } from './entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionEntrada/NteCreditoEntity';
import { NteCuotaEntity } from './entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionEntrada/NteCuotaEntity';
import { NteDetalleEntity } from './entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionEntrada/NteDetalleEntity';
import { ComprobanteTipoEntity } from './entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionEntrada/ComprobanteTipoEntity';
import { NotaTransaccionSalidaEntity } from './entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionSalida/NotaTransaccionSalidaEntity';
import { NtsCreditoEntity } from './entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionSalida/NtsCreditoEntity';
import { NtsCuotaEntity } from './entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionSalida/NtsCuotaEntity';
import { NtsDetalleEntity } from './entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionSalida/NtsDetalleEntity';
import { NotaVentaEntity } from './entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/NotaVentaEntity';
import { NvEstadoEntity } from './entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/NvEstadoEntity';
import { NvPrioridadEntity } from './entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/NvPrioridadEntity';
import { NvEntradaEfectivoEntity } from './entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/EntradaEfectivo/NvEntradaEfectivoEntity';
import { NvSalidaBienConsumoEntity } from './entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/SalidaBienConsumo/NvSalidaBienConsumoEntity';
import { NvServicioReparacionEntity } from './entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/SalidaProduccionServicioReparacion/NvServicioReparacionEntity';
import { NvServicioReparacionRecursoServicioEntity } from './entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/SalidaProduccionServicioReparacion/NvServicioReparacionRecursoServicioEntity';
import { NvServicioReparacionRecursoBienConsumoEntity } from './entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/SalidaProduccionServicioReparacion/NvServicioReparacionRecursoBienConsumoEntity';
import { NvCategoriaReparacionEntity } from './entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/SalidaProduccionServicioReparacion/NvCategoriaReparacionEntity';
import { MedioTransferenciaEntity } from './entities/MovimientosRecurso/MedioTransferenciaEntity';
import { EntradaEfectivoEntity } from './entities/MovimientosRecurso/Entrada/EntradaEfectivo/EntradaEfectivoEntity';
import { EntradaEfectivoCreditoEntity } from './entities/MovimientosRecurso/Entrada/EntradaEfectivo/EntradaEfectivoCreditoEntity';
import { EntradaEfectivoCuotaEntity } from './entities/MovimientosRecurso/Entrada/EntradaEfectivo/EntradaEfectivoCuotaEntity';
import { EntradaBienConsumoEntity } from './entities/MovimientosRecurso/Entrada/EntradaBienConsumo/EntradaBienConsumoEntity';
import { EntradaEfectivoContadoEntity } from './entities/MovimientosRecurso/Entrada/EntradaEfectivo/EntradaEfectivoContadoEntity';
import { EntradaBienConsumoValorNuevoEntity } from './entities/MovimientosRecurso/Entrada/EntradaBienConsumo/EntradaBienConsumoValorNuevoEntity';
import { EntradaBienConsumoValorSalidaEntity } from './entities/MovimientosRecurso/Entrada/EntradaBienConsumo/EntradaBienConsumoValorSalidaEntity';
import { SalidaEfectivoEntity } from './entities/MovimientosRecurso/Salida/SalidaEfectivo/SalidaEfectivoEntity';
import { SalidaEfectivoContadoEntity } from './entities/MovimientosRecurso/Salida/SalidaEfectivo/SalidaEfectivoContadoEntity';
import { SalidaEfectivoCreditoEntity } from './entities/MovimientosRecurso/Salida/SalidaEfectivo/SalidaEfectivoCreditoEntity';
import { SalidaEfectivoCuotaEntity } from './entities/MovimientosRecurso/Salida/SalidaEfectivo/SalidaEfectivoCuotaEntity';
import { SalidaBienConsumoEntity } from './entities/MovimientosRecurso/Salida/SalidaBienConsumo/SalidaBienConsumoEntity';
import { SalidaBienConsumoValorNuevoEntity } from './entities/MovimientosRecurso/Salida/SalidaBienConsumo/SalidaBienConsumoValorNuevoEntity';
import { SalidaBienConsumoValorEntradaEntity } from './entities/MovimientosRecurso/Salida/SalidaBienConsumo/SalidaBienConsumoValorEntradaEntity';
import { SalidaProduccionEntity } from './entities/MovimientosRecurso/Salida/SalidaProduccion/SalidaProduccionEntity';
import { SalidaProduccionServicioEntity } from './entities/MovimientosRecurso/Salida/SalidaProduccion/SalidaProduccionServicioEntity';
import { DbPresetEntity } from './entities/Preset/DbPresetEntity';
import { NotaService } from './repositories/documentos-fuente/nota/nota.service';
import { DocumentoEntradaEfectivoController } from './controllers/documentos-fuente/documentos-movimiento/entrada/documento-entrada-efectivo.controller';
import { SalidaProduccionService } from './repositories/movimientos-recurso/salida/salida-produccion.service';
import { MedioTransferenciaService } from './repositories/documentos-fuente/medio-transferencia.service';
import { ComprobanteTipoService } from './repositories/documentos-fuente/documentos-transaccion/nota-transaccion-entrada/comprobante-tipo.service';
import { NvPrioridadService } from './repositories/documentos-fuente/documentos-transaccion/nota-venta/nv-prioridad.service';
import { NvEstadoService } from './repositories/documentos-fuente/documentos-transaccion/nota-venta/nv-estado.service';
import { NvCategoriaReparacionService } from './repositories/documentos-fuente/documentos-transaccion/nota-venta/nv-categoria-reparacion.service';
import { DocumentoFuenteController } from './controllers/documentos-fuente/documento-fuente.controller';
import { DocumentoMovimientoController } from './controllers/documentos-fuente/documentos-movimiento/documento-movimiento.controller';
import { DocumentoTransaccionController } from './controllers/documentos-fuente/documentos-transaccion/documento-transaccion.controller';
import { NotaVentaController } from './controllers/documentos-fuente/documentos-transaccion/nota-venta/nota-venta.controller';
import { NotaTransaccionEntradaController } from './controllers/documentos-fuente/documentos-transaccion/nota-transaccion-entrada/nota-transaccion-entrada.controller';
import { NotaTransaccionSalidaController } from './controllers/documentos-fuente/documentos-transaccion/nota-transaccion-salida/nota-transaccion-salida.controller';
import { DocumentoEntradaBienConsumoController } from './controllers/documentos-fuente/documentos-movimiento/entrada/documento-entrada-bien-consumo.controller';
import { DocumentoSalidaEfectivoController } from './controllers/documentos-fuente/documentos-movimiento/salida/documento-salida-efectivo.controller';
import { DocumentoSalidaBienConsumoController } from './controllers/documentos-fuente/documentos-movimiento/salida/documento-salida-bien-consumo.controller';
import { NotaController } from './controllers/documentos-fuente/nota/nota.controller';
import { NvCategoriaReparacionController } from './controllers/documentos-fuente/documentos-transaccion/nota-venta/nv-categoria-reparacion.controller';
import { NvEstadoController } from './controllers/documentos-fuente/documentos-transaccion/nota-venta/nv-estado.controller';
import { NvPrioridadController } from './controllers/documentos-fuente/documentos-transaccion/nota-venta/nv-prioridad.controller';
import { ComprobanteTipoController } from './controllers/documentos-fuente/documentos-transaccion/nota-transaccion-entrada/comprobante-tipo.controller';
import { MedioTransferenciaController } from './controllers/documentos-fuente/medio-transferencia.controller';
import { LiquidacionTipoController } from './controllers/documentos-fuente/documentos-transaccion/liquidacion-tipo.controller';
import { LiquidacionTipoService } from './repositories/documentos-fuente/liquidacion-tipo.service';
import { IntegridadController } from './controllers/integridad/integridad.controller';
import { IntegridadService } from './services/integridad.service';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [
        ConfigModule.forRoot(),
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
            DocumentoFuenteEntity,
            DocumentoTransaccionEntity,
            DocumentoMovimientoEntity,
            NotaEntity,
            LiquidacionTipoEntity,

            NotaTransaccionEntradaEntity,
            NteDetalleEntity,
            NteCreditoEntity,
            NteCuotaEntity,
            ComprobanteTipoEntity,

            NotaTransaccionSalidaEntity,
            NtsDetalleEntity,
            NtsCreditoEntity,
            NtsCuotaEntity,

            NotaVentaEntity,
            NvEstadoEntity,
            NvPrioridadEntity,
            NvEntradaEfectivoEntity,
            NvSalidaBienConsumoEntity,
            NvServicioReparacionEntity,
            NvServicioReparacionRecursoServicioEntity,
            NvServicioReparacionRecursoBienConsumoEntity,
            NvCategoriaReparacionEntity,

            MedioTransferenciaEntity,

            EntradaEfectivoEntity,
            EntradaEfectivoContadoEntity,
            EntradaEfectivoCreditoEntity,
            EntradaEfectivoCuotaEntity,

            EntradaBienConsumoEntity,
            EntradaBienConsumoValorNuevoEntity,
            EntradaBienConsumoValorSalidaEntity,

            SalidaEfectivoEntity,
            SalidaEfectivoContadoEntity,
            SalidaEfectivoCreditoEntity,
            SalidaEfectivoCuotaEntity,

            SalidaBienConsumoEntity,
            SalidaBienConsumoValorNuevoEntity,
            SalidaBienConsumoValorEntradaEntity,

            SalidaProduccionEntity,
            SalidaProduccionServicioEntity,

            DbPresetEntity
        ]),
        HttpModule
    ],
    controllers: [DocumentoFuenteController, DocumentoMovimientoController, DocumentoTransaccionController, NotaVentaController, NvCategoriaReparacionController, NvEstadoController, NvPrioridadController, NotaTransaccionEntradaController, ComprobanteTipoController, NotaTransaccionSalidaController, DocumentoEntradaEfectivoController, DocumentoEntradaBienConsumoController, DocumentoSalidaEfectivoController, DocumentoSalidaBienConsumoController, NotaController, MedioTransferenciaController, LiquidacionTipoController, IntegridadController],
    providers: [ConectorService, DbPresetService, NotaTransaccionEntradaService, NotaTransaccionSalidaService, NotaVentaService, DocumentoEntradaEfectivoService, DocumentoEntradaBienConsumoService, DocumentoSalidaBienConsumoService, DocumentoSalidaEfectivoService, DocumentoMovimientoService, DocumentoTransaccionService, DocumentoFuenteService, EntradaEfectivoService, EntradaBienConsumoService, SalidaBienConsumoService, SalidaEfectivoService, NotaService, SalidaProduccionService, MedioTransferenciaService, ComprobanteTipoService, NvPrioridadService, NvEstadoService, NvCategoriaReparacionService, LiquidacionTipoService, IntegridadService],
})
export class AppModule { }
