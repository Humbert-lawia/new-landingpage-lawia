// Module partage pour l'envoi d'emails via Resend
const RESEND_API = 'https://api.resend.com/emails';

export async function sendPurchaseEmail({ to, prenom, product, downloadUrl, apiKey }) {
  const subject = `LawIA — Votre ${product} est prêt à télécharger`;
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#FAF9F5;font-family:Calibri,'Gill Sans',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border:3px solid #141413;border-radius:12px;overflow:hidden;">
    <div style="background:#141413;padding:24px 32px;">
      <span style="font-family:Georgia,serif;font-size:1.4rem;font-weight:700;color:#FAF9F5;">Law<span style="color:#6A9BCC;">IA</span></span>
    </div>
    <div style="padding:32px;">
      <h1 style="font-family:Georgia,serif;font-size:1.5rem;color:#141413;margin:0 0 16px;">Merci pour votre achat${prenom ? `, ${prenom}` : ''} !</h1>
      <p style="color:#141413;line-height:1.7;margin:0 0 16px;">Votre <strong>${product}</strong> est prêt. Cliquez sur le bouton ci-dessous pour le télécharger.</p>
      <a href="${downloadUrl}" style="display:inline-block;padding:12px 28px;background:#141413;color:#FAF9F5;font-weight:700;text-decoration:none;border-radius:4px;border:3px solid #141413;font-size:0.95rem;">Télécharger mes Skills →</a>
      <p style="color:#B0AEA5;font-size:0.85rem;margin:20px 0 0;line-height:1.6;">Ce lien est valable 7 jours et permet 5 téléchargements. En cas de problème, contactez-nous à <a href="mailto:contact@lawia.fr" style="color:#4A7BA8;">contact@lawia.fr</a>.</p>
    </div>
    <div style="border-top:2px solid #E8E6DC;padding:16px 32px;text-align:center;">
      <p style="color:#B0AEA5;font-size:0.75rem;margin:0;">LawIA SAS — SIREN 990 961 120</p>
    </div>
  </div>
</body>
</html>`;

  const res = await fetch(RESEND_API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'LawIA <noreply@lawia.fr>',
      to: [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Resend error:', err);
    throw new Error(`Email sending failed: ${res.status}`);
  }

  return res.json();
}

export async function sendFreePackEmail({ to, prenom, downloadUrl, apiKey }) {
  const subject = 'LawIA — Vos 2 Skills gratuits sont prêts';
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#FAF9F5;font-family:Calibri,'Gill Sans',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border:3px solid #141413;border-radius:12px;overflow:hidden;">
    <div style="background:#141413;padding:24px 32px;">
      <span style="font-family:Georgia,serif;font-size:1.4rem;font-weight:700;color:#FAF9F5;">Law<span style="color:#6A9BCC;">IA</span></span>
    </div>
    <div style="padding:32px;">
      <h1 style="font-family:Georgia,serif;font-size:1.5rem;color:#141413;margin:0 0 16px;">Bienvenue${prenom ? ` ${prenom}` : ''} !</h1>
      <p style="color:#141413;line-height:1.7;margin:0 0 12px;">Vos 2 Skills gratuits sont prêts :</p>
      <ul style="color:#141413;line-height:1.8;margin:0 0 20px;padding-left:20px;">
        <li><strong>Bordereau de pièces</strong> — génération automatique</li>
        <li><strong>Vérificateur de sources</strong> — contrôle anti-hallucination</li>
      </ul>
      <a href="${downloadUrl}" style="display:inline-block;padding:12px 28px;background:#141413;color:#FAF9F5;font-weight:700;text-decoration:none;border-radius:4px;border:3px solid #141413;font-size:0.95rem;">Télécharger mes 2 Skills →</a>
      <p style="color:#B0AEA5;font-size:0.85rem;margin:20px 0 0;line-height:1.6;">Ce lien est valable 48h et permet 3 téléchargements.</p>
      <hr style="border:none;border-top:1px solid #E8E6DC;margin:24px 0;">
      <p style="color:#141413;font-size:0.9rem;line-height:1.6;">Envie d'aller plus loin ? Le <strong>Pack 5 Skills</strong> est disponible à 250 € HT, paiement unique.</p>
      <a href="https://lawia.fr/tarifs.html" style="color:#4A7BA8;font-weight:700;text-decoration:none;font-size:0.9rem;">Voir les tarifs →</a>
    </div>
    <div style="border-top:2px solid #E8E6DC;padding:16px 32px;text-align:center;">
      <p style="color:#B0AEA5;font-size:0.75rem;margin:0;">LawIA SAS — SIREN 990 961 120</p>
    </div>
  </div>
</body>
</html>`;

  const res = await fetch(RESEND_API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'LawIA <noreply@lawia.fr>',
      to: [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Resend error:', err);
    throw new Error(`Email sending failed: ${res.status}`);
  }

  return res.json();
}
