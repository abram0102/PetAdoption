import PetsDAO from "../dao/petsDAO.js";

export default class PetController {
  static async apiGetPetsByUserOrName(req, res, next) {
  try {
    const userId = req.params.userId;
    const name = req.query.name;
    const pets = await PetsDAO.getPetsByUserOrName(userId, name);
    res.json({ pets });
  } catch (error) {
    console.error(`Unable to get pets by user/name ${error}`);
    res.status(500).json({ error: "Unable to get pets by user/name" });
  }
}

  static async apiGetAllPets(req, res, next) {
    const { petList, totalPets } = await PetsDAO.getAllPets();
    let response = {
      pets: petList,
      totalNumOfPets: totalPets,
    };

    res.json(response);
  }

  static async apiGetPetById(req, res, next) {
    try {
      const petId = req.params.petId || {};
      let pet = await PetsDAO.getPetByID(petId);
      if (!pet) {
        res.status(404).json({ error: "Unable to find pet by Id" });
        return;
      }
      res.json({ pet });
    } catch (error) {
      console.error(`Unable to get pet by Id ${error}`);
      res.status(500).json({ error: "Unable to get pet by Id" });
    }
  }

  static async apiPostPet(req, res, next) {
    try {
      const petInfo = {
        type: req.body.type,
        petName: req.body.petName,
        age: req.body.age,
        breed: req.body.breed,
        history: req.body.history,
        personality: req.body.personality,
        image: req.body.image,
      };
      const userInfo = {
        userName: req.body.userName,
        _id: req.body.user_id,
      };

      //checks if field is not filled out
      if (
        !petInfo.type &&
        !petInfo.petName &&
        !petInfo.age &&
        !petInfo.breed &&
        !petInfo.history &&
        !petInfo.personality &&
        !petInfo.image
      ) {
        res.status(404).json({ message: "Please fill out all fields" });
        return;
      }

      const petResponse = await PetsDAO.addPet(petInfo, userInfo);

      var { error } = petResponse;
      if (error) {
        res.status(500).json({ error: `${error}` });
      } else {
        res.json({ status: "Success", response: petResponse });
      }
    } catch (error) {
      console.error(`Unable to add a pet ${error}`);
      res.status(500).json({ error: "Unable to add a pet" });
    }
  }

  static async apiUpdatePet(req, res, next) {
    const petId = req.params.id;
    const petInfo = {
      type: req.body.type,
      petName: req.body.petName,
      age: req.body.age,
      breed: req.body.breed,
      history: req.body.history,
      personality: req.body.personality,
      image: req.body.image,
    };

    const updatedPet = await PetsDAO.updatePet(petId, petInfo);

    if (updatedPet && updatedPet.error) {
      return res.status(500).json({ error: "Unable to update pet" });
    }
    return res
      .status(200)
      .json({
        status: "Success",
        updatedPet
      });
  }

  static async apiDeletePet(req, res, next) {
    try {
      const petId = req.params.id;
      const deletePet = await PetsDAO.deletePet(petId);
      if (deletePet.error) {
        return res.status(500).json({ error: "Unable to delete pet" });
      }
      res.json({ message: "Pet was delete from database" });
    } catch (error) {
      console.error(`Unable to delete pet ${error}`);
      res.status(500).json({ error: "Unable to delete pet" });
    }
  }
}
