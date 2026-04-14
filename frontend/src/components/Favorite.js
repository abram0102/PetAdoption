import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Favorites() {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  const rawLogin = localStorage.getItem("login");
  const user = rawLogin && rawLogin !== "null" ? JSON.parse(rawLogin) : null;
  const userId = user?.sub;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/pet/favorites/${userId}`)
      .then(res => res.json())
      .then(async data => {
        const ids = data.favorites || [];

        const petInfoPromises = ids.map(async (id) => {
          try {
            const r = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/pet/id/${id}`);
            if (!r.ok) return null;
            const d = await r.json();
            const pet = d.pet || d;
            return pet && pet._id ? pet : null;
          } catch (e) {
            return null;
          }
        });

        const petList = await Promise.all(petInfoPromises);
        const validPets = petList.filter(Boolean);
        setPets(validPets);

        const validIds = validPets.map(p => p._id);
        if (validIds.length !== ids.length) {
          await fetch('/api/pet/favorites', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ _id: userId, favorites: validIds })
          });
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return <Container className="main-container">loading..</Container>
  }

  return(
    <Container className="main-container">
      <h2>Your Favorite Pets</h2>
      {pets.length === 0 ? (
        <p>No favorites yet</p>
      ) : (
        <Row>
          {pets.map(pet => (
            <Col md={4} sm={6} xs={12} key={pet._id} className="mb-4">
              <Card style={{ borderRadius: 20, cursor: 'pointer' }}
                onClick={() => navigate(`/pets/${pet._id}`)}
              >
                {pet.image && (
                  <Card.Img
                    variant="top"
                    src={pet.image}
                    className='petList_image'
                  />
                )}
                <Card.Body>
                  <Card.Title style={{ fontWeight: 600, fontSize: '1.7rem '}}>{pet.petName}</Card.Title>
                  <Card.Text style={{ fontSize: '1.1rem', marginBottom: 2 }}><strong>Age:</strong> {pet.age}</Card.Text>
                  <Card.Text style={{ fontSize: '1.1rem', marginBottom: 2 }}><strong>Breed:</strong> {pet.breed}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default Favorites;