import React from 'react';

export const useTranslation = () => ({
  t: (key: string, defaultValue?: string) => defaultValue || key,
  i18n: {
    changeLanguage: jest.fn(),
    language: 'en',
  },
});

export const Trans = ({ children }: { children: React.ReactNode }) => (
  React.createElement(React.Fragment, null, children)
);

export const initReactI18next = {
  type: '3rdParty',
  init: jest.fn(),
};
