import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, Autocomplete, Marker } from '@react-google-maps/api';
import withAuth from '../../authCheck';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './CreateStory.css'

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
              <label>Title:</label>
              <input type="text" onChange={(e) => setTitle(e.target.value)} />
            {/* </div> */}
            {/* <div className="form-group"> */}
            <br/>
              <label>Content:</label>
              <ReactQuill
                modules={modules}
                formats={formats}
                className="custom-input"
                theme="snow"
                value={content}
                onChange={setContent}
              />
            {/* </div> */}
            <br/>
            <br/>
            <div>
              <label>Story Tags:</label>
              <input type="text" onChange={(e) => setStoryTags(e.target.value)} />
            </div>
            <div >
              <label>Date Type:</label>
              <select  onChange={(e) => setDateType(e.target.value)}>
                <option value="">Select a date type</option>
                <option value="decade">Year</option>
                <option value="year_interval">Interval Year</option>
                <option value="normal_date">Normal Date</option>
                <option value="interval_date">Interval Date</option>
              </select>
            </div>
            {date_type === 'decade' &&
              <div >
                <label>Year:</label>
                <input type="text"  onChange={(e) => setYear(e.target.value)} />
                <label>Season:</label>
                <input type="text"  onChange={(e) => setSeasonName(e.target.value)} />
              </div>
            }
            {date_type === 'year_interval' &&
              <div >
                <label>StartYear:</label>
                <input type="number"  onChange={(e) => setStartYear(e.target.value)} />
                <label>EndYear:</label>
                <input type="number"  onChange={(e) => setEndYear(e.target.value)} />
                <label>Season:</label>
                <input type="text"  onChange={(e) => setSeasonName(e.target.value)} />
              </div>
            }
            {date_type === 'normal_date' &&
              <div >
                <label>Date:</label>
                <input type="date"  onChange={(e) => setDate(e.target.value)} />
              </div>
            }
            {date_type === 'interval_date' &&
              <div >
                <label>Start Date:</label>
                <input type="date"  onChange={(e) => setStartDate(e.target.value)} />
                <label>End Date:</label>
                <input type="date"  onChange={(e) => setEndDate(e.target.value)} />
              </div>
            }

          
          <label>Locations:</label>
          <Autocomplete
            onLoad={(autocomplete) => {
              autocompleteRef.current = autocomplete;
            }}
            onPlaceChanged={handleLocationSelect}
          >
            <input type="text" className="form-control" ref={inputRef} />
          </Autocomplete>
          <button type="submit" className="btn btn-primary middle" onClick={handleSubmit}>Create Story</button>
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
            <ol>
              {location_ids.map((loc, index) => (
                <div key={index}>
                  <li>{loc.name || `${loc.latitude}, ${loc.longitude}`}</li>
                  <button type="button" onClick={() => handleLocationRemove(index)}>Remove</button>
                </div>
              ))}
            </ol>
          </div>
          </div>
          </div>
          
        </div>
      
    </div>
  );
}

export default withAuth(CreateStory);