import React from "react";

interface CommunityCardProps {
  _id: string;
  name: string;
  description: string;
}

const CommunityCard: React.FC<CommunityCardProps> = ({
  _id,
  name,
  description,
}) => {
  return (
    <div className="border rounded-lg p-4 shadow-md">
      <h2 className="font-bold text-lg">{name}</h2>
      <p className="text-gray-600">{description}</p>
      {/* Add more details or actions as needed */}
    </div>
  );
};

export default CommunityCard;
