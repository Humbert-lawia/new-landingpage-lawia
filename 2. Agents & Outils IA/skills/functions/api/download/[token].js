export async function onRequestGet(context) {
  const { params, env } = context;
  const token = params.token;

  if (!token) {
    return new Response('Token manquant', { status: 400 });
  }

  const key = `token:${token}`;
  const data = await env.LAWIA_TOKENS.get(key, 'json');

  if (!data) {
    return new Response('Lien de téléchargement invalide ou expiré.', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  if (Date.now() > data.expiresAt) {
    await env.LAWIA_TOKENS.delete(key);
    return new Response('Ce lien de téléchargement a expiré.', {
      status: 410,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  if (data.downloadsRemaining <= 0) {
    return new Response('Nombre maximum de téléchargements atteint.', {
      status: 410,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  // Recuperer le fichier depuis R2
  const file = await env.SKILLS_BUCKET.get(data.r2Key);

  if (!file) {
    console.error('R2 file not found:', data.r2Key);
    return new Response('Fichier introuvable. Contactez contact@lawia.fr.', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  // Decrementer le compteur
  data.downloadsRemaining -= 1;
  const ttl = Math.max(1, Math.floor((data.expiresAt - Date.now()) / 1000));
  await env.LAWIA_TOKENS.put(key, JSON.stringify(data), {
    expirationTtl: ttl,
  });

  // Streamer le fichier
  const filename = data.r2Key.replace(/[^a-zA-Z0-9._-]/g, '_');
  return new Response(file.body, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': file.size,
      'Cache-Control': 'no-store',
    },
  });
}
