import { Config } from '../constants/Config';

export const askGemini = async (prompt) => {
  try {
    if (!Config.GEMINI_API_KEY ) {
      throw new Error('Gemini API key not configured. Please add your API key to the .env file.');
    }

    console.log('📤 Sending request to Gemini with prompt:', prompt.substring(0, 100) + '...');

    const response = await fetch(`${Config.GEMINI_API_URL}?key=${Config.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    console.log('📥 Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json();
      console.log('❌ Error response:', errorData);
      throw new Error(`Gemini API Error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('📊 Full API response:', JSON.stringify(data, null, 2));
    
    if (!data.candidates || data.candidates.length === 0) {
      console.log('❌ No candidates in response');
      throw new Error('No response generated from Gemini');
    }

    const candidate = data.candidates[0];
    console.log('📋 First candidate:', JSON.stringify(candidate, null, 2));
    
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      console.log('❌ Invalid content structure in candidate');
      throw new Error('Invalid response structure from Gemini');
    }

    const result = candidate.content.parts[0].text;
    console.log('✅ Extracted result:', result?.substring(0, 100) + '...');
    
    if (!result || result.trim() === '') {
      console.log('❌ Empty result from Gemini');
      throw new Error('Empty response from Gemini');
    }
    
    return result;
  } catch (error) {
    console.error('🚨 Gemini AI Error:', error);
    throw error;
  }
};

// Helper functions for specific use cases
export const getSummary = async (text) => {
  const prompt = `Please provide a concise summary of the following text:\n\n${text}`;
  return await askGemini(prompt);
};

export const getAdvice = async (situation) => {
  const prompt = `Please provide helpful advice for the following situation:\n\n${situation}`;
  return await askGemini(prompt);
};

export const analyzeText = async (text, analysisType = 'general') => {
  const prompt = `Please analyze the following text for ${analysisType} insights:\n\n${text}`;
  return await askGemini(prompt);
};
