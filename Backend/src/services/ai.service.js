const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

/*
|--------------------------------------------------------------------------
| ZOD SCHEMA
|--------------------------------------------------------------------------
*/

const interviewReportSchema = z.object({
    matchScore: z.number().min(0).max(100),

    technicalQuestions: z
        .array(
            z.object({
                question: z.string(),
                intention: z.string(),
                answer: z.string()
            })
        )
        .min(5),

    behavioralQuestions: z
        .array(
            z.object({
                question: z.string(),
                intention: z.string(),
                answer: z.string()
            })
        )
        .min(5),

    skillGaps: z
        .array(
            z.object({
                skill: z.string(),
                severity: z.enum(["low", "medium", "high"])
            })
        )
        .min(1),

    preparationPlan: z
       .array(
        z.object({
            day: z.number().int(),
            focus: z.string(),

            tasks: z.array(
                z.object({
                    task: z.string(),

                    status: z.enum([
                        "not started",
                        "in progress",
                        "completed"
                    ])
                })
            )
        })
    )
    .min(7),

    title: z.string()
});


/*
|--------------------------------------------------------------------------
| GEMINI JSON SCHEMA
|--------------------------------------------------------------------------
*/

const interviewReportJsonSchema = {
    type: "object",

    properties: {
        matchScore: {
            type: "number",
            minimum: 0,
            maximum: 100,
            description:
                "A score between 0 and 100 indicating how well the candidate matches the job description."
        },

        technicalQuestions: {
            type: "array",
            minItems: 5,

            items: {
                type: "object",

                properties: {
                    question: {
                        type: "string",
                        description:
                            "A technical interview question relevant to the candidate and job."
                    },

                    intention: {
                        type: "string",
                        description:
                            "What the interviewer wants to evaluate by asking this question."
                    },

                    answer: {
                        type: "string",
                        description:
                            "Guidance explaining how the candidate should answer the question."
                    }
                },

                required: [
                    "question",
                    "intention",
                    "answer"
                ],

                propertyOrdering: [
                    "question",
                    "intention",
                    "answer"
                ]
            }
        },

        behavioralQuestions: {
            type: "array",
            minItems: 5,

            items: {
                type: "object",

                properties: {
                    question: {
                        type: "string",
                        description:
                            "A behavioral interview question relevant to the candidate."
                    },

                    intention: {
                        type: "string",
                        description:
                            "What the interviewer wants to evaluate."
                    },

                    answer: {
                        type: "string",
                        description:
                            "Guidance explaining how the candidate should answer."
                    }
                },

                required: [
                    "question",
                    "intention",
                    "answer"
                ],

                propertyOrdering: [
                    "question",
                    "intention",
                    "answer"
                ]
            }
        },

        skillGaps: {
            type: "array",
            minItems: 1,

            items: {
                type: "object",

                properties: {
                    skill: {
                        type: "string",
                        description:
                            "A skill that the candidate needs to improve for the target job."
                    },

                    severity: {
                        type: "string",
                        enum: [
                            "low",
                            "medium",
                            "high"
                        ],
                        description:
                            "The severity of the skill gap."
                    }
                },

                required: [
                    "skill",
                    "severity"
                ],

                propertyOrdering: [
                    "skill",
                    "severity"
                ]
            }
        },

        preparationPlan: {
            type: "array",
            minItems: 7,

            items: {
                type: "object",

                properties: {
                    day: {
                        type: "integer",
                        description:
                            "The preparation day number."
                    },

                    focus: {
                        type: "string",
                        description:
                            "The main topic or focus for that day."
                    },

                    tasks: {
    type: "array",

    items: {
        type: "object",

        properties: {
            task: {
                type: "string",
                description: "Specific preparation task."
            },

            status: {
                type: "string",
                enum: [
                    "not started",
                    "in progress",
                    "completed"
                ],
                description: "Task completion status."
            }
        },

        required: [
            "task",
            "status"
        ],

        propertyOrdering: [
            "task",
            "status"
        ]
    },

    description: "Preparation tasks with completion status."
}
                },

                required: [
                    "day",
                    "focus",
                    "tasks"
                ],

                propertyOrdering: [
                    "day",
                    "focus",
                    "tasks"
                ]
            }
        },

        title: {
            type: "string",
            description:
                "A short title for the generated interview preparation report."
        }
    },

    required: [
        "matchScore",
        "technicalQuestions",
        "behavioralQuestions",
        "skillGaps",
        "preparationPlan",
        "title"
    ],

    propertyOrdering: [
        "matchScore",
        "technicalQuestions",
        "behavioralQuestions",
        "skillGaps",
        "preparationPlan",
        "title"
    ]
};


/*
|--------------------------------------------------------------------------
| GENERATE INTERVIEW REPORT
|--------------------------------------------------------------------------
*/

async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription
}) {

    const prompt = `
You are an expert technical interviewer and career preparation assistant.

Analyze the candidate's resume, self-description, and target job description.

Generate a complete interview preparation report.

IMPORTANT OUTPUT RULES:

1. technicalQuestions MUST be an array of OBJECTS.

Each object MUST contain exactly these fields:

{
    "question": "string",
    "intention": "string",
    "answer": "string"
}

Generate at least 5 technical questions.

2. behavioralQuestions MUST be an array of OBJECTS.

Each object MUST contain exactly these fields:

{
    "question": "string",
    "intention": "string",
    "answer": "string"
}

Generate at least 5 behavioral questions.

3. skillGaps MUST be an array of OBJECTS.

Each object MUST contain:

{
    "skill": "string",
    "severity": "low | medium | high"
}

Generate at least 1 skill gap.
4. preparationPlan MUST be an array of OBJECTS.

Each object MUST contain:

{
    "day": number,
    "focus": "string",
    "tasks": [
        {
            "task": "string",
            "status": "not started"
        }
    ]
}

Generate a minimum 7-day preparation plan.

Every task MUST be an object.

Each task object MUST contain:
- "task": the specific preparation activity
- "status": the task completion status

For a newly generated report, ALWAYS set:
"status": "not started"

5. DO NOT put plain strings inside technicalQuestions.

6. DO NOT put plain strings inside behavioralQuestions.

7. DO NOT put plain strings inside skillGaps.
8. DO NOT put plain strings directly inside preparationPlan.tasks.

9. Every item in those arrays MUST be an object with the required fields.

10. Do not invent skills, education, projects, experience, or technologies that are not supported by the resume or self-description.

11. Match the interview questions and skill gaps to the target job description.

12. matchScore must be a number between 0 and 100.

13. Return valid JSON matching the provided schema.

----------------------------------------
CANDIDATE RESUME
----------------------------------------

${resume}

----------------------------------------
CANDIDATE SELF DESCRIPTION
----------------------------------------

${selfDescription || "Not provided"}

----------------------------------------
JOB DESCRIPTION
----------------------------------------

${jobDescription}
`;

    try {

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",

            contents: prompt,

            config: {
                responseMimeType: "application/json",
                responseJsonSchema: interviewReportJsonSchema
            }
        });

        /*
        |--------------------------------------------------------------------------
        | GET GEMINI RESPONSE
        |--------------------------------------------------------------------------
        */

        const result = JSON.parse(response.text);

        /*
        |--------------------------------------------------------------------------
        | DEBUG LOG
        |--------------------------------------------------------------------------
        */

        console.log(
            "========== GEMINI INTERVIEW REPORT =========="
        );

        console.dir(result, {
            depth: null
        });

        console.log(
            "=============================================="
        );

        /*
        |--------------------------------------------------------------------------
        | VALIDATE RESPONSE USING ZOD
        |--------------------------------------------------------------------------
        */

        const validatedResult =
            interviewReportSchema.parse(result);

        return validatedResult;

    } catch (error) {

        console.error(
            "Error generating interview report:"
        );

        console.error(error);

        throw error;
    }
}


/*
|--------------------------------------------------------------------------
| GENERATE PDF FROM HTML
|--------------------------------------------------------------------------
*/

async function generatePdfFromHtml(html) {

    const { default: puppeteer } = await import("puppeteer");

    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox"
        ]
    });

    try {

        const page = await browser.newPage();

        await page.setContent(html, {
            waitUntil: "networkidle0"
        });

        const pdfBuffer = await page.pdf({
            format: "A4",

            printBackground: true,

            margin: {
                top: "20px",
                right: "20px",
                bottom: "20px",
                left: "20px"
            }
        });

        return pdfBuffer;

    } finally {

        await browser.close();
    }
}


/*
|--------------------------------------------------------------------------
| GENERATE RESUME PDF
|--------------------------------------------------------------------------
*/

async function generateResumePdf({
    resume,
    jobDescription,
    selfDescription
}) {

    const resumeSchema = z.object({
        html: z.string()
    });

    const resumeJsonSchema = {
        type: "object",

        properties: {
            html: {
                type: "string",
                description:
                    "Complete professional HTML resume."
            }
        },

        required: ["html"],

        propertyOrdering: ["html"]
    };

    const prompt = `
You are an expert professional resume writer.

Create a professional ATS-friendly resume in HTML format.

Use ONLY information available in the candidate resume and self-description.

Do not invent:
- Companies
- Jobs
- Degrees
- Certifications
- Skills
- Projects
- Achievements
- Dates
- Technologies

The resume should have a clean professional layout and be suitable for conversion to PDF.

Target Job Description:

${jobDescription}

Candidate Self Description:

${selfDescription || "Not provided"}

Candidate Resume:

${resume}

Return only the HTML inside the JSON field.
`;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",

        contents: prompt,

        config: {
            responseMimeType: "application/json",
            responseJsonSchema: resumeJsonSchema
        }
    });

    const result = JSON.parse(response.text);

    const validatedResult =
        resumeSchema.parse(result);

    const pdfBuffer =
        await generatePdfFromHtml(
            validatedResult.html
        );

    return pdfBuffer;
}


/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/

module.exports = {
    generateInterviewReport,
    generateResumePdf
};