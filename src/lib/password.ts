/**
 * Password Security Utilities
 * 
 * Implements industry-standard password hashing using bcrypt.
 * - Salt rounds: 12 (high security, reasonable performance)
 * - Automatic salt generation
 * - Timing-safe comparison
 */

import bcrypt from 'bcrypt'

// Salt rounds: Higher = more secure but slower
// 12 rounds is recommended for production (takes ~300ms to hash)
const SALT_ROUNDS = 12

/**
 * Hash a plain text password using bcrypt
 * 
 * @param password - Plain text password to hash
 * @returns Promise resolving to hashed password
 * @throws Error if hashing fails
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length === 0) {
    throw new Error('Password cannot be empty')
  }
  
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
    return hashedPassword
  } catch (error) {
    console.error('Error hashing password:', error)
    throw new Error('Failed to hash password')
  }
}

/**
 * Verify a plain text password against a hashed password
 * 
 * @param password - Plain text password to verify
 * @param hashedPassword - Hashed password from database
 * @returns Promise resolving to true if password matches, false otherwise
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  if (!password || !hashedPassword) {
    return false
  }
  
  try {
    // Check if the stored password is already hashed (starts with $2b$12$)
    const isHashed = hashedPassword.startsWith('$2b$12$')
    
    if (isHashed) {
      // New format: use bcrypt to verify
      const isValid = await bcrypt.compare(password, hashedPassword)
      return isValid
    } else {
      // Legacy format: plain text comparison (TEMPORARY - for migration period)
      console.warn('⚠️ Using legacy plain text password verification - user should reset password')
      return password === hashedPassword
    }
  } catch (error) {
    console.error('Error verifying password:', error)
    return false
  }
}

/**
 * Validate password strength
 * 
 * Requirements for law enforcement compliance:
 * - Minimum 12 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * 
 * @param password - Password to validate
 * @returns Object with isValid flag and error messages
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
} {
  const errors: string[] = []
  
  // Check length
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long')
  }
  
  // Check for uppercase
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  // Check for lowercase
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  // Check for number
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  // Check for special character
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*, etc.)')
  }
  
  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  if (errors.length === 0) {
    if (password.length >= 16) {
      strength = 'strong'
    } else {
      strength = 'medium'
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength
  }
}

/**
 * Check if a password appears in common password lists
 * (Basic check - in production, use a comprehensive leaked password database)
 * 
 * @param password - Password to check
 * @returns true if password is too common
 */
export function isCommonPassword(password: string): boolean {
  const commonPasswords = [
    'password', 'password123', '12345678', '123456789', '1234567890',
    'qwerty', 'abc123', 'monkey', '1234567', '12345678910',
    'password1', 'qwerty123', 'admin', 'letmein', 'welcome',
    'admin123', 'root', 'password!', 'Password1', 'Password123'
  ]
  
  return commonPasswords.some(common => 
    password.toLowerCase().includes(common.toLowerCase())
  )
}

/**
 * Check if a password is stored in legacy plain text format
 * 
 * @param hashedPassword - Password from database
 * @returns true if password is plain text (not hashed)
 */
export function isLegacyPassword(hashedPassword: string): boolean {
  return !hashedPassword.startsWith('$2b$12$')
}

/**
 * Migrate a user's password from plain text to hashed format
 * This should be called when a user with a legacy password logs in
 * 
 * @param userId - User ID to update
 * @param plainTextPassword - The plain text password to hash
 * @param prisma - Prisma client instance
 * @returns Promise resolving when migration is complete
 */
export async function migrateUserPassword(
  userId: string,
  plainTextPassword: string,
  prisma: any
): Promise<void> {
  try {
    const hashedPassword = await hashPassword(plainTextPassword)
    
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })
    
    console.log(`✅ Migrated password for user ${userId} to hashed format`)
  } catch (error) {
    console.error(`❌ Failed to migrate password for user ${userId}:`, error)
    throw error
  }
}

