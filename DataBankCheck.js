import { access } from 'fs/promises';

export async function accessFile(caminho) {
  try {
    await access(caminho);
    return true;
  } catch {
    return false;
  }
}

export function databankCheck(caminho, intervalo = 2500) {
  let status = false;

  (async () => {
    status = await accessFile(caminho);
  })();

  setInterval(async () => {
    status = await accessFile(caminho);
  }, intervalo);

  return () => status;
}