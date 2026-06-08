import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module.js';
import { BackupService } from '../src/modules/backup/backup.service.js';

async function bootstrap() {
  console.log('Starting manual database backup...');

  // Create an application context rather than a full HTTP server
  const app = await NestFactory.createApplicationContext(AppModule);

  const backupService = app.get(BackupService);

  try {
    await backupService.createBackup();
    await backupService.cleanOldBackups();
    console.log('Manual backup completed successfully.');
  } catch (error) {
    console.error('Manual backup failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
