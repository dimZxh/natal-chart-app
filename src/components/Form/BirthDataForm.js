import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useChartContext } from '../../context/ChartContext';
import EnhancedDatePicker from './EnhancedDatePicker';
import Button from '../UI/Button';

const BirthDataForm = () => {
  const { birthData, setBirthData, fetchChartData, resetChartData, saveProfile, profiles } = useChartContext();
  
  // Local form state
  const [formData, setFormData] = useState({
    name: '',
    date: new Date(),
    time: '12:00',
    place: '',
    latitude: '',
    longitude: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showLatLong, setShowLatLong] = useState(false);
  const [placeSuggestions, setPlaceSuggestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formChanged, setFormChanged] = useState(false);
  
  // Initialize form with existing data if available
  useEffect(() => {
    if (birthData) {
      setFormData({
        name: birthData.name || '',
        date: birthData.date ? new Date(birthData.date) : new Date(),
        time: birthData.time || '12:00',
        place: birthData.place || '',
        latitude: birthData.latitude || '',
        longitude: birthData.longitude || ''
      });
      
      setShowLatLong(birthData.latitude && birthData.longitude);
    }
  }, [birthData]);
  
  // Track form changes to enable/disable the generate button
  useEffect(() => {
    if (birthData) {
      const hasChanged = 
        formData.name !== birthData.name ||
        formData.place !== birthData.place ||
        formData.time !== birthData.time ||
        (formData.date && birthData.date && formData.date.toDateString() !== new Date(birthData.date).toDateString()) ||
        (showLatLong && (formData.latitude !== birthData.latitude || formData.longitude !== birthData.longitude));
        
      setFormChanged(hasChanged);
    } else {
      setFormChanged(true);
    }
  }, [formData, birthData, showLatLong]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Handle date change
  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      date
    }));
    
    if (errors.date) {
      setErrors(prev => ({
        ...prev,
        date: ''
      }));
    }
  };
  
  // Handle place selection
  const handlePlaceSelect = (suggestion) => {
    setFormData(prev => ({
      ...prev,
      place: suggestion.description,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude
    }));
    
    setPlaceSuggestions([]);
    
    if (errors.place) {
      setErrors(prev => ({
        ...prev,
        place: ''
      }));
    }
  };
  
  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Birth date is required';
    }
    
    if (!formData.time) {
      newErrors.time = 'Birth time is required';
    } else if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.time)) {
      newErrors.time = 'Invalid time format (use HH:MM)';
    }
    
    if (!formData.place.trim()) {
      newErrors.place = 'Birth place is required';
    }
    
    if (showLatLong) {
      if (!formData.latitude || isNaN(parseFloat(formData.latitude))) {
        newErrors.latitude = 'Valid latitude is required';
      } else if (parseFloat(formData.latitude) < -90 || parseFloat(formData.latitude) > 90) {
        newErrors.latitude = 'Latitude must be between -90 and 90';
      }
      
      if (!formData.longitude || isNaN(parseFloat(formData.longitude))) {
        newErrors.longitude = 'Valid longitude is required';
      } else if (parseFloat(formData.longitude) < -180 || parseFloat(formData.longitude) > 180) {
        newErrors.longitude = 'Longitude must be between -180 and 180';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Set birth data in context
      await setBirthData({
        name: formData.name.trim(),
        date: formData.date,
        time: formData.time,
        place: formData.place.trim(),
        latitude: showLatLong ? formData.latitude : null,
        longitude: showLatLong ? formData.longitude : null
      });
      
      // Fetch chart data
      await fetchChartData();
      
      // Reset form changed state
      setFormChanged(false);
      
    } catch (error) {
      console.error('Error generating chart:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Error generating chart. Please check your input and try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Save profile
  const handleSaveProfile = () => {
    if (birthData) {
      saveProfile(birthData);
    }
  };
  
  // Reset form
  const handleReset = () => {
    setFormData({
      name: '',
      date: new Date(),
      time: '12:00',
      place: '',
      latitude: '',
      longitude: ''
    });
    
    setErrors({});
    setShowLatLong(false);
    resetChartData();
  };
  
  // Check if profile already exists
  const profileExists = () => {
    if (!birthData || !profiles.length) return false;
    
    return profiles.some(profile => 
      profile.name === birthData.name && 
      new Date(profile.date).toDateString() === new Date(birthData.date).toDateString() &&
      profile.time === birthData.time &&
      profile.place === birthData.place
    );
  };

  return (
    <div className="birth-data-form">
      <h2 className="form-title">Enter Birth Details</h2>
      
      {errors.submit && (
        <div className="form-error" role="alert">
          {errors.submit}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name <span className="required">*</span></label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`form-control ${errors.name ? 'error' : ''}`}
            placeholder="Enter your full name"
            aria-describedby={errors.name ? "name-error" : undefined}
            autoComplete="name"
            required
          />
          {errors.name && (
            <div id="name-error" className="error-message" role="alert">
              {errors.name}
            </div>
          )}
        </div>
        
        <div className="form-group">
          <EnhancedDatePicker
            id="birth-date"
            label="Birth Date"
            selectedDate={formData.date}
            onChange={handleDateChange}
            required={true}
            error={errors.date}
            placeholder="Select birth date..."
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="time">Birth Time <span className="required">*</span></label>
          <input
            type="time"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className={`form-control ${errors.time ? 'error' : ''}`}
            aria-describedby={errors.time ? "time-error" : undefined}
            required
          />
          {errors.time && (
            <div id="time-error" className="error-message" role="alert">
              {errors.time}
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="place">Birth Place <span className="required">*</span></label>
          <div className="place-input-container">
            <input
              type="text"
              id="place"
              name="place"
              value={formData.place}
              onChange={handleChange}
              className={`form-control ${errors.place ? 'error' : ''}`}
              placeholder="City, Country"
              aria-describedby={errors.place ? "place-error" : undefined}
              autoComplete="off"
              required
            />
            {placeSuggestions.length > 0 && (
              <ul className="place-suggestions">
                {placeSuggestions.map((suggestion, index) => (
                  <li 
                    key={index}
                    onClick={() => handlePlaceSelect(suggestion)}
                    tabIndex={0}
                    role="option"
                    aria-selected={false}
                  >
                    {suggestion.description}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {errors.place && (
            <div id="place-error" className="error-message" role="alert">
              {errors.place}
            </div>
          )}
        </div>
        
        <div className="form-group toggle-container">
          <button
            type="button"
            className="toggle-btn"
            onClick={() => setShowLatLong(!showLatLong)}
            aria-expanded={showLatLong}
          >
            {showLatLong ? '− Hide Coordinates' : '+ Add Coordinates Manually'}
          </button>
        </div>
        
        {showLatLong && (
          <div className="coordinates-container">
            <div className="form-group">
              <label htmlFor="latitude">Latitude <span className="required">*</span></label>
              <input
                type="text"
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className={`form-control ${errors.latitude ? 'error' : ''}`}
                placeholder="e.g. 40.7128"
                aria-describedby={errors.latitude ? "latitude-error" : undefined}
                required={showLatLong}
              />
              {errors.latitude && (
                <div id="latitude-error" className="error-message" role="alert">
                  {errors.latitude}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="longitude">Longitude <span className="required">*</span></label>
              <input
                type="text"
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className={`form-control ${errors.longitude ? 'error' : ''}`}
                placeholder="e.g. -74.0060"
                aria-describedby={errors.longitude ? "longitude-error" : undefined}
                required={showLatLong}
              />
              {errors.longitude && (
                <div id="longitude-error" className="error-message" role="alert">
                  {errors.longitude}
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="form-actions">
          <Button 
            type="submit"
            variant="primary"
            fullWidth={true}
            disabled={isSubmitting || !formChanged}
          >
            {isSubmitting ? 'Generating Chart...' : birthData ? 'Update Chart' : 'Generate Chart'}
          </Button>
          
          {birthData && (
            <div className="secondary-actions">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveProfile}
                disabled={profileExists()}
              >
                {profileExists() ? 'Profile Saved' : 'Save Profile'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
              >
                New Chart
              </Button>
            </div>
          )}
        </div>
      </form>
      
      <style jsx>{`
        .birth-data-form {
          padding: 1.5rem;
        }
        
        .form-title {
          margin-top: 0;
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
          color: var(--color-text);
          text-align: center;
        }
        
        .form-group {
          margin-bottom: 1.25rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: var(--color-text);
          font-size: 0.95rem;
        }
        
        .required {
          color: var(--color-danger);
          margin-left: 2px;
        }
        
        .form-control {
          display: block;
          width: 100%;
          padding: 0.75rem 1rem;
          font-size: 1rem;
          line-height: 1.5;
          color: var(--color-text);
          background-color: var(--color-bg-light);
          background-clip: padding-box;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
        
        .form-control:focus {
          border-color: var(--color-primary);
          outline: 0;
          box-shadow: 0 0 0 3px var(--color-primary-transparent);
        }
        
        .form-control.error {
          border-color: var(--color-danger);
        }
        
        .form-control.error:focus {
          box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.25);
        }
        
        .error-message {
          color: var(--color-danger);
          font-size: 0.85rem;
          margin-top: 0.5rem;
          margin-bottom: 0;
        }
        
        .form-error {
          margin-bottom: 1.5rem;
          padding: 0.75rem 1rem;
          background-color: rgba(220, 53, 69, 0.1);
          border-left: 4px solid var(--color-danger);
          color: var(--color-danger);
          border-radius: 4px;
        }
        
        .place-input-container {
          position: relative;
        }
        
        .place-suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          z-index: 10;
          margin: 0;
          padding: 0;
          list-style: none;
          background-color: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: 0 0 8px 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          max-height: 200px;
          overflow-y: auto;
        }
        
        .place-suggestions li {
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }
        
        .place-suggestions li:hover,
        .place-suggestions li:focus {
          background-color: var(--color-bg-light);
          outline: none;
        }
        
        .toggle-container {
          text-align: right;
        }
        
        .toggle-btn {
          background: none;
          border: none;
          color: var(--color-primary);
          font-size: 0.9rem;
          cursor: pointer;
          padding: 0.5rem;
          font-weight: 500;
        }
        
        .toggle-btn:hover {
          text-decoration: underline;
        }
        
        .coordinates-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .form-actions {
          margin-top: 2rem;
        }
        
        .secondary-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }
        
        @media (max-width: 768px) {
          .coordinates-container {
            grid-template-columns: 1fr;
            gap: 0;
          }
          
          .secondary-actions {
            flex-direction: column;
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default BirthDataForm; 