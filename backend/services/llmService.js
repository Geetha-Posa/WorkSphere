const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');

const TASK_TYPE_ENUM = [
  'ui-design',
  'backend-dev',
  'frontend-dev',
  'security-patch',
  'bugfix',
  'infrastructure',
  'content-writing',
  'qa-testing',
  'research',
  'documentation',
  'other',
];

const PRIORITY_ENUM = ['low', 'medium', 'high'];
const DIFFICULTY_ENUM = ['low', 'medium', 'high'];

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    title: {
      type: SchemaType.STRING,
      description: 'Concise title of the task.',
    },
    summary: {
      type: SchemaType.STRING,
      description: '1-2 sentence summary of the task.',
    },
    project: {
      type: SchemaType.STRING,
      nullable: true,
      description: 'Project name stated in document, or null if absent.',
    },
    taskType: {
      type: SchemaType.STRING,
      format: 'enum',
      enum: TASK_TYPE_ENUM,
      description: 'Category/type of the task.',
    },
    requiredSkills: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.STRING,
      },
      description:
        '2-5 required skills (prefer UI design, UX research, prototyping, branding, motion graphics, network security, API development, database design, TLS/SSL configuration, DevOps, testing, technical writing; allow close matches).',
    },
    deliverables: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.STRING,
      },
      description: '2-4 short strings describing key deliverables.',
    },
    deadline: {
      type: SchemaType.STRING,
      nullable: true,
      description: 'Deadline as an ISO date string (e.g. YYYY-MM-DD), or null if absent.',
    },
    priority: {
      type: SchemaType.STRING,
      format: 'enum',
      enum: PRIORITY_ENUM,
      description: 'Priority stated in document: low, medium, or high.',
    },
    difficulty: {
      type: SchemaType.STRING,
      format: 'enum',
      enum: DIFFICULTY_ENUM,
      description: 'Estimated difficulty: low, medium, or high.',
    },
  },
  required: [
    'title',
    'summary',
    'project',
    'taskType',
    'requiredSkills',
    'deliverables',
    'deadline',
    'priority',
    'difficulty',
  ],
};

const decodeHtmlEntities = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
};

const validateSummaryJson = (obj) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    throw new Error('LLM response is not a valid JSON object');
  }

  const requiredKeys = [
    'title',
    'summary',
    'project',
    'taskType',
    'requiredSkills',
    'deliverables',
    'deadline',
    'priority',
    'difficulty',
  ];

  for (const key of requiredKeys) {
    if (!(key in obj)) {
      throw new Error(`Missing required key: ${key}`);
    }
  }

  if (typeof obj.title !== 'string' || !obj.title.trim()) {
    throw new Error('title must be a non-empty string');
  }

  if (typeof obj.summary !== 'string' || !obj.summary.trim()) {
    throw new Error('summary must be a non-empty string');
  }

  if (obj.project !== null && typeof obj.project !== 'string') {
    throw new Error('project must be a string or null');
  }

  const normTaskType = typeof obj.taskType === 'string' ? obj.taskType.toLowerCase() : '';
  if (!TASK_TYPE_ENUM.includes(normTaskType)) {
    throw new Error(`taskType must be one of: ${TASK_TYPE_ENUM.join(', ')}. Got: ${obj.taskType}`);
  }

  if (!Array.isArray(obj.requiredSkills) || obj.requiredSkills.some((s) => typeof s !== 'string')) {
    throw new Error('requiredSkills must be an array of strings');
  }

  if (!Array.isArray(obj.deliverables) || obj.deliverables.some((d) => typeof d !== 'string')) {
    throw new Error('deliverables must be an array of strings');
  }

  if (obj.deadline !== null && typeof obj.deadline !== 'string') {
    throw new Error('deadline must be an ISO date string or null');
  }

  const normPriority = typeof obj.priority === 'string' ? obj.priority.toLowerCase() : '';
  if (!PRIORITY_ENUM.includes(normPriority)) {
    throw new Error(`priority must be one of: ${PRIORITY_ENUM.join(', ')}. Got: ${obj.priority}`);
  }

  const normDifficulty = typeof obj.difficulty === 'string' ? obj.difficulty.toLowerCase() : '';
  if (!DIFFICULTY_ENUM.includes(normDifficulty)) {
    throw new Error(`difficulty must be one of: ${DIFFICULTY_ENUM.join(', ')}. Got: ${obj.difficulty}`);
  }

  return {
    title: obj.title.trim(),
    summary: obj.summary.trim(),
    project: typeof obj.project === 'string' && obj.project.trim() ? obj.project.trim() : null,
    taskType: normTaskType,
    requiredSkills: obj.requiredSkills.map((s) => s.trim()).filter(Boolean),
    deliverables: obj.deliverables.map((d) => d.trim()).filter(Boolean),
    deadline: typeof obj.deadline === 'string' && obj.deadline.trim() ? obj.deadline.trim() : null,
    priority: normPriority,
    difficulty: normDifficulty,
  };
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isTransientError = (err) => {
  if (!err) return false;
  const status = err.status || err.statusCode || (err.response && err.response.status);
  if (status === 429 || status === 500 || status === 502 || status === 503 || status === 504) {
    return true;
  }
  const msg = (err.message || '').toLowerCase();
  return (
    msg.includes('429') ||
    msg.includes('resource_exhausted') ||
    msg.includes('quota') ||
    msg.includes('rate limit') ||
    msg.includes('ratelimit') ||
    msg.includes('overloaded') ||
    msg.includes('503') ||
    msg.includes('unavailable') ||
    msg.includes('econnreset') ||
    msg.includes('etimedout') ||
    msg.includes('fetch failed') ||
    msg.includes('network')
  );
};

/**
 * Summarizes task document extractedText using Gemini API with structured JSON output.
 * @param {string} extractedText - Text extracted from task document
 * @returns {Promise<object|null>} Validated summary object or null on final failure
 */
const summarizeTask = async (extractedText) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL;

    if (!apiKey || !apiKey.trim()) {
      console.error('GEMINI_API_KEY environment variable is missing.');
      return null;
    }

    if (!modelName || !modelName.trim()) {
      console.error('GEMINI_MODEL environment variable is missing.');
      return null;
    }

    // Preprocess the input: decode HTML entities (&amp; -> &) and trim
    const preprocessed = decodeHtmlEntities(extractedText || '').trim();
    if (!preprocessed) {
      console.error('summarizeTask error: extractedText is empty after preprocessing.');
      return null;
    }

    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const model = genAI.getGenerativeModel({
      model: modelName.trim(),
      systemInstruction:
        'extract only what the document states; null deadline if absent; use the document’s stated priority; don’t invent project names.',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema,
      },
    });

    const maxRetries = 2;
    let lastError = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await model.generateContent(preprocessed);
        const response = await result.response;
        const text = response.text();
        const parsed = JSON.parse(text);
        const validated = validateSummaryJson(parsed);
        return validated;
      } catch (err) {
        lastError = err;
        if (attempt < maxRetries && isTransientError(err)) {
          const backoffMs = 1000 * (attempt + 1);
          console.warn(
            `Transient error during Gemini summarization (attempt ${attempt + 1}/${maxRetries + 1}): ${err.message}. Retrying in ${backoffMs}ms...`
          );
          await sleep(backoffMs);
          continue;
        }
        break;
      }
    }

    console.error('Gemini summarization failed:', lastError);
    return null;
  } catch (err) {
    console.error('Gemini summarization unexpected error:', err);
    return null;
  }
};

module.exports = {
  summarizeTask,
  decodeHtmlEntities,
  validateSummaryJson,
  responseSchema,
  TASK_TYPE_ENUM,
  PRIORITY_ENUM,
  DIFFICULTY_ENUM,
};
