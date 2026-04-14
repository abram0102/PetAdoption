import CommentsDAO from "../dao/commentsDAO.js";

export default class CommentsController {
    static async apiPostComment(req, res, next) {
      console.log("apiPostComment called with body:", req.body);
      try {
      const petId = req.body.pet_id
      const comments = req.body.comments
      const user = req.body.name
      const userId = req.body.user_id
      const date = new Date()

      const postResponse = await CommentsDAO.addComment(
        petId,
        user,
        userId,
        comments,
        date
      )

      res.json({ status: 'success', response: postResponse })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  }

  static async apiUpdateComment(req, res, next) {
    try {
      const commentsId = req.params.comments_id || req.body.comments_id;
      const userId = req.body.user_id;
      const comments = req.body.comments;
      const date = new Date();
  
      const updateResponse = await CommentsDAO.updateComment(
        commentsId,
        userId,
        comments,
        date
      );

      if (!updateResponse || updateResponse.matchedCount === 0) {
        return res
          .status(403)
          .json({ error: "Not authorized to edit this comment" });
      }

      res.json({ status: "success" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async apiDeleteComment(req, res, next) {
    try {
      const commentsId = req.params.comments_id || req.body.comments_id;
      const userId = req.body.user_id;

      const deleteResponse = await CommentsDAO.deleteComment(
        commentsId,
        userId
      );

      if (deleteResponse?.error) {
        return res.status(403).json({ error: deleteResponse.error });
      }

    res.json({ status: "success", response: deleteResponse });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

  static async apiGetComments(req, res, next) {
    try {
      const petId = req.params.petId;
      const commentsList = await CommentsDAO.getComments(petId);
      res.json({ comments: commentsList });
    } catch (e) {
      console.error(`apiGetComments error: ${e}`);
      res.status(500).json({ error: e.message });
    }
  }
}