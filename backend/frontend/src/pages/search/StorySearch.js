import React, { useState,useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';
import styles from './StorySearch.css'
import withAuth from '../../authCheck';


const StorySearch = () => {
  const [titleSearch, setTitleSearch] = useState('');
  const [authorSearch, setAuthorSearch] = useState('');
  const [stories, setStories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [timeType, setTimeType] = useState('');
  const [seasonName, setSeasonName] = useState('');
  const [startYear, setStartYear] = useState(null);
  const [endYear, setEndYear] = useState(null);
  const [year, setYear] = useState('');
  const [date, setDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [locationSearch, setLocationSearch] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [markerPosition, setMarkerPosition] = useState(mapCenter);
  const [radiusDiff, setRadiusDiff] = useState(25);
  const [dateDiff, setDateDiff] = useState(2);

  const autocompleteRef = useRef(null);

  const navigate = useNavigate();

  const handleStoryClick = async (id) => {
    navigate(`/story/${id}`);
  };
  
  const handleUserClick = async (id) => {
    navigate(`/user-profile/${id}`);
  };

  const handleSearch = async (e,pageNumber = 1) => {
    e.preventDefault();
    
    let timeValueObj = {};

    switch (timeType) {
        case 'year':
        timeValueObj = { year, seasonName };
        break;
        case 'year_interval':
        timeValueObj = { startYear, endYear, seasonName };
        break;
        case 'normal_date':
        timeValueObj = { date };
        break;
        case 'interval_date':
        timeValueObj = { startDate, endDate };
        break;
        default:
        break;
    }
    
    try {
      const response = await axios.get(`http://localhost:8000/user/storySearch`, {
        params: {
            title: titleSearch,
            author: authorSearch,
            page: pageNumber,
            size: pageSize,
            time_type: timeType,
            time_value: JSON.stringify(timeValueObj),
            location: JSON.stringify(locationSearch),
            radius_diff: radiusDiff,
            date_diff: dateDiff,
          },
        withCredentials: true,
      });
      setStories(response.data.stories);
      setTotalPages(response.data.total_pages);
      setCurrentPage(pageNumber);
      console.log(radiusDiff)
    } catch (error) {
      console.error('Error fetching stories:', error);
    } 
  };

  const handlePageChange = (newPage) => {
    handleSearch({ preventDefault: () => {} }, newPage);
  };

  const renderTimeInput = () => {
    switch (timeType) {
      case 'year':
        return (
          <>
            <label htmlFor="year">Year:</label>
            <input
              type="number"
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
            <br />
            <label htmlFor="seasonName">Season: </label>
            <select
              id="seasonName"
              value={seasonName}
              onChange={(e) => setSeasonName(e.target.value)}
            >
              <option value="">Select season</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
              <option value="Fall">Fall</option>
              <option value="Winter">Winter</option>
            </select>
          </>
        );
      case 'year_interval':
        return (
          <>
            <label htmlFor="startYear">Start Year:</label>
            <input
              type="number"
              id="startYear"
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
            />
            <br />
            <label htmlFor="endYear">End Year:</label>
            <input
              type="number"
              id="endYear"
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
            />
            <br />
            <label htmlFor="seasonName">Season: </label>
            <select
              id="seasonName"
              value={seasonName}
              onChange={(e) => setSeasonName(e.target.value)}
            >
              <option value="">Select season</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
              <option value="Fall">Fall</option>
              <option value="Winter">Winter</option>
            </select>
          </>
        );
      case 'normal_date':
        return (
          <>
            <label htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </>
        );
      case 'interval_date':
        return (
          <>
            <label htmlFor="startDate">Start Date:</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <br />
            <label htmlFor="endDate">End Date:</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </>
        );
      default:
        return null;
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];

    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={i === currentPage ? styles.activePage : ''}
        >
          {i}
        </button>
      );
    }

    return pageNumbers;
  };

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
  
    setLocationSearch(locationData);
    setMapCenter({ lat: locationData.latitude, lng: locationData.longitude });
  };

  const handleMarker = (e) => {
    const newPosition = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };
    setMarkerPosition(newPosition);
    setLocationSearch({
      name: 'Custom Location',
      latitude: Number(newPosition.lat.toFixed(6)),
      longitude: Number(newPosition.lng.toFixed(6)),
    });
  };

  const renderDateDiffInput = () => {
    if (timeType === 'normal_date' || timeType === 'interval_date') {
      return (
        <>
          <br/>
          <label htmlFor="dateDiff">Date Difference (days):</label>
          <input
            type="number"
            id="dateDiff"
            value={dateDiff}
            onChange={(e) => setDateDiff(e.target.value)}
          />
        </>
      );
    }
    return null;
  };

  const formatRadiusLabel = (value) => {
    return `${value} km`;
  };

  return (
    <div>
      <h2>Story Search</h2>
      <form onSubmit={handleSearch}>
      <label htmlFor="titleSearch">Search by title:</label>
      <input
        type="text"
        id="titleSearch"
        value={titleSearch}
        onChange={(e) => setTitleSearch(e.target.value)}
      />
      <br />
      <label htmlFor="authorSearch">Search by author username:</label>
      <input
        type="text"
        id="authorSearch"
        value={authorSearch}
        onChange={(e) => setAuthorSearch(e.target.value)}
      />
      <br />
      <div>
        <label htmlFor="timeType">Date Type:</label>
        <select
          id="timeType"
          value={timeType}
          onChange={(e) => setTimeType(e.target.value)}
        >
          <option value="">Select time type</option>
          <option value="year">Year</option>
          <option value="year_interval">Year Interval</option>
          <option value="normal_date">Normal Date</option>
          <option value="interval_date">Interval Date</option>
        </select>
      </div>
      {renderTimeInput()}
      {renderDateDiffInput()}
        <div>
            <label>Location:</label>
            <Autocomplete
            onLoad={(autocomplete) => {
                autocompleteRef.current = autocomplete;
            }}
            onPlaceChanged={handleLocationSelect}
            >
            <input type="text"/>
            </Autocomplete>
            <label htmlFor="radiusDiff">
          Radius Difference: {formatRadiusLabel(radiusDiff)}
        </label>
          <input
            type="range"
            id="radiusDiff"
            min="1"
            max="250"
            value={radiusDiff}
            onChange={(e) => setRadiusDiff(e.target.value)}
          />
        </div>
            <div className='search-story-map' >
                <GoogleMap
                
                mapContainerStyle={{
                  width: '400px',
                  height: '400px',
                  
                }}
                zoom={2}
                center={markerPosition}
                onClick={(e) => handleMarker(e)}
                >
                {locationSearch && (
                    <Marker
                    position={markerPosition}
                    draggable={true}
                    onDragEnd={(e) => handleMarker(e)}
                    />
                )}
                </GoogleMap>
            </div>
            <button type="submit">Search</button>
            </form> 
      {stories.length > 0 && (
        <>
          <h3>Search Results:</h3>
          <ul>
            {stories.map((story) => (
              <li key={story.id}>
                <h4 className='title-search' onClick={() => handleStoryClick(story.id)}>
                  {story.title}
                </h4>
                <p>
                  author:{' '}
                  <span
                    className='author-search'
                    onClick={() => handleUserClick(story.author)}
                  >
                    {story.author_username}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
      {totalPages > 1 && (
        <div className='pagination-search'>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {renderPageNumbers()}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default withAuth(StorySearch);