import { calculateAge, isValidName, isValidEmail, isValidCodePostal } from './module.js';

/**
 * Test the calculateAge function
 * @function calculateAge
 */
describe('calculateAge Unit Test Suites', () => {
    it('should return the correct age', () => {
        const thomas = {
            birth: new Date("07/14/2000")
        };
        expect(calculateAge(thomas)).toEqual(25);
    });
    it('should throw a "missing param p" error', () => {
        expect(() => calculateAge()).toThrow("missing param p")
    });
    it('should throw a "param is not an object" error', () => {
        expect(() => calculateAge("abc")).toThrow("param is not an object")
    });
    it('should throw a "object doesn t have a birth property" error', () => {
        expect(() => calculateAge({})).toThrow("object doesn t have a birth property")
    });
    it('should throw a "property birth is not a Date" error', () => {
        expect(() => calculateAge({ birth: "abc" })).toThrow("property birth is not a Date")
    });
    it('should throw a "date invalid" error', () => {
        const badDate = new Date(NaN);
        expect(() => calculateAge({ birth: badDate })).toThrow("date invalid");
    });
})



/**
 * Test the isValidEmail functione si l'email est valide, false sinon
 * @function isValidEmail
 */
describe('isValidEmail Unit Test Suites', () => {
    it('should return true for valid email', () => {
        expect(isValidEmail('thomas.barrault@gmail.com')).toEqual(true);
    });
    it('should return false when email length is lower than 3', () => {
        expect(isValidEmail('a@')).toEqual(false);
    });
    it('should return false for invalid email', () => {
        expect(isValidEmail('thomas.barrault@gmail')).toEqual(false);
    });
    it('should throw a "missing param email" error', () => {
        expect(() => isValidEmail()).toThrow("missing param email");
    });
    it('should throw a "param is not a string" error', () => {
        expect(() => isValidEmail(123)).toThrow("param is not a string");
    });
    it('should return false if email does not contain @', () => {
        expect(isValidEmail('thomas.barraultgmail.com')).toEqual(false);
    });
});

/**
 * Test the isValidCodePostal function
 * @function isValidCodePostal
 */
describe('isValidCodePostal Unit Test Suites', () => {
    it('should return true for valid code postal', () => {
        expect(isValidCodePostal('06640')).toEqual(true);
    });
    it('should return false when code postal has more than 5 chars', () => {
        expect(isValidCodePostal('066402')).toEqual(false);
    });
    it('should return false when code postal has less than 5 chars', () => {
        expect(isValidCodePostal('0664')).toEqual(false);
    });
    it('should return false when code postal contains letters', () => {
        expect(isValidCodePostal('066A0')).toEqual(false);
    });
    it('should throw a "missing param codePostal" error', () => {
        expect(() => isValidCodePostal()).toThrow("missing param codePostal");
    });
    it('should throw a "param is not a string" error', () => {
        expect(() => isValidCodePostal(123)).toThrow("param is not a string");
    });
    it('should return false if code postal is not numeric', () => {
        expect(isValidCodePostal('abcde')).toEqual(false);
    });
});



/**
 * Test the isValidName function
 * @function isValidName
 */
describe('isValidName Unit Test Suites', () => {
    it('should return true for valid nom, prenom and ville', () => {
        expect(isValidName({ nom: 'Barrault', prenom: 'Thomas', ville: 'Nice' })).toEqual(true);
    });
    it('should return false when nom contains digits', () => {
        expect(isValidName({ nom: 'barr0lt', prenom: 'Thomas', ville: 'Nice' })).toEqual(false);
    });
    it('should return false when prenom is too short', () => {
        expect(isValidName({ nom: 'barrault', prenom: 'T', ville: 'Nice' })).toEqual(false);
    });
    it('should return false when ville contains special characters', () => {
        expect(isValidName({ nom: 'Barrault', prenom: 'Thomas', ville: 'Ni!ce' })).toEqual(false);
    });
    it('should accept accents and hyphen', () => {
        expect(isValidName({ nom: 'Brûlé', prenom: 'Anaïs', ville: 'Saint-Étienne' })).toEqual(true);
    });
    it('should throw a "missing param name" error', () => {
        expect(() => isValidName()).toThrow("missing param name");
    });
    it('should throw a "param is not an object" error', () => {
        expect(() => isValidName("abc")).toThrow("param is not an object");
    });
    it('should throw a "object must include nom, prenom and ville" error', () => {
        expect(() => isValidName({ nom: 'barrault', prenom: 'thomas' })).toThrow("object must include nom, prenom and ville");
    });
    it('should throw a "nom, prenom and ville must be strings" error', () => {
        expect(() => isValidName({ nom: 1, prenom: 'Thomas', ville: 'Nice' })).toThrow("nom, prenom and ville must be strings");
    });
});