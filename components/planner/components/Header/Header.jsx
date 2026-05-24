// Header interne du planificateur — menu hamburger (actions planner) uniquement.
// EN/FR, Jour/Nuit et logo sont gérés par le PortalHeader de l'app principale (au-dessus).

import React from 'react';
import { MenuDropdown } from '../UI/MenuDropdown';

export function Header({
    onCreateEvent,
    onManageConges,
    onManageResources,
}) {
    return (
        <div className="flex items-center justify-end border-b border-gray-700 bg-gray-800 px-4 py-2">
            <MenuDropdown
                onCreateEvent={onCreateEvent}
                onManageConges={onManageConges}
                onManageResources={onManageResources}
            />
        </div>
    );
}
