import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const execAsync = promisify(exec);

async function runBackup() {
  console.log('Starting standalone database backup...');

  const directUrl = process.env.DIRECT_URL;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS || '7', 10);

  if (!directUrl || !supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables (DIRECT_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup-${timestamp}.dump`;
  const filepath = path.join(backupDir, filename);

  try {
    console.log(`Running pg_dump to file: ${filename}`);
    await execAsync(`pg_dump "${directUrl}" -F c -f "${filepath}"`);
    console.log(`Local backup created successfully: ${filepath}`);

    console.log(`Uploading ${filename} to Supabase Storage...`);
    const fileBuffer = fs.readFileSync(filepath);
    const { data, error: uploadError } = await supabase.storage
      .from('database-backups')
      .upload(filename, fileBuffer, {
        contentType: 'application/octet-stream',
        upsert: true,
      });

    if (uploadError) throw new Error(`Supabase upload failed: ${uploadError.message}`);
    console.log(`Backup successfully uploaded to Supabase Storage: ${data?.path}`);

    // Clean old backups from Supabase Storage
    console.log(`Cleaning up old backups (retention: ${retentionDays} days)...`);
    const { data: files, error: listError } = await supabase.storage.from('database-backups').list();
    if (listError) throw new Error(`Failed to list Supabase backups: ${listError.message}`);

    const now = Date.now();
    const retentionMs = retentionDays * 24 * 60 * 60 * 1000;
    const filesToDelete = (files || [])
      .filter((file) => file.created_at && (now - new Date(file.created_at).getTime() > retentionMs))
      .map((file) => file.name);

    if (filesToDelete.length > 0) {
      const { error: deleteError } = await supabase.storage.from('database-backups').remove(filesToDelete);
      if (deleteError) throw new Error(`Failed to delete old Supabase backups: ${deleteError.message}`);
      console.log(`Deleted ${filesToDelete.length} old backups from Supabase Storage.`);
    }

    console.log('Standalone backup completed successfully.');
  } catch (error) {
    console.error(`Backup failed: ${error.message}`);
    process.exit(1);
  }
}

runBackup().catch(console.error);
