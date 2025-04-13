import { useEffect, useState } from "react";
import { SearchBar } from "./SearchBar";
import { SearchResults } from "./SearchResults";

function MovieBox() {
  const [movie, setMovie] = useState({});
  const [jsonGenres, setJsonGenres] = useState([]);
  const [jsonCast, setJsonCast] = useState([]);
  const [releaseYear, setReleaseYear] = useState(0);

  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [amountTries, setAmountTries] = useState(0);
  const [gameStatus, setGameStatus] = useState("playing"); // 'playing' | 'won' | 'lost'
  const [feedback, setFeedback] = useState("");
  const [guesses, setGuesses] = useState([]);
  const apiURL = import.meta.env.VITE_API_URL;

  const getEETDateString = () => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const eetOffset = 2; // UTC+2
    const eetTime = new Date(utc + 3600000 * eetOffset);
    return eetTime.toISOString().split("T")[0];
  };

  const storageKey = `movieGame_${getEETDateString()}`;

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem(storageKey));

    if (savedData) {
      setMovie(savedData.movie);
      setJsonGenres(savedData.jsonGenres);
      setJsonCast(savedData.jsonCast);
      setReleaseYear(savedData.releaseYear);
      setAmountTries(savedData.amountTries);
      setGuesses(savedData.guesses);
      setGameStatus(savedData.gameStatus);
      return;
    }

    fetch(`${apiURL}/movie/`)
      .then((response) => response.json())
      .then((data) => {
        const year = parseInt(data.release_date?.slice(0, 4)) || 0;
        const state = {
          movie: data,
          jsonGenres: data.genres || [],
          jsonCast: data.cast || [],
          releaseYear: year,
          amountTries: 0,
          guesses: [],
          gameStatus: "playing",
        };

        setMovie(data);
        setJsonGenres(data.genres || []);
        setJsonCast(data.cast || []);
        setReleaseYear(year);
        localStorage.setItem(storageKey, JSON.stringify(state));
      })
      .catch((err) => console.error("Error fetching movie:", err));
  }, []);

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
      })
    );
  };

  const renderClues = () => (
    <div className="text-base text-gray-200 space-y-2 mb-6 text-center">
      {amountTries > 0 && (
        <p>
          📅 <span className="font-semibold text-white">Release Year:</span>{" "}
          {releaseYear}
        </p>
      )}
      {amountTries > 1 && (
        <p>
          🎭 <span className="font-semibold text-white">Genres:</span>{" "}
          {jsonGenres.map((g) => g.name).join(", ")}
        </p>
      )}
      {amountTries > 2 && (
        <p>
          🧑‍🎤 <span className="font-semibold text-white">Main Cast:</span>{" "}
          {jsonCast.slice(0, 5).map((c) => c.name).join(", ")}
        </p>
      )}
      {amountTries > 3 && (
        <p>
          📝 <span className="font-semibold text-white">Overview:</span>{" "}
          {movie.overview}
        </p>
      )}
    </div>
  );

  if (gameStatus === "won" || gameStatus === "lost") {
    return (
      <div className="max-w-2xl mx-auto text-center mt-20 px-6">
        <h1 className="text-4xl font-bold mb-6 text-white">
          🎬 Guess the Movie
        </h1>

        <div className="text-xl italic text-purple-300 mb-4">
          "{movie.tagline}"
        </div>

        {renderClues()}

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
                  guess === movie.title
                    ? "bg-green-700 text-white"
                    : "bg-gray-700 text-white"
                }`}
              >
                <span className={guess === movie.title ? "font-bold" : ""}>
                  {guess}
                </span>
                <span>{guess === movie.title ? "✅" : "❌"}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-gray-300 text-sm mt-4">
          Come back tomorrow for a new movie! 🎥
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 text-center">
      <h1 className="text-4xl font-bold mb-6 text-white">🎬 Guess the Movie</h1>

      <div className="text-xl italic text-purple-300 mb-4">
        "{movie.tagline}"
      </div>

      {feedback && (
        <div className="text-lg font-semibold text-yellow-300 mb-4">
          {feedback}
        </div>
      )}

      {renderClues()}

      <SearchBar input={input} setInput={setInput} setResults={setResults} />
      <SearchResults results={results} onSelect={handleSelectResult} />

      {guesses.length > 0 && (
        <div className="text-left max-w-md mx-auto mt-6">
          <p className="font-semibold mb-2">Your guesses:</p>
          <ul className="space-y-2">
            {guesses.map((guess, idx) => (
              <li
                key={idx}
                className={`flex items-center justify-between px-3 py-2 rounded ${
                  guess === movie.title
                    ? "bg-green-700 text-white"
                    : "bg-gray-700 text-white"
                }`}
              >
                <span className={guess === movie.title ? "font-bold" : ""}>
                  {guess}
                </span>
                <span>{guess === movie.title ? "✅" : "❌"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default MovieBox;
