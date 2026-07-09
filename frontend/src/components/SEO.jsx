import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'FormSahay Portal';
const SITE_URL = 'https://form-sahay-portal.vercel.app';
const DEFAULT_DESC = 'AI-powered assistant for Indian government welfare schemes. Analyze notices, check eligibility, and verify documents.';
const DEFAULT_IMAGE = '/og-image.png';

export default function SEO({ title, description, image, noindex = false, jsonLd }) {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - AI Government Scheme Assistant`;
  const desc = description || DEFAULT_DESC;
  const img = image || DEFAULT_IMAGE;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={desc} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={SITE_URL} />
      <meta property="og:image" content={img} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
