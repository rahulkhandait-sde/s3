import { useNavigate } from "react-router-dom"

export const Backbutton = () => {
    const navigate = useNavigate();

    return (
      <button 
        onClick={() => navigate(-1)} 
        className="bg-gray-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-700"
      >
        ← Back
      </button>
    );
}

