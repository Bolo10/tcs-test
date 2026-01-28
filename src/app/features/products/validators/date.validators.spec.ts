import { FormControl, FormGroup } from '@angular/forms';
import {
  releaseNotBeforeToday,
  revisionIsPlusOneYear,
} from './date.validators';

describe('Date Validators', () => {
  describe('releaseNotBeforeToday', () => {
    it('should return null if value is empty', () => {
      const validator = releaseNotBeforeToday;
      const control = new FormControl('');
      expect(validator(control)).toBeNull();
    });

    it('should return error if date is before today', () => {
      const validator = releaseNotBeforeToday;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const yyyy = yesterday.getFullYear();
      const mm = String(yesterday.getMonth() + 1).padStart(2, '0');
      const dd = String(yesterday.getDate()).padStart(2, '0');

      const control = new FormControl(`${yyyy}-${mm}-${dd}`);

      expect(validator(control)).toEqual({ releaseBeforeToday: true });
    });

    it('should return null if date is today', () => {
      const validator = releaseNotBeforeToday;

      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');

      const control = new FormControl(`${yyyy}-${mm}-${dd}`);

      expect(validator(control)).toBeNull();
    });

    it('should return null if date is in the future', () => {
      const validator = releaseNotBeforeToday;

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const yyyy = tomorrow.getFullYear();
      const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const dd = String(tomorrow.getDate()).padStart(2, '0');

      const control = new FormControl(`${yyyy}-${mm}-${dd}`);

      expect(validator(control)).toBeNull();
    });
  });

  describe('revisionIsPlusOneYear', () => {
    it('should return null if dates are missing', () => {
      const validator = revisionIsPlusOneYear;

      const form = new FormGroup({
        date_release: new FormControl(''),
        date_revision: new FormControl(''),
      });

      expect(validator(form)).toBeNull();
    });

    it('should return null when revision is exactly +1 year', () => {
      const validator = revisionIsPlusOneYear;

      const form = new FormGroup({
        date_release: new FormControl('2025-01-28'),
        date_revision: new FormControl('2026-01-28'),
      });

      expect(validator(form)).toBeNull();
    });

    it('should return error when revision is NOT +1 year', () => {
      const validator = revisionIsPlusOneYear;

      const form = new FormGroup({
        date_release: new FormControl('2025-01-28'),
        date_revision: new FormControl('2025-12-30'),
      });

      expect(validator(form)).toEqual({ revisionNotOneYear: true });
    });
  });
});
