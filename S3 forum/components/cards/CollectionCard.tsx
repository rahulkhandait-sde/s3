import React from "react";

interface CollectionCardProps {
  _id: string;
  title: string;
  description: string;
  // Add other relevant properties
}

const CollectionCard: React.FC<CollectionCardProps> = ({ _id, title, description }) => {
  return (
    <div className="border rounded-lg p-4 shadow-md">
      <h2 className="font-bold text-lg">{title}</h2>
      <p className="text-gray-600">{description}</p>
      {/* Add more details or actions as needed */}
    </div>
  );
};

export default CollectionCard;