import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

function UserSearch() {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
  
    const handleSearch = async () => {
      navigate(`/SearchUserResults/${searchQuery}`);
    };
  
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search usernames..."
          size="small"
          variant="outlined"
          style={{ backgroundColor: 'white', borderRadius: '4px' }}
        />
      <IconButton onClick={handleSearch} size="small">
      <SearchIcon style={{ color: 'white' }} />
        </IconButton>
      </div>
    );
  }
  
  export default UserSearch;
