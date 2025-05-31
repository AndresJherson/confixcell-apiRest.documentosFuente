import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { ConectorService } from './infrastructure/services/conector.service';
import { AllExceptionFilter } from './interface/filters/all-exception.filter';
import { TransactionInterceptor } from './interface/interceptors/transaction.interceptor';


async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const config = new DocumentBuilder()
        .setTitle('API Documentos Fuente')
        .setVersion('1.0')
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('doc', app, documentFactory);

    const conectorService = app.get( ConectorService );
    app.useGlobalFilters( new AllExceptionFilter() );
    app.useGlobalInterceptors( new TransactionInterceptor( conectorService ) );

    const port = process.env.PORT ?? 3000

    await app.listen(port);

    Logger.log(`Listening on ${await app.getUrl()}`)
}
bootstrap();
