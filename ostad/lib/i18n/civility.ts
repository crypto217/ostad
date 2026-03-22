/**
 * Logic for dynamic civility (greeting) in 3 languages (FR, AR, EN)
 * based on teacher profile (gender + preferred_language).
 */

export function getCivility(
    fullName: string,
    gender: 'male' | 'female' | null,
    language: 'fr' | 'ar' | 'en' | null
): string {
    const firstName = fullName?.split(' ')[0] || ''

    switch (language) {
        case 'ar':
            return gender === 'female'
                ? `مرحباً أستاذة ${firstName}`
                : `مرحباً أستاذ ${firstName}`
        case 'en':
            return gender === 'female'
                ? `Welcome Ms. ${firstName}`
                : `Welcome Mr. ${firstName}`
        default: // 'fr'
            return gender === 'female'
                ? `Bonjour Mme ${firstName}`
                : `Bonjour M. ${firstName}`
    }
}

/**
 * Returns the locale string for Date.toLocaleDateString()
 */
export function getDateLocale(
    language: 'fr' | 'ar' | 'en' | null
): string {
    switch (language) {
        case 'ar': return 'ar-DZ'
        case 'en': return 'en-US'
        default: return 'fr-FR'
    }
}

/**
 * Returns true if the language requires RTL (Right-to-Left) layout
 */
export function isRTL(
    language: 'fr' | 'ar' | 'en' | null
): boolean {
    return language === 'ar'
}
