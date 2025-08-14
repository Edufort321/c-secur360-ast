import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Step1ProjectInfo from './Step1ProjectInfo';
import type { ASTFormData } from '../../app/types/astForm';
import { vi, describe, it, expect } from 'vitest';

vi.mock('next/image', () => ({
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

const baseFormData: ASTFormData = {
  id: 'test',
  astNumber: '',
  projectInfo: {
    client: '',
    clientPhone: '',
    clientRepresentative: '',
    clientRepresentativePhone: '',
    projectNumber: '',
    astClientNumber: '',
    date: '',
    time: '',
    workLocation: '',
    industry: '',
    emergencyContact: '',
    emergencyPhone: '',
    workDescription: '',
    workLocations: [],
    lockoutPoints: [],
    lockoutPhotos: [],
  },
  equipment: {
    list: [],
    selected: [],
    totalSelected: 0,
    highPriority: 0,
    categories: [],
    inspectionStatus: {
      total: 0,
      verified: 0,
      available: 0,
      verificationRate: 0,
      availabilityRate: 0,
    },
  },
  hazards: { selected: [], controls: [] },
  permits: { permits: [] },
  validation: { reviewers: [] },
  finalization: { consent: false, signatures: [] },
};

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('Step1ProjectInfo', () => {
  it('garde le focus après saisie et n\'utilise pas le réseau', async () => {
    const user = userEvent.setup();
    const onDataChange = vi.fn();
    global.fetch = vi.fn();

    render(
      <Step1ProjectInfo
        formData={baseFormData}
        onDataChange={onDataChange}
        language="fr"
        tenant="test"
      />
    );

    const clientInput = screen.getByPlaceholderText('Ex: Hydro-Québec, Bell Canada...');
    await user.type(clientInput, 'Client X');
    await flush();
    expect(clientInput).toHaveFocus();
    expect(clientInput).toHaveValue('Client X');

    const phoneInput = screen.getByPlaceholderText('Ex: (514) 555-0123');
    await user.type(phoneInput, '1234567890');
    await flush();
    expect(phoneInput).toHaveFocus();
    expect(phoneInput).toHaveValue('1234567890');

    const repInput = screen.getByPlaceholderText('Nom du responsable projet');
    await user.type(repInput, 'Jean');
    await flush();
    expect(repInput).toHaveFocus();
    expect(repInput).toHaveValue('Jean');

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
