import mongodb from "mongodb";
import app from "./server.js";
import PetDAO from "./dao/petsDAO.js"; //modified to be petsDAO not PetsDAO
import CommentsDAO from "./dao/commentsDAO.js";
import FavoritesDAO from "./dao/favoritesDAO.js";

async function main() {
  console.log("MONGODB URL:", process.env.PET_DB_URL);
  const client = new mongodb.MongoClient(process.env.PET_DB_URL);
  const port = process.env.PORT || 8000;

  try {
    await client.connect();
    await PetDAO.injectDB(client);
    await CommentsDAO.injectDB(client);
    await FavoritesDAO.injectDB(client);


    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main().catch(console.error);

export default app;
