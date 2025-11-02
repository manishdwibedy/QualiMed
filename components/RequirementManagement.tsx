import React, { useState } from 'react';
import { Requirement, ComplianceStandard } from '../types';

interface RequirementManagementProps {
  requirements: Requirement[];
  setRequirements: React.Dispatch<React.SetStateAction<Requirement[]>>;
}

export const RequirementManagement: React.FC<RequirementManagementProps> = ({ requirements, setRequirements }) => {
  const [newRequirementText, setNewRequirementText] = useState('');
  const [newRequirementSource, setNewRequirementSource] = useState('');
  const [selectedCompliance, setSelectedCompliance] = useState<ComplianceStandard[]>([]);

  const handleAddRequirement = () => {
    if (newRequirementText.trim() === '') return;

    const newRequirement: Requirement = {
      id: `REQ-${String(requirements.length + 1).padStart(3, '0')}`,
      text: newRequirementText,
      source: newRequirementSource,
      compliance: selectedCompliance,
    };

    setRequirements([...requirements, newRequirement]);
    setNewRequirementText('');
    setNewRequirementSource('');
    setSelectedCompliance([]);
  };

  const handleComplianceChange = (standard: ComplianceStandard) => {
    setSelectedCompliance(prev =>
      prev.includes(standard)
        ? prev.filter(s => s !== standard)
        : [...prev, standard]
    );
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Requirement Management</h2>
      <div className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="requirement-text" className="block text-sm font-medium text-gray-700">
              Requirement Text
            </label>
            <textarea
              id="requirement-text"
              value={newRequirementText}
              onChange={e => setNewRequirementText(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              rows={3}
            />
          </div>
          <div>
            <label htmlFor="requirement-source" className="block text-sm font-medium text-gray-700">
              Source (e.g., document, section)
            </label>
            <input
              type="text"
              id="requirement-source"
              value={newRequirementSource}
              onChange={e => setNewRequirementSource(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Compliance Standards</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.values(ComplianceStandard).map(standard => (
              <label key={standard} className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50"
                  checked={selectedCompliance.includes(standard)}
                  onChange={() => handleComplianceChange(standard)}
                />
                <span className="ml-2 text-sm text-gray-600">{standard}</span>
              </label>
            ))}
          </div>
        </div>
        <button
          onClick={handleAddRequirement}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Add Requirement
        </button>
      </div>
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">Requirements</h3>
        <ul className="mt-4 space-y-2">
          {requirements.map(req => (
            <li key={req.id} className="p-4 bg-gray-50 rounded-md">
              <p className="font-semibold">{req.id}: {req.text}</p>
              <p className="text-sm text-gray-600">Source: {req.source}</p>
              {req.compliance.length > 0 && (
                <p className="text-sm text-gray-600">
                  Compliance: {req.compliance.join(', ')}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
