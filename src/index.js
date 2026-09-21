import { readdirSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function loadCommands(client) {
  const commandsPath = join(__dirname, '..', 'commands');
  const commandFiles = readdirSync(commandsPath).filter(
    (file) => file.endsWith('.js') && !file.startsWith('.')
  );

  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const command = await import(pathToFileURL(filePath).href);

    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      console.log(`📦 Comando carregado: ${command.data.name}`);
    } else {
      console.warn(`⚠️ Arquivo ${file} não tem "data" ou "execute", ignorando.`);
    }
  }

  console.log(`✅ ${client.commands.size} comando(s) carregado(s).`);
}
