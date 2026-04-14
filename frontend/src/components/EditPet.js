import React, { useEffect, useState } from "react";
import { Container, Form, Row, Col, Button, Alert } from "react-bootstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const EditPet = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [petData, setPetData] = useState({
    type: "", petName: "", age: "", breed: "", history: "", personality: "", image: ""
  });
  const [error, setError] = useState("");
  const allowedTypes = ["dog","cat","fish","rabbit","lizard","sheep"];

  useEffect(() => {
    const statePet = location.state?.pet;
    if (statePet) {
      setPetData({
        type: statePet.type || "",
        petName: statePet.petName || "",
        age: statePet.age || "",
        breed: statePet.breed || "",
        history: statePet.history || "",
        personality: statePet.personality || "",
        image: statePet.image || ""
      });
    } else {
      fetch(`/api/pet/id/${id}`)
        .then(r => r.json())
        .then(d => {
          const p = d.pet || d;
          setPetData({
            type: p.type || "",
            petName: p.petName || "",
            age: p.age || "",
            breed: p.breed || "",
            history: p.history || "",
            personality: p.personality || "",
            image: p.image || ""
          });
        })
        .catch(console.error);
    }
  }, [id, location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPetData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.size > 2 * 1024 * 1024) {
      setError("Image size must be ≤ 2MB");
      return;
    }
    const imageData = new FormData();
    imageData.append("file", file);
    imageData.append("upload_preset", "your_upload_preset");
    try {
      const imgRes = await fetch("https://api.cloudinary.com/v1_1/your_cloud_name/image/upload", { method:"POST", body:imageData });
      const data = await imgRes.json();
      setPetData(prev => ({ ...prev, image: data.secure_url }));
    } catch (err) {
      console.error("Upload error", err);
      setError("Failed to upload image");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!petData.type || !petData.petName || !petData.age || !petData.breed || !petData.history || !petData.personality || !petData.image) {
      setError("Missing Information"); return;
    }
    if (!allowedTypes.includes(petData.type.toLowerCase().trim())) {
      setError("We only accept limited type of pets now"); return;
    }
    try {
      const res = await fetch(`/api/pet/updatePet/${id}`, {
        method: "PUT",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify(petData)
      });
      if (!res.ok) throw new Error("Failed to update");
      navigate("/my-uploads");
    } catch (err) {
      console.error(err);
      setError("Failed to update pet. Please try again.");
    }
  };

  return (
    <Container className="main-container" style={{ maxWidth: 600 }}>
      <h2 className="my-4 text-center">Edit your upload</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group as={Row} className="mb-3" controlId="petType">
          <Form.Label column sm={4}>Enter Type of Pet</Form.Label>
          <Col sm={8}>
            <Form.Control type="text" name="type" value={petData.type} onChange={handleInputChange}/>
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3" controlId="petName">
          <Form.Label column sm={4}>Enter Pet Name</Form.Label>
          <Col sm={8}>
            <Form.Control type="text" name="petName" value={petData.petName} onChange={handleInputChange}/>
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3" controlId="petAge">
          <Form.Label column sm={4}>Enter Pet Age</Form.Label>
          <Col sm={8}>
            <Form.Control type="number" min="0" name="age" value={petData.age} onChange={handleInputChange}/>
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3" controlId="petBreed">
          <Form.Label column sm={4}>Enter Breed</Form.Label>
          <Col sm={8}>
            <Form.Control type="text" name="breed" value={petData.breed} onChange={handleInputChange}/>
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3" controlId="petHistory">
          <Form.Label column sm={4}>Enter Pet History</Form.Label>
          <Col sm={8}>
            <Form.Control as="textarea" rows={2} name="history" value={petData.history} onChange={handleInputChange}/>
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3" controlId="petPersonality">
          <Form.Label column sm={4}>Enter Pet’s Personality</Form.Label>
          <Col sm={8}>
            <Form.Control as="textarea" rows={2} name="personality" value={petData.personality} onChange={handleInputChange}/>
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-4" controlId="petImage">
          <Form.Label column sm={4}>Upload Image</Form.Label>
          <Col sm={8}>
            <Form.Control type="file" accept="image/*" onChange={handleFileChange}/>
            <Form.Text className="text-muted">Max size: 2MB</Form.Text>
            {petData.image && <div style={{marginTop:8}}><img alt="preview" src={petData.image} style={{maxWidth:'100%'}}/></div>}
          </Col>
        </Form.Group>

        <div className="text-center">
          <Button variant="info" type="submit">Save your edit</Button>
        </div>
      </Form>
    </Container>
  );
};

export default EditPet;
