import { sendFreePackEmail } from './_shared/email.js';

const FREE_PACK_R2_KEY = 'free-pack.zip'; // Bordereau + Verificateur combines dans un ZIP

export async function onRequestPost(context) {
  const { request, env } = context;

  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  };

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Corps de requête invalide' }), {
      status: 400, headers,
    });
  }

  const email = body.email?.trim().toLowerCase();
  const prenom = body.prenom?.trim() || '';

  if (!email || !email.includes('@') || !email.includes('.')) {
    return new Response(JSON.stringify({ error: 'Adresse email invalide' }), {
      status: 400, headers,
    });
  }

  // Rate limiting simple : max 3 demandes par email par 24h
  const rateLimitKey = `ratelimit:freepack:${email}`;
  const rateLimitData = await env.LAWIA_TOKENS.get(rateLimitKey, 'json');

  if (rateLimitData && rateLimitData.count >= 3) {
    return new Response(JSON.stringify({
      error: 'Vous avez déjà demandé le pack gratuit. Vérifiez vos emails.',
    }), { status: 429, headers });
  }

  // Incrementer le rate limit
  const newCount = (rateLimitData?.count || 0) + 1;
  await env.LAWIA_TOKENS.put(rateLimitKey, JSON.stringify({ count: newCount }), {
    expirationTtl: 24 * 60 * 60, // 24h
  });

  // Creer un token de telechargement
  const token = crypto.randomUUID();
  const tokenData = {
    email,
    name: prenom,
    product: 'Pack Gratuit (Bordereau + Vérificateur)',
    r2Key: FREE_PACK_R2_KEY,
    downloadsRemaining: 3,
    createdAt: Date.now(),
    expiresAt: Date.now() + 48 * 60 * 60 * 1000, // 48h
  };

  await env.LAWIA_TOKENS.put(`token:${token}`, JSON.stringify(tokenData), {
    expirationTtl: 48 * 60 * 60, // 48h
  });

  // Envoyer l'email
  const downloadUrl = `https://lawia.fr/telechargement?token=${token}`;
  try {
    await sendFreePackEmail({
      to: email,
      prenom,
      downloadUrl,
      apiKey: env.RESEND_API_KEY,
    });
  } catch (err) {
    console.error('Email failed:', err);
    // On retourne quand meme le lien, l'email est un bonus
  }

  return new Response(JSON.stringify({
    success: true,
    downloadUrl: `/telechargement?token=${token}`,
    message: 'Vos Skills gratuits sont prêts ! Un email de confirmation a été envoyé.',
  }), { status: 200, headers });
}
