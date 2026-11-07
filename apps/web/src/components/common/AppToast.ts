import { message } from 'antd';

/**
 * Standardized AppToast feedback system
 * Auto-hides in 3.5s.
 * Plain, user-friendly messages explaining what happened and next steps.
 */
export const AppToast = {
  success: (content: string, onUndo?: () => void) => {
    if (onUndo) {
      return message.success({
        content,
        duration: 4,
        key: content,
        onClick: onUndo,
      });
    }
    return message.success({
      content,
      duration: 3.5,
      key: content,
    });
  },

  error: (content: string, fallbackMessage?: string) => {
    // Sanitize any raw technical JSON, 500 error codes, or trace dumps
    let displayMsg = content || fallbackMessage || 'Kuch gadbad hui. Kripya dobara koshish karein.';
    if (typeof displayMsg === 'string') {
      if (displayMsg.includes('500') || displayMsg.includes('Internal Server') || displayMsg.includes('ECONNREFUSED')) {
        displayMsg = 'Server se sampark nahi ho paya. Kripya internet check karein ya thodi der baad koshish karein.';
      } else if (displayMsg.startsWith('{') || displayMsg.includes('PrismaClient') || displayMsg.includes('raw error')) {
        displayMsg = fallbackMessage || 'Request poori nahi ho saki. Kripya details check karke dobara koshish karein.';
      }
    }
    return message.error({
      content: displayMsg,
      duration: 4,
      key: displayMsg,
    });
  },

  warning: (content: string) => {
    return message.warning({
      content,
      duration: 3.5,
      key: content,
    });
  },

  info: (content: string) => {
    return message.info({
      content,
      duration: 3.5,
      key: content,
    });
  },

  loading: (content: string) => {
    return message.loading({
      content,
      duration: 0,
      key: content,
    });
  },

  destroy: () => {
    message.destroy();
  },
};

export default AppToast;
