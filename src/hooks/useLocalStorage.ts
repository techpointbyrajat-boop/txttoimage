import { useState, useEffect } from 'react';
import { StoredHistory, PromptData, FavoritePrompt, UserPreferences } from '@/lib/types';

const STORAGE_KEY = 'txttoimage_data';
const MAX_HISTORY_ITEMS = 50;
const MAX_FAVORITE_ITEMS = 20;

export function useLocalStorage() {
  const [data, setData] = useState<StoredHistory>({
    promptHistory: [],
    favoritePrompts: [],
    userPreferences: {
      defaultModel: 'flux-dev',
      defaultEnhancement: 'light',
      preferredAspectRatio: '1:1',
      preferredQuality: 'standard'
    }
  });

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedData = JSON.parse(stored);
        setData(parsedData);
      }
    } catch (error) {
      console.error('Error loading localStorage data:', error);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving localStorage data:', error);
    }
  }, [data]);

  // Add prompt to history
  const addToHistory = (promptData: Omit<PromptData, 'id' | 'timestamp'>) => {
    const newItem: PromptData = {
      ...promptData,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    setData(prev => {
      const newHistory = [newItem, ...prev.promptHistory];
      // Keep only the most recent items
      const trimmedHistory = newHistory.slice(0, MAX_HISTORY_ITEMS);

      return {
        ...prev,
        promptHistory: trimmedHistory
      };
    });

    return newItem;
  };

  // Remove item from history
  const removeFromHistory = (id: string) => {
    setData(prev => ({
      ...prev,
      promptHistory: prev.promptHistory.filter(item => item.id !== id)
    }));
  };

  // Add to favorites
  const addToFavorites = (promptData: Omit<FavoritePrompt, 'id'>) => {
    const newFavorite: FavoritePrompt = {
      ...promptData,
      id: `fav-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    setData(prev => {
      const newFavorites = [newFavorite, ...prev.favoritePrompts];
      // Keep only the maximum number of favorites
      const trimmedFavorites = newFavorites.slice(0, MAX_FAVORITE_ITEMS);

      return {
        ...prev,
        favoritePrompts: trimmedFavorites
      };
    });

    return newFavorite;
  };

  // Remove from favorites
  const removeFromFavorites = (id: string) => {
    setData(prev => ({
      ...prev,
      favoritePrompts: prev.favoritePrompts.filter(item => item.id !== id)
    }));
  };

  // Update user preferences
  const updatePreferences = (preferences: Partial<UserPreferences>) => {
    setData(prev => ({
      ...prev,
      userPreferences: {
        ...prev.userPreferences,
        ...preferences
      }
    }));
  };

  // Clear all data
  const clearAllData = () => {
    setData({
      promptHistory: [],
      favoritePrompts: [],
      userPreferences: {
        defaultModel: 'flux-dev',
        defaultEnhancement: 'light',
        preferredAspectRatio: '1:1',
        preferredQuality: 'standard'
      }
    });
  };

  // Export data
  const exportData = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `txttoimage-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import data
  const importData = (importedData: StoredHistory) => {
    try {
      // Validate imported data structure
      if (importedData.promptHistory && Array.isArray(importedData.promptHistory)) {
        setData(prev => ({
          ...prev,
          promptHistory: [
            ...importedData.promptHistory.slice(0, MAX_HISTORY_ITEMS),
            ...prev.promptHistory
          ].slice(0, MAX_HISTORY_ITEMS),
          favoritePrompts: importedData.favoritePrompts
            ? [...importedData.favoritePrompts.slice(0, MAX_FAVORITE_ITEMS), ...prev.favoritePrompts]
              .slice(0, MAX_FAVORITE_ITEMS)
            : prev.favoritePrompts,
          userPreferences: importedData.userPreferences || prev.userPreferences
        }));
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Invalid data format');
    }
  };

  return {
    data,
    addToHistory,
    removeFromHistory,
    addToFavorites,
    removeFromFavorites,
    updatePreferences,
    clearAllData,
    exportData,
    importData
  };
}