
import React from 'react';

interface PricingTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  description: string;
}

interface ScriptReviewDetailsProps {
  selectedTier: PricingTier;
}

const ScriptReviewDetails: React.FC<ScriptReviewDetailsProps> = ({ selectedTier }) => {
  return (
    <div className="bg-portfolio-black p-4 rounded border border-portfolio-gold/20">
      <h3 className="text-portfolio-gold font-semibold mb-2">Review Details for {selectedTier.name}:</h3>
      <ul className="text-portfolio-white/80 text-sm space-y-1">
        {selectedTier.features.map((feature, index) => (
          <li key={index}>• {feature}</li>
        ))}
        <li>• Turnaround time: 30 days</li>
        <li>• Cost: ${selectedTier.price}</li>
        <li>• 90-120 pages: Additional $5 per page</li>
      </ul>
    </div>
  );
};

export default ScriptReviewDetails;
