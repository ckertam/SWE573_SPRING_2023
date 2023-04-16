import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, Autocomplete } from '@react-google-maps/api';


function CreateStory() {

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [story_tags, setStoryTags] = useState('');
  const [location_ids, setLocations] = useState([]);
  const [date_type, setDateType] = useState('');
  const [season_name, setSeasonName] = useState(null);
  const [year, setYear] = useState(null);
  const [date, setDate] = useState(null);

  const autocompleteRef = useRef(null);

  const handleLocationSelect = () => {
    const place = autocompleteRef.current.getPlace();
    const locationData = {
      name: place.name,
      latitude: Number(place.geometry.location.lat().toFixed(6)),
        longitude: Number(place.geometry.location.lng().toFixed(6)),
    };
    setLocations([...location_ids, locationData]);
  };


  const handleLocationChange = (e) => {
    const locationData = e.target.value.split(';').map(loc => {
      const json = loc.trim().replace(/^{/, '').replace(/}$/, '');
      const {name, latitude, longitude} = JSON.parse(`{${json}}`);
      return {
        name: name,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      };
    });
    setLocations(locationData);
  };

  useEffect(() => {
    setSeasonName(null);
    setYear(null);
    setDate(null);
  }, [date_type]);

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
        date: date
      }, { withCredentials: true });
      window.location.reload();
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  };



  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={['places']}>
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
              <li key={index}>{loc.name}</li>
            ))}
          </ul>
        </div>
        
        <div className="form-group">
          <label>Date Type:</label>
          <select className="form-control" onChange={(e) => setDateType(e.target.value)}>
            <option value="season">Season</option>
            <option value="decade">Decade</option>
            <option value="normal_date">Normal Date</option>
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
      <button type="submit" className="btn btn-primary">Create Story</button>
    </form>
  </LoadScript> 
);
}

export default CreateStory;
