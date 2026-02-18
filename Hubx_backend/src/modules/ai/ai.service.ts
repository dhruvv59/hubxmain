import { OpenAI } from "openai";
import prisma from "@config/database";
import { AppError } from "@utils/errors";
import { QuestionType, Difficulty } from "@prisma/client";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
});

export interface QuestionGenerationRequest {
    subject: string;
    chapters: string[];
    difficulty: "Easy" | "Medium" | "Hard";
    count: number;
    instructions?: string;
    standard?: string;
}

export interface GeneratedQuestion {
    id?: string;
    type: "TEXT" | "MCQ" | "FILL_IN_THE_BLANKS";
    difficulty: "EASY" | "MEDIUM" | "HARD";
    questionText: string;
    solutionText: string;
    marks: number;
    options?: string[];
    correctOption?: number;
    correctAnswers?: string[][];
    caseSensitive?: boolean;
}

export class AIService {
    /**
     * Generate questions using OpenAI GPT-4
     */
    async generateQuestions(
        paperId: string,
        teacherId: string,
        request: QuestionGenerationRequest
    ): Promise<GeneratedQuestion[]> {
        // Validate paper ownership
        const paper = await prisma.paper.findUnique({
            where: { id: paperId },
            include: { teacher: true },
        });

        if (!paper || paper.teacherId !== teacherId) {
            throw new AppError(404, "Paper not found or access denied");
        }

        if (!process.env.OPENAI_API_KEY) {
            throw new AppError(500, "OpenAI API key not configured");
        }

        try {
            // Build the prompt for GPT-4
            const prompt = this.buildPrompt(request, paper);

            // Call OpenAI API
            const message = await (openai as any).chat.completions.create({
                model: "gpt-4",
                max_tokens: 4096,
                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
            });

            // Extract the response text
            const responseText = message.choices[0]?.message?.content || "";

            // Parse the questions from the response
            const questions = this.parseQuestionsFromResponse(responseText, request.difficulty);

            if (questions.length === 0) {
                throw new AppError(500, "Failed to generate valid questions from AI");
            }

            return questions.slice(0, request.count);
        } catch (error: any) {
            console.error("[AI Service] Question generation failed:", error);

            if (error instanceof AppError) {
                throw error;
            }

            throw new AppError(
                500,
                error.message || "Failed to generate questions. Please try again later."
            );
        }
    }

    /**
     * Build a detailed prompt for question generation
     */
    private buildPrompt(request: QuestionGenerationRequest, paper: any): string {
        const chaptersStr = request.chapters.join(", ");
        const difficultyMap = {
            Easy: "beginner-friendly, basic concept understanding",
            Medium: "moderate difficulty, requires application of concepts",
            Hard: "challenging, requires analysis and synthesis",
        };

        return `You are an expert educator tasked with generating high-quality exam questions.

Generate exactly ${request.count} ${request.difficulty} level questions for a school exam.

Subject: ${request.subject}
Chapters/Topics: ${chaptersStr}
Standard: ${request.standard || "Not specified"}
Difficulty Level: ${request.difficulty} (${difficultyMap[request.difficulty as keyof typeof difficultyMap]})
${request.instructions ? `Additional Instructions: ${request.instructions}` : ""}

Requirements:
1. Questions must be appropriate for the ${request.difficulty} difficulty level
2. Questions should test understanding, not just memorization (when appropriate)
3. Each question should have a clear, comprehensive solution/explanation
4. Allocate 3-5 marks per question based on complexity
5. Mix different question types: short answer, essay, and multiple choice
6. Ensure questions are clear, unambiguous, and grammatically correct
7. Questions should be based on the specified chapters/topics

For each question, provide:
1. Question text (clear and precise)
2. Question type (TEXT, MCQ, or FILL_IN_THE_BLANKS)
3. Correct answer or solution (comprehensive explanation)
4. Marks (3-5 based on difficulty)
5. If MCQ: 4 options with the correct one marked
6. If Fill in the Blanks: the correct answer(s) as nested arrays

Format your response as a JSON array with this structure:
[
  {
    "questionText": "...",
    "type": "TEXT|MCQ|FILL_IN_THE_BLANKS",
    "difficulty": "EASY|MEDIUM|HARD",
    "solutionText": "...",
    "marks": 3-5,
    "options": ["option1", "option2", "option3", "option4"],  // only for MCQ
    "correctOption": 1,  // 0-indexed, only for MCQ
    "correctAnswers": [["answer1", "alt_answer1"], ["answer2", "alt_answer2"]],  // only for FILL_IN_THE_BLANKS (nested array of acceptable answers per blank)
    "caseSensitive": false  // only for FILL_IN_THE_BLANKS
  }
]

Generate ${request.count} questions now:`;
    }

    /**
     * Parse questions from OpenAI response
     */
    private parseQuestionsFromResponse(
        responseText: string,
        difficulty: string
    ): GeneratedQuestion[] {
        try {
            // Try to extract JSON from the response
            const jsonMatch = responseText.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                throw new Error("No JSON array found in response");
            }

            const jsonStr = jsonMatch[0];
            const questionsData = JSON.parse(jsonStr);

            if (!Array.isArray(questionsData)) {
                throw new Error("Response is not an array");
            }

            // Map the response to GeneratedQuestion format
            const questions: GeneratedQuestion[] = questionsData
                .filter((q: any) => q.questionText && q.type && q.solutionText)
                .map((q: any) => ({
                    type: this.mapQuestionType(q.type),
                    difficulty: this.mapDifficulty(difficulty),
                    questionText: q.questionText.trim(),
                    solutionText: q.solutionText.trim(),
                    marks: Math.min(Math.max(q.marks || 3, 1), 10), // Clamp between 1-10
                    options: q.options || undefined,
                    correctOption: q.correctOption ?? undefined,
                    correctAnswers: q.correctAnswers || undefined,
                    caseSensitive: q.caseSensitive ?? false,
                }));

            return questions;
        } catch (error) {
            console.error("[AI Service] Failed to parse questions:", error);
            // Return empty array if parsing fails
            return [];
        }
    }

    /**
     * Map question type string to enum value
     */
    private mapQuestionType(type: string): "TEXT" | "MCQ" | "FILL_IN_THE_BLANKS" {
        const typeMap: Record<string, "TEXT" | "MCQ" | "FILL_IN_THE_BLANKS"> = {
            TEXT: "TEXT",
            SHORT_ANSWER: "TEXT",
            ESSAY: "TEXT",
            MCQ: "MCQ",
            MULTIPLE_CHOICE: "MCQ",
            FILL_IN_THE_BLANKS: "FILL_IN_THE_BLANKS",
            FILL_IN: "FILL_IN_THE_BLANKS",
        };

        return typeMap[type.toUpperCase()] || "TEXT";
    }

    /**
     * Map difficulty string to enum value
     */
    private mapDifficulty(difficulty: string): "EASY" | "MEDIUM" | "HARD" {
        const difficultyMap: Record<string, "EASY" | "MEDIUM" | "HARD"> = {
            EASY: "EASY",
            EASY_EASY: "EASY",
            MEDIUM: "MEDIUM",
            INTERMEDIATE: "MEDIUM",
            MEDIUM_MEDIUM: "MEDIUM",
            HARD: "HARD",
            DIFFICULT: "HARD",
            HARD_HARD: "HARD",
        };

        return difficultyMap[difficulty.toUpperCase()] || "MEDIUM";
    }
}

export const aiService = new AIService();
