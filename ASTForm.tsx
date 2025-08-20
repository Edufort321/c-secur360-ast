const StepContent = memo((stepProps) => {
    const { onDataChange } = stepProps;
    const updatedOnDataChange = (data) => ultraStableHandler('projectInfo', data);

    return (
        // ... your JSX code here, with updated onDataChange
    );
});

export default StepContent;
