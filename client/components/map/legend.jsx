import L from 'leaflet';
import { useEffect } from 'react';
import { useLeafletContext } from '@react-leaflet/core';

/* Legend adapted from https://codesandbox.io/s/how-to-add-a-legend-to-the-map-using-react-leaflet-6yqs5 */
export const Legend = () => {
  const context = useLeafletContext();
  useEffect(() => {
    const legend = L.control({ position: 'topright' });

    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend');
      let labels = [];

      labels.push('<i style="background:black"></i><span>Current position</span>');
      labels.push('<i style="background:red"></i><span>Unjoinable</span>');
      labels.push('<i style="background:green"></i><span>Joinable</span>');
      labels.push('<i style="background:blue"></i><span>Editable & Joinable</span>');

      div.innerHTML = labels.join('<br>');
      return div;
    };

    const { map } = context;
    legend.addTo(map);
  }, [context]);

  return null;
};
