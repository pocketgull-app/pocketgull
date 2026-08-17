import { genkit, z } from 'genkit';
// Google GenAI Plugin (@genkit-ai/google-genai)
import { googleAI } from '@genkit-ai/google-genai';

// Polyfill fetch to append our referer and bypass strict API key restrictions
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url: any, options: any = {}) => {
  const urlString = typeof url === 'string' ? url : (url && url.url ? url.url : url.toString());
  let isTarget = false;
  try {
    const parsed = new URL(urlString);
    isTarget = parsed.hostname === 'generativelanguage.googleapis.com';
  } catch (e) {}

  if (isTarget) {
    const newHeaders: Record<string, string> = { 'Referer': 'https://pocketgull.app' };
    
    if (options.headers) {
      if (typeof options.headers.entries === 'function') {
        for (const [key, value] of options.headers.entries()) {
          newHeaders[key] = value;
        }
      } else {
        Object.entries(options.headers).forEach(([key, value]) => {
          newHeaders[key] = value as string;
        });
      }
    }
    
    options.headers = newHeaders;
  }
  return originalFetch(url, options);
};

// Initialize Genkit with @genkit-ai/googleai
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env['GEMINI_API_KEY'] || process.env['GOOGLE_GENAI_API_KEY']
    })
  ],
  model: 'googleai/gemini-2.5-flash',
});

// 1. Generate Metrics Flow
export const generateMetricsFlow = ai.defineFlow(
  {
    name: 'generateMetricsFlow',
    inputSchema: z.string().describe('Clinical report text'),
    outputSchema: z.object({
        complexity: z.number().min(0).max(10),
        stability: z.number().min(0).max(10),
        certainty: z.number().min(0).max(10)
    }),
  },
  async (reportText) => {
    const prompt = `Analyze the following clinical report and patient data. 
    Extract three key metrics on a scale of 0 to 10:
    1. Clinical Complexity (0 = Simple/Routine, 10 = Highly Complex/Multimorbid)
    2. Clinical Stability (0 = Unstable/Acute, 10 = Stable/Compensated)
    3. Global Certainty (0 = Speculative/Needs Data, 10 = Definitive/Clear)

    Report:
    ${reportText.substring(0, 3000)}

    Return ONLY a JSON object with this exact structure:
    {"complexity": number, "stability": number, "certainty": number}`;

    const response = await ai.generate({
      prompt,
      config: {
        temperature: 0,
        responseMimeType: 'application/json',
        // Clinical CDS Safety Policy: See SECURITY.md §2
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'OFF' }
        ]
      }
    });

    const data = JSON.parse(response.text);
    return data;
  }
);

// 2. Detect Clinical Changes Flow
export const detectClinicalChangesFlow = ai.defineFlow(
  {
    name: 'detectClinicalChangesFlow',
    inputSchema: z.object({
      oldData: z.string(),
      newData: z.string()
    }),
    outputSchema: z.boolean(),
  },
  async ({ oldData, newData }) => {
    const prompt = `Compare these two clinical snapshots and determine if the difference is CLINICALLY SIGNIFICANT (e.g., new symptoms, medication changes, vital sign shifts, or new diagnoses). 
    If the changes are only cosmetic (typos, formatting, minor phrasing), respond with "FALSE". 
    If the changes are clinically meaningful, respond with "TRUE".
    
    OLD DATA: "${oldData.substring(0, 1000)}"
    NEW DATA: "${newData.substring(0, 1000)}"
    
    SIGNIFICANT? (TRUE/FALSE):`;

    const response = await ai.generate({
      prompt,
      config: {
        temperature: 0,
        // Clinical CDS Safety Policy: See SECURITY.md §2
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'OFF' }
        ]
      }
    });

    return response.text.toUpperCase().includes('TRUE');
  }
);

// 3. Translate Reading Level Flow
export const translateReadingLevelFlow = ai.defineFlow(
    {
      name: 'translateReadingLevelFlow',
      inputSchema: z.object({
        text: z.string(),
        level: z.string().optional(),
        cognitiveLevel: z.enum(['standard', 'simplified', 'dyslexia', 'child']).optional(),
        language: z.string().optional()
      }),
      outputSchema: z.string(),
    },
    async ({ text, level, cognitiveLevel, language }) => {
      let resolvedCognitiveLevel = cognitiveLevel || 'standard';
      let resolvedLanguage = language || 'english';

      if (level) {
        if (['simplified', 'dyslexia', 'child'].includes(level)) {
          resolvedCognitiveLevel = level as 'simplified' | 'dyslexia' | 'child';
        } else if (['spanish', 'german', 'french', 'japanese', 'hindi'].includes(level)) {
          resolvedLanguage = level;
        }
      }

      let systemInstruction = '';
      let cognitiveInstruction = '';

      if (resolvedCognitiveLevel === 'simplified') {
        cognitiveInstruction = `You are an expert clinical copywriter. Your task is to rewrite the provided medical text to improve its Flesch Reading Ease score and lower its Flesch-Kincaid Grade level (target: Grade 6-8). 
        
CRITICAL SIMPLIFIED RULES:
1. Preserve ALL clinical facts, diagnoses, medications, and dosages exactly.
2. Use shorter sentences.
3. Replace complex medical jargon with simpler terms where possible, but keep the original term in parentheses if it's important (e.g., "high blood pressure (hypertension)").
4. Use active voice.
5. Use bullet points for lists.`;
      } else if (resolvedCognitiveLevel === 'dyslexia') {
        cognitiveInstruction = `You are an expert in accessible communication. Your task is to rewrite the provided medical text to be Dyslexia-friendly and highly readable.

CRITICAL DYSLEXIA RULES:
1. Preserve ALL clinical facts, diagnoses, medications, and dosages exactly.
2. Structure the text with frequent line breaks and very short paragraphs (1-2 sentences max).
3. Use plain, everyday language (target very high Flesch Reading Ease).
4. Use **bold** text to highlight key points instead of italics or underlining.
5. Provide clear, step-by-step instructions using bullet points or numbered lists.
6. Avoid medical jargon; explain concepts simply.`;
      } else if (resolvedCognitiveLevel === 'child') {
        cognitiveInstruction = `You are an expert pediatric communicator and child life specialist. Your task is to rewrite the provided medical text so it is easily understandable, comforting, and engaging for a child (target age: 8-12 years old) to explain what is wrong with the patient.

CRITICAL PEDIATRIC RULES:
1. Explain medical concepts using simple, everyday analogies (e.g., "white blood cells are like tiny superheroes").
2. Focus on what the child will experience, how they will feel, and what they can do to help.
3. Keep the tone encouraging, warm, and not scary.
4. Preserve the core meaning of diagnoses and treatments, but omit overly complex dosage specifics unless relevant to the child's actions.
5. Use short sentences and simple formatting.`;
      } else {
        cognitiveInstruction = `You are an expert clinical copywriter. Your task is to write/format the clinical care plan in standard medical detail/structure. Keep the tone professional, clinical, and accurate.`;
      }

      let languageInstruction = '';
      if (resolvedLanguage.toLowerCase() !== 'english') {
        languageInstruction = `Translate/write the final output accurately into ${resolvedLanguage}. Use professional, culturally appropriate medical language for ${resolvedLanguage}. Keep specific medication names and complex dosages in standard English or transliterated pronunciations if commonly used to ensure patient safety. Do not add or remove any clinical information.`;
      } else {
        languageInstruction = `The final response MUST be written in English.`;
      }

      systemInstruction = `${cognitiveInstruction}

${languageInstruction}

CRITICAL RULES:
1. Preserve ALL clinical facts, diagnoses, medications, and dosages exactly.
2. Return ONLY the rewritten/translated markdown text, with no introductory or concluding remarks.
3. Begin your output with "### [START CARE PLAN]" and end it with "### [END CARE PLAN]".`;

      const prompt = `Please rewrite the following care plan text according to your system instructions:\n\n<clinical_text>\n${text}\n</clinical_text>`;

      const response = await ai.generate({
        prompt,
        system: systemInstruction,
        config: {
          temperature: 0.2,
          // Clinical CDS Safety Policy: See SECURITY.md §2
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'OFF' }
          ]
        }
      });

      let cleaned = response.text || '';
      // Strip starting tags
      cleaned = cleaned.replace(/^\s*(?:###?\s*)?\[?START CARE PLAN\]?\s*/i, '');
      // Strip ending tags
      cleaned = cleaned.replace(/\s*(?:###?\s*)?\[?END CARE PLAN\]?\s*$/i, '');
      cleaned = cleaned.trim();

      // Guard against empty responses (safety filter blocked everything)
      if (!cleaned) {
        throw new Error('Translation returned empty — safety filter may have blocked clinical content. Falling back to local cognitive transformation.');
      }

      return cleaned;
    }
);

// 4. Analyze Translation Flow
export const analyzeTranslationFlow = ai.defineFlow(
    {
      name: 'analyzeTranslationFlow',
      inputSchema: z.object({
        original: z.string(),
        translated: z.string()
      }),
      outputSchema: z.string(),
    },
    async ({ original, translated }) => {
      const prompt = `Analyze the following translated/adjusted clinical text against the original text.
Provide a brief critique (2-3 sentences) on:
1. Did it maintain clinical accuracy?
2. Is the tone appropriate for the target audience?
3. Were any important details lost?

ORIGINAL TEXT:
${original}

TRANSLATED TEXT:
${translated}

CRITIQUE:`;

      const response = await ai.generate({
        prompt,
        config: { 
          temperature: 0.2,
          // Clinical CDS Safety Policy: See SECURITY.md §2
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'OFF' }
          ]
        }
      });
      return response.text;
    }
);

// 5. Analyze Image Flow (Multi-modal)
export const analyzeImageFlow = ai.defineFlow(
    {
      name: 'analyzeImageFlow',
      inputSchema: z.object({
        base64Image: z.string(),
        context: z.string().optional()
      }),
      outputSchema: z.string(),
    },
    async ({ base64Image, context }) => {
      // Remove data URL prefix if present
      const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
      
      const prompt = `You are a world-class radiologist and clinical expert. Please analyze this medical image.
${context ? 'Additional Context: ' + context : ''}

In accordance with the joint European and North American Multisociety Statement on the Ethics of AI in Radiology, this analysis is designed to promote patient well-being, minimize harm, and mitigate bias. Ultimate responsibility and accountability for clinical diagnosis remain strictly with the human operator.

Please provide:
1. Identifying visual findings (what is seen).
2. Clinical interpretation (what it likely means).
3. If applicable, recommend next steps or considerations.

Note: This is an AI preliminary analysis for decision-support, not an official diagnostic read. Respond with clear, structured Markdown.`;

      const response = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              { text: prompt },
              { media: { url: `data:image/jpeg;base64,${base64Data}` } }
            ]
          }
        ],
        config: { 
          temperature: 0.1,
          // Clinical CDS Safety Policy (Imaging): See SECURITY.md §2
          // Medical imaging (X-rays, dermatology, wound assessment) requires
          // fully permissive settings to avoid false-positive blocking.
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'OFF' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'OFF' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'OFF' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'OFF' }
          ]
        }
      });
      
      return response.text;
    }
);

// 6. Synthesize Knowledge Flow
export const synthesizeKnowledgeFlow = ai.defineFlow(
    {
      name: 'synthesizeKnowledgeFlow',
      inputSchema: z.object({
        inputText: z.string()
      }),
      outputSchema: z.array(z.object({
        id: z.string(),
        title: z.string(),
        content: z.string(),
        type: z.enum(['Urgent Signal', 'Action Item', 'Context', 'Unknown']),
        confidence: z.number().min(0).max(100)
      })),
    },
    async ({ inputText }) => {
      const prompt = `Analyze the following clinical intake text and distill it into structured insights.
For each distinct insight, determine its type:
- "Urgent Signal" for critical risks, red flags, or severe distress.
- "Action Item" for things that require follow-up, scheduling, or immediate clinical tasks.
- "Context" for relevant background info (e.g. social history, diet).
- "Unknown" if it doesn't fit the others.

Assign a confidence score (0-100) based on how explicit the information is.

Intake Text:
${inputText.substring(0, 5000)}

Return ONLY a JSON array of objects with this exact structure:
[
  { "id": "unique-id", "title": "Short Title", "content": "Detailed explanation", "type": "...", "confidence": 95 }
]`;

      const response = await ai.generate({
        prompt,
        config: {
          temperature: 0.1,
          responseMimeType: 'application/json',
          // Clinical CDS Safety Policy: See SECURITY.md §2
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'OFF' }
          ]
        }
      });

      return JSON.parse(response.text);
    }
);

// 7. Scan Document Flow (OCR & Clinical Extraction)
export const scanDocumentFlow = ai.defineFlow(
  {
    name: 'scanDocumentFlow',
    inputSchema: z.object({
      base64Image: z.string(),
      context: z.string().optional()
    }),
    outputSchema: z.object({
      name: z.string().optional(),
      age: z.number().optional(),
      gender: z.string().optional(),
      vitals: z.object({
        bp: z.string().optional(),
        hr: z.string().optional(),
        temp: z.string().optional(),
        spO2: z.string().optional(),
        weight: z.string().optional(),
        height: z.string().optional()
      }).optional(),
      issues: z.array(z.object({
        partId: z.string(),
        name: z.string(),
        severity: z.enum(['mild', 'moderate', 'critical']),
        notes: z.string()
      })).optional(),
      medications: z.array(z.object({
        name: z.string(),
        dosage: z.string(),
        frequency: z.string()
      })).optional(),
      notes: z.array(z.string()).optional(),
      patientGoals: z.string().optional()
    })
  },
  async ({ base64Image, context }) => {
    // Remove data URL prefix if present but extract format
    let mimeType = 'image/jpeg';
    const match = base64Image.match(/^data:([^;]+);base64,/);
    if (match) {
      mimeType = match[1];
    }
    const base64Data = base64Image.replace(/^data:[^;]+;base64,/, "");

    const prompt = `You are a clinical expert assistant. Analyze the provided clinical document or image (e.g. lab report, clinical chart, patient intake questionnaire, or medical notes).
Perform OCR and extract all patient attributes. 
${context ? 'Additional Context: ' + context : ''}

Strictly map any extracted clinical issues or symptoms to one of the following exact partId strings if applicable:
- head
- chest
- abdomen
- pelvis
- r_shoulder
- l_shoulder
- r_arm
- l_arm
- r_hand
- l_hand
- r_thigh
- l_thigh
- r_shin
- l_shin
- r_foot
- l_foot

Return all results structured into the response schema.`;

    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      messages: [
        {
          role: 'user',
          content: [
            { text: prompt },
            { media: { contentType: mimeType, url: `data:${mimeType};base64,${base64Data}` } }
          ]
        }
      ],
      config: {
        temperature: 0.15,
        responseMimeType: 'application/json',
        responseSchema: z.object({
          name: z.string().optional(),
          age: z.number().optional(),
          gender: z.string().optional(),
          vitals: z.object({
            bp: z.string().optional(),
            hr: z.string().optional(),
            temp: z.string().optional(),
            spO2: z.string().optional(),
            weight: z.string().optional(),
            height: z.string().optional()
          }).optional(),
          issues: z.array(z.object({
            partId: z.string(),
            name: z.string(),
            severity: z.enum(['mild', 'moderate', 'critical']),
            notes: z.string()
          })).optional(),
          medications: z.array(z.object({
            name: z.string(),
            dosage: z.string(),
            frequency: z.string()
          })).optional(),
          notes: z.array(z.string()).optional(),
          patientGoals: z.string().optional()
        })
      }
    });

    return JSON.parse(response.text);
  }
);

// 8. Analyze Medical Wound & Dermatology Flow (Multimodal Clinical Vision)
export const analyzeMedicalWoundDermatologyFlow = ai.defineFlow(
  {
    name: 'analyzeMedicalWoundDermatologyFlow',
    inputSchema: z.object({
      base64Image: z.string(),
      anatomicalSite: z.string().optional(),
      patientSymptoms: z.string().optional()
    }),
    outputSchema: z.object({
      primaryObservation: z.string(),
      woundClassification: z.enum(['Erythema', 'Ulceration', 'Laceration', 'Burn', 'Surgical Wound', 'Dermatological Rash', 'Intact Skin', 'Other']),
      severityTier: z.enum(['Mild', 'Moderate', 'Severe', 'Critical Red Flag']),
      surfaceAreaMmEstimate: z.string().optional(),
      exudateDescription: z.string().optional(),
      erythemaMarginCm: z.number().optional(),
      recommendedClinicalAction: z.string()
    })
  },
  async ({ base64Image, anatomicalSite, patientSymptoms }) => {
    let mimeType = 'image/jpeg';
    const match = base64Image.match(/^data:([^;]+);base64,/);
    if (match) mimeType = match[1];
    const base64Data = base64Image.replace(/^data:[^;]+;base64,/, '');

    const prompt = `You are an expert clinical dermatologist and wound care specialist. Analyze the provided clinical photograph.
Perform a systematic visual assessment:
1. Identify primary lesion / wound characteristics (erythema, ulceration, border regularity, exudate).
2. Classify severity tier and estimate affected surface area margin.
3. Recommend standard-of-care clinical actions (e.g. debridement, culture, urgent surgical consult, topical barrier).
${anatomicalSite ? 'Anatomical Site: ' + anatomicalSite : ''}
${patientSymptoms ? 'Reported Symptoms: ' + patientSymptoms : ''}`;

    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      messages: [
        {
          role: 'user',
          content: [
            { text: prompt },
            { media: { contentType: mimeType, url: `data:${mimeType};base64,${base64Data}` } }
          ]
        }
      ],
      config: {
        temperature: 0.1,
        responseMimeType: 'application/json',
        // Clinical CDS Imaging Safety Policy: See SECURITY.md §2 (All categories OFF for medical imaging)
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'OFF' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'OFF' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'OFF' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'OFF' }
        ]
      }
    });

    return JSON.parse(response.text);
  }
);

