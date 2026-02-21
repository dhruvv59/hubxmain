/**
 * PRODUCTION-CRITICAL: Exam State Management Hook
 * 
 * Ensures:
 * 1. Answers are auto-saved to backend on every selection
 * 2. State persists across page refreshes
 * 3. Timer syncs with backend time
 * 4. Network failures are gracefully handled
 * 
 * This prevents data loss and ensures accurate scoring.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { http } from '@/lib/http-client';
import { EXAM_ENDPOINTS } from '@/lib/api-config';

interface ExamState {
    attemptId: string;
    answers: Record<string, string | number>; // questionId -> answer
    flagged: Set<string>; // questionId set
    askTeacher: Set<string>; // questionId set
    currentQuestionIndex: number;
    timeLeft: number; // seconds
    serverEndTime: number; // Unix timestamp
}

interface UseExamStateProps {
    attemptId: string;
    totalQuestions: number;
    durationSeconds: number;
}

export function useExamState({ attemptId, totalQuestions, durationSeconds }: UseExamStateProps) {
    const [state, setState] = useState<ExamState>({
        attemptId,
        answers: {},
        flagged: new Set(),
        askTeacher: new Set(),
        currentQuestionIndex: 0,
        timeLeft: durationSeconds,
        serverEndTime: Date.now() + (durationSeconds * 1000),
    });

    const [isSaving, setIsSaving] = useState(false);
    const saveQueue = useRef<Array<() => Promise<void>>>([]);
    const processingQueue = useRef(false);

    /**
     * Load exam state from backend (answers, marks, flags)
     */
    const loadSavedState = useCallback(async () => {
        if (!attemptId) return;

        try {
            // First, try localStorage for instant recovery
            const cached = localStorage.getItem(`exam:${attemptId}`);
            if (cached) {
                const parsed = JSON.parse(cached);
                setState(prev => ({
                    ...prev,
                    flagged: new Set(parsed.flagged || []),
                    askTeacher: new Set(parsed.askTeacher || []),
                    currentQuestionIndex: parsed.currentQuestionIndex || 0,
                }));
            }

            // Then fetch from backend for accurate state
            const response = await http.get<any>(EXAM_ENDPOINTS.getData(attemptId));
            const { attempt, timeRemaining } = response.data;

            // Build answers map from saved student answers
            const answersMap: Record<string, string | number> = {};
            if (attempt.answers && Array.isArray(attempt.answers)) {
                attempt.answers.forEach((ans: any) => {
                    if (ans.selectedOption !== null && ans.selectedOption !== undefined) {
                        answersMap[ans.questionId] = ans.selectedOption;
                    } else if (ans.answerText) {
                        answersMap[ans.questionId] = ans.answerText;
                    }
                });
            }

            // Calculate server end time from timeRemaining
            const serverEndTime = timeRemaining
                ? Date.now() + (timeRemaining * 1000)
                : Date.now() + (durationSeconds * 1000);

            setState(prev => ({
                ...prev,
                answers: answersMap,
                timeLeft: timeRemaining || durationSeconds,
                serverEndTime,
            }));

        } catch (error) {
            console.error('[ExamState] Failed to load saved state:', error);
        }
    }, [attemptId, durationSeconds]);

    /**
     * Auto-submit when timer expires
     */
    const handleAutoSubmit = useCallback(async () => {
        if (!attemptId) return;
        try {
            await http.post(EXAM_ENDPOINTS.submit(attemptId));
            localStorage.removeItem(`exam:${attemptId}`);
        } catch (error) {
            console.error('[ExamState] Auto-submit failed:', error);
        }
    }, [attemptId]);

    /**
     * Process queued save operations sequentially
     */
    const processSaveQueue = useCallback(async () => {
        if (processingQueue.current || saveQueue.current.length === 0) return;

        processingQueue.current = true;

        while (saveQueue.current.length > 0) {
            const task = saveQueue.current.shift();
            if (task) await task();
        }

        processingQueue.current = false;
    }, []);

    /**
     * CRITICAL: Save answer to backend immediately
     * Queued to prevent race conditions on rapid clicks
     */
    const saveAnswer = useCallback(async (questionId: string, answer: string | number, questionType: string) => {
        // Optimistic update for instant UI feedback
        setState(prev => ({
            ...prev,
            answers: { ...prev.answers, [questionId]: answer }
        }));

        // Queue the backend save
        const saveTask = async () => {
            try {
                setIsSaving(true);
                // MCQ and FILL_IN_THE_BLANKS with options use selectedOption (numeric index)
                const useSelectedOption = questionType === 'MCQ' || (questionType === 'FILL_IN_THE_BLANKS' && typeof answer === 'number');
                const payload = useSelectedOption
                    ? { selectedOption: answer }
                    : { answerText: String(answer) };

                await http.post(
                    EXAM_ENDPOINTS.answerQuestion(attemptId, questionId),
                    payload
                );
            } catch (error) {
                console.error(`[ExamState] Failed to save answer for ${questionId}:`, error);
            } finally {
                setIsSaving(false);
            }
        };

        saveQueue.current.push(saveTask);
        processSaveQueue();
    }, [attemptId, processSaveQueue]);

    /**
     * Toggle question flags (for review)
     */
    const toggleFlag = useCallback((questionId: string) => {
        setState(prev => {
            const newFlagged = new Set(prev.flagged);
            if (newFlagged.has(questionId)) {
                newFlagged.delete(questionId);
            } else {
                newFlagged.add(questionId);
            }
            return { ...prev, flagged: newFlagged };
        });

        http.post(EXAM_ENDPOINTS.markReview(attemptId, questionId))
            .catch(err => console.error('[ExamState] Failed to sync flag:', err));
    }, [attemptId]);

    /**
     * Toggle ask teacher flag
     */
    const toggleAskTeacher = useCallback((questionId: string) => {
        setState(prev => {
            const newAsk = new Set(prev.askTeacher);
            if (newAsk.has(questionId)) {
                newAsk.delete(questionId);
            } else {
                newAsk.add(questionId);
            }
            return { ...prev, askTeacher: newAsk };
        });

        const isTooHard = !state.askTeacher.has(questionId);
        http.post(EXAM_ENDPOINTS.markHard(attemptId, questionId), { isTooHard })
            .catch(err => console.error('[ExamState] Failed to sync ask teacher:', err));
    }, [attemptId, state.askTeacher]);

    /**
     * Navigate to next/prev question
     */
    const setQuestionIndex = useCallback((index: number) => {
        if (index >= 0 && index < totalQuestions) {
            setState(prev => ({ ...prev, currentQuestionIndex: index }));
        }
    }, [totalQuestions]);

    // CRITICAL: Load saved state from backend on mount
    useEffect(() => {
        loadSavedState();
    }, [loadSavedState]);

    // CRITICAL: Persist state to localStorage for quick recovery
    useEffect(() => {
        if (!attemptId) return;
        const stateToSave = {
            ...state,
            flagged: Array.from(state.flagged),
            askTeacher: Array.from(state.askTeacher),
        };
        localStorage.setItem(`exam:${attemptId}`, JSON.stringify(stateToSave));
    }, [state, attemptId]);

    // CRITICAL: Timer based on SERVER time, not client time
    useEffect(() => {
        if (!attemptId) return;

        const interval = setInterval(() => {
            setState(prev => {
                const remaining = Math.max(0, Math.floor((prev.serverEndTime - Date.now()) / 1000));

                if (remaining === 0 && prev.timeLeft > 0) {
                    handleAutoSubmit();
                }

                return { ...prev, timeLeft: remaining };
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [attemptId, handleAutoSubmit]);

    return {
        ...state,
        isSaving,
        saveAnswer,
        toggleFlag,
        toggleAskTeacher,
        setQuestionIndex,
        reloadState: loadSavedState,
    };
}
