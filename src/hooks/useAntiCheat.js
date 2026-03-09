import { useState, useEffect, useCallback } from 'react';
import { AppState, Platform } from 'react-native';

const MAX_VIOLATIONS = 4;

export function useAntiCheat(onTotalFailure) {
    const [violationCount, setViolationCount] = useState(0);
    const [latestViolation, setLatestViolation] = useState(null);

    const registerViolation = useCallback((reason) => {
        setViolationCount(prev => {
            const next = prev + 1;
            setLatestViolation({ reason, count: next });

            if (next >= MAX_VIOLATIONS) {
                if (onTotalFailure) onTotalFailure();
            }
            return next;
        });
    }, [onTotalFailure]);

    useEffect(() => {
        // AppState covers most Native Background/Inactive events
        const handleAppStateChange = (nextAppState) => {
            if (nextAppState === 'background' || nextAppState === 'inactive') {
                registerViolation("App Minimized or Backgrounded");
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        // Web-specific aggressive listeners (like legacy anti_cheat.js)
        if (Platform.OS === 'web') {
            const handleVisibility = () => {
                if (document.hidden) registerViolation("Tab Switched or Window Minimized");
            };
            const handleBlur = () => {
                registerViolation("Window Focus Lost");
            };
            const handleContextMenu = (e) => {
                e.preventDefault();
                registerViolation("Right Click Disabled");
            }

            document.addEventListener("visibilitychange", handleVisibility);
            window.addEventListener("blur", handleBlur);
            document.addEventListener("contextmenu", handleContextMenu);

            return () => {
                subscription.remove();
                document.removeEventListener("visibilitychange", handleVisibility);
                window.removeEventListener("blur", handleBlur);
                document.removeEventListener("contextmenu", handleContextMenu);
            };
        }

        return () => {
            subscription.remove();
        };
    }, [registerViolation]);

    return {
        violationCount,
        maxViolations: MAX_VIOLATIONS,
        latestViolation
    };
}
