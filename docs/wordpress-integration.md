# WordPress-koppeling

Leads uit WordPress-formulieren (Contact Form 7, WPForms, Gravity Forms) komen binnen via:

```
POST /api/webhooks/wordpress
Content-Type: application/json
X-Webhook-Secret: <WORDPRESS_WEBHOOK_SECRET>   # alleen als geconfigureerd
```

## Payload

De webhook is flexibel met veldnamen. Herkende sleutels (incl. varianten):

| Lead-veld | Geaccepteerde sleutels |
|---|---|
| Naam | `name`, `your-name`, `full_name`, of `first_name` + `last_name` |
| E-mail | `email`, `your-email`, `email_address` |
| Telefoon | `phone`, `tel`, `telephone`, `your-phone` |
| Bedrijf | `company`, `company_name`, `bedrijf` |
| Bericht | `message`, `your-message`, `bericht` |
| Bron | `utm_source`, `utm_medium`, `gclid`, `fbclid`, `referrer` |

De **bron** (SEO/SEA/Social/Direct) wordt automatisch bepaald uit de UTM-parameters,
click-ids (`gclid`/`fbclid`) en de referrer.

## Voorbeeld (curl)

```bash
curl -X POST http://localhost:4000/api/webhooks/wordpress \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jan Jansen",
    "email": "jan@voorbeeldbv.nl",
    "company": "Voorbeeld BV",
    "message": "Graag een offerte",
    "utm_medium": "cpc",
    "gclid": "abc123"
  }'
# -> { "ok": true, "id": "...", "source": "SEA" }
```

## WordPress-snippet (functions.php)

Stuurt elke Contact Form 7-submit door naar het dashboard. Pas `DASHBOARD_URL` en
`WEBHOOK_SECRET` aan.

```php
add_action('wpcf7_mail_sent', function ($contact_form) {
    $submission = WPCF7_Submission::get_instance();
    if (!$submission) return;
    $data = $submission->get_posted_data();

    $payload = array(
        'name'       => $data['your-name']    ?? '',
        'email'      => $data['your-email']   ?? '',
        'phone'      => $data['your-phone']   ?? '',
        'company'    => $data['your-company'] ?? '',
        'message'    => $data['your-message'] ?? '',
        'utm_source' => $_COOKIE['utm_source'] ?? '',
        'utm_medium' => $_COOKIE['utm_medium'] ?? '',
        'gclid'      => $_COOKIE['gclid']      ?? '',
        'fbclid'     => $_COOKIE['fbclid']     ?? '',
        'referrer'   => $_SERVER['HTTP_REFERER'] ?? '',
    );

    wp_remote_post('https://DASHBOARD_URL/api/webhooks/wordpress', array(
        'headers' => array(
            'Content-Type'     => 'application/json',
            'X-Webhook-Secret' => 'WEBHOOK_SECRET',
        ),
        'body'    => wp_json_encode($payload),
        'timeout' => 10,
    ));
});
```

> Tip: bewaar UTM-parameters en click-ids in cookies bij landing, zodat ze bij de
> formulier-submit beschikbaar zijn voor correcte bronherkenning.
