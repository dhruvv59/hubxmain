export const runtime = 'edge';
export const contentType = 'image/svg+xml';

export default function favicon() {
  return new Response(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
      <rect width="256" height="256" fill="#ffffff"/>
      <rect x="20" y="20" width="100" height="100" rx="12" fill="#3b82f6"/>
      <rect x="136" y="20" width="100" height="100" rx="12" fill="#f97316"/>
      <rect x="20" y="136" width="100" height="100" rx="12" fill="#a855f7"/>
      <rect x="136" y="136" width="100" height="100" rx="12" fill="#eab308"/>
    </svg>`,
    {
      headers: {
        'Content-Type': 'image/svg+xml',
      },
    }
  );
}
