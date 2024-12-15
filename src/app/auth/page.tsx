'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../lib/firebase'

export default function AuthForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('') // New state for username
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent, action: 'signup' | 'login') => {
    event.preventDefault()
    setError(null) // Reset error

    try {
      if (action === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password)
        router.push('/films') // Redirect to root
      } else if (action === 'login') {
        await signInWithEmailAndPassword(auth, email, password)
        router.push('/films') // Redirect to root
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Authentication</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signup" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
              <TabsTrigger value="signup" className="text-base h-full data-[state=active]:bg-background">Sign Up</TabsTrigger>
              <TabsTrigger value="login" className="text-base h-full data-[state=active]:bg-background">Log In</TabsTrigger>
            </TabsList>

            {error && <p className="text-red-500 text-center">{error}</p>}  {/* Display error */}

            <TabsContent value="signup">
              <form onSubmit={(e) => handleSubmit(e, 'signup')} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="signup-username" className="text-base">Username</Label>
                  <Input 
                    id="signup-username" 
                    type="text" 
                    placeholder="Username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required 
                    className="text-base py-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-base">Email</Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    placeholder="your@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    className="text-base py-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-base">Password</Label>
                  <Input 
                    id="signup-password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    className="text-base py-2"
                  />
                </div>
                <Button type="submit" className="w-full text-base py-2">Sign Up</Button>
              </form>
            </TabsContent>

            <TabsContent value="login">
              <form onSubmit={(e) => handleSubmit(e, 'login')} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-base">Email</Label>
                  <Input 
                    id="login-email" 
                    type="email" 
                    placeholder="your@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    className="text-base py-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-base">Password</Label>
                  <Input 
                    id="login-password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    className="text-base py-2"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <Button type="submit" className="w-1/2 text-base py-2">Log In</Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
