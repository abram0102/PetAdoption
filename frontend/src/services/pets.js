import axios from "axios";

const API_URL = process.env.REACT_APP_API_BASE_URL;

class PetDataService {
getComments(petId) {
  return axios.get(
    `${process.env.REACT_APP_API_BASE_URL}/api/pet/id/${petId}/comments?t=${Date.now()}`
  );
}

  createComment(data) {
    return axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/pet/comments`, data);
  }

  updateComment(data) {
    return axios.put(
      `${process.env.REACT_APP_API_BASE_URL}/api/pet/updateComment/${data.comments_id}`,
      data
    );
  }

deleteComment(data) {
  return axios.delete(
    `${process.env.REACT_APP_API_BASE_URL}/api/pet/deleteComment/${data.comments_id}`,
    { data } 
  );
}

addPet(data){
  return axios.post(`${API_URL}/api/pet/postPet`, data);
}

updatePet(data){
   return axios.put(
      `${API_URL}/api/pet/updatePet/${data.petId}`,
      {data}
   )
}

}

export default new PetDataService();