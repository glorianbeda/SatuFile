import React, { useState, useEffect } from 'react';
import { Box, FormControl, MenuItem, Select, Typography } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import Flag from 'react-world-flags';
import i18n from '../../i18n/config';
import { saveLanguage } from '../../i18n/utils';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastProvider';
import { api } from '../../api';
import { useTranslation } from '../../hooks/useTranslation';

const languages = [
  { code: 'en', name: 'English', flag: 'GB' },
  { code: 'id', name: 'Indonesia', flag: 'ID' },
];

interface LanguageSelectorProps {
  size?: 'small' | 'medium';
  syncToBackend?: boolean; // If true, will sync language to backend when user is logged in
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  size = 'small',
  syncToBackend = false 
}) => {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const { t } = useTranslation('common');
  const [language, setLanguage] = useState(i18n.language);

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setLanguage(lng);
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  const handleChange = async (event: SelectChangeEvent) => {
    const lang = event.target.value as string;
    
    // Save to localStorage
    saveLanguage(lang);
    
    // Change i18n language immediately
    await i18n.changeLanguage(lang);
    
    // Sync to backend if enabled and user is logged in
    if (syncToBackend && isAuthenticated && user) {
      try {
        await api.put('/me', { locale: lang });
        // User context will be updated automatically via API response
      } catch (error) {
        // If backend sync fails, still keep the language change in localStorage
        console.error('Failed to sync language to backend:', error);
        toast.error(t('languageSaveError'));
      }
    }
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl size={size} fullWidth>
        <Select
          value={language}
          onChange={handleChange}
          displayEmpty
          sx={{
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            },
          }}
        >
          {languages.map((lang) => (
            <MenuItem key={lang.code} value={lang.code}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Flag
                  code={lang.flag}
                  style={{ width: 20, height: 15 }}
                  fallback={<span>🌐</span>}
                />
                <Typography variant="body2">{lang.name}</Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default LanguageSelector;
