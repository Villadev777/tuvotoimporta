/**
 * Validates a Peruvian DNI using the Modulo 11 algorithm (RENIEC standard).
 * 
 * @param dni The 8-digit DNI number string.
 * @param verificationDigit The single verification digit provided by user.
 * @returns boolean True if valid, false otherwise.
 */
export function validateDni(dni: string, verificationDigit: string): boolean {
    if (!dni || !verificationDigit || dni.length !== 8) return false;

    // Based on the algorithm: sum products with weights, mod 11, complement.
    const mult = [3, 2, 7, 6, 5, 4, 3, 2];
    let total = 0;
    for (let i = 0; i < 8; i++) {
        total += parseInt(dni.charAt(i), 10) * mult[i];
    }

    const res = 11 - (total % 11);
    let finalDigit = res;

    if (res === 10) finalDigit = 1;
    if (res === 11) finalDigit = 0;

    // If verificationDigit is 'K' or 'k', convert to expected value if needed, 
    // but standard DNI uses digits 0-9. Some sources say 10->K. 
    // However, the frontend limits input specifically.
    // For this implementation, we compare string values.

    // Note: If the user inputs 'K', and the calc result is 10 (which maps to 1), they don't match.
    // This implementation assumes the standard numeric check digit found on blue DNIs.

    return finalDigit.toString() === verificationDigit;
}
