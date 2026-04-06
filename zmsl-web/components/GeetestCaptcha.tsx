'use client';

import React, { useEffect, useRef } from 'react';

interface GeetestCaptchaProps {
  captchaId: string;
  onSuccess: (result: any) => void;
  onReady?: () => void;
  onError?: (error: any) => void;
}

declare global {
  interface Window {
    initGeetest4: any;
    captchaObj?: any;
  }
}

const GeetestCaptcha: React.FC<GeetestCaptchaProps> = ({
  captchaId,
  onSuccess,
  onReady,
  onError,
}) => {
  const captchaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.initGeetest4) {
      console.error('Geetest script not loaded');
      return;
    }

    const config = {
      captchaId: captchaId,
      product: 'bind',
      language: 'zho',
      protocol: 'https://',
    };

    window.initGeetest4(config, (captchaObj: any) => {
      window.captchaObj = captchaObj;

      captchaObj
        .appendTo(captchaRef.current)
        .onReady(() => {
          console.log('Geetest ready');
          onReady?.();
        })
        .onSuccess(() => {
          const result = captchaObj.getValidate();
          console.log('Geetest success:', result);
          onSuccess(result);
        })
        .onError((error: any) => {
          console.error('Geetest error:', error);
          onError?.(error);
        });
    });

    return () => {
      // Cleanup
      if (window.captchaObj) {
        try {
          window.captchaObj.destroy();
        } catch (e) {
          console.warn('Failed to destroy captcha:', e);
        }
        window.captchaObj = undefined;
      }
    };
  }, [captchaId, onSuccess, onReady, onError]);

  return <div ref={captchaRef} className="geetest-captcha"></div>;
};

export default GeetestCaptcha;
