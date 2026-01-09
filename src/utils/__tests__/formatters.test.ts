// Tests for utility functions
// Add your utility function tests here

describe('Utility Functions', () => {
  describe('Date formatting', () => {
    it('should format dates correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      // Test basic date functionality
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0); // January is 0
      expect(date.getDate()).toBe(15);
    });

    it('should handle ISO date strings', () => {
      const isoString = '2024-01-15T10:30:00Z';
      const date = new Date(isoString);
      expect(date.toISOString()).toBe(isoString);
    });
  });

  describe('Number formatting', () => {
    it('should format currency values', () => {
      const price = 25.5;
      const formatted = `€${price.toFixed(2)}`;
      expect(formatted).toBe('€25.50');
    });

    it('should handle whole numbers', () => {
      const price = 100;
      const formatted = `€${price.toFixed(2)}`;
      expect(formatted).toBe('€100.00');
    });
  });

  describe('String utilities', () => {
    it('should truncate long strings', () => {
      const longString = 'This is a very long string that should be truncated';
      const maxLength = 20;
      const truncated = longString.length > maxLength 
        ? longString.substring(0, maxLength) + '...' 
        : longString;
      expect(truncated).toBe('This is a very long ...');
    });

    it('should not truncate short strings', () => {
      const shortString = 'Short';
      const maxLength = 20;
      const truncated = shortString.length > maxLength 
        ? shortString.substring(0, maxLength) + '...' 
        : shortString;
      expect(truncated).toBe('Short');
    });
  });
});
