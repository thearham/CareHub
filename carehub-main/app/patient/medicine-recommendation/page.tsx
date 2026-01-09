'use client';

import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface MedicineAlternative {
  name: string;
  manufacturer: string;
  price: string;
  savings: string;
  strength: string;
  packSize: string;
}

// Pakistani Paracetamol brands
const paracetamolAlternatives: MedicineAlternative[] = [
  {
    name: 'Panadol',
    manufacturer: 'GSK Pakistan',
    price: 'Rs. 85',
    savings: '0%',
    strength: '500mg',
    packSize: '20 Tablets',
  },
  {
    name: 'Calpol',
    manufacturer: 'GSK Pakistan',
    price: 'Rs. 75',
    savings: '12%',
    strength: '500mg',
    packSize: '20 Tablets',
  },
  {
    name: 'Tylenol',
    manufacturer: 'Johnson & Johnson Pakistan',
    price: 'Rs. 90',
    savings: '0%',
    strength: '500mg',
    packSize: '20 Tablets',
  },
  {
    name: 'Disprol',
    manufacturer: 'Reckitt Benckiser Pakistan',
    price: 'Rs. 65',
    savings: '24%',
    strength: '500mg',
    packSize: '20 Tablets',
  },
  {
    name: 'Febrol',
    manufacturer: 'Searle Pakistan',
    price: 'Rs. 45',
    savings: '47%',
    strength: '500mg',
    packSize: '20 Tablets',
  },
];

// Generic alternatives for other medicines
const genericAlternatives: MedicineAlternative[] = [
  {
    name: 'Risek',
    manufacturer: 'Getz Pharma',
    price: 'Rs. 280',
    savings: '35%',
    strength: '20mg',
    packSize: '14 Capsules',
  },
  {
    name: 'Augmentin',
    manufacturer: 'GSK Pakistan',
    price: 'Rs. 450',
    savings: '20%',
    strength: '625mg',
    packSize: '6 Tablets',
  },
  {
    name: 'Ponstan',
    manufacturer: 'Pfizer Pakistan',
    price: 'Rs. 120',
    savings: '25%',
    strength: '500mg',
    packSize: '10 Tablets',
  },
  {
    name: 'Brufen',
    manufacturer: 'Abbott Pakistan',
    price: 'Rs. 95',
    savings: '30%',
    strength: '400mg',
    packSize: '20 Tablets',
  },
  {
    name: 'Flagyl',
    manufacturer: 'Sanofi Pakistan',
    price: 'Rs. 85',
    savings: '40%',
    strength: '400mg',
    packSize: '20 Tablets',
  },
];

// Specific medicines mapping
const medicineDatabase: Record<string, MedicineAlternative[]> = {
  paracetamol: paracetamolAlternatives,
  panadol: paracetamolAlternatives,
  calpol: paracetamolAlternatives,
  acetaminophen: paracetamolAlternatives,
  omeprazole: [
    {
      name: 'Risek',
      manufacturer: 'Getz Pharma',
      price: 'Rs. 280',
      savings: '0%',
      strength: '20mg',
      packSize: '14 Capsules',
    },
    {
      name: 'Omeprazole Generic',
      manufacturer: 'Pharmevo',
      price: 'Rs. 150',
      savings: '46%',
      strength: '20mg',
      packSize: '14 Capsules',
    },
    {
      name: 'Gastrazol',
      manufacturer: 'Sami Pharma',
      price: 'Rs. 180',
      savings: '36%',
      strength: '20mg',
      packSize: '14 Capsules',
    },
  ],
  ibuprofen: [
    {
      name: 'Brufen',
      manufacturer: 'Abbott Pakistan',
      price: 'Rs. 95',
      savings: '0%',
      strength: '400mg',
      packSize: '20 Tablets',
    },
    {
      name: 'Ibuprofen Generic',
      manufacturer: 'Platinum Pharma',
      price: 'Rs. 55',
      savings: '42%',
      strength: '400mg',
      packSize: '20 Tablets',
    },
    {
      name: 'Nurofen',
      manufacturer: 'Reckitt Benckiser',
      price: 'Rs. 120',
      savings: '0%',
      strength: '400mg',
      packSize: '12 Tablets',
    },
  ],
  amoxicillin: [
    {
      name: 'Amoxil',
      manufacturer: 'GSK Pakistan',
      price: 'Rs. 320',
      savings: '0%',
      strength: '500mg',
      packSize: '12 Capsules',
    },
    {
      name: 'Amoxicillin Generic',
      manufacturer: 'Hilton Pharma',
      price: 'Rs. 180',
      savings: '44%',
      strength: '500mg',
      packSize: '12 Capsules',
    },
    {
      name: 'Moxyvit',
      manufacturer: 'Sami Pharma',
      price: 'Rs. 210',
      savings: '34%',
      strength: '500mg',
      packSize: '12 Capsules',
    },
  ],
};

export default function MedicineRecommendation() {
  const [medicineName, setMedicineName] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<MedicineAlternative[]>([]);
  const [searchedMedicine, setSearchedMedicine] = useState('');
  const [savedMedicines, setSavedMedicines] = useState<string[]>([]);

  const handleSearch = () => {
    if (medicineName.trim()) {
      const searchTerm = medicineName.toLowerCase().trim();
      setSearchedMedicine(medicineName);

      // Check if medicine exists in database
      const foundMedicines = medicineDatabase[searchTerm];

      if (foundMedicines) {
        setResults(foundMedicines);
      } else {
        // Return random generic alternatives
        setResults(genericAlternatives);
      }

      setShowResults(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSave = (medicineName: string) => {
    if (!savedMedicines.includes(medicineName)) {
      setSavedMedicines([...savedMedicines, medicineName]);
    }
  };

  const isSaved = (medicineName: string) => savedMedicines.includes(medicineName);

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-[#2c3e50]">Medicine Recommendations</h1>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-[#5a6c7d] mb-6">
          Find affordable alternatives to your prescribed medicines. Enter the medicine name below to get recommendations for Pakistani pharmaceutical brands.
        </p>

        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              label="Enter medicine name"
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., Paracetamol, Ibuprofen, Omeprazole..."
            />
          </div>
          <Button onClick={handleSearch} className="px-8 h-[42px] mt-6">
            Find Alternatives
          </Button>
        </div>

        {/* Quick Search Tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-[#5a6c7d]">Popular searches:</span>
          {['Paracetamol', 'Ibuprofen', 'Omeprazole', 'Amoxicillin'].map((med) => (
            <button
              key={med}
              onClick={() => {
                setMedicineName(med);
                setSearchedMedicine(med);
                const searchTerm = med.toLowerCase();
                setResults(medicineDatabase[searchTerm] || genericAlternatives);
                setShowResults(true);
              }}
              className="px-3 py-1 bg-[#e8f8f5] text-[#1abc9c] rounded-full text-sm hover:bg-[#1abc9c] hover:text-white transition-colors"
            >
              {med}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {showResults && (
        <div className="bg-white rounded-lg shadow-sm p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[#2c3e50]">
              {medicineDatabase[searchedMedicine.toLowerCase()]
                ? `Pakistani brands for "${searchedMedicine}"`
                : `Recommended alternatives (searched: "${searchedMedicine}")`}
            </h2>
            <span className="text-sm text-[#5a6c7d]">{results.length} options found</span>
          </div>

          {/* Info Banner */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              These are Pakistani pharmaceutical alternatives. Prices may vary by pharmacy. Always consult your doctor before switching medicines.
            </p>
          </div>

          <div className="space-y-3">
            {results.map((alt, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-[#f0f4f7] rounded-lg hover:shadow-md transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[#2c3e50]">{alt.name}</h3>
                    {index === 0 && (
                      <span className="px-2 py-0.5 bg-[#1abc9c] text-white text-xs rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#5a6c7d]">{alt.manufacturer}</p>
                  <div className="flex gap-4 mt-1">
                    <span className="text-xs text-[#5a6c7d]">Strength: {alt.strength}</span>
                    <span className="text-xs text-[#5a6c7d]">Pack: {alt.packSize}</span>
                  </div>
                </div>

                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className="font-bold text-[#2c3e50]">{alt.price}</p>
                    {alt.savings !== '0%' && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        Save {alt.savings}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleSave(alt.name)}
                    disabled={isSaved(alt.name)}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                      isSaved(alt.name)
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'text-[#1abc9c] hover:bg-[#e8f8f5]'
                    }`}
                  >
                    {isSaved(alt.name) ? '✓ Saved' : 'Save'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Disclaimer:</strong> This information is for reference only. Medicine prices may vary based on location and pharmacy. Generic medicines contain the same active ingredients but may have different inactive ingredients. Always consult with your healthcare provider or pharmacist before making any changes to your medication.
            </p>
          </div>
        </div>
      )}

      {/* Saved Recommendations */}
      {savedMedicines.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-[#2c3e50] mb-4">
            Saved Recommendations ({savedMedicines.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {savedMedicines.map((med, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-[#e8f8f5] text-[#1abc9c] rounded-full text-sm font-medium flex items-center gap-2"
              >
                {med}
                <button
                  onClick={() => setSavedMedicines(savedMedicines.filter((m) => m !== med))}
                  className="hover:text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}