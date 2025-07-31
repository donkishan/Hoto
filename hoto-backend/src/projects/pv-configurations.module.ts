import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PvConfiguration, PvConfigurationSchema } from './schemas/pv-config.schema';
import { PVConfigService } from './services/pv-config.service';
import { PVConfigController } from './controllers/pv-config.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PvConfiguration.name, schema: PvConfigurationSchema }])
  ],
  controllers: [PVConfigController],
  providers: [PVConfigService],
  exports: [PVConfigService] // in case you want to use this service elsewhere
})
export class PvConfigurationsModule {}
