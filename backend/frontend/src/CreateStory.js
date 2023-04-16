import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CreateStory() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [story_tags, setStoryTags] = useState('');
  const [location_ids, setLocations] = useState([]);
  const [date_type, setDateType] = useState('');
  const [season_name, setSeasonName] = useState(null);
  const [year, setYear] = useState(null);
  const [date, setDate] = useState(null);

  const handleLocationChange = (e) => {
    const locationData = e.target.value.split(';').map(loc => {
      const json = loc.trim().replace(/^{/, '').replace(/}$/, '');
      const {name, latitude, longitude} = JSON.parse(`{${json}}`);
      return {
        name,
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

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:8000/user/storyCreate', {
      title: title,
      content: content,
      story_tags: story_tags,
      location_ids: location_ids,
      date_type: date_type,
      season_name: season_name,
      year: year,
      date: date
    },{ withCredentials: true }).then(response => {
      console.log(response.data);
    }).catch(error => {
      console.log(error);
    });
  }

  return (
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
        <textarea className="form-control" onChange={handleLocationChange}></textarea>
        <small className="form-text text-muted">
          Enter location data as JSON objects separated by semicolons. Example: {"{"} "name": "My Location 1", "latitude": 37.7749, "longitude": -122.4194 {"}"}; {"{"} "name": "My Location 2", "latitude": 40.7128, "longitude": -74.0060 {"}"}
        </small>
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
);
}

export default CreateStory;
