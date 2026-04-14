import React, { useEffect, useState } from 'react';
import { Form, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import "./PetList.css";

function HeartIcon({ filled, size = 32, color = "#e53935", onClick }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? color : "none"}
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      onClick={e => { e.stopPropagation(); onClick && onClick(); }}
      style={{ cursor: "pointer" }}
    >
      <path d="M12 20.8C12 20.8 5 15.36 5 10.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 7 4.5c0 4.86-7 10.3-7 10.3z" />
    </svg>
  );
}


const petTypes = ['All', 'Dog', 'Cat', 'Fish', 'Rabbit', 'Sheep', 'Lizard'];

const PetList = () => {
  const [pets, setPets] = useState([]);
  const [filterType, setFilterType] = useState('All');
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const navigate = useNavigate();

  const rawLogin = localStorage.getItem("login");
  const user = rawLogin && rawLogin !== "null" ? JSON.parse(rawLogin) : null;
  const userId = user?.sub;

  useEffect(() => {
  if (!userId) {
    setFavoriteIds([]);
    return;
  }
  fetch(`${process.env.REACT_APP_API_BASE_URL}/api/pet/favorites/${userId}`)
    .then(res => res.json())
    .then(data => {
      setFavoriteIds(data.favorites || []);
    })
    .catch(err => console.error("Favorite showing error", err));
  }, [userId]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/pet/`)
      .then(res => res.json())
      .then(data => {
        setPets(data.pets || []);
        setLoading(false);
      });
  }, []);

  const filteredPets = pets.filter(pet => {
    if (filterType === 'All') return true;
    return pet.type?.toLowerCase().trim() === filterType.toLowerCase();
  });


  const handleToggleFavorite = async (petId) => {
    if (!userId) {
        alert("Please login first");
        return;
    }
    setFavoriteIds(ids => {
        const newIds = ids.includes(petId) ? ids.filter(id => id !== petId) : [...ids, petId];

        fetch(`${process.env.REACT_APP_API_BASE_URL}/api/pet/favorites`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify({
                _id: userId,
                favorites:newIds,
            })
        })
        .then(res => {
            if (!res.ok) throw new Error('Failed to favorite');
            return res.json();
        })
        .catch(err => console.error(err));
        return newIds;
    });
  };

  return (
    <div className="container-fluid" style={{ minHeight: "100vh" }}>
      <div className="row">
        <div className="col-md-3 d-flex flex-column align-items-center justify-content-start pt-5 ">
          <Card className="filter_card">
            <Form>
              <Form.Label
                className="fw-bold mb-3"
                style={{ fontSize: "1.3rem", letterSpacing: 1, color: "#2d6b9f" }}
              >
                Filter by type
              </Form.Label>
              <Form.Select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                style={{
                  height: 56,
                  fontSize: '1.2rem',
                  borderRadius: 14,
                  boxShadow: '0 2px 12px 0 rgba(88, 159, 255, 0.05)'
                }}
              >
                {petTypes.map(type => (
                  <option value={type} key={type}>{type}</option>
                ))}
              </Form.Select>
              <button
                className="btn btn-info w-100 mt-3"
                onClick={() => { 
                    if (!user || !userId) {
                      alert("Please log in to add a pet.");
                    } else {
                      navigate('/add-pet');
                    }
                }}
              >
                Do you have a pet that needs to be adopted?
              </button>
            </Form>
          </Card>
        </div>
        <div className="col-md-9 p-4">
          {loading ? (
            <div className="d-flex justify-content-center"><span>Loading...</span></div>
          ) : (
            <Row>
              {filteredPets.map(pet => (
                <Col md={4} sm={6} xs={12} key={pet._id || pet.petName} className="mb-4">
                  <Card
                    className="h-100 shadow-sm position-relative"
                    style={{
                      borderRadius: 20,
                      cursor: "pointer"
                    }}
                    onClick={() => navigate(`/pets/${pet._id}`)}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: 14,
                        right: 18,
                        zIndex: 2,
                      }}
                    >
                      <HeartIcon
                        filled={favoriteIds.includes(pet._id)}
                        size={38}
                        onClick={() => handleToggleFavorite(pet._id)}
                      />
                    </span>
                    {pet.image && (
                      <Card.Img
                        variant="top"
                        src={pet.image}
                        className='petList_image'
                      />
                    )}
                    <Card.Body>
                      <Card.Title className="mb-2" style={{ fontWeight: 600, fontSize: '1.7rem' }}>{pet.petName}</Card.Title>
                      <Card.Text style={{ fontSize: '1.1rem', marginBottom: 2 }}>
                        <strong>Age:</strong> {pet.age}
                      </Card.Text>
                      <Card.Text style={{ fontSize: '1.1rem', marginBottom: 2 }}>
                        <strong>Breed:</strong> {pet.breed}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
              {filteredPets.length === 0 && (
                <Col>
                  <p className="text-center mt-4">No pets of this type available.</p>
                </Col>
              )}
            </Row>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetList;
