import { useState } from 'react';

export default function ScoreSubmission({ score, onClose }) {
    const [initials, setInitials] = useState('');
    
    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Submit to database later
        console.log('Submitting score:', { initials, score });
        onClose();
    };
    
    const handleChange = (e) => {
        // Limit to 3 characters, uppercase only
        const value = e.target.value.toUpperCase().slice(0, 3);
        setInitials(value);
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-[300px]">
                <h2 className="text-xl font-bold mb-4">Submit Your Score</h2>
                <p className="mb-4">Final Score: {score}</p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="initials" className="block text-sm font-medium mb-1">
                            Enter your initials (3 letters):
                        </label>
                        <input
                            type="text"
                            id="initials"
                            value={initials}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-lg text-center text-2xl font-bold tracking-wider"
                            placeholder="AAA"
                            required
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={initials.length !== 3}
                            className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 