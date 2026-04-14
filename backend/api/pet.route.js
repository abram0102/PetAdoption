import express from "express";
import PetController from "./pet.controller.js";
import CommentsController from "./comments.controller.js";
import FavoritesController from "./favorites.controller.js";

const router = express.Router();

router.route("/").get(PetController.apiGetAllPets);
router.route("/id/:petId").get(PetController.apiGetPetById);
router.route("/postPet").post(PetController.apiPostPet);
router.route("/updatePet/:id").put(PetController.apiUpdatePet);
router.route("/deletePet/:id").delete(PetController.apiDeletePet);
router.route("/user/:userId").get(PetController.apiGetPetsByUserOrName);

//favorites 
router.route("/favorites").put(FavoritesController.apiUpdateFavorites);
router.route("/favorites/:userId").get(FavoritesController.apiGetFavorites);

//comments
router.get("/id/:petId/comments", CommentsController.apiGetComments);
router.post("/comments", CommentsController.apiPostComment);
router.put("/updateComment/:comments_id", CommentsController.apiUpdateComment);
router.delete("/deleteComment/:comments_id", CommentsController.apiDeleteComment);

export default router;