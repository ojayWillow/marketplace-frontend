import { act } from '@testing-library/react';
import { useToastStore } from '../toastStore';

// Reset store before each test
beforeEach(() => {
  useToastStore.setState({ toasts: [] });
});

describe('toastStore', () => {
  describe('addToast', () => {
    it('should add a toast with default type', () => {
      const { addToast } = useToastStore.getState();
      
      act(() => {
        addToast('Test message');
      });

      const { toasts } = useToastStore.getState();
      expect(toasts).toHaveLength(1);
      expect(toasts[0].message).toBe('Test message');
      expect(toasts[0].type).toBe('info');
    });

    it('should add a toast with specified type', () => {
      const { addToast } = useToastStore.getState();
      
      act(() => {
        addToast('Success!', 'success');
      });

      const { toasts } = useToastStore.getState();
      expect(toasts[0].type).toBe('success');
    });

    it('should generate unique IDs for toasts', () => {
      const { addToast } = useToastStore.getState();
      
      act(() => {
        addToast('First toast');
        addToast('Second toast');
      });

      const { toasts } = useToastStore.getState();
      expect(toasts[0].id).not.toBe(toasts[1].id);
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
  });

  describe('removeToast', () => {
    it('should remove a specific toast by ID', () => {
      const { addToast, removeToast } = useToastStore.getState();
      
      act(() => {
        addToast('First toast');
        addToast('Second toast');
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
        addToast('Test toast');
      });
      
      act(() => {
        removeToast('non-existent-id');
      });

      const { toasts } = useToastStore.getState();
      expect(toasts).toHaveLength(1);
    });
  });

  describe('clearAll', () => {
    it('should remove all toasts', () => {
      const { addToast, clearAll } = useToastStore.getState();
      
      act(() => {
        addToast('First');
        addToast('Second');
        addToast('Third');
      });

      const { toasts: toastsBefore } = useToastStore.getState();
      expect(toastsBefore).toHaveLength(3);
      
      act(() => {
        clearAll();
      });

      const { toasts: toastsAfter } = useToastStore.getState();
      expect(toastsAfter).toHaveLength(0);
    });
  });
});
