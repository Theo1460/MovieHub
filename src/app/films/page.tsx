"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Heart, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { auth, db, onAuthStateChanged, doc, setDoc, getDoc } from "@/lib/firebase";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

const apiKey = 'ca033664d69e46239a2fefbbcd663c4d'.replace(/'/g, '&#39;');

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

interface User {
  uid: string;
  // Ajoutez d'autres propriétés utilisateur si nécessaire
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
      image: movie.poster_path ? `https://image.tmdb.org/t/p/w400${movie.poster_path}` : '', // Ajoutez cette vérification
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
      image: movie.poster_path ? `https://image.tmdb.org/t/p/w400${movie.poster_path}` : '', // Ajoutez cette vérification
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

const loadFavoriteMovies = async (favoriteIds: number[]): Promise<Movie[]> => {
  const favoriteMovies = await Promise.all(
    favoriteIds.map(async (id) => {
      const response = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`);
      const movie = await response.json();
      return {
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        image: movie.poster_path ? `https://image.tmdb.org/t/p/w400${movie.poster_path}` : '', // Ajoutez cette vérification
        vote_average: movie.vote_average,
        vote_count: movie.vote_count,
        poster_path: movie.poster_path, // Ajoutez cette ligne
      };
    })
  );
  return favoriteMovies;
};

export default function Component() {
  const [searchTerm, setSearchTerm] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const router = useRouter();

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

  const loadFavorites = async (uid: string) => {
    const favoritesCollection = await getDoc(doc(db, "favorites", uid));
    if (favoritesCollection.exists()) {
      const favoriteIds = favoritesCollection.data().favorites || [];
      setFavorites(favoriteIds);
      const favoriteMovies = await loadFavoriteMovies(favoriteIds);
      setFavoriteMovies(favoriteMovies);
    }
  };

  const saveFavorite = async (uid: string, movieId: number) => {
    const userFavoritesRef = doc(db, "favorites", uid);
    const userFavoritesDoc = await getDoc(userFavoritesRef);
    if (userFavoritesDoc.exists()) {
      const userFavorites = userFavoritesDoc.data().favorites || [];
      if (!userFavorites.includes(movieId)) {
        userFavorites.push(movieId);
        await setDoc(userFavoritesRef, { favorites: userFavorites }, { merge: true });
      }
    } else {
      await setDoc(userFavoritesRef, { favorites: [movieId] });
    }
  };

  const removeFavorite = async (uid: string, movieId: number) => {
    const userFavoritesRef = doc(db, "favorites", uid);
    const userFavoritesDoc = await getDoc(userFavoritesRef);
    if (userFavoritesDoc.exists()) {
      const userFavorites = userFavoritesDoc.data().favorites || [];
      const updatedFavorites = userFavorites.filter((id: number) => id !== movieId);
      await setDoc(userFavoritesRef, { favorites: updatedFavorites }, { merge: true });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        loadFavorites(user.uid);
      } else {
        setUser(null);
        setFavorites([]); // Ajoutez cette ligne pour vider les favoris lorsque l'utilisateur se déconnecte
      }
    });
    return () => unsubscribe();
  }, []);

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
    if (user) {
      if (favorites.includes(id)) {
        removeFavorite(user.uid, id);
      } else {
        saveFavorite(user.uid, id);
      }
    } else {
      setShowLoginDialog(true);
    }
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
    setFavoriteMovies((prev) =>
      prev.some((movie) => movie.id === id)
        ? prev.filter((movie) => movie.id !== id)
        : [...prev, movies.find((movie) => movie.id === id)!]
    );
  };

  const handleLoginRedirect = () => {
    router.push("/auth");
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
              priority // Ajoutez cette ligne
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
            {favoriteMovies.length > 0 ? (
              favoriteMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} isFavorite={true} />
              ))
            ) : (
              <p>No favorite movies found.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connexion requise</DialogTitle>
          </DialogHeader>
          <p>Vous devez être connecté pour ajouter des films à vos favoris.</p>
          <DialogFooter>
            <Button onClick={handleLoginRedirect} className="bg-black text-white hover:bg-gray-800">
              Se connecter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
