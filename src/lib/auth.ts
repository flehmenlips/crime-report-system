import { cookies } from 'next/headers'

export interface User {
  id: string
  name: string
  email: string
  role: string
}

const users = [
  {
    id: "1",
    name: "Police Officer",
    email: "officer@police.gov",
    role: "law_enforcement",
    username: "admin",
    password: "password"
  },
  {
    id: "2", 
    name: "George Page",
    email: "george@birkenfeldfarm.com",
    role: "citizen",
    username: "citizen",
    password: "password"
  },
  {
    id: "3",
    name: "George Page", 
    email: "george@birkenfeldfarm.com",
    role: "citizen",
    username: "george",
    password: "password"
  }
]

export async function authenticateUser(username: string, password: string): Promise<User | null> {
  const user = users.find(u => u.username === username && u.password === password)
  if (user) {
    // Return user without password
    const { password: _, username: __, ...userWithoutCredentials } = user
    return userWithoutCredentials as User
  }
  return null
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')
    
    if (!userCookie) {
      return null
    }
    
    return JSON.parse(userCookie.value) as User
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
