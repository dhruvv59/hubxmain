import { http } from "@/lib/http-client";
import { TEACHER_CONTENT_ENDPOINTS } from "@/lib/api-config";

export interface Standard {
    id: string;
    name: string;
    description?: string;
}

export interface Subject {
    id: string;
    name: string;
    code?: string;
    standardId: string;
}

export interface Chapter {
    id: string;
    name: string;
    description?: string;
    subjectId: string;
    standardId: string;
    sequence?: number;
}

/**
 * Teacher Content Service
 *
 * Manages hierarchical content structure: Standard → Subject → Chapter
 * Backend uses nested RESTful routes - all parent IDs required
 */
export const teacherContentService = {
    // ============================================
    // STANDARDS - Top Level
    // ============================================

    getStandards: async () => {
        try {
            const response = await http.get<{ success: boolean; data: Standard[] }>(
                TEACHER_CONTENT_ENDPOINTS.getStandards()
            );
            return response.data;
        } catch (error) {
            console.error("[TeacherContent] Failed to fetch standards:", error);
            throw error;
        }
    },

    getStandard: async (standardId: string) => {
        try {
            const response = await http.get<{ success: boolean; data: Standard }>(
                TEACHER_CONTENT_ENDPOINTS.getStandard(standardId)
            );
            return response.data;
        } catch (error) {
            console.error(`[TeacherContent] Failed to fetch standard ${standardId}:`, error);
            throw error;
        }
    },

    createStandard: async (data: Partial<Standard>) => {
        if (!data.name?.trim()) {
            throw new Error('Standard name is required');
        }

        try {
            const response = await http.post(TEACHER_CONTENT_ENDPOINTS.createStandard(), data);
            return response;
        } catch (error) {
            console.error("[TeacherContent] Failed to create standard:", error);
            throw error;
        }
    },

    updateStandard: async (id: string, data: Partial<Standard>) => {
        try {
            const response = await http.put(TEACHER_CONTENT_ENDPOINTS.updateStandard(id), data);
            return response;
        } catch (error) {
            console.error(`[TeacherContent] Failed to update standard ${id}:`, error);
            throw error;
        }
    },

    deleteStandard: async (id: string) => {
        try {
            await http.delete(TEACHER_CONTENT_ENDPOINTS.deleteStandard(id));
        } catch (error) {
            console.error(`[TeacherContent] Failed to delete standard ${id}:`, error);
            throw error;
        }
    },

    // ============================================
    // SUBJECTS - Nested under Standard
    // ============================================

    /**
     * Get subjects for a specific standard
     * @param standardId - Required parent standard ID
     */
    getSubjects: async (standardId: string) => {
        if (!standardId) {
            throw new Error('Standard ID is required to fetch subjects');
        }

        try {
            const response = await http.get<{ success: boolean; data: Subject[] }>(
                TEACHER_CONTENT_ENDPOINTS.getSubjects(standardId)
            );
            return response.data;
        } catch (error) {
            console.error(`[TeacherContent] Failed to fetch subjects for standard ${standardId}:`, error);
            throw error;
        }
    },

    /**
     * Get single subject
     * @param standardId - Required parent standard ID
     * @param subjectId - Subject ID
     */
    getSubject: async (standardId: string, subjectId: string) => {
        if (!standardId || !subjectId) {
            throw new Error('Both standard ID and subject ID are required');
        }

        try {
            const response = await http.get<{ success: boolean; data: Subject }>(
                TEACHER_CONTENT_ENDPOINTS.getSubject(standardId, subjectId)
            );
            return response.data;
        } catch (error) {
            console.error(`[TeacherContent] Failed to fetch subject ${subjectId}:`, error);
            throw error;
        }
    },

    /**
     * Create subject under a standard
     * @param standardId - Required parent standard ID
     * @param data - Subject data (must include standardId)
     */
    createSubject: async (standardId: string, data: Partial<Subject>) => {
        if (!standardId) {
            throw new Error('Standard ID is required to create subject');
        }

        if (!data.name?.trim()) {
            throw new Error('Subject name is required');
        }

        const payload = {
            ...data,
            standardId,
        };

        try {
            const response = await http.post(
                TEACHER_CONTENT_ENDPOINTS.createSubject(standardId),
                payload
            );
            return response;
        } catch (error) {
            console.error(`[TeacherContent] Failed to create subject in standard ${standardId}:`, error);
            throw error;
        }
    },

    /**
     * Update subject
     * @param standardId - Required parent standard ID
     * @param subjectId - Subject ID to update
     * @param data - Updated subject data
     */
    updateSubject: async (standardId: string, subjectId: string, data: Partial<Subject>) => {
        if (!standardId || !subjectId) {
            throw new Error('Both standard ID and subject ID are required');
        }

        try {
            const response = await http.put(
                TEACHER_CONTENT_ENDPOINTS.updateSubject(standardId, subjectId),
                data
            );
            return response;
        } catch (error) {
            console.error(`[TeacherContent] Failed to update subject ${subjectId}:`, error);
            throw error;
        }
    },

    /**
     * Delete subject
     * @param standardId - Required parent standard ID
     * @param subjectId - Subject ID to delete
     */
    deleteSubject: async (standardId: string, subjectId: string) => {
        if (!standardId || !subjectId) {
            throw new Error('Both standard ID and subject ID are required');
        }

        try {
            await http.delete(TEACHER_CONTENT_ENDPOINTS.deleteSubject(standardId, subjectId));
        } catch (error) {
            console.error(`[TeacherContent] Failed to delete subject ${subjectId}:`, error);
            throw error;
        }
    },

    // ============================================
    // CHAPTERS - Nested under Standard AND Subject
    // ============================================

    /**
     * Get chapters for a specific subject
     * @param standardId - Required parent standard ID
     * @param subjectId - Required parent subject ID
     */
    getChapters: async (standardId: string, subjectId: string) => {
        if (!standardId || !subjectId) {
            throw new Error('Both standard ID and subject ID are required to fetch chapters');
        }

        try {
            const response = await http.get<{ success: boolean; data: Chapter[] }>(
                TEACHER_CONTENT_ENDPOINTS.getChapters(standardId, subjectId)
            );
            return response.data;
        } catch (error) {
            console.error(`[TeacherContent] Failed to fetch chapters for subject ${subjectId}:`, error);
            throw error;
        }
    },

    /**
     * Create chapter under a subject
     * @param standardId - Required parent standard ID
     * @param subjectId - Required parent subject ID
     * @param data - Chapter data (must include subjectId)
     */
    createChapter: async (standardId: string, subjectId: string, data: Partial<Chapter>) => {
        if (!standardId || !subjectId) {
            throw new Error('Both standard ID and subject ID are required to create chapter');
        }

        if (!data.name?.trim()) {
            throw new Error('Chapter name is required');
        }

        const payload = {
            ...data,
            standardId,
            subjectId,
        };

        try {
            const response = await http.post(
                TEACHER_CONTENT_ENDPOINTS.createChapter(standardId, subjectId),
                payload
            );
            return response;
        } catch (error) {
            console.error(`[TeacherContent] Failed to create chapter in subject ${subjectId}:`, error);
            throw error;
        }
    },

    /**
     * Update chapter
     * @param standardId - Required parent standard ID
     * @param subjectId - Required parent subject ID
     * @param chapterId - Chapter ID to update
     * @param data - Updated chapter data
     */
    updateChapter: async (standardId: string, subjectId: string, chapterId: string, data: Partial<Chapter>) => {
        if (!standardId || !subjectId || !chapterId) {
            throw new Error('Standard ID, subject ID, and chapter ID are all required');
        }

        try {
            const response = await http.put(
                TEACHER_CONTENT_ENDPOINTS.updateChapter(standardId, subjectId, chapterId),
                data
            );
            return response;
        } catch (error) {
            console.error(`[TeacherContent] Failed to update chapter ${chapterId}:`, error);
            throw error;
        }
    },

    /**
     * Delete chapter
     * @param standardId - Required parent standard ID
     * @param subjectId - Required parent subject ID
     * @param chapterId - Chapter ID to delete
     */
    deleteChapter: async (standardId: string, subjectId: string, chapterId: string) => {
        if (!standardId || !subjectId || !chapterId) {
            throw new Error('Standard ID, subject ID, and chapter ID are all required');
        }

        try {
            await http.delete(
                TEACHER_CONTENT_ENDPOINTS.deleteChapter(standardId, subjectId, chapterId)
            );
        } catch (error) {
            console.error(`[TeacherContent] Failed to delete chapter ${chapterId}:`, error);
            throw error;
        }
    },
};
