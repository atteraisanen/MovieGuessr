export const SearchResults = ({ results, onSelect }) => {
    return (
        <div className="mt-6 w-full max-w-xl mx-auto">
            {results.length > 0 ? (
                <ul className="space-y-3 max-h-60 overflow-y-auto">
                    {results.map((result, index) => (
                        <li
                            key={index}
                            onClick={() => onSelect(result.title)}
                            className="p-4 bg-white rounded-xl shadow hover:shadow-md transition-shadow border border-gray-100 cursor-pointer hover:bg-gray-50"
                        >
                            <p className="text-lg font-semibold text-gray-800">{result.title}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-gray-500"></p>
            )}
        </div>
    );
};

export default SearchResults;
