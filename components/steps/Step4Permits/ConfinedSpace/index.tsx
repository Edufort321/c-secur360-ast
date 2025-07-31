const ConfinedSpace: React.FC<ConfinedSpaceProps> = ({ onCancel }) => {
  return (
    <div style={{ padding: '40px', color: 'white' }}>
      <h1>✅ ConfinedSpace Fonctionne !</h1>
      <button onClick={onCancel}>Retour</button>
    </div>
  );
};
