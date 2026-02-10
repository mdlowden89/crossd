import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { selfie_url, profile_photo_url } = await req.json();

    if (!selfie_url || !profile_photo_url) {
      return Response.json({ error: 'Missing selfie_url or profile_photo_url' }, { status: 400 });
    }

    // Use LLM to compare the two images
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an identity verification expert. Compare these two photos:
1. A selfie taken during verification
2. A profile photo from the user's account

Analyze if the SAME PERSON appears in both photos. Consider:
- Facial features (eyes, nose, mouth, face shape)
- Skin tone and complexion
- Overall appearance consistency
- Distinctiveness (can you confidently say it's the same person?)

Respond with a JSON object containing:
{
  "match_score": (0-100, where 100 is definitely the same person, 0 is definitely different),
  "is_match": (true if score > 75, false otherwise),
  "confidence": "high" | "medium" | "low",
  "reasons": ["reason1", "reason2", ...],
  "recommendation": "approve" | "reject" | "review",
  "feedback": "brief explanation for the user"
}`,
      file_urls: [selfie_url, profile_photo_url],
      response_json_schema: {
        type: 'object',
        properties: {
          match_score: { type: 'number' },
          is_match: { type: 'boolean' },
          confidence: { type: 'string' },
          reasons: { type: 'array', items: { type: 'string' } },
          recommendation: { type: 'string' },
          feedback: { type: 'string' }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});