const RECIPIENT_EMAIL = 'myynti@kukakuskaa.com';
const RESEND_ENDPOINT = 'https://api.resend.com/emails';

const FIELD_LIMITS = {
  name: 120,
  company: 160,
  phone: 40,
  email: 254,
  projectType: 120,
  description: 4000,
  website: 120,
};

function json(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  if (typeof req.body === 'string') {
    return JSON.parse(req.body);
  }

  return {};
}

function clean(value, limit) {
  return String(value || '').trim().slice(0, limit);
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function validate(payload) {
  const values = {};
  const errors = {};

  for (const [field, limit] of Object.entries(FIELD_LIMITS)) {
    values[field] = clean(payload[field], limit);
  }

  for (const field of ['name', 'email', 'projectType', 'description']) {
    if (!values[field]) {
      errors[field] = 'Required';
    }
  }

  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Invalid email';
  }

  if (values.website) {
    errors.website = 'Invalid submission';
  }

  return { values, errors };
}

function buildEmail(values) {
  const rows = [
    ['Nimi / Name', values.name],
    ['Yritys / Company', values.company || '-'],
    ['Puhelin / Phone', values.phone || '-'],
    ['Sähköposti / Email', values.email],
    ['Projektin tyyppi / Project type', values.projectType],
    ['Kuvaus / Description', values.description],
  ];

  const text = [
    'Uusi yhteydenotto kukakuskaapro.com-sivustolta.',
    '',
    ...rows.map(([label, value]) => `${label}: ${value}`),
  ].join('\n');

  const htmlRows = rows
    .map(([label, value]) => {
      return `<p><strong>${escapeHtml(label)}:</strong><br>${escapeHtml(value).replace(/\n/g, '<br>')}</p>`;
    })
    .join('');

  return {
    subject: `Uusi yhteydenotto: ${values.projectType}`,
    text,
    html: `<p>Uusi yhteydenotto kukakuskaapro.com-sivustolta.</p>${htmlRows}`,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { ok: false, message: 'Method not allowed' });
  }

  let payload;
  try {
    payload = parseBody(req);
  } catch {
    return json(res, 400, { ok: false, message: 'Invalid request' });
  }

  const { values, errors } = validate(payload);
  if (Object.keys(errors).length > 0) {
    return json(res, 400, { ok: false, message: 'Validation failed', errors });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !from) {
    return json(res, 500, { ok: false, message: 'Email service is not configured' });
  }

  const email = buildEmail(values);

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: RECIPIENT_EMAIL,
        reply_to: values.email,
        subject: email.subject,
        text: email.text,
        html: email.html,
      }),
    });

    if (!response.ok) {
      return json(res, 502, { ok: false, message: 'Email service rejected the message' });
    }

    return json(res, 200, { ok: true });
  } catch {
    return json(res, 502, { ok: false, message: 'Email service is unavailable' });
  }
}
