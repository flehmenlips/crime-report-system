import { cookies } from 'next/headers'
import { User, users } from './auth'

export async function authenticateUser(username: string, password: string): Promise<User | null> {
  console.log('=== AUTH DEBUG ===')
  console.log('Attempting to authenticate user:', username)
  console.log('Total users in database:', users.length)
  console.log('Available users:', users.map(u => ({ username: u.username, role: u.role })))
  console.log('Looking for exact match:', { username, password })
  
  const user = users.find(u => u.username === username && u.password === password)
  if (user) {
    console.log('✅ User found:', { username: user.username, role: user.role })
    // Return user without password
    const { password: _, username: __, ...userWithoutCredentials } = user
    return userWithoutCredentials as User
  }
  
  console.log('❌ No user found for:', username)
  console.log('=== END AUTH DEBUG ===')
  return null
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')
    
    if (!userCookie) {
      return null
    }
    
    const user = JSON.parse(userCookie.value) as User
    
    // Validate role - if it's the old 'citizen' role, clear the session
    if (user.role === 'citizen') {
      console.log('Found old citizen role, clearing session')
      await clearUserSession()
      return null
    }
    
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function setUserSession(user: User): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('user', JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })
}

export async function clearUserSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('user')
}
