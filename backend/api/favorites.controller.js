import FavoritesDAO from "../dao/favoritesDAO.js";

export default class FavoritesController {
    static async apiUpdateFavorites(req, res, next) {
        try {
            const FavoritesResponse = await FavoritesDAO.updateFavorites(
                req.body._id,
                req.body.favorites
            )

            var { error } = FavoritesResponse
            if (error) {
                return res.status(500).json({ error });
            }

            res.json({ status: "success" });
        } catch(e) {
            res.status(500).json({ error: e.message });
        }
    }

    static async apiGetFavorites(req, res, next) {
        try {
            let userId = req.params.userId;
            let favorites = await FavoritesDAO.getFavorites(userId);
            if (!favorites) {
                res.status(404).json({ error: "No Favorites Found" });
                return;
            }
            res.json(favorites);
        } catch(e) {
            console.log(`API, ${e}`);
            res.status(500).json({ error:e });
        }
    }
}