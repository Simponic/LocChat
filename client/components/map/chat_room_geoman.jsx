import { useLeafletContext } from '@react-leaflet/core';
import L from 'leaflet';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import { useEffect, useContext, useState } from 'react';
import { ApiContext } from '../../utils/api_context';

const userPositionBubble = {
  color: 'black',
  fillColor: 'black',
  fillOpacity: 0.4,
  weight: 1,
  pmIgnore: true,
};

const joinable = {
  color: 'green',
  weight: 1,
  pmIgnore: true,
};

const unjoinable = {
  color: 'red',
  weight: 1,
  pmIgnore: true,
};

const editable = {
  color: 'blue',
  weight: 1,
  pmIgnore: false,
};

const icon = new L.Icon({ iconUrl: markerIconPng, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [0, -30] });

const haversine = (p1, p2) => {
  const degreesToRadians = (degrees) => degrees * (Math.PI / 180);
  const delta = { lat: degreesToRadians(p2.lat - p1.lat), lng: degreesToRadians(p2.lng - p1.lng) };
  const a =
    Math.sin(delta.lat / 2) * Math.sin(delta.lat / 2) +
    Math.cos(degreesToRadians(p1.lat)) *
      Math.cos(degreesToRadians(p2.lat)) *
      Math.sin(delta.lng / 2) *
      Math.sin(delta.lng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const r = 6371 * 1000;
  return r * c;
};

// GeoMan code is heavily adapted from this codesandbox: https://codesandbox.io/s/394eq
export const Geoman = ({ user, userPos, joinRoom }) => {
  const context = useLeafletContext();
  const api = useContext(ApiContext);
  let dontRedirect = true;
  const circleAndMarkerFromChatroom = (chatRoom) => {
    const circle = new L.Circle(chatRoom.center, chatRoom.radius);
    const marker = new L.Marker(chatRoom.center, { pmIgnore: !chatRoom.editable, icon });
    console.log(chatRoom);
    circle.setStyle(chatRoom.editable ? editable : chatRoom.joinable ? joinable : unjoinable); // We only send the id when user is in the radius
    marker.addEventListener('click', () => {
      setTimeout(() => {
        if (!dontRedirect) {
          joinRoom(chatRoom.id, userPos);
          return;
        }
        dontRedirect = false;
      }, 500);
    });
    marker.bindPopup(chatRoom.name || `Chat Room ${chatRoom.id}`);
    marker.on('mouseover', (e) => {
      e.target.openPopup();
    });
    if (chatRoom.editable) {
      [circle, marker].map((x) => {
        x.on('pm:edit', (e) => {
          const coords = e.target.getLatLng();
          marker.setLatLng(coords);
          circle.setLatLng(coords);
          api.put(`/chat_rooms/${chatRoom.id}`, {
            ...chatRoom,
            radius: circle.getRadius(),
            latitude: coords.lat,
            longitude: coords.lng,
          });
        });
        x.on('pm:remove', (e) => {
          dontRedirect = true;
          context.map.removeLayer(marker);
          context.map.removeLayer(circle);

          api.del(`/chat_rooms/${chatRoom.id}`);
        });
      });
      circle.on('pm:drag', (e) => {
        marker.setLatLng(e.target.getLatLng());
      });
      marker.on('pm:drag', (e) => {
        circle.setLatLng(e.target.getLatLng());
      });
      marker.on('pm:dragstart', (e) => {
        dontRedirect = true;
      });
    }
    [circle, marker].map((x) => x.addTo(context.map));
    return [circle, marker];
  };

  const reRender = async () => {
    const layersToRemove = [];
    context.map.eachLayer((layer) => {
      if (layer instanceof L.Circle || layer instanceof L.Marker) {
        layersToRemove.push(layer);
      }
    });

    const res = await api.get(`/chat_rooms?lat=${userPos.lat}&lng=${userPos.lng}`);
    res.map((x) => {
      circleAndMarkerFromChatroom({
        center: [x.latitude, x.longitude],
        ...x,
      });
    });
    layersToRemove.map((x) => context.map.removeLayer(x));

    const userLocationCircle = new L.Circle(userPos, 5);
    userLocationCircle.setStyle(userPositionBubble);
    userLocationCircle.addTo(context.map);
  };

  useEffect(() => {
    if (context) {
      reRender();
    }
  }, [userPos]);

  useEffect(() => {
    const leafletContainer = context.layerContainer || context.map;
    leafletContainer.pm.addControls({
      drawMarker: false,
      editControls: true,
      dragMode: true,
      cutPolygon: false,
      removalMode: true,
      rotateMode: false,
      splitMode: false,
      drawPolyline: false,
      drawRectangle: false,
      drawPolygon: false,
      drawCircleMarker: false,
    });

    leafletContainer.pm.setGlobalOptions({ pmIgnore: false });

    leafletContainer.on('pm:create', async (e) => {
      if (e.layer && e.layer.pm) {
        const shape = e;
        context.map.removeLayer(shape.layer);

        const { lat: latitude, lng: longitude } = shape.layer.getLatLng();
        const chatRoom = await api.post('/chat_rooms', {
          name: prompt("What's the name of the chat room?"),
          latitude,
          longitude,
          radius: shape.layer.getRadius(),
        });
        console.log(chatRoom);
        reRender();
      }
    });

    return () => {
      leafletContainer.pm.removeControls();
      leafletContainer.pm.setGlobalOptions({ pmIgnore: true });
    };
  }, [context]);

  return null;
};

export default Geoman;
