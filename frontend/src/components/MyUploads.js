import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const MyUploads = () => {
  const navigate = useNavigate();
  const rawLogin = localStorage.getItem("login");
  const user = rawLogin && rawLogin !== "null" ? JSON.parse(rawLogin) : null;
  const userId = user?.sub || user?.googleId; 

  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetPet, setTargetPet] = useState(null);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    const nameParam = user?.name ? `?name=${encodeURIComponent(user.name)}` : '';
    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/pet/user/${userId}${nameParam}`)
      .then(res => res.json())
      .then(data => setPets(data.pets || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId, user?.name]);

  const askDelete = (pet) => { setTargetPet(pet); setConfirmOpen(true); };
  const doDelete = async () => {
    if (!targetPet) return;
    try {
      await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/pet/deletePet/${targetPet._id}`, { method: 'DELETE' });
      setPets(prev => prev.filter(p => p._id !== targetPet._id));
      if (userId) {
        try {
          const favRes = await fetch(`/api/pet/favorites/${userId}`);
          const favData = await favRes.json();
          const newFav = (favData?.favorites || []).filter(id => id !== targetPet._id);
          await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/pet/favorites`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ _id: userId, favorites: newFav })
          });
        } catch (e) {
          console.warn('Favorites cleanup failed (non-blocking):', e);
        }
      }
    } catch (e) {
      console.error(e);
      alert('Failed to delete the pet.');
    } finally {
      setConfirmOpen(false);
      setTargetPet(null);
    }
  };

  const goEdit = (pet) => {
    navigate(`/edit-pet/${pet._id}`, { state: { pet } });
  };

  if (!userId) {
    return <Container className="main-container"><h3>Please login to view your uploads.</h3></Container>;
  }

  return (
    <Container className="main-container">
      <h2 className="mb-4">My Uploads</h2>
      {loading ? (
          <p>Loading…</p> 
      ) : pets.length === 0 ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '40vh' }}
        >
            <button className="btn btn-info" onClick={() => navigate('/add-pet')}
            style={{
                padding: '14px 22px',
                borderRadius: 14,
                fontSize: '1.25rem'
            }}
            >
                You can upload a pet needs adoption here.
            </button>
        </div>
      ) : (
        <Row>
          {pets.map(pet => (
            <Col md={4} sm={6} xs={12} key={pet._id} className="mb-4">
              <Card className="h-100 position-relative" style={{ borderRadius: 20, cursor: 'pointer'  }}
                onClick={() => navigate(`/pets/${pet._id}`)}
              >
                <button className="corner-btn left" onClick={(e) => { e.stopPropagation(); askDelete(pet); }}
                aria-label="delete pet"
            >
                <img src="/images/Trashlogo.jpg" alt="" />
            </button>

            <button className="corner-btn right" onClick={(e) => { e.stopPropagation(); goEdit(pet); }}
            aria-label="Edit pet"
        >
            <img src="/images/Editlogo.png" alt="" />
        </button>

        {pet.image && (
            <Card.Img
            variant="top"
            src={pet.image}
            style={{ height:200, objectFit:'cover', borderTopLeftRadius:20, borderTopRightRadius:20 }}
            />
        )}
        <Card.Body>
            <Card.Title className="mb-2" style={{ fontWeight:600, fontSize:'1.3rem' }}>{pet.petName}</Card.Title>
            <Card.Text><strong>Type:</strong> {pet.type}</Card.Text>
            <Card.Text><strong>Age:</strong> {pet.age}</Card.Text>
            <Card.Text><strong>Breed:</strong> {pet.breed}</Card.Text>
          </Card.Body>
        </Card>
      </Col>
    ))}
  </Row>
    )}

      <Modal show={confirmOpen} onHide={() => setConfirmOpen(false)} centered>
        <Modal.Header closeButton><Modal.Title>Confirm</Modal.Title></Modal.Header>
        <Modal.Body>You're deleting the pet</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={doDelete}>Yes</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyUploads;
