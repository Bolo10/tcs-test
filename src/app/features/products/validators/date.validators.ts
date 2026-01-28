import { ValidationErrors, ValidatorFn } from '@angular/forms';

function toDateOnly(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
}

export const releaseNotBeforeToday: ValidatorFn = (
  control,
): ValidationErrors | null => {
  const d = toDateOnly(control.value);
  if (!d) return null;

  const today = new Date();
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return d < t0 ? { releaseBeforeToday: true } : null;
};

export const revisionIsPlusOneYear: ValidatorFn = (
  group,
): ValidationErrors | null => {
  const release = toDateOnly(group.get('date_release')?.value);
  const revision = toDateOnly(group.get('date_revision')?.value);
  if (!release || !revision) return null;

  const expected = new Date(release);
  expected.setFullYear(expected.getFullYear() + 1);

  const same =
    revision.getFullYear() === expected.getFullYear() &&
    revision.getMonth() === expected.getMonth() &&
    revision.getDate() === expected.getDate();

  return same ? null : { revisionNotOneYear: true };
};
