import mongodb from "mongodb";
const ObjectId = mongodb.ObjectId;

let pets;

export default class PetsDAO {
  static async injectDB(conn) {
    if (pets) {
      return;
    }
    try {
      pets = await conn.db(process.env.PET_COLLECTION).collection("pets");
    } catch (error) {
      console.error(`Unable to connect to petsDAO`);
    }
  }

  static async getPetsByUserOrName(userId, userName) {
  try {
    const orConds = [];
    if (userId) {
      orConds.push({ user_id: userId });
      try {
        if (ObjectId.isValid(userId)) {
          orConds.push({ user_id: new ObjectId(userId) });
        }
      } catch (e) {}
    }
    if (userName) {
      orConds.push({ userName: userName });
    }
    const query = orConds.length ? { $or: orConds } : {};
    return await pets.find(query).toArray();
  } catch (error) {
    console.error(`Unable to get pets by user/name: ${error}`);
    return [];
  }
}

  static async getAllPets() {
    try {
      const petList = await pets.find({}).toArray();

      const totalPets = await pets.countDocuments();
      return { petList, totalPets };
    } catch (error) {
      console.error(`Unable to get all pet: ${error}`);
      return { petList: [], totalPets: 0 };
    }
  }
  static async getPetByID(petId) {
    try {
      return await pets
        .aggregate([
          {
            $match: {
              _id: new ObjectId(petId),
            },
          },
        ])
        .next();
    } catch (error) {
      console.error(`Unable to get pet by Id, ${error}`);
      throw error;
    }
  }

  static async updatePet(petId, petData) {
    try {
      const updateFields = {};
      //only updates fields given and keeps the rest the same 
      if (petData.type !== undefined) updateFields.type = petData.type;
      if (petData.petName !== undefined) updateFields.petName = petData.petName;
      if (petData.age !== undefined) updateFields.age = petData.age;
      if (petData.breed !== undefined) updateFields.breed = petData.breed;
      if (petData.history !== undefined) updateFields.history = petData.history;
      if (petData.personality !== undefined)
        updateFields.personality = petData.personality;
      if (petData.image !== undefined) updateFields.image = petData.image;

      
      const updatedPet = await pets.updateOne(
        { _id: new ObjectId(petId) },
        { $set: updateFields }
      );

      if (updatedPet.modifiedCount == 0) {
        console.error("Nothing to modify");
        throw new error("Nothing to modify");
      }
      return updateFields;
    } catch (error) {
      console.error(`Unable to update pet: ${error}`);
      return error;
    }
  }
  static async addPet(petData, user) {
    try {
      const petInfo = {
        // pet_id: new ObjectId(),
        type: petData.type,
        petName: petData.petName,
        age: petData.age,
        breed: petData.breed,
        history: petData.history,
        personality: petData.personality,
        image: petData.image,
        userName: user.userName,
        user_id: new ObjectId(user.user_id),
      };
      //before adding check if it exists in databse
      const existingPet = await pets.findOne(petInfo);
      if (existingPet) {
        throw new Error("Pet already exists in databse");
      }
      await pets.insertOne(petInfo);
      return petInfo;
    } catch (error) {
      console.error(`Unable to post a pet: ${error}`);
      return { error: error };
    }
  }
  static async deletePet(petId) {
    try {
      const deletePet = await pets.deleteOne({
        _id: new ObjectId(petId),
      });
      if (deletePet.deletedCount == 0) {
        throw new Error("Pet id not found or was already deleted");
      }
      return { success: true };
    } catch (error) {
      console.error(`Unable to delete pets: ${error}`);
    }
  }
}
