export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('session_id');
  const token = url.searchParams.get('token');

  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  };

  // Si on a directement un token, verifier sa validite
  if (token) {
    const data = await env.LAWIA_TOKENS.get(`token:${token}`, 'json');
    if (!data) {
      return new Response(JSON.stringify({ error: 'Token invalide ou expiré' }), {
        status: 404, headers,
      });
    }
    if (data.downloadsRemaining <= 0) {
      return new Response(JSON.stringify({ error: 'Nombre de téléchargements épuisé' }), {
        status: 410, headers,
      });
    }
    return new Response(JSON.stringify({
      token,
      product: data.product,
      downloadsRemaining: data.downloadsRemaining,
    }), { status: 200, headers });
  }

  // Sinon, chercher par session_id
  if (!sessionId) {
    return new Response(JSON.stringify({ error: 'session_id ou token requis' }), {
      status: 400, headers,
    });
  }

  // Verifier dans KV (rempli par le webhook)
  let storedToken = await env.LAWIA_TOKENS.get(`session:${sessionId}`);

  if (storedToken) {
    const data = await env.LAWIA_TOKENS.get(`token:${storedToken}`, 'json');
    return new Response(JSON.stringify({
      token: storedToken,
      product: data?.product,
      downloadsRemaining: data?.downloadsRemaining,
    }), { status: 200, headers });
  }

  // Fallback : le webhook n'a pas encore fire, verifier directement via Stripe
  try {
    const stripeRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}`,
      {
        headers: { 'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}` },
      }
    );

    if (!stripeRes.ok) {
      return new Response(JSON.stringify({ error: 'Session introuvable' }), {
        status: 404, headers,
      });
    }

    const session = await stripeRes.json();

    if (session.payment_status !== 'paid') {
      return new Response(JSON.stringify({
        status: 'pending',
        message: 'Paiement en cours de traitement. Rechargez dans quelques secondes.',
      }), { status: 202, headers });
    }

    // Le paiement est confirme mais le webhook n'a pas encore cree le token
    // On le cree ici en fallback
    return new Response(JSON.stringify({
      status: 'pending',
      message: 'Préparation de vos fichiers en cours. Rechargez dans quelques secondes.',
    }), { status: 202, headers });

  } catch (err) {
    console.error('Stripe API error:', err);
    return new Response(JSON.stringify({ error: 'Erreur de vérification' }), {
      status: 500, headers,
    });
  }
}
