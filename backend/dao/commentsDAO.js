import mongodb from "mongodb";
const ObjectId = mongodb.ObjectId;

let commentsCollection;

export default class CommentsDAO {
  static async injectDB(conn) {
    if (commentsCollection) {
      return;
    }
    try {
      commentsCollection = await conn
        .db(process.env.PET_COLLECTION)
        .collection("comments");
    } catch (error) {
      console.error(`Unable to connect to CommentsDAO ${error}`);
    }
  }

  static async addComment(petId, user, userId, comment, date) {
    try {
      const commentsData = {
        name: user,
        user_id: userId,
        date: date,
        comment: comment,
        pet_id: new ObjectId(petId),
      };
      console.log("Inserting comment doc:", commentsData);
      return await commentsCollection.insertOne(commentsData);
    } catch (error) {
      console.error(`Unable to post comments : ${error}`);
      return { error: error };
    }
  }

  static async updateComment(commentId, userId, comment, date) {
    try {
      const result = await commentsCollection.updateOne(
        { _id: new ObjectId(commentId), user_id: userId },
        { $set: { comment: comment, date: date } }
      );
      return result;
    } catch (error) {
      console.error(`Unable to update comment: ${error}`);
      return { error: error };
    }
  }

  static async deleteComment(commentId, userId) {
    try {
      const deletedComment = await commentsCollection.deleteOne({
        _id: new ObjectId(commentId),
        user_id: userId
      });
      if (deletedComment.deletedCount === 0) {
        throw new Error("Comment was not found or already deleted.");
      }
      return { success: true };
    } catch (error) {
      console.error(`Unable to delete comment: ${error}`);
      return { error: error };
    }
  }

  static async getComments(petId) {
    try {
      return await commentsCollection
        .find({ pet_id: new ObjectId(petId) })
        .sort({ date: -1 })
        .toArray();
    } catch (e) {
      console.error(`Unable to get comments: ${e}`);
      return [];
    }
  }
}
