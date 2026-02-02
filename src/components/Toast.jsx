import { Toaster as HotToaster, toast as hotToast } from 'react-hot-toast';

const toastConfig = {
  duration: 4000,
  position: 'top-right',
  style: {
    background: 'var(--color-bg-primary)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-border-medium)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-4)',
    fontSize: 'var(--font-size-sm)',
    boxShadow: 'var(--shadow-lg)',
  },
  success: {
    iconTheme: {
      primary: 'var(--color-success)',
      secondary: '#fff',
    },
  },
  error: {
    iconTheme: {
      primary: 'var(--color-error)',
      secondary: '#fff',
    },
  },
};

export const Toaster = () => <HotToaster {...toastConfig} />;

export const toast = {
  success: (message, options = {}) => {
    return hotToast.success(message, {
      ...toastConfig,
      ...options,
    });
  },

  error: (message, options = {}) => {
    return hotToast.error(message, {
      ...toastConfig,
      duration: 6000,
      ...options,
    });
  },

  info: (message, options = {}) => {
    return hotToast(message, {
      ...toastConfig,
      icon: 'ℹ️',
      ...options,
    });
  },

  warning: (message, options = {}) => {
    return hotToast(message, {
      ...toastConfig,
      icon: '⚠️',
      style: {
        ...toastConfig.style,
        borderColor: 'var(--color-warning)',
      },
      ...options,
    });
  },

  promise: (promise, messages, options = {}) => {
    return hotToast.promise(
      promise,
      {
        loading: messages.loading || 'Loading...',
        success: messages.success || 'Success!',
        error: messages.error || 'Error',
      },
      {
        ...toastConfig,
        ...options,
      }
    );
  },

  loading: (message, options = {}) => {
    return hotToast.loading(message, {
      ...toastConfig,
      ...options,
    });
  },

  dismiss: (toastId) => {
    hotToast.dismiss(toastId);
  },

  custom: (component, options = {}) => {
    return hotToast.custom(component, {
      ...toastConfig,
      ...options,
    });
  },
};

export default toast;
