import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import PetDataService from "../services/pets";
import moment from 'moment';

import "./Pet.css";

const Pet = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pet, setPet] = useState(null);
  const [loadingPet, setLoadingPet] = useState(true);

  //comments state
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);

  //fetch pet details
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/pet/id/${id}`)
      .then(res => res.json())
      .then(data => {
        setPet(data.pet || data);
        setLoadingPet(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingPet(false);
      });
  }, [id]);

  //fetch comments for this pet
  useEffect(() => {
    PetDataService.getComments(id)
      .then(res => {
        setComments(res.data.comments || res.data);
        setLoadingComments(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingComments(false);
      });
  }, [id]);

  //check if current user owns a comment (robust)
  const isOwner = (c) => {
    const stored = JSON.parse(localStorage.getItem("login") || "null");
    const currentUserId =
      (user && user.googleId) || (stored && stored.googleId) || "";

    const commentOwnerId =
      (typeof c.user_id === "object" && c.user_id?.$oid)
        ? c.user_id.$oid
        : (c.user_id || "");

    return String(currentUserId) !== "" && String(commentOwnerId) === String(currentUserId);
  };

  const handleDelete = (commentId, commentOwnerId) => {
    const currentUser = user || JSON.parse(localStorage.getItem("login") || "null");

    if (!currentUser || !currentUser.googleId) {
      console.error("User not logged in — can't delete comment");
      return;
    }

    if (currentUser.googleId !== commentOwnerId) {
      console.error("Not allowed to delete someone else's comment");
      return;
    }

    PetDataService.deleteComment({
      comments_id: commentId,
      user_id: currentUser.googleId
    })
      .then(() => {
        setComments(prev => prev.filter(c => c._id !== commentId));
      })
      .catch(console.error);
  };

  if (loadingPet) {
    return <div style={{ textAlign: "center", marginTop: 60 }}>Loading pet…</div>;
  }
  if (!pet) {
    return <div style={{ textAlign: "center", marginTop: 60 }}>Pet not found.</div>;
  }

  return (
    <div className="pet_single_container">
      <div className="headers">
        <div className="pet_info_left">
          {pet.image && (
            <img src={pet.image} alt={pet.petName} className="pet_image" />
          )}
        </div>
        <div className="pet_info_right">
          <div className="pet_text">
            <h2 style={{ marginBottom: 12, fontSize: 44, fontWeight: 700 }}>
              {pet.petName.toUpperCase()}
            </h2>
            <p><strong>Type:</strong> {pet.type}</p>
            <p><strong>Age:</strong> {pet.age}</p>
            <p><strong>Breed:</strong> {pet.breed}</p>
            {pet.history && (
              <p><strong>History:</strong> {pet.history}</p>
            )}
            {pet.personality && (
              <p><strong>Personality:</strong> {pet.personality}</p>
            )}
          </div>
        </div>
      </div>

      <div className="comments_section">
        <h4 className="comments_title">INQUIRIES</h4>
        {loadingComments ? (
          <p>Loading comments…</p>
        ) : comments.length === 0 ? (
          <p className="comments_txt">No inquiries yet. Be the first!</p>
        ) : (
          comments.map((comment) => (
            <div className="comments_inquiry" key={comment._id}>
              <p>
                <strong className="comments_date">{comment.name}</strong>
                <small className="text-muted">
                  {moment(comment.date).format("Do MMMM YYYY, h:mm a")}
                </small>
              </p>
              <p className="user_comments">{comment.comment}</p>
              {(() => {
                const currentUser = user || JSON.parse(localStorage.getItem("login") || "null");
                console.log("[isOwner check]", {
                  commentId: comment._id,
                  commentUserId: comment.user_id,
                  currentUserId: currentUser?.googleId,
                  isOwner: isOwner(comment),
                });
                return null;
              })()}
              {isOwner(comment) && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="me-2"
                    onClick={() =>
                      navigate(`/pets/${id}/comment`, {
                        state: { currentComment: comment },
                      })
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(comment._id, comment.user_id)}
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          ))
        )}
        <Button
          variant="primary"
          className="add_comment_btn"
          onClick={() => navigate(`/pets/${id}/comment`)}
        >
          ADD INQUIRY
        </Button>
      </div>
    </div>
  );
};

export default Pet;
