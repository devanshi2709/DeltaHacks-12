// LiveHeatMap.tsx
import React, { useMemo } from 'react';
import { GoogleMap, LoadScript, HeatmapLayer } from '@react-google-maps/api';

interface LiveHeatMapProps {
  apiKey: string;
  points: { lat: number; lng: number }[];
}

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = { lat: 43.256, lng: -79.87 };

const LiveHeatMap: React.FC<LiveHeatMapProps> = ({ apiKey, points }) => {
  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={['visualization']}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={15}>
        {points.length > 0 && (
          <HeatmapLayer
            data={points.map(p => ({
              location: new window.google.maps.LatLng(p.lat, p.lng)
            }))}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default React.memo(LiveHeatMap);
