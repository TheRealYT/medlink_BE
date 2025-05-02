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
                    text: `Given the following condition: "${description}", return only a JSON array of relevant medicine names. No explanation, no markdown, no code blocks. Example format: ["Medicine1", "Medicine2"]`,
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
        const medicines: unknown[] = JSON.parse(text);
        if (Array.isArray(medicines)) {
          return medicines.filter((m) => typeof m == 'string');
        }
      }
    } catch (err) {
      logger.error('Failed to parse AI response text: ', err);
    }

    return [];
  }
}

export default new AIService();
