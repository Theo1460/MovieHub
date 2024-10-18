"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Heart, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

const apiKey = 'ca033664d69e46239a2fefbbcd663c4d';

// Define Movie and Genre interfaces
interface Movie {
  id: number;
  title: string;
  overview: string;
  image: string;
  vote_average: number;
  vote_count: number;
  poster_path: string;
}

interface Genre {
  id: number;
  name: string;
}

// Fetch popular movies from TMDB API
async function fetchPopularMovies(genreId?: number): Promise<Movie[]> {
  const popularMoviesUrl = genreId
    ? `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}`
    : `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`;

  try {
    const response = await fetch(popularMoviesUrl);
    const data = await response.json();
    return data.results.map((movie: Movie) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      image: `https://image.tmdb.org/t/p/w400${movie.poster_path}`,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
    }));
  } catch (error) {
    console.error("Error fetching popular movies:", error);
    return [];
  }
}

// Fetch searched movies based on the query
async function searchMovies(query: string): Promise<Movie[]> {
  const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(searchUrl);
    const data = await response.json();
    return data.results.map((movie: Movie) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      image: `https://image.tmdb.org/t/p/w400${movie.poster_path}`,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
    }));
  } catch (error) {
    console.error("Error searching movies:", error);
    return [];
  }
}

// Fetch genres from TMDB API
async function fetchGenres(): Promise<Genre[]> {
  const genresUrl = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}`;
  try {
    const response = await fetch(genresUrl);
    const data = await response.json();
    return data.genres;
  } catch (error) {
    console.error("Error fetching genres:", error);
    return [];
  }
}

export default function Component() {
  const [searchTerm, setSearchTerm] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);

  // Utiliser localStorage seulement côté client
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedFavorites = localStorage.getItem("favorites");
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    }
  }, []);

  // Sauvegarder les favoris dans localStorage quand ils changent
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("favorites", JSON.stringify(favorites));
    }
  }, [favorites]);

  // Fetch genres on component mount
  useEffect(() => {
    async function getGenres() {
      const fetchedGenres = await fetchGenres();
      setGenres(fetchedGenres);
    }
    getGenres();
  }, []);

  // Fetch popular movies on component mount or when genre is selected
  useEffect(() => {
    async function getMovies() {
      const fetchedMovies = await fetchPopularMovies(selectedGenre || undefined);
      setMovies(fetchedMovies);
    }
    getMovies();
  }, [selectedGenre]);

  const handleSearch = async () => {
    if (searchTerm) {
      const searchedMovies = await searchMovies(searchTerm);
      setMovies(searchedMovies);
    } else {
      const fetchedMovies = await fetchPopularMovies(selectedGenre || undefined);
      setMovies(fetchedMovies);
    }
  };

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const MovieCard = ({ movie, isFavorite }: { movie: Movie; isFavorite: boolean }) => {
    return (
      <Card
        key={movie.id}
        className="w-full rounded-[2rem] overflow-hidden shadow-lg group relative"
      >
        <CardContent className="p-0">
          <div className="relative aspect-square">
            <Image
              src={movie.image}
              alt={movie.title}
              width={400}
              height={600}
              className="object-cover rounded-[2rem]"
            />
            {/* Description overlay on hover */}
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-80 transition-opacity rounded-[2rem] flex items-center justify-center p-4">
              <div className="text-white text-center">
                <p className="text-sm md:text-base mb-2">{movie.overview}</p>
                <div className="mb-2">
                  <p className="text-lg font-semibold">{movie.vote_average}/10</p>
                </div>
                <p className="text-sm">{movie.vote_count} reviews</p>
              </div>
            </div>
            {/* Favorite button in the top-right corner, hidden by default and shown on hover */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 w-10 h-10 rounded-full bg-background/50 hover:bg-background/75 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => toggleFavorite(movie.id)}
            >
              <Heart
                className={`w-6 h-6 ${
                  isFavorite ? "fill-red-500 text-red-500" : "text-white"
                }`}
              />
              <span className="sr-only">Toggle favorite</span>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="p-4">
          <h3 className="font-medium text-base text-center w-full text-foreground">
            {movie.title}
          </h3>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="bg-background min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8 text-primary">Popular Movies</h1>
      <div className="flex items-center mb-8">
        <Input
          type="search"
          placeholder="Search movies..."
          className="max-w-md text-black bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button
          onClick={handleSearch}
          className="ml-2 bg-black text-white hover:bg-gray-800"
          variant="ghost"
          size="icon"
        >
          <Search className="w-6 h-6" />
          <span className="sr-only">Search</span>
        </Button>
      </div>

      {/* Genre Filter */}
      <div className="flex mb-8">
        <select
          value={selectedGenre || ""}
          onChange={(e) => setSelectedGenre(Number(e.target.value))}
          className="bg-white text-black p-2 rounded-md"
        >
          <option value="">All Genres</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All Movies</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                isFavorite={favorites.includes(movie.id)}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="favorites">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {movies
              .filter((movie) => favorites.includes(movie.id))
              .map((movie) => (
                <MovieCard key={movie.id} movie={movie} isFavorite={true} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
