import { useState, useEffect, useCallback } from "react";
import { Excursion } from "@/types/excursion";
import { excursionService } from "@/services/excursionService";

export function useExcursions() {
    const [excursions, setExcursions] = useState<Excursion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchExcursions = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await excursionService.getAll();
            setExcursions(data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch excursions:", err);
            setError("Failed to load excursions. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchExcursions();
    }, [fetchExcursions]);

    return {
        excursions,
        isLoading,
        error,
        refetch: fetchExcursions
    };
}
