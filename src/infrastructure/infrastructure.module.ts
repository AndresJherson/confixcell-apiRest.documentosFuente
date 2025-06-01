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
import { ClientsModule, Transport } from '@nestjs/microservices';

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
        ClientsModule.register([
            {
                name: 'NATS',
                transport: Transport.NATS,
                options: {
                    servers: process.env.NATS_HOST
                }
            }
        ])
    ],
    providers: [
        ConectorService,
        IntegridadService,
    ],
    exports: [
        ConectorService,
        IntegridadService,
        ConfigModule,
        SequelizeModule,
        HttpModule,
        ClientsModule
    ]
})
export class InfrastructureModule {}
