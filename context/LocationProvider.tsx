import React, { createContext, PropsWithChildren, useContext, useState } from 'react';

interface LocationContextType {
  markerObj: { latitude: number; longitude: number } | null;
  setMarkerObj: React.Dispatch<
    React.SetStateAction<{
      latitude: number;
      longitude: number;
    } | null>
  >;
  patrolID: string | null;
  setPatrolID: React.Dispatch<React.SetStateAction<string | null>>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocationContext = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
};

const LocationProvider = ({ children }: PropsWithChildren) => {
  const [markerObj, setMarkerObj] = useState<{ latitude: number; longitude: number } | null>(null);
  const [patrolID, setPatrolID] = useState<string | null>(null);
  return (
    <LocationContext.Provider
      value={{
        markerObj,
        setMarkerObj,
        patrolID,
        setPatrolID,
      }}>
      {children}
    </LocationContext.Provider>
  );
};

export default LocationProvider;
