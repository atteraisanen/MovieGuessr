import { useEffect, useState } from "react";
import { SearchBar } from "./SearchBar";
import { SearchResults } from "./SearchResults";

function MovieBox() {
  const [movie, setMovie] = useState({});
  const [jsonGenres, setJsonGenres] = useState([]);
  const [jsonCast, setJsonCast] = useState([]);
  const [releaseYear, setReleaseYear] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [amountTries, setAmountTries] = useState(0);
  const [gameStatus, setGameStatus] = useState("playing");
  const [feedback, setFeedback] = useState("");
  const [guesses, setGuesses] = useState([]);

  const getEETDateString = () => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const eetOffset = 2;
    const eetTime = new Date(utc + 3600000 * eetOffset);
    return eetTime.toISOString().split("T")[0];
  };

  const todayKey = getEETDateString();
  const storageKey = `movieGame_${todayKey}`;
  const apiURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem(storageKey));

    if (savedData && savedData.date === todayKey) {
      setMovie(savedData.movie);
      setJsonGenres(savedData.jsonGenres);
      setJsonCast(savedData.jsonCast);
      setReleaseYear(savedData.releaseYear);
      setAmountTries(savedData.amountTries);
      setGuesses(savedData.guesses);
      setGameStatus(savedData.gameStatus);
      setIsLoading(false);
      return;
    }

    fetch(`${apiURL}/movie/`)
      .then((response) => response.json())
      .then((data) => {
        const year = parseInt(data.release_date?.slice(0, 4)) || 0;
        const newState = {
          movie: data,
          jsonGenres: data.genres || [],
          jsonCast: data.cast || [],
          releaseYear: year,
          amountTries: 0,
          guesses: [],
          gameStatus: "playing",
          date: todayKey,
        };

        localStorage.setItem(storageKey, JSON.stringify(newState));
        setMovie(data);
        setJsonGenres(newState.jsonGenres);
        setJsonCast(newState.jsonCast);
        setReleaseYear(year);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching movie:", err);
        setIsLoading(false);
      });
  }, []);

  const saveGame = (updated) => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        movie,
        jsonGenres,
        jsonCast,
        releaseYear,
        amountTries: updated.amountTries,
        guesses: updated.guesses,
        gameStatus: updated.gameStatus,
        date: todayKey,
      })
    );
  };

  const handleSelectResult = (title) => {
    if (gameStatus !== "playing") return;

    const normalizedGuess = title.trim().toLowerCase();
    const normalizedAnswer = movie.title?.trim().toLowerCase();

    const newTries = amountTries + 1;
    const newGuesses = [...guesses, title];
    let newStatus = gameStatus;

    if (normalizedGuess === normalizedAnswer) {
      newStatus = "won";
      setFeedback(`✅ Correct! The movie is "${movie.title}"`);
    } else if (newTries >= 5) {
      newStatus = "lost";
      setFeedback(`❌ Out of tries! The movie was "${movie.title}"`);
    } else {
      setFeedback("");
    }

    setAmountTries(newTries);
    setGuesses(newGuesses);
    setGameStatus(newStatus);
    setInput("");
    setResults([]);

    saveGame({
      amountTries: newTries,
      guesses: newGuesses,
      gameStatus: newStatus,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-white text-xl font-semibold">
        🔄 Loading today’s movie...
      </div>
    );
  }

  if (gameStatus === "won" || gameStatus === "lost") {
    return (
      <div className="max-w-2xl mx-auto text-center mt-20 px-6">
        <h1 className="text-4xl font-bold mb-6 text-white">
          🎬 Daily Movie Guess - Results
        </h1>

        <div className="text-xl italic text-purple-300 mb-4">
          "{movie.tagline}"
        </div>

        <div className="text-base text-gray-200 space-y-2 mb-6">
          <p>
            📅 <span className="font-semibold text-white">Release Year:</span>{" "}
            {releaseYear}
          </p>
          <p>
            🎭 <span className="font-semibold text-white">Genres:</span>{" "}
            {jsonGenres.map((g) => g.name).join(", ")}
          </p>
          <p>
            🧑‍🎤 <span className="font-semibold text-white">Main Cast:</span>{" "}
            {jsonCast
              .slice(0, 5)
              .map((c) => c.name)
              .join(", ")}
          </p>
          <p>
            📝 <span className="font-semibold text-white">Overview:</span>{" "}
            {movie.overview}
          </p>
        </div>

        <div
          className={`text-2xl font-bold mb-6 ${
            gameStatus === "won" ? "text-green-400" : "text-red-400"
          }`}
        >
          {gameStatus === "won" ? (
            "🎉 You guessed it!"
          ) : (
            <>
              😢 The correct answer was{" "}
              <span className="underline text-white">"{movie.title}"</span>
            </>
          )}
        </div>

        <div className="text-left max-w-md mx-auto mt-6">
          <p className="font-semibold mb-2">Your guesses:</p>
          <ul className="space-y-2">
            {guesses.map((guess, idx) => (
              <li
                key={idx}
                className={`flex items-center justify-between px-3 py-2 rounded ${
                  guess.toLowerCase() === movie.title.toLowerCase()
                    ? "bg-green-700 text-white"
                    : "bg-gray-700 text-white"
                }`}
              >
                <span
                  className={
                    guess.toLowerCase() === movie.title.toLowerCase()
                      ? "font-bold"
                      : ""
                  }
                >
                  {guess}
                </span>
                <span>
                  {guess.toLowerCase() === movie.title.toLowerCase()
                    ? "✅"
                    : "❌"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-gray-300 text-sm mt-6">
          Come back tomorrow for a new movie! 🎥
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-center mb-4">
        🎬 Guess the Movie
      </h1>

      <div className="text-xl text-center mb-6 italic text-gray-300">
        "{movie.tagline}"
      </div>

      <div className="text-center text-lg mb-4 text-blue-400">{feedback}</div>

      <div className="space-y-3 text-center mb-6 text-white">
        {amountTries > 0 && (
          <div>
            📅 <strong>Release Year:</strong> {releaseYear}
          </div>
        )}
        {amountTries > 1 && (
          <div>
            🎭 <strong>Genres:</strong>{" "}
            {jsonGenres.map((g) => g.name).join(", ")}
          </div>
        )}
        {amountTries > 2 && (
          <div>
            🧑‍🎤 <strong>Main Cast:</strong>{" "}
            {jsonCast
              .slice(0, 5)
              .map((c) => c.name)
              .join(", ")}
          </div>
        )}
        {amountTries > 3 && (
          <div>
            <strong>📝 Overview:</strong> {movie.overview}
          </div>
        )}
      </div>

      {gameStatus === "playing" ? (
        <>
          <SearchBar
            input={input}
            setInput={setInput}
            setResults={setResults}
          />
          <SearchResults results={results} onSelect={handleSelectResult} />

          {guesses.length > 0 && (
            <div className="mt-4 text-center">
              <p className="font-semibold mb-1 text-white">❌ Incorrect Guesses:</p>
              <ul className="space-y-1 text-red-400">
                {guesses.map((guess, idx) => (
                  <li key={idx}>{guess}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <button
          className="mt-5 bg-blue-600 text-white py-2 px-4 rounded-xl hover:bg-blue-700 transition"
          onClick={() => window.location.reload()}
        >
          🔁 Play Again
        </button>
      )}
    </div>
  );
}

export default MovieBox;
