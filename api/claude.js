export const maxDuration = 60;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  
  const body = req.body;
  
  // For PDF documents, add disable_image_types to speed up processing
  if (body.messages) {
    body.messages = body.messages.map(msg => {
      if (Array.isArray(msg.content)) {
        msg.content = msg.content.map(block => {
          if (block.type === 'document') {
            return { ...block, source: { ...block.source }, citations: { enabled: false } };
          }
          return block;
        });
      }
      return msg;
    });
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'pdfs-2024-09-25'
    },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  res.status(200).json(data);
}
