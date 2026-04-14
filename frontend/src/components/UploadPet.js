import React, { useState, useEffect } from "react";
import { Container, Form, Row, Col, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import PetDataService from "../services/pets";

export default function UploadPet({ user }) {
  const navigate = useNavigate();

  const [petData, setPetData] = useState({
    type: "",
    petName: "",
    age: "",
    breed: "",
    history: "",
    personality: "",
    image: "",
    userName: "",
    user_id: ""
  });

  const [error, setError] = useState("");
  const allowedTypes = ["dog", "cat", "fish", "rabbit", "lizard", "sheep"];

  let imageURL;
  useEffect(() => {
  if (user) {
    setPetData(prev => ({
      ...prev,
      userName: user?.name || "",
      user_id: user?.googleId || ""
    }));
  }
}, [user]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.size > 2 * 1024 * 1024) {
      setError("Image size must be ≤ 2MB");
      return;
    }
    //upload to cloundinary to get the https:// url
    const imageData = new FormData();
    imageData.append("file", file);
    imageData.append("upload_preset", "your_upload_preset");

    try {
      const imgRes = await fetch(
        "https://api.cloudinary.com/v1_1/your_cloud_name/image/upload",
        {
          method: "POST",
          body: imageData,
        }
      );
      const data = await imgRes.json();
      imageURL = data.secure_url;
      setPetData((prev) => ({
        ...prev,
        image: imageURL,
      }));
    } catch (error) {
      console.error("Upload error", error);
      setError("Failed to upload image");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPetData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !petData.type ||
      !petData.petName ||
      !petData.age ||
      !petData.breed ||
      !petData.history ||
      !petData.personality ||
      !petData.image
    ) {
      setError("Missing Information");
      return;
    }
    if (!allowedTypes.includes(petData.type.toLocaleLowerCase().trim())) {
      setError("We only accept limited type of pets now");
      return;
    }
    try {
      const res = await PetDataService.addPet(petData);
      navigate("/pets");
    } catch (err) {
       console.error(err.response?.data || err.message);
      setError("Failed to add pet. Please try again.");
    }
  };

  return (
    <Container className="main-container" style={{ maxWidth: 600 }}>
      <h2 className="my-4 text-center">Fill out the form to Add a pet</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        {/* 1. Type */}
        <Form.Group as={Row} className="mb-3" controlId="petType">
          <Form.Label column sm={4}>
            Enter Type of Pet
          </Form.Label>
          <Col sm={8}>
            <Form.Control
              type="text"
              name="type"
              value={petData.type}
              onChange={handleInputChange}
              placeholder=" Only accept Dog, Cat, Fish, Rabbit, Sheep, Lizard"
            />
          </Col>
        </Form.Group>

        {/* 2. Name */}
        <Form.Group as={Row} className="mb-3" controlId="petName">
          <Form.Label column sm={4}>
            Enter Pet Name
          </Form.Label>
          <Col sm={8}>
            <Form.Control
              type="text"
              name="petName"
              value={petData.petName}
              onChange={handleInputChange}
              placeholder="e.g. Metro"
            />
          </Col>
        </Form.Group>

        {/* 3. Age */}
        <Form.Group as={Row} className="mb-3" controlId="petAge">
          <Form.Label column sm={4}>
            Enter Pet Age
          </Form.Label>
          <Col sm={8}>
            <Form.Control
              type="number"
              min="0"
              name="age"
              value={petData.age}
              onChange={handleInputChange}
              placeholder="e.g. 3"
            />
          </Col>
        </Form.Group>

        {/* 4. Breed */}
        <Form.Group as={Row} className="mb-3" controlId="petBreed">
          <Form.Label column sm={4}>
            Enter Breed
          </Form.Label>
          <Col sm={8}>
            <Form.Control
              type="text"
              name="breed"
              value={petData.breed}
              onChange={handleInputChange}
              placeholder="e.g. Golden Short Hair..."
            />
          </Col>
        </Form.Group>

        {/* 5. History */}
        <Form.Group as={Row} className="mb-3" controlId="petHistory">
          <Form.Label column sm={4}>
            Enter Pet History
          </Form.Label>
          <Col sm={8}>
            <Form.Control
              as="textarea"
              rows={2}
              name="history"
              value={petData.history}
              onChange={handleInputChange}
              placeholder="e.g. Owner moved abroad..."
            />
          </Col>
        </Form.Group>

        {/* 6. Personality */}
        <Form.Group as={Row} className="mb-3" controlId="petPersonality">
          <Form.Label column sm={4}>
            Enter Pet’s Personality
          </Form.Label>
          <Col sm={8}>
            <Form.Control
              as="textarea"
              rows={2}
              name="personality"
              value={petData.personality}
              onChange={handleInputChange}
              placeholder="e.g. Curious, Eat a lot..."
            />
          </Col>
        </Form.Group>

        {/* 7. Upload Image */}
        <Form.Group as={Row} className="mb-4" controlId="petImage">
          <Form.Label column sm={4}>
            Upload Image
          </Form.Label>
          <Col sm={8}>
            <Form.Control
              type="file"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
            />
            <Form.Text className="text-muted">Max size: 2MB</Form.Text>
          </Col>
        </Form.Group>

        {/* Submit */}
        <div className="text-center">
          <Button variant="info" type="submit">
            Submit
          </Button>
        </div>
      </Form>
    </Container>
  );
}
