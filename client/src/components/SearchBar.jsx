import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { FaSearch } from 'react-icons/fa';
import { ImSpinner2 } from 'react-icons/im';
export const SearchBar = ({ input, setInput, setResults }) => {
    const [loading, setLoading] = useState(false);
    const apiURL = import.meta.env.VITE_API_URL;

    const fetchData = async (value) => {
        if (!value) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${apiURL}/movies/${value}`);
            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error('Error:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const debouncedFetch = useCallback(debounce(fetchData, 400), []);

    const handleChange = (value) => {
        setInput(value);
        debouncedFetch(value);
    };

    useEffect(() => {
        return () => debouncedFetch.cancel();
    }, [debouncedFetch]);

    return (
        <div className="relative w-full max-w-xl mx-auto mt-8">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            {loading && (
                <ImSpinner2 className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-blue-500" />
            )}
            <input
                type="text"
                value={input}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Search for a movie..."
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            />
        </div>
    );
};

export default SearchBar;
