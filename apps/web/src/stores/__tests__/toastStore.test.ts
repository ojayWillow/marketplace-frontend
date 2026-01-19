import { act } from '@testing-library/react';
import { useToastStore } from '../toastStore';

// Reset store before each test
beforeEach(() => {
  useToastStore.setState({ toasts: [] });
});

describe('toastStore', () => {
  describe('addToast', () => {
    it('should add a toast with specified type', () => {
      const { addToast } = useToastStore.getState();
      
      act(() => {
        addToast('Test message', 'info');
      });

      const { toasts } = useToastStore.getState();
      expect(toasts).toHaveLength(1);
      expect(toasts[0].message).toBe('Test message');
      expect(toasts[0].type).toBe('info');
    });

    it('should generate unique IDs for toasts', () => {
      const { addToast } = useToastStore.getState();
      
      act(() => {
        addToast('First toast', 'info');
        addToast('Second toast', 'info');
      });

      const { toasts } = useToastStore.getState();
      expect(toasts[0].id).not.toBe(toasts[1].id);
    });

    it('should set default duration', () => {
      const { addToast } = useToastStore.getState();
      
      act(() => {
        addToast('Test', 'info');
      });

      const { toasts } = useToastStore.getState();
      expect(toasts[0].duration).toBe(4000);
    });

    it('should allow custom duration', () => {
      const { addToast } = useToastStore.getState();
      
      act(() => {
        addToast('Test', 'info', 10000);
      });

      const { toasts } = useToastStore.getState();
      expect(toasts[0].duration).toBe(10000);
    });
  });

  describe('helper methods', () => {
    it('success() should add a success toast', () => {
      const { success } = useToastStore.getState();
      
      act(() => {
        success('Operation successful');
      });

      const { toasts } = useToastStore.getState();
      expect(toasts[0].type).toBe('success');
      expect(toasts[0].message).toBe('Operation successful');
    });

    it('error() should add an error toast', () => {
      const { error } = useToastStore.getState();
      
      act(() => {
        error('Something went wrong');
      });

      const { toasts } = useToastStore.getState();
      expect(toasts[0].type).toBe('error');
      expect(toasts[0].message).toBe('Something went wrong');
    });

    it('warning() should add a warning toast', () => {
      const { warning } = useToastStore.getState();
      
      act(() => {
        warning('Be careful');
      });

      const { toasts } = useToastStore.getState();
      expect(toasts[0].type).toBe('warning');
    });

    it('info() should add an info toast', () => {
      const { info } = useToastStore.getState();
      
      act(() => {
        info('Just so you know');
      });

      const { toasts } = useToastStore.getState();
      expect(toasts[0].type).toBe('info');
    });

    it('error() should have longer duration than others', () => {
      const { error, success } = useToastStore.getState();
      
      act(() => {
        error('Error message');
        success('Success message');
      });

      const { toasts } = useToastStore.getState();
      const errorToast = toasts.find(t => t.type === 'error');
      const successToast = toasts.find(t => t.type === 'success');
      
      expect(errorToast?.duration).toBe(5000);
      expect(successToast?.duration).toBe(4000);
    });
  });

  describe('removeToast', () => {
    it('should remove a specific toast by ID', () => {
      const { addToast, removeToast } = useToastStore.getState();
      
      act(() => {
        addToast('First toast', 'info');
        addToast('Second toast', 'info');
      });

      const { toasts: toastsBefore } = useToastStore.getState();
      const firstToastId = toastsBefore[0].id;
      
      act(() => {
        removeToast(firstToastId);
      });

      const { toasts: toastsAfter } = useToastStore.getState();
      expect(toastsAfter).toHaveLength(1);
      expect(toastsAfter[0].message).toBe('Second toast');
    });

    it('should do nothing if toast ID does not exist', () => {
      const { addToast, removeToast } = useToastStore.getState();
      
      act(() => {
        addToast('Test toast', 'info');
      });
      
      act(() => {
        removeToast('non-existent-id');
      });

      const { toasts } = useToastStore.getState();
      expect(toasts).toHaveLength(1);
    });
  });
});
