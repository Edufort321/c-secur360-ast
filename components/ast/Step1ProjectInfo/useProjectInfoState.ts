import { useState } from 'react';
import { generateASTNumber } from './helpers';
import { WorkLocation, LockoutPoint, LockoutPhoto } from './types';

interface Params {
  formData: any;
  projectInfo: any;
  workLocations: WorkLocation[];
  lockoutPoints: LockoutPoint[];
  lockoutPhotos: LockoutPhoto[];
}

export const useProjectInfoState = ({
  formData,
  projectInfo,
  workLocations,
  lockoutPoints,
  lockoutPhotos,
}: Params) => {
  const [localData, setLocalData] = useState(() => ({
    client: projectInfo.client || '',
    clientPhone: projectInfo.clientPhone || '',
    clientRepresentative: projectInfo.clientRepresentative || '',
    clientRepresentativePhone: projectInfo.clientRepresentativePhone || '',
    projectNumber: projectInfo.projectNumber || '',
    astClientNumber: projectInfo.astClientNumber || '',
    date: projectInfo.date || new Date().toISOString().split('T')[0],
    time: projectInfo.time || new Date().toTimeString().substring(0, 5),
    workLocation: projectInfo.workLocation || '',
    industry: projectInfo.industry || 'electrical',
    emergencyContact: projectInfo.emergencyContact || '',
    emergencyPhone: projectInfo.emergencyPhone || '',
    workDescription: projectInfo.workDescription || '',
    workLocations,
    lockoutPoints,
    lockoutPhotos,
  }));

  const [astNumber, setAstNumber] = useState(() => formData?.astNumber || generateASTNumber());
  const [copied, setCopied] = useState(false);

  return { localData, setLocalData, astNumber, setAstNumber, copied, setCopied };
};
