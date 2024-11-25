"use client";
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [movieImages, setMovieImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const handleLoginClick = () => {
    router.push('/auth');
  };

  const handleExploreClick = () => {
    router.push('/films');
  };

  useEffect(() => {
    async function fetchMovieImages() {
      try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=ca033664d69e46239a2fefbbcd663c4d`);
        const data = await response.json();
        const images = data.results.map((movie: { backdrop_path: string }) => `https://image.tmdb.org/t/p/w1920_and_h1080_bestv2${movie.backdrop_path}`);
        setMovieImages(images);
      } catch (error) {
        console.error("Error fetching movie images:", error);
      }
    }
    fetchMovieImages();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % movieImages.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(interval);
  }, [movieImages]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-black bg-opacity-30 backdrop-blur-md text-white absolute top-0 left-0 w-full z-20">
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
        <section className="relative h-screen flex items-center justify-center text-white">
          <Image
            src={movieImages[currentImageIndex] || "/placeholder.svg?height=1080&width=1920&text=Cinema"}
            alt="Fond de cinéma"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="relative z-10 text-center px-4">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">MovieHub</h2>
            <p className="text-xl sm:text-2xl mb-8 max-w-2xl mx-auto"></p>
            <Button size="lg" className="bg-white text-gray-800 hover:bg-gray-200" onClick={handleExploreClick}>
              Explorez notre collection
            </Button>
          </div>
        </section>
      </main>
    </div>
  )
}

