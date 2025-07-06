import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import IconButton from '@/components/ui/icon-button';

type Theme = 'system' | 'dark' | 'light';

interface ThemeConfig {
    value: Theme;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
}

const themes: ThemeConfig[] = [
    { value: 'system', icon: Monitor, label: 'System' },
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
];

export default function ThemeSelector() {
    const [currentTheme, setCurrentTheme] = useState<Theme>('system');

    // Initialize theme from localStorage or default to system
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme && ['system', 'dark', 'light'].includes(savedTheme)) {
            setCurrentTheme(savedTheme);
        }
    }, []);

    // Apply theme to document
    useEffect(() => {
        const root = document.documentElement;
        
        // Remove existing theme classes
        root.classList.remove('light', 'dark');
        
        if (currentTheme === 'system') {
            // Use system preference
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.classList.add(systemPrefersDark ? 'dark' : 'light');
        } else {
            // Use explicit theme
            root.classList.add(currentTheme);
        }
        
        // Save to localStorage
        localStorage.setItem('theme', currentTheme);
    }, [currentTheme]);

    // Listen for system theme changes when in system mode
    useEffect(() => {
        if (currentTheme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            const root = document.documentElement;
            root.classList.remove('light', 'dark');
            root.classList.add(mediaQuery.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [currentTheme]);

    const cycleTheme = () => {
        const currentIndex = themes.findIndex(theme => theme.value === currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setCurrentTheme(themes[nextIndex].value);
    };

    const currentThemeConfig = themes.find(theme => theme.value === currentTheme) || themes[0];
    const IconComponent = currentThemeConfig.icon;

    return (
        <IconButton
            onClick={cycleTheme}
            title={`Theme: ${currentThemeConfig.label} (click to cycle)`}
            className="transition-colors"
        >
            <IconComponent className="w-4 h-4" />
        </IconButton>
    );
}