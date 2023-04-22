import React, { useState, useEffect, useRef} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, LoadScript, Autocomplete, Marker } from '@react-google-maps/api';
import withAuth from './authCheck';

function CreateStory() {

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [story_tags, setStoryTags] = useState('');
  const [location_ids, setLocations] = useState([]);
  const [date_type, setDateType] = useState('season');
  const [season_name, setSeasonName] = useState(null);
  const [year, setYear] = useState(null);
  const [date, setDate] = useState(null);
  const [start_date, setStartDate] = useState(null);
  const [end_date, setEndDate] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [searchBox, setSearchBox] = useState(null);

  const navigate = useNavigate();


  const autocompleteRef = useRef(null);

  const handleLocationSelect = () => {
    const place = autocompleteRef.current.getPlace();
    const locationData = {
      name: place.name,
      latitude: Number(place.geometry.location.lat().toFixed(6)),
      longitude: Number(place.geometry.location.lng().toFixed(6)),
    };
    setLocations([...location_ids, locationData]);
    setMapCenter({ lat: locationData.latitude, lng: locationData.longitude});
  };

  useEffect(() => {
    setSeasonName(null);
    setYear(null);
    setDate(null);
    setStartDate(null);
    setEndDate(null);
  }, [date_type]);

  const handleMapClick = async (e) => {
    const { latLng } = e;
    const lat = latLng.lat();
    const lng = latLng.lng();
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`);
      const { results } = response.data;
      if (results.length > 0) {
        const locationData = {
          name: results[0].formatted_address,
          latitude: Number(lat.toFixed(6)),
          longitude: Number(lng.toFixed(6))
        };
        setLocations([...location_ids, locationData]);

        setMapCenter({ lat: locationData.latitude, lng: locationData.longitude});
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleMapLoad = (map) => {
    setSearchBox(new window.google.maps.places.SearchBox(map.getDiv()));
  };

  const handleLocationRemove = (index) => {
    setLocations(location_ids.filter((loc, i) => i !== index));
  };

  const handlePlacesChanged = () => {
    const place = searchBox.getPlaces()[0];
    if (place) {
      const locationData = {
        name: place.name,
        latitude: Number(place.geometry.location.lat().toFixed(6)),
        longitude: Number(place.geometry.location.lng().toFixed(6)),
      };
      setLocations([...location_ids, locationData]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/user/storyCreate', {
        title: title,
        content: content,
        story_tags: story_tags,
        location_ids: location_ids,
        date_type: date_type,
        season_name: season_name,
        year: year,
        date: date,
        start_date : start_date,
        end_date: end_date
      }, { withCredentials: true });
      console.log(response.data);

navigate(`/create-story/add-photo/${response.data.id}/${encodeURIComponent(title)}`);

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <h1>Create Story</h1>
        <div className="form-group">
          <label>Title:</label>
          <input type="text" className="form-control" onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="form-group">
          <label>Content:</label>
          <textarea className="form-control" onChange={(e) => setContent(e.target.value)}></textarea>
          </div>
          <div className="form-group">
          <label>Story Tags:</label>
          <input type="text" className="form-control" onChange={(e) => setStoryTags(e.target.value)} />
          </div>
          <div className="form-group">
          <label>Locations:</label>
          <Autocomplete
          onLoad={(autocomplete) => {
          autocompleteRef.current = autocomplete;
          }}
          onPlaceChanged={handleLocationSelect}
          >
          <input type="text" className="form-control" />
          </Autocomplete>
          <ul>
          {location_ids.map((loc, index) => (
            <div key={index}>
              <li>{loc.name || `${loc.latitude}, ${loc.longitude}`}</li>
              <button type="button" onClick={() => handleLocationRemove(index)}>Remove</button>
            </div>
          ))}
          </ul>
          </div>
          <div className="form-group">
      <label>Date Type:</label>
      <select className="form-control" onChange={(e) => setDateType(e.target.value)}>
        <option value="season">Season</option>
        <option value="decade">Decade</option>
        <option value="normal_date">Normal Date</option>
        <option value="interval_date">Interval Date</option>
      </select>
    </div>
    {date_type === 'season' &&
      <div className="form-group">
        <label>Season Name:</label>
        <input type="text" className="form-control" onChange={(e) => setSeasonName(e.target.value)} />
      </div>
    }
    {date_type === 'decade' &&
      <div className="form-group">
        <label>Year:</label>
        <input type="number" className="form-control" onChange={(e) => setYear(e.target.value)} />
      </div>
    }
    {date_type === 'normal_date' &&
      <div className="form-group">
        <label>Date:</label>
        <input type="date" className="form-control" onChange={(e) => setDate(e.target.value)} />
      </div>
    }
    {date_type === 'interval_date' &&
      <div className="form-group">
        <label>Start Date:</label>
        <input type="date" className="form-control" onChange={(e) => setStartDate(e.target.value)} />
        <label>End Date:</label>
        <input type="date" className="form-control" onChange={(e) => setEndDate(e.target.value)} />
      </div>
    }
    <button type="submit" className="btn btn-primary">Create Story</button>
  </form>

  <GoogleMap
    mapContainerStyle={{ height: '400px', width: '100%' }}
    center={mapCenter}
    zoom={1}
    onClick={handleMapClick}
    onLoad={handleMapLoad}
  >
    {searchBox &&
      <Autocomplete
        bounds={null}
        onLoad={() => console.log('autocomplete loaded')}
        onPlaceChanged={handlePlacesChanged}
      >
        <input type="text" placeholder="Search on map" />
      </Autocomplete>
    }
    {location_ids.map((loc, index) => (
      <Marker
        key={index}
        position={{ lat: loc.latitude, lng: loc.longitude }}
        onClick={() => {
        }}
      />
    ))}
  </GoogleMap>
</>
);
}

export default withAuth(CreateStory);