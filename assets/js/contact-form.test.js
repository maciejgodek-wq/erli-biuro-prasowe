/**
 * contact-form.test.js — testy jednostkowe (plain JS, Node.js, bez zależności)
 * Uruchomienie: node erli-de/assets/js/contact-form.test.js
 * Podejście: RED → GREEN → REFACTOR (D2a)
 */

const { isValidEmail, isValidRequired, validateFields } = require('./contact-form.js');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log('  ✓ ' + name);
    passed++;
  } catch (err) {
    console.error('  ✗ ' + name + ': ' + err.message);
    failed++;
  }
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected)
        throw new Error('Expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual));
    },
    toBeTruthy() {
      if (!actual) throw new Error('Expected truthy, got ' + JSON.stringify(actual));
    },
    toBeFalsy() {
      if (actual) throw new Error('Expected falsy, got ' + JSON.stringify(actual));
    },
    toHaveLength(len) {
      if ((actual || []).length !== len)
        throw new Error('Expected length ' + len + ', got ' + (actual || []).length);
    },
  };
}

/* =====================================================================
   isValidEmail
   ===================================================================== */
console.log('\nisValidEmail:');

test('valid email passes', () =>
  expect(isValidEmail('test@erli.de')).toBeTruthy());

test('valid email with subdomain passes', () =>
  expect(isValidEmail('user@mail.erli.de')).toBeTruthy());

test('missing @ fails', () =>
  expect(isValidEmail('not-an-email')).toBeFalsy());

test('empty string fails', () =>
  expect(isValidEmail('')).toBeFalsy());

test('email with leading space fails', () =>
  expect(isValidEmail(' test@erli.de')).toBeFalsy());

test('email without TLD fails', () =>
  expect(isValidEmail('test@erli')).toBeFalsy());

/* =====================================================================
   isValidRequired
   ===================================================================== */
console.log('\nisValidRequired:');

test('non-empty string passes', () =>
  expect(isValidRequired('Hans')).toBeTruthy());

test('string with content passes', () =>
  expect(isValidRequired('  hello  ')).toBeTruthy());

test('empty string fails', () =>
  expect(isValidRequired('')).toBeFalsy());

test('whitespace-only string fails', () =>
  expect(isValidRequired('   ')).toBeFalsy());

test('number type fails', () =>
  expect(isValidRequired(42)).toBeFalsy());

/* =====================================================================
   validateFields
   ===================================================================== */
console.log('\nvalidateFields:');

const validData = {
  name: 'Hans Müller',
  email: 'hans@erli.de',
  betreff: 'partnerschaft',
  nachricht: 'Hallo, ich möchte Partner werden.',
  dsgvo: true,
};

test('valid data returns valid=true, no errors', () => {
  const { valid, errors } = validateFields(validData);
  expect(valid).toBe(true);
  expect(Object.keys(errors).length).toBe(0);
});

test('empty name → error.name set, valid=false', () => {
  const { valid, errors } = validateFields({ ...validData, name: '' });
  expect(valid).toBe(false);
  expect(errors.name).toBeTruthy();
});

test('invalid email → error.email set, valid=false', () => {
  const { valid, errors } = validateFields({ ...validData, email: 'not-valid' });
  expect(valid).toBe(false);
  expect(errors.email).toBeTruthy();
});

test('empty betreff → error.betreff set', () => {
  const { valid, errors } = validateFields({ ...validData, betreff: '' });
  expect(valid).toBe(false);
  expect(errors.betreff).toBeTruthy();
});

test('empty nachricht → error.nachricht set', () => {
  const { valid, errors } = validateFields({ ...validData, nachricht: '' });
  expect(valid).toBe(false);
  expect(errors.nachricht).toBeTruthy();
});

test('dsgvo=false → error.dsgvo set', () => {
  const { valid, errors } = validateFields({ ...validData, dsgvo: false });
  expect(valid).toBe(false);
  expect(errors.dsgvo).toBeTruthy();
});

test('all fields empty → valid=false, 5 errors', () => {
  const { valid, errors } = validateFields({
    name: '', email: '', betreff: '', nachricht: '', dsgvo: false,
  });
  expect(valid).toBe(false);
  expect(Object.keys(errors).length).toBe(5);
});

test('dsgvo=true but invalid email → only email error', () => {
  const { errors } = validateFields({ ...validData, email: 'bad' });
  expect(errors.email).toBeTruthy();
  expect(errors.dsgvo === undefined).toBe(true);
});

/* =====================================================================
   ERGEBNIS
   ===================================================================== */
const total = passed + failed;
console.log('\n' + total + ' tests: ' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);
