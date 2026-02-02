// src/services/measurementService.js
export const saveMeasurement = async (studyId, measurement) => {
  const response = await fetch(`/api/studies/${studyId}/measurements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(measurement)
  });
  return response.json();
};