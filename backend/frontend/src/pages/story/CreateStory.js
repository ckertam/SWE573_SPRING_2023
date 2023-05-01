import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, Autocomplete, Marker } from '@react-google-maps/api';
import withAuth from '../../authCheck';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './CreateStory.css'
import {TextField, Select, MenuItem, InputLabel, FormControl, Button, List, ListItem, ListItemText } from '@mui/material';

function CreateStory() {

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [story_tags, setStoryTags] = useState('');
  const [location_ids, setLocations] = useState([]);
  const [date_type, setDateType] = useState('season');
  const [season_name, setSeasonName] = useState(null);
  const [year, setYear] = useState(null);
  const [start_year, setStartYear] = useState(null);
  const [end_year, setEndYear] = useState(null);
  const [date, setDate] = useState(null);
  const [start_date, setStartDate] = useState(null);
  const [end_date, setEndDate] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [searchBox, setSearchBox] = useState(null);
  const [firstClick, setFirstClick] = useState(true);
  const navigate = useNavigate();
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image", "video"]
    ]
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video"
  ];

  const handleLocationSelect = () => {
    if (!autocompleteRef.current) {
      return;
    }

    const place = autocompleteRef.current.getPlace();

    if (!place || !place.geometry || !place.geometry.location) {
      return;
    }

    const locationData = {
      name: place.name,
      latitude: Number(place.geometry.location.lat().toFixed(6)),
      longitude: Number(place.geometry.location.lng().toFixed(6)),
    };
    setLocations([...location_ids, locationData]);
    setMapCenter({ lat: locationData.latitude, lng: locationData.longitude });

    // Clear the input value
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  useEffect(() => {
    setSeasonName(null);
    setYear(null);
    setStartYear(null);
    setEndYear(null);
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

        setMapCenter({ lat: locationData.latitude, lng: locationData.longitude }); //can be excluded so that map not always clicked
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

  // const handlePlacesChanged = () => {
  //   const place = searchBox.getPlaces()[0];
  //   if (place) {
  //     const locationData = {
  //       name: place.name,
  //       latitude: Number(place.geometry.location.lat().toFixed(6)),
  //       longitude: Number(place.geometry.location.lng().toFixed(6)),
  //     };
  //     setLocations([...location_ids, locationData]);
  //   }
  // };

  const handleContentChange = (value) => {
    setContent(value);
  };

  const handleEditorClick = () => {
    if (firstClick) {
      setContent('');
      setFirstClick(false);
    }
  };

  const editorPlaceholder = firstClick ? 'Enter your content here' : '';

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
        start_year: start_year,
        end_year: end_year,
        year: year,
        date: date,
        start_date: start_date,
        end_date: end_date
      }, { withCredentials: true });
      console.log(response.data);

      navigate(`/story/${response.data.id}`);

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h1 className="big-heading">Create Story</h1>
      <div className='create-story-container'>
      <div className="create-story-content">
          <form>
            {/* <div className="form-group"> */}
              <TextField
                  variant="outlined"
                  placeholder="Title"
                  className='long-boxes'
                  label="Title" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
            {/* </div> */}
            {/* <div className="form-group"> */}
            <br/>
            <br/>
              <ReactQuill
                modules={modules}
                formats={formats}
                className="custom-input"
                theme="snow"
                value={content}
                onClick={handleEditorClick}
                placeholder={editorPlaceholder}
                onChange={setContent}
              />
            {/* </div> */}
            <br/>
            <br/>
            <div>
              <TextField
                variant="outlined"
                placeholder="Enter tags separating with ','"
                className='long-boxes'
                label="Tags"
                value={story_tags}
                onChange={(e) => setStoryTags(e.target.value)}
              />
            </div>
            <div style={{ marginTop: '1rem' }}>
            <FormControl variant="outlined" > 
                <InputLabel id="date-type-label">Date Type</InputLabel>
                <Select
                  labelId="date-type-label"
                  id="date-type"
                  className='date-box'
                  style={{width: "200px"}}
                  value={date_type}
                  onChange={(e) => setDateType(e.target.value)}
                  label="Date Type"
                >
                  <MenuItem value="">Select a date type</MenuItem>
                  <MenuItem value="year">Year</MenuItem>
                  <MenuItem value="year_interval">Interval Year</MenuItem>
                  <MenuItem value="normal_date">Normal Date</MenuItem>
                  <MenuItem value="interval_date">Interval Date</MenuItem>
                </Select>
              </FormControl>
            </div>
            {date_type === 'year' &&
            <div className='date-type'>
              <TextField
                id="year"
                className='date-box'
                label="Year"
                variant="outlined"
                type="text"
                onChange={(e) => setYear(e.target.value)}
              />
              <FormControl variant="outlined">
                <InputLabel id="season-label">Season</InputLabel>
                <Select
                  labelId="season-label"
                  id="season"
                  className='date-box'
                  value={season_name}
                  onChange={(e) => setSeasonName(e.target.value)}
                  label="Season"
                >
                  <MenuItem value="">Select a season</MenuItem>
                  <MenuItem value="Spring">Spring</MenuItem>
                  <MenuItem value="Summer">Summer</MenuItem>
                  <MenuItem value="Fall">Fall</MenuItem>
                  <MenuItem value="Winter">Winter</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                    }
          {date_type === 'year_interval' &&
            <div className='date-type'>
              <TextField
                id="start-year"
                className='date-box'
                label="Start Year"
                variant="outlined"
                type="number"
                onChange={(e) => setStartYear(e.target.value)}
              />
              <TextField
                id="end-year"
                className='date-box'
                label="End Year"
                variant="outlined"
                type="number"
                onChange={(e) => setEndYear(e.target.value)}
              />
              <FormControl variant="outlined">
                <InputLabel id="season-label">Season</InputLabel>
                <Select
                  labelId="season-label"
                  id="season"
                  className='date-box'
                  value={season_name}
                  onChange={(e) => setSeasonName(e.target.value)}
                  label="Season"
                >
                  <MenuItem value="">Select a season</MenuItem>
                  <MenuItem value="Spring">Spring</MenuItem>
                  <MenuItem value="Summer">Summer</MenuItem>
                  <MenuItem value="Fall">Fall</MenuItem>
                  <MenuItem value="Winter">Winter</MenuItem>
                </Select>
              </FormControl>
            </div>
          }
          {date_type === 'normal_date' &&
            <div className='date-type'>
              <TextField
                className='date-box'
                label="Date"
                variant="outlined"
                type="date"
                InputLabelProps={{ shrink: true }}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          }
            {date_type === 'interval_date' && (
            <div className='date-type'>
              <TextField
                className='date-box'
                type="date"
                label="Start Date"
                variant="outlined"
                // style={{ background: '#FFFFFF' }}
                InputLabelProps={{ shrink: true }}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <TextField
                className='date-box'
                type="date"
                label="End Date"
                variant="outlined"
                // style={{ background: '#FFFFFF' }}
                InputLabelProps={{ shrink: true }}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          )}
          
          <Autocomplete 
            className='date-type'
            onLoad={(autocomplete) => {
              autocompleteRef.current = autocomplete;
            }}
            onPlaceChanged={handleLocationSelect}
          >
            <TextField 
              className='date-box'
              type="search" 
              label="Locations" 
              variant="outlined" 
              inputRef={inputRef} 
            />
          </Autocomplete>
          <br/>
          <Button variant="contained" onClick={handleSubmit} className="btn btn-primary middle">Create Story</Button>
          </form>
          </div>
          
          <div className='create-story-map'>
            <GoogleMap
              mapContainerStyle={{ height: '400px', width: '400px' }}
              center={mapCenter}
              zoom={1}
              onClick={handleMapClick}
              onLoad={handleMapLoad}
            >
              {location_ids.map((loc, index) => (
                <Marker
                  key={index}
                  position={{ lat: loc.latitude, lng: loc.longitude }}
                  onClick={() => {
                  }}
                />
              ))}
            </GoogleMap>
            <div className="location-list-wrapper">
            <div className="location-list-container">
              <List>
                {location_ids.map((loc, index) => (
                  <ListItem key={index}>
                    <ListItemText style={{ marginRight: "16px" }}>{loc.name || `${loc.latitude}, ${loc.longitude}`}</ListItemText>
                    <Button variant="contained" size="small" color="primary" onClick={() => handleLocationRemove(index)}>Remove</Button>
                  </ListItem>
                ))}
              </List>
            </div>
          </div>
          </div>
          
        </div>
      
    </div>
  );
}

export default withAuth(CreateStory);