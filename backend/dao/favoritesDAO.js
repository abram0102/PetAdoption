import mongodb from "mongodb";
const ObjectId = mongodb.ObjectId;

let favoritesCollection;

export default class FavoritesDAO {
  static async injectDB(conn) {
    if (favoritesCollection) {
      return;
    }
    try {
      favoritesCollection = await conn
        .db(process.env.PET_COLLECTION)
        .collection("favorites");
    } catch (error) {
      console.error(`Unable to connect to favoritesDAO: ${error}`);
    }
  }
  static async getFavorites(userId) {
    let cursor;
    try {
      cursor = await favoritesCollection.find({
        _id: userId,
      });

      const favorites = await cursor.toArray();
      return favorites[0];
    } catch (error) {
      console.error(`Something went wrong in getFavorites: ${error}`);
    }
  }
  static async updateFavorites(userId, favorites) {
    try {
      const updatedResponse = await favoritesCollection.updateOne(
        { _id: userId },
        { $set: { favorites: favorites } },
        { upsert: true }
      );
      return updatedResponse;
    } catch (error) {
      console.error(`Unable to update favorites: ${error}`);
    }
  }
}
