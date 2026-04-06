'use client';

import React from 'react';
import { Button } from 'antd';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { useTheme } from './ThemeProvider';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Button
      type="text"
      icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
      onClick={toggleTheme}
      title={isDarkMode ? '切换到亮色模式' : '切换到深色模式'}
    />
  );
};

export default ThemeToggle;
