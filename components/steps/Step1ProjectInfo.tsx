// Step1ProjectInfo.tsx

// Import necessary libraries
import React, { useEffect, useRef, useState } from 'react';

const Step1ProjectInfo = () => {
    const [localData, setLocalData] = useState({});
    const stableFormDataRef = useRef(localData);

    // Handler for updating lockout point
    const updateLockoutPoint = (pointId, newData) => {
        setLocalData(prev => {
            // Logging to check if rerender is caused by order or key
            console.log('Updating lockout point', pointId, newData);
            return {...prev, [pointId]: newData};
        });
    };

    // Check stability of keys in lockoutPoints mapping
    const lockoutPoints = [{ id: 1 }, { id: 2 }]; // Example data
    const mappedLockoutPoints = lockoutPoints.map(point => (
        <div key={point.id}> {/* Ensure key={point.id} is stable */} 
            {/* Render lockout point */}
        </div>
    ));

    // Modal for adding location
    const closeModal = () => {
        const body = document.body;
        body.style.overflow = '';
        body.style.position = '';
        body.style.width = '';
        body.style.height = '';
    };

    // Ensure state is not overwritten on input change
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setLocalData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div>
            {mappedLockoutPoints}
            {/* Modal and other components */}
        </div>
    );
};

export default Step1ProjectInfo;
