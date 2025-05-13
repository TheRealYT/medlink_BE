import { getEnv } from '@/config';
import { logger } from '@/utils';

class AIService {
  async getMedicines(description: string) {
    const apiKey = getEnv('GEMINI_API_KEY');

    let response: Response;

    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an AI medicine-finding assistant inside an app called MedLink. Your job is to help users find appropriate medicines. Given the following condition: "${description}", return only a raw JSON data based on the given example format. No markdown, no code blocks. Example format: {"medicines": ["Medicine1", "Medicine2"], "explain": "User friendly explanation."}`,
                  },
                ],
              },
            ],
          }),
        },
      );
    } catch (err) {
      logger.error('Failed to ask AI: ', err);
      return [];
    }

    try {
      const data: { candidates: { content: { parts: { text: string }[] } }[] } =
        await response.json();
      if (
        'candidates' in data &&
        Array.isArray(data.candidates) &&
        data.candidates.length > 0
      ) {
        const text = data.candidates[0].content?.parts?.[0]?.text;
        const result: { medicines: unknown[]; explain: unknown } =
          JSON.parse(text);

        if (Array.isArray(result.medicines)) {
          return {
            medicines: result.medicines.filter((m) => typeof m == 'string'),
            explanation:
              typeof result.explain == 'string'
                ? result.explain
                : 'No explanation.',
          };
        }
      }
    } catch (err) {
      logger.error('Failed to parse AI response text: ', err);
    }

    return { medicines: [], explanation: 'No explanation.' };
  }
}

export default new AIService();
