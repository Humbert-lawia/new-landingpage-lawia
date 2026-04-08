import { sendPurchaseEmail } from './_shared/email.js';

// Mapping Stripe price_id → R2 file key + nom produit
// A REMPLIR avec les vrais price_id Stripe une fois crees
const PRODUCT_MAP = {
  'price_pack_5_skills': { r2Key: 'pack-5-skills.zip', name: 'Pack 5 Skills' },
  'price_skill_assignation': { r2Key: 'assignation-tribunal-judiciaire.zip', name: 'Skill Assignation' },
  'price_skill_requete': { r2Key: 'requete-memoire-tribunal-administratif.zip', name: 'Skill Requête TA' },
  'price_skill_contre_argumentation': { r2Key: 'contre-argumentation.zip', name: 'Skill Contre-argumentation' },
  'price_skill_appel': { r2Key: 'procedure-appel-civil.zip', name: 'Skill Appel' },
  'price_skill_convention': { r2Key: 'convention-honoraires.zip', name: 'Skill Convention' },
};

// Verification de la signature Stripe via Web Crypto (pas besoin de npm)
async function verifyStripeSignature(payload, sigHeader, secret) {
  const parts = {};
  for (const item of sigHeader.split(',')) {
    const [key, value] = item.split('=');
    parts[key] = value;
  }

  const timestamp = parts['t'];
  const signature = parts['v1'];
  if (!timestamp || !signature) return false;

  // Verifier que le timestamp n'est pas trop vieux (5 min)
  const age = Math.floor(Date.now() / 1000) - parseInt(timestamp);
  if (age > 300) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
  const expected = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return expected === signature;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const payload = await request.text();
  const sigHeader = request.headers.get('stripe-signature');

  if (!sigHeader) {
    return new Response('Missing signature', { status: 400 });
  }

  const valid = await verifyStripeSignature(payload, sigHeader, env.STRIPE_WEBHOOK_SECRET);
  if (!valid) {
    return new Response('Invalid signature', { status: 401 });
  }

  const event = JSON.parse(payload);

  if (event.type !== 'checkout.session.completed') {
    return new Response('OK', { status: 200 });
  }

  const session = event.data.object;
  const email = session.customer_details?.email;
  const name = session.customer_details?.name || '';
  const sessionId = session.id;

  // Recuperer le price_id depuis les line_items via l'API Stripe
  const lineItemsRes = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${sessionId}/line_items`,
    {
      headers: { 'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}` },
    }
  );
  const lineItems = await lineItemsRes.json();
  const priceId = lineItems.data?.[0]?.price?.id;
  const product = PRODUCT_MAP[priceId];

  if (!product) {
    console.error('Unknown price_id:', priceId);
    return new Response('Unknown product', { status: 400 });
  }

  // Creer un token de telechargement
  const token = crypto.randomUUID();
  const tokenData = {
    email,
    name,
    product: product.name,
    r2Key: product.r2Key,
    downloadsRemaining: 5,
    createdAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 jours
  };

  await env.LAWIA_TOKENS.put(`token:${token}`, JSON.stringify(tokenData), {
    expirationTtl: 7 * 24 * 60 * 60, // 7 jours en secondes
  });

  // Stocker aussi par session_id pour la page de telechargement
  await env.LAWIA_TOKENS.put(`session:${sessionId}`, token, {
    expirationTtl: 7 * 24 * 60 * 60,
  });

  // Envoyer l'email de confirmation
  const downloadUrl = `https://lawia.fr/telechargement?token=${token}`;
  try {
    await sendPurchaseEmail({
      to: email,
      prenom: name.split(' ')[0],
      product: product.name,
      downloadUrl,
      apiKey: env.RESEND_API_KEY,
    });
  } catch (err) {
    console.error('Email failed (non-blocking):', err);
  }

  return new Response('OK', { status: 200 });
}
