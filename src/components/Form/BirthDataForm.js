import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useChartContext } from '../../context/ChartContext';
import { geocodeAddress } from '../../api/astronomyApi';

const BirthDataForm = () => {
  const { setBirthData, birthData, saveProfile } = useChartContext();
  
  // Form state
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [birthTime, setBirthTime] = useState('12:00');
  const [birthPlace, setBirthPlace] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [errors, setErrors] = useState({});
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState(false);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!birthDate) newErrors.birthDate = 'Birth date is required';
    if (!birthTime) newErrors.birthTime = 'Birth time is required';
    if (!birthPlace.trim() && (!latitude || !longitude)) {
      newErrors.birthPlace = 'Birth place or coordinates are required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      let lat = parseFloat(latitude);
      let lng = parseFloat(longitude);
      
      // If coordinates are not provided, geocode the birth place
      if (isNaN(lat) || isNaN(lng)) {
        setIsGeocoding(true);
        const geocodeResult = await geocodeAddress(birthPlace);
        lat = geocodeResult.latitude;
        lng = geocodeResult.longitude;
        setLatitude(lat.toString());
        setLongitude(lng.toString());
        setIsGeocoding(false);
      }
      
      // Format time as HH:MM
      const formattedTime = birthTime.includes(':') 
        ? birthTime 
        : `${birthTime}:00`;
      
      // Create birth data object
      const birthDataObj = {
        name,
        date: birthDate,
        time: formattedTime,
        place: birthPlace,
        latitude: lat,
        longitude: lng
      };
      
      // Set birth data in context
      setBirthData(birthDataObj);
      
      // Clear form errors
      setErrors({});
    } catch (error) {
      setErrors({ submit: error.message });
      setIsGeocoding(false);
    }
  };
  
  // Handle save profile
  const handleSaveProfile = () => {
    if (birthData) {
      saveProfile({
        ...birthData,
        savedAt: new Date().toISOString()
      });
      alert('Profile saved successfully!');
    }
  };
  
  return (
    <div className="birth-data-form">
      <h2 className="form-title">Birth Information</h2>
      
      {errors.submit && (
        <div className="error-message">{errors.submit}</div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="name">Full Name:</label>
          <input
            type="text"
            id="name"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>
        
        <div className="form-group date-time-group">
          <div className="date-field">
            <label className="form-label" htmlFor="birthDate">Birth Date:</label>
            <DatePicker
              id="birthDate"
              selected={birthDate}
              onChange={(date) => setBirthDate(date)}
              className={`form-control date-picker ${errors.birthDate ? 'is-invalid' : ''}`}
              dateFormat="MMMM d, yyyy"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              yearDropdownItemNumber={100}
              scrollableYearDropdown
            />
            {errors.birthDate && <div className="invalid-feedback">{errors.birthDate}</div>}
          </div>
          
          <div className="time-field">
            <label className="form-label" htmlFor="birthTime">Birth Time:</label>
            <input
              type="time"
              id="birthTime"
              className={`form-control ${errors.birthTime ? 'is-invalid' : ''}`}
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
            />
            {errors.birthTime && <div className="invalid-feedback">{errors.birthTime}</div>}
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="birthPlace">Birth Place:</label>
          <input
            type="text"
            id="birthPlace"
            className={`form-control ${errors.birthPlace ? 'is-invalid' : ''}`}
            value={birthPlace}
            onChange={(e) => setBirthPlace(e.target.value)}
            placeholder="City, Country"
          />
          {errors.birthPlace && <div className="invalid-feedback">{errors.birthPlace}</div>}
        </div>
        
        <div className="advanced-toggle">
          <button 
            type="button" 
            className="link-button"
            onClick={() => setAdvancedOptions(!advancedOptions)}
          >
            {advancedOptions ? 'Hide Advanced Options' : 'Show Advanced Options'}
          </button>
        </div>
        
        {advancedOptions && (
          <div className="advanced-options">
            <div className="form-group coordinates-group">
              <div className="lat-field">
                <label className="form-label" htmlFor="latitude">Latitude:</label>
                <input
                  type="text"
                  id="latitude"
                  className="form-control"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g. 40.7128"
                />
              </div>
              
              <div className="lng-field">
                <label className="form-label" htmlFor="longitude">Longitude:</label>
                <input
                  type="text"
                  id="longitude"
                  className="form-control"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g. -74.0060"
                />
              </div>
            </div>
          </div>
        )}
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary generate-btn"
            disabled={isGeocoding}
          >
            {isGeocoding ? 'Finding Location...' : 'Generate Chart'}
          </button>
          
          {birthData && (
            <button
              type="button"
              className="btn btn-secondary save-btn"
              onClick={handleSaveProfile}
            >
              Save Profile
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default BirthDataForm; 