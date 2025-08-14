import React, { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddLocationModal from './AddLocationModal';
import { vi, describe, it, expect } from 'vitest';

const geocodeAddress = vi.fn().mockRejectedValue(new Error('timeout'));
const getCurrentPosition = vi.fn().mockResolvedValue({ lat: 0, lng: 0 });
const createMap = vi.fn().mockReturnValue({ setCenter: vi.fn() });
const createMarker = vi
  .fn()
  .mockReturnValue({ addListener: vi.fn(), setPosition: vi.fn() });

vi.mock('../../hooks/useGoogleMaps', () => ({
  default: () => ({
    getCurrentPosition,
    createMap,
    createMarker,
    geocodeAddress,
    isLoaded: true,
  }),
}));

describe('AddLocationModal', () => {
  it("accepte l'adresse saisie même si geocode échoue et se ferme", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const Wrapper = () => {
      const [open, setOpen] = useState(true);
      return (
        <AddLocationModal
          isOpen={open}
          initial={null}
          onCancel={() => setOpen(false)}
          onSave={(loc) => {
            onSave(loc);
            setOpen(false);
          }}
        />
      );
    };

    render(<Wrapper />);

    const input = screen.getByPlaceholderText('Rechercher une adresse');
    await user.type(input, '123 rue Test');
    input.blur();
    await waitFor(() => expect(geocodeAddress).toHaveBeenCalled());

    await user.click(screen.getByText('Ajouter'));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ address: '123 rue Test' })
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    consoleError.mockRestore();
  });
});
