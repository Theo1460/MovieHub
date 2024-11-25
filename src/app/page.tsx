"use client";
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push('/auth');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-800 text-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">MovieHub</h1>
          <nav>
            <Button 
              variant="outline" 
              className="text-black border-white hover:bg-white hover:text-gray-800"
              onClick={handleLoginClick}
            >
              Se connecter
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <section className="relative h-[calc(100vh-64px)] flex items-center justify-center text-white">
          <Image
            src="/placeholder.svg?height=1080&width=1920&text=Cinema"
            alt="Fond de cinéma"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="relative z-10 text-center px-4">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">Bienvenue sur MovieHub</h2>
            <p className="text-xl sm:text-2xl mb-8 max-w-2xl mx-auto">Votre destination ultime pour découvrir, discuter et partager vos films préférés</p>
            <Button size="lg" className="bg-white text-gray-800 hover:bg-gray-200">
              Explorez notre collection
            </Button>
          </div>
        </section>
      </main>
    </div>
  )
}

