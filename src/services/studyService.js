// src/services/studyService.js
export const getPatientStudies = async (patientId) => {
  const response = await fetch(`/api/patients/${patientId}/studies`);
  return response.json();
};

export const getStudyImages = async (studyId) => {
  const response = await fetch(`/api/studies/${studyId}/images`);
  return response.json();
};