export interface Chapter {
    id: string;
    name: string;
    selected: boolean;
}

export type QuestionType = "Text" | "MCQ" | "Fill in the Blanks";
export type Difficulty = "Easy" | "Intermediate" | "Advanced";

export interface MCQOption {
    id: string;
    text: string;
    isCorrect: boolean;
}

export interface FillInTheBlank {
    id: string;
    position: number; // Position in the question text where blank appears
    correctAnswer: string;
    placeholder?: string; // Optional placeholder text for the blank
}

export interface Question {
    id: string;
    type: QuestionType;
    difficulty: Difficulty;
    content: string;
    solution: string;
    marks?: number;
    // MCQ specific fields
    options?: MCQOption[]; // Required only for MCQ type
    // Fill in the Blanks specific fields
    blanks?: FillInTheBlank[]; // Required only for Fill in the Blanks type
    // Image URLs (from question bank)
    questionImage?: string;
    solutionImage?: string;
}

export interface PaperConfig {
    title: string;
    standard: string;
    subject: string;
    difficulty: Difficulty;
    chapters: Chapter[];
    isTimeBound: boolean;
    isPublic: boolean;
    schoolOnly: boolean; // Only students from same school can access
    duration: number;
    price: number;
    questions?: Question[]; // Added questions array

    // Backend Integration Fields
    subjectId?: string;
    standardId?: string; // ID from the Standard entity
    standardValue?: number; // The actual number (e.g. 9 or 10)
}
