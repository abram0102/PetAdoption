import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import PetDataService from "../services/pets";

const AddComment = ({ user }) => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const editing = Boolean(location.state?.currentComment);
  const [comment, setComment] = useState(
    editing ? location.state.currentComment.comment : ""
  );

  const onChangeComment = (e) => {
    setComment(e.target.value);
  };

  const saveComment = async (e) => {
    e.preventDefault();
    console.log("saveComment called:", { editing, comment });

    const date = new Date();
    const data = {
      comments: comment,
      name: user.name,
      user_id: user.googleId,
      pet_id: params.id,
      date,
    };

    try {
      if (editing) {
        data.comments_id = location.state.currentComment._id;
        await PetDataService.updateComment(data);
      } else {
        await PetDataService.createComment(data);
      }
      navigate(`/pets/${params.id}`);
    } catch (err) {
      console.error("Failed to save comment:", err);
    }
  };

  return (
    <Container className="main-container">
      <Form onSubmit={saveComment}>
        <Form.Group className="mb-3">
          <Form.Label>
            {editing ? "Edit" : "Create"} Inquiry
          </Form.Label>
          <Form.Control
            as="textarea"
            value={comment}
            onChange={onChangeComment}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </Container>
  );
};

export default AddComment;