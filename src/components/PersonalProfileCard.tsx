'use client';

import React, { useState } from 'react';

const regions = [
  'Arica y Parinacota',
  'Tarapacá',
  'Antofagasta',
  'Atacama',
  'Coquimbo',
  'Valparaíso',
  'Metropolitana',
  'O’Higgins',
  'Maule',
  'Ñuble',
  'Biobío',
  'Araucanía',
  'Los Ríos',
  'Los Lagos',
  'Aysén',
  'Magallanes',
];

const citiesByRegion: Record<string, string[]> = {
  'Araucanía': ['Temuco', 'Villarrica', 'Pucón'],
  'Metropolitana': ['Santiago', 'Puente Alto', 'Maipú'],
  'Valparaíso': ['Valparaíso', 'Viña del Mar', 'Quilpué'],
  // Add more regions and cities as needed
};

const occupations = ['Ninguna', 'Profesional', 'Técnico', 'Estudiante', 'Independiente'];

const PersonalProfileCard: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('johndoe@example.com');
  const [phone, setPhone] = useState('123-456-7890');
  const [address, setAddress] = useState('123 Main St, Springfield');
  const [image, setImage] = useState('https://via.placeholder.com/150');
  const [region, setRegion] = useState('Araucanía');
  const [city, setCity] = useState('Temuco');
  const [occupation, setOccupation] = useState('Profesional');
  const [description, setDescription] = useState('Descripción del usuario.');
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRegion(e.target.value);
    setCity(citiesByRegion[e.target.value]?.[0] || '');
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCity(e.target.value);
  };

  const handleOccupationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOccupation(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  const toggleEditingDescription = () => {
    setIsEditingDescription(!isEditingDescription);
  };

  return (
    <div className="personal-profile-card" style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', maxWidth: '400px', backgroundColor: '#f9f9f9' }}>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <img
          src={image}
          alt="Profile"
          style={{ borderRadius: '50%', width: '120px', height: '120px', objectFit: 'cover', marginBottom: '16px' }}
        />
        {isEditing && (
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'block', margin: '0 auto' }}
          />
        )}
      </div>
      {isEditing ? (
        <>
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            style={{ fontSize: '1.5rem', margin: '0 0 8px', width: '100%', textAlign: 'center', border: '1px solid #ddd', borderRadius: '4px', padding: '4px' }}
          />
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            style={{ fontSize: '1rem', margin: '0 0 8px', width: '100%', textAlign: 'center', border: '1px solid #ddd', borderRadius: '4px', padding: '4px' }}
          />
          <input
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            style={{ fontSize: '1rem', margin: '0 0 8px', width: '100%', textAlign: 'center', border: '1px solid #ddd', borderRadius: '4px', padding: '4px' }}
          />
          <select
            value={region}
            onChange={handleRegionChange}
            style={{ fontSize: '1rem', margin: '0 0 8px', width: '100%', textAlign: 'center', border: '1px solid #ddd', borderRadius: '4px', padding: '4px' }}
          >
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select
            value={city}
            onChange={handleCityChange}
            style={{ fontSize: '1rem', margin: '0 0 8px', width: '100%', textAlign: 'center', border: '1px solid #ddd', borderRadius: '4px', padding: '4px' }}
          >
            {citiesByRegion[region]?.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={occupation}
            onChange={handleOccupationChange}
            style={{ fontSize: '1rem', margin: '0 0 8px', width: '100%', textAlign: 'center', border: '1px solid #ddd', borderRadius: '4px', padding: '4px' }}
          >
            {occupations.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </>
      ) : (
        <>
          <h2 style={{ fontSize: '1.5rem', margin: '0 0 8px', textAlign: 'center' }}>{name}</h2>
          <p style={{ fontSize: '1rem', margin: '0 0 8px', textAlign: 'center' }}>{email}</p>
          <p style={{ fontSize: '1rem', margin: '0 0 8px', textAlign: 'center' }}>{phone}</p>
          <p style={{ fontSize: '1rem', margin: '0 0 8px', textAlign: 'center' }}>{region}, {city}</p>
          <p style={{ fontSize: '1rem', margin: '0 0 8px', textAlign: 'center', color: '#007BFF' }}>{occupation}</p>
        </>
      )}
      <button
        onClick={toggleEditing}
        style={{ padding: '10px 20px', backgroundColor: isEditing ? '#28a745' : '#007BFF', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
      >
        {isEditing ? 'Guardar' : 'Editar'}
      </button>

      <div style={{ marginTop: '16px' }}>
        <h3 style={{ fontSize: '1.2rem', margin: '0 0 8px', textAlign: 'center' }}>Sobre mí</h3>
        {isEditingDescription ? (
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            style={{ fontSize: '1rem', margin: '0 0 16px', width: '100%', textAlign: 'center', border: '1px solid #ddd', borderRadius: '4px', padding: '4px' }}
          />
        ) : (
          <p style={{ fontSize: '1rem', margin: '0 0 16px', textAlign: 'center' }}>{description}</p>
        )}
        <button
          onClick={toggleEditingDescription}
          style={{ padding: '10px 20px', backgroundColor: isEditingDescription ? '#28a745' : '#007BFF', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
        >
          {isEditingDescription ? 'Guardar' : 'Editar'}
        </button>
      </div>
    </div>
  );
};

export default PersonalProfileCard;