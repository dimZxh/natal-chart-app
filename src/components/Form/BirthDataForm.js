import React, { useState, useEffect } from 'react';
import { useChartContext } from '../../context/ChartContext';
import { geocodeAddress } from '../../api/astronomyApi';
import EnhancedDatePicker from './EnhancedDatePicker';
import Button from '../UI/Button';
import LoadingSpinner from '../UI/LoadingSpinner';

const BirthDataForm = () => {
  const { setBirthData, birthData, saveProfile, savedProfiles } = useChartContext();
  
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
  const [formTouched, setFormTouched] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // Load the most recent profile if available
  useEffect(() => {
    if (savedProfiles && savedProfiles.length > 0 && !formTouched) {
      const latestProfile = savedProfiles[0];
      setName(latestProfile.name || '');
      setBirthDate(new Date(latestProfile.date) || new Date());
      setBirthTime(latestProfile.time || '12:00');
      setBirthPlace(latestProfile.place || '');
      setLatitude(latestProfile.latitude?.toString() || '');
      setLongitude(latestProfile.longitude?.toString() || '');
    }
  }, [savedProfiles, formTouched]);
  
  // Form validation function
  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!birthDate) newErrors.birthDate = 'Birth date is required';
    
    // Validate time format
    if (!birthTime) {
      newErrors.birthTime = 'Birth time is required';
    } else if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(birthTime)) {
      newErrors.birthTime = 'Invalid time format (use HH:MM)';
    }
    
    if (!birthPlace.trim() && (!latitude || !longitude)) {
      newErrors.birthPlace = 'Birth place or coordinates are required';
    }
    
    // Validate latitude and longitude if provided
    if (latitude && (isNaN(parseFloat(latitude)) || parseFloat(latitude) < -90 || parseFloat(latitude) > 90)) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }
    
    if (longitude && (isNaN(parseFloat(longitude)) || parseFloat(longitude) < -180 || parseFloat(longitude) > 180)) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }
    
    return newErrors;
  };
  
  // Handle input changes - mark form as touched
  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setFormTouched(true);
    
    // Clear related error when value changes
    if (errors[e.target.id]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[e.target.id];
        return newErrors;
      });
    }
  };
  
  // Handle date change
  const handleDateChange = (date) => {
    setBirthDate(date);
    setFormTouched(true);
    
    if (errors.birthDate) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.birthDate;
        return newErrors;
      });
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    // Validate form
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      setShowSuccess(false);
      let lat = parseFloat(latitude);
      let lng = parseFloat(longitude);
      
      // If coordinates are not provided, geocode the birth place
      if (isNaN(lat) || isNaN(lng)) {
        setIsGeocoding(true);
        try {
          const geocodeResult = await geocodeAddress(birthPlace);
          lat = geocodeResult.latitude;
          lng = geocodeResult.longitude;
          setLatitude(lat.toString());
          setLongitude(lng.toString());
        } catch (geocodeError) {
          setErrors({ 
            birthPlace: `Could not find coordinates for this location: ${geocodeError.message}` 
          });
          setIsGeocoding(false);
          return;
        }
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
      
      // Show success message briefly
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Clear form errors
      setErrors({});
    } catch (error) {
      setErrors({ submit: error.message });
      setIsGeocoding(false);
    }
  };
  
  // Handle saving profile
  const handleSaveProfile = () => {
    if (birthData) {
      saveProfile({
        ...birthData,
        savedAt: new Date().toISOString()
      });
      
      // Show success message briefly
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };
  
  // Clear form
  const handleClearForm = () => {
    setName('');
    setBirthDate(new Date());
    setBirthTime('12:00');
    setBirthPlace('');
    setLatitude('');
    setLongitude('');
    setErrors({});
    setFormTouched(true);
    setFormSubmitted(false);
  };
  
  return (
    <div className="birth-data-form">
      <h2 className="form-title">Birth Information</h2>
      
      {errors.submit && (
        <div className="error-message">
          <p>{errors.submit}</p>
          <button className="close-btn" onClick={() => setErrors(prev => {
            const newErrors = {...prev};
            delete newErrors.submit;
            return newErrors;
          })}>×</button>
        </div>
      )}
      
      {showSuccess && (
        <div className="success-message slide-up">
          <p>{birthData ? 'Chart generated successfully!' : 'Profile saved successfully!'}</p>
          <button className="close-btn" onClick={() => setShowSuccess(false)}>×</button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className={formSubmitted ? 'was-validated' : ''}>
        <div className="form-group">
          <label className="form-label" htmlFor="name">Full Name:</label>
          <input
            type="text"
            id="name"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            value={name}
            onChange={handleInputChange(setName)}
            placeholder="Enter your name"
            required
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>
        
        <div className="form-group date-time-group">
          <div className="date-field">
            <EnhancedDatePicker
              id="birthDate"
              selectedDate={birthDate}
              onChange={handleDateChange}
              label="Birth Date"
              required={true}
              error={errors.birthDate}
            />
          </div>
          
          <div className="time-field">
            <label className="form-label" htmlFor="birthTime">Birth Time:</label>
            <div className="time-input-container">
              <input
                type="time"
                id="birthTime"
                className={`form-control ${errors.birthTime ? 'is-invalid' : ''}`}
                value={birthTime}
                onChange={handleInputChange(setBirthTime)}
                required
              />
              <span className="time-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 3.5V8L11 10.5M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8Z" 
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </div>
            {errors.birthTime && <div className="invalid-feedback">{errors.birthTime}</div>}
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="birthPlace">Birth Place:</label>
          <div className="location-input-container">
            <input
              type="text"
              id="birthPlace"
              className={`form-control ${errors.birthPlace ? 'is-invalid' : ''}`}
              value={birthPlace}
              onChange={handleInputChange(setBirthPlace)}
              placeholder="City, Country"
              required={!latitude || !longitude}
            />
            <span className="location-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 8.5C9.10457 8.5 10 7.60457 10 6.5C10 5.39543 9.10457 4.5 8 4.5C6.89543 4.5 6 5.39543 6 6.5C6 7.60457 6.89543 8.5 8 8.5Z" 
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13 6.5C13 11 8 14.5 8 14.5C8 14.5 3 11 3 6.5C3 3.46243 5.23858 1 8 1C10.7614 1 13 3.46243 13 6.5Z" 
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
          {errors.birthPlace && <div className="invalid-feedback">{errors.birthPlace}</div>}
        </div>
        
        <div className="advanced-toggle">
          <button 
            type="button" 
            className="link-button"
            onClick={() => setAdvancedOptions(!advancedOptions)}
          >
            {advancedOptions ? '▼ Hide Advanced Options' : '▶ Show Advanced Options'}
          </button>
        </div>
        
        {advancedOptions && (
          <div className="advanced-options slide-up">
            <p className="coordinates-help">Manually enter coordinates if known. These will override any geocoded values.</p>
            <div className="form-group coordinates-group">
              <div className="lat-field">
                <label className="form-label" htmlFor="latitude">Latitude:</label>
                <input
                  type="text"
                  id="latitude"
                  className={`form-control ${errors.latitude ? 'is-invalid' : ''}`}
                  value={latitude}
                  onChange={handleInputChange(setLatitude)}
                  placeholder="e.g. 40.7128"
                />
                {errors.latitude && <div className="invalid-feedback">{errors.latitude}</div>}
              </div>
              
              <div className="lng-field">
                <label className="form-label" htmlFor="longitude">Longitude:</label>
                <input
                  type="text"
                  id="longitude"
                  className={`form-control ${errors.longitude ? 'is-invalid' : ''}`}
                  value={longitude}
                  onChange={handleInputChange(setLongitude)}
                  placeholder="e.g. -74.0060"
                />
                {errors.longitude && <div className="invalid-feedback">{errors.longitude}</div>}
              </div>
            </div>
          </div>
        )}
        
        <div className="form-actions">
          <div className="action-buttons">
            <Button 
              type="submit" 
              variant="primary"
              size="medium"
              disabled={isGeocoding}
            >
              {isGeocoding ? (
                <><LoadingSpinner message="" /> Finding Location...</>
              ) : (
                'Generate Chart'
              )}
            </Button>
            
            {birthData && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleSaveProfile}
              >
                Save Profile
              </Button>
            )}
          </div>
          
          <Button
            type="button"
            variant="outline"
            size="small"
            onClick={handleClearForm}
          >
            Clear Form
          </Button>
        </div>
      </form>
      
      <style jsx>{`
        .date-picker-container,
        .time-input-container,
        .location-input-container {
          position: relative;
        }
        
        .time-icon,
        .location-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-light);
          pointer-events: none;
        }
        
        .error-message,
        .success-message {
          padding: 12px 16px;
          border-radius: var(--border-radius-sm);
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .error-message {
          background-color: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: var(--color-error);
        }
        
        .success-message {
          background-color: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: var(--color-success);
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          line-height: 1;
          color: currentColor;
          cursor: pointer;
        }
        
        .coordinates-help {
          margin-top: 0;
          margin-bottom: 16px;
          font-size: 0.9rem;
          color: var(--color-text-light);
          font-style: italic;
        }
        
        .link-button {
          background: none;
          border: none;
          color: var(--color-primary);
          cursor: pointer;
          padding: 8px 0;
          font-size: 0.9rem;
          display: inline-flex;
          align-items: center;
        }
        
        .link-button:hover {
          text-decoration: underline;
        }
        
        .action-buttons {
          display: flex;
          gap: 12px;
        }
        
        @media (max-width: 768px) {
          .action-buttons {
            flex-direction: column;
            width: 100%;
          }
          
          .form-actions {
            flex-direction: column;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default BirthDataForm; 