import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import IconButton from '@/components/ui/icon-button';
import { useAppearance, Appearance } from '@/hooks/use-appearance';

const themes: { value: Appearance; icon: React.ComponentType<{ className?: string }> ; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
];

export default function ThemeSelectorButton() {
    const { appearance, updateAppearance } = useAppearance();

    const cycleTheme = () => {
        const currentIndex = themes.findIndex(theme => theme.value === appearance);
        const nextIndex = (currentIndex + 1) % themes.length;
        updateAppearance(themes[nextIndex].value);
    };

    const currentThemeConfig = themes.find(theme => theme.value === appearance) || themes[0];
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