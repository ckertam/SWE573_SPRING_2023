import React, { useState } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddPhotoToStory.css';

function AddPhotoToStory() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploadedPhotos, setUploadedPhotos] = useState([]);

  const { story_id, story_title } = useParams();

  const navigate = useNavigate();

  const decodedStoryTitle = decodeURIComponent(story_title);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    } else {
        setSelectedFile(null);
        setPreviewUrl(null);
    }
  };

  const handleAddPhoto = async () => {
    setSelectedFile(null); // reset selected file before adding
    setPreviewUrl(null);

    if (selectedFile) {
      const formData = new FormData();
      formData.append('photo_for_story', selectedFile);

      try {
        const response = await axios.post(`http://localhost:8000/user/storyPhotoOps/${story_id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        });
        console.log(response.data);
        alert('Photo added successfully');
        setUploadedPhotos([...uploadedPhotos, response.data]);
        setSelectedFile(null); // reset selected file after adding
        setPreviewUrl(null); // remove preview URL after adding
      } catch (error) {
        console.log(error);
        alert('Error adding photo');
      }
    } else {
      alert('Please select a photo to add');
    }
  };
  

  const handleRemovePhoto = async (index) => {
    // You may need to modify this line based on your API.
    const photo_id = uploadedPhotos[index].id;
  
    try {
      await axios.delete(`http://localhost:8000/user/storyPhotoOps/${story_id}/${photo_id}`, {
        withCredentials: true,
      });
      setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== index));
      alert('Photo removed successfully');
    } catch (error) {
      console.log(error);
      alert('Error removing photo');
    }
  };

  const handleDoneClick = () => {
    navigate(`/story/${story_id}`);
  };

  return (
    <div>
      <h2>Story Title: {decodedStoryTitle}</h2>
      <label className="file-upload-container">
        <input type="file" onChange={handleFileChange} />
        <span className="file-upload-text">Choose a photo</span>
      </label>
      {previewUrl && (
        <div>
          <img src={previewUrl} alt="Selected Photo" width={100} height={100} />
        </div>
      )}
      <button onClick={handleAddPhoto}>Add Photo</button>
      <div>
        {uploadedPhotos.map((photo, index) => {
          return (
            <div key={photo.id}>
              <img
                src={`http://localhost:8000${photo.photo_for_story}`}
                alt={`Uploaded Photo ${index}`}
                width={100}
                height={100}
              />
              <button onClick={() => handleRemovePhoto(index)}>Remove</button>
            </div>
          );
        })}
      </div>
      <button onClick={handleDoneClick}>Done</button>
    </div>
  );
  
}

export default AddPhotoToStory;
